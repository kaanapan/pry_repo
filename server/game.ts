import { Server, Socket } from 'socket.io'
import fs from 'fs'
import path from 'path'

type Team = 'A' | 'B'
type RoomStatus = 'lobby' | 'live' | 'ended'

interface Card { id: string; target: string; taboos: string[] }
interface Member { id: string; name: string; team: Team | null; isReady: boolean; isLeader?: boolean }
interface RoundState {
  clueGiverId: string
  guesserId: string
  cardId: string
  endsAt: number
}
interface RoomState {
  code: string
  status: RoomStatus
  members: Member[]
  scores: { A: number; B: number }
  turnTeam: Team
  round?: RoundState
  // Tracks rotating guesser index per team
  roleIndex?: { A: number; B: number }
  scoreLimit: number
}

const rooms = new Map<string, RoomState>()
const roomTimers = new Map<string, NodeJS.Timeout>()
const roomDecks = new Map<string, string[]>() // roomCode -> remaining card ids

const WORDS: Card[] = JSON.parse(
  fs.readFileSync(path.join(process.cwd(), 'server', 'words.en.json'), 'utf-8')
)

function shortId(): string {
  return Math.random().toString(36).slice(2, 8).toUpperCase()
}

function getRoom(code: string): RoomState | undefined {
  return rooms.get(code)
}

function emitState(io: Server, code: string) {
  const room = rooms.get(code)
  if (room) io.to(code).emit('room:state', room)
}

function setupDeckForRoom(code: string) {
  const deck = [...WORDS.map(w => w.id)]
  // simple shuffle
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[deck[i], deck[j]] = [deck[j], deck[i]]
  }
  roomDecks.set(code, deck)
}

function drawCard(code: string): Card {
  let deck = roomDecks.get(code)
  if (!deck || deck.length === 0) {
    setupDeckForRoom(code)
    deck = roomDecks.get(code)!
  }
  const cardId = deck.shift()!
  roomDecks.set(code, deck)
  return WORDS.find(w => w.id === cardId)!
}

function teamMembers(room: RoomState, team: Team): Member[] {
  return room.members.filter(m => m.team === team)
}

function autoAssignRoles(room: RoomState): { clueGiverId: string; guesserId: string } {
  // Choose guesser by rotating index per team; clue-giver is next member
  const activeTeam = room.turnTeam
  const members = teamMembers(room, activeTeam)
  if (members.length === 0) return { clueGiverId: '', guesserId: '' }
  if (!room.roleIndex) room.roleIndex = { A: Math.floor(Math.random() * 2), B: Math.floor(Math.random() * 2) }
  const idx = (activeTeam === 'A' ? room.roleIndex.A : room.roleIndex.B) % members.length
  const guesser = members[idx]
  const clueIdx = members.length > 1 ? (idx + 1) % members.length : idx
  const clue = members[clueIdx]
  return { clueGiverId: clue.id, guesserId: guesser.id }
}

function startRound(io: Server, room: RoomState) {
  room.status = 'live'
  const card = drawCard(room.code)
  const roles = autoAssignRoles(room)
  const endsAt = Date.now() + 60000
  room.round = { clueGiverId: roles.clueGiverId, guesserId: roles.guesserId, cardId: card.id, endsAt }
  emitState(io, room.code)

  const timer = setInterval(() => {
    const remainingMs = Math.max(0, (room.round?.endsAt ?? 0) - Date.now())
    io.to(room.code).emit('round:tick', { remainingMs })
    if (remainingMs <= 0) {
      stopTimer(room.code)
      endRound(io, room)
    }
  }, 200)
  stopTimer(room.code)
  roomTimers.set(room.code, timer)
}

function stopTimer(code: string) {
  const t = roomTimers.get(code)
  if (t) clearInterval(t)
  roomTimers.delete(code)
}

function nextCard(io: Server, room: RoomState) {
  if (!room.round) return
  const card = drawCard(room.code)
  room.round.cardId = card.id
  emitState(io, room.code)
}

function endRound(io: Server, room: RoomState) {
  // rotate guesser index for the team that just played
  const justPlayed: Team = room.turnTeam
  const members = teamMembers(room, justPlayed)
  if (!room.roleIndex) room.roleIndex = { A: 0, B: 0 }
  if (members.length > 0) {
    if (justPlayed === 'A') room.roleIndex.A = (room.roleIndex.A + 1) % members.length
    else room.roleIndex.B = (room.roleIndex.B + 1) % members.length
  }
  room.round = undefined
  room.status = 'lobby'
  room.turnTeam = justPlayed === 'A' ? 'B' : 'A'
  emitState(io, room.code)
}

function applyResult(io: Server, room: RoomState, kind: 'correct' | 'pass' | 'violation') {
  const team = room.turnTeam
  if (kind === 'correct') room.scores[team] += 1
  if (kind === 'pass' || kind === 'violation') room.scores[team] -= 1

  // Check win condition (dynamic score limit)
  const limit = room.scoreLimit || 7
  if (room.scores.A >= limit || room.scores.B >= limit) {
    room.status = 'ended'
    stopTimer(room.code)
    emitState(io, room.code)
    return
  }

  // move to next card during round
  if (room.status === 'live') nextCard(io, room)
}

export function createGameServer(io: Server) {
  io.on('connection', (socket: Socket) => {
    let joinedCode: string | null = null
    let memberName: string = ''

    socket.on('room:create', ({ name, scoreLimit }: { name: string, scoreLimit?: number }) => {
      const code = shortId()
      const room: RoomState = {
        code,
        status: 'lobby',
        members: [],
        scores: { A: 0, B: 0 },
        turnTeam: 'A',
        roleIndex: { A: Math.floor(Math.random() * 2), B: Math.floor(Math.random() * 2) },
        scoreLimit: scoreLimit && typeof scoreLimit === 'number' ? scoreLimit : 7
      }
      rooms.set(code, room)
      setupDeckForRoom(code)
      socket.emit('toast', { kind: 'info', text: `Room ${code} created` })
      // auto-join owner as leader
      joinRoom(io, socket, code, name, true)
    })

    socket.on('room:join', ({ code, name }: { code: string; name: string }) => {
      joinRoom(io, socket, code.toUpperCase(), name, false)
    })

    socket.on('room:setTeam', ({ team }: { team: Team }) => {
      if (!joinedCode) return
      const room = getRoom(joinedCode)
      if (!room) return
      const m = room.members.find(mm => mm.id === socket.id)
      if (!m) return
      m.team = team
      emitState(io, joinedCode)
    })

    socket.on('room:ready', () => {
      if (!joinedCode) return
      const room = getRoom(joinedCode)
      if (!room) return
      const m = room.members.find(mm => mm.id === socket.id)
      if (!m) return
      m.isReady = !m.isReady
      emitState(io, joinedCode)
    })

    socket.on('room:start', () => {
      if (!joinedCode) return
      const room = getRoom(joinedCode)
      if (!room) return
      // Only leader can start
      const leader = room.members.find(m => m.isLeader)
      if (!leader || leader.id !== socket.id) {
        socket.emit('toast', { kind: 'warn', text: 'Only the lobby leader can start the game.' })
        return
      }
      // basic validation: at least one per team
      if (teamMembers(room, 'A').length === 0 || teamMembers(room, 'B').length === 0) {
        socket.emit('toast', { kind: 'warn', text: 'Need at least one member per team' })
        return
      }
      startRound(io, room)
    })

    socket.on('round:guess', ({ text }: { text: string }) => {
      if (!joinedCode) return
      const room = getRoom(joinedCode)
      if (!room || room.status !== 'live' || !room.round) return
      const { guesserId, cardId } = room.round
      if (socket.id !== guesserId) return
      const card = WORDS.find(w => w.id === cardId)!
      if (!card) return
      if (text.trim().toUpperCase() === card.target.toUpperCase()) {
        applyResult(io, room, 'correct')
      }
    })

    socket.on('round:pass', () => {
      if (!joinedCode) return
      const room = getRoom(joinedCode)
      if (!room || room.status !== 'live') return
      applyResult(io, room, 'pass')
    })

    socket.on('round:correct', () => {
      if (!joinedCode) return
      const room = getRoom(joinedCode)
      if (!room || room.status !== 'live') return
      applyResult(io, room, 'correct')
    })

    socket.on('round:buzz', () => {
      if (!joinedCode) return
      const room = getRoom(joinedCode)
      if (!room || room.status !== 'live') return
      applyResult(io, room, 'violation')
    })

    socket.on('disconnect', () => {
      if (!joinedCode) return
      const room = getRoom(joinedCode)
      if (!room) return
      room.members = room.members.filter(m => m.id !== socket.id)
      emitState(io, joinedCode)
    })

    function joinRoom(io: Server, socket: Socket, code: string, name: string, isLeader = false) {
      const room = getRoom(code)
      if (!room) {
        socket.emit('toast', { kind: 'error', text: 'Room not found' })
        return
      }
      memberName = name
      joinedCode = code
      socket.join(code)
      if (!room.members.find(m => m.id === socket.id)) {
        room.members.push({ id: socket.id, name, team: null, isReady: isLeader ? true : false, isLeader })
      }
      emitState(io, code)
    }
  })
}


