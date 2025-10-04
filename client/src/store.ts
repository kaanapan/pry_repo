import { create } from 'zustand'
import { socket } from './socket'

type Team = 'A' | 'B'
type RoomStatus = 'lobby' | 'live' | 'ended'
interface Card { id: string; target: string; taboos: string[] }
interface Member { id: string; name: string; team: Team | null; isReady: boolean, isLeader?: boolean; }
interface RoomState {
  code: string
  status: RoomStatus
  members: Member[]
  scores: { A: number; B: number }
  turnTeam: Team
  round?: { clueGiverId: string; guesserId: string; cardId: string; endsAt: number }
}

interface Store {
  meId: string
  roomCode: string | null
  playerName: string
  state: RoomState | null
  remainingMs: number
  currentCard: Card | null
  setRoomCode: (code: string) => void
  setPlayerName: (n: string) => void
  rematch: () => void
}

export const useGameStore = create<Store>((set, get) => {
  // subscribe sockets
  socket.on('connect', () => {
    set({ meId: socket.id })
  })
  socket.on('room:state', async (state: RoomState) => {
    set({ state })
    // fetch card if live
    if (state.status === 'live' && state.round?.cardId) {
      const meId = get().meId;
      if (state.round.guesserId === meId) {
        // Guesser: maskeli kart
        set({
          currentCard: {
            id: state.round.cardId,
            target: '*****',
            taboos: Array(5).fill('*****'),
          },
        });
      } else {
        // Diğer herkes: gerçek kartı fetch et
        try {
          const base = (import.meta.env.VITE_SERVER_URL as string) || window.location.origin;
          const res = await fetch(`${base}/cards/${state.round.cardId}`);
          if (res.ok) {
            const card = (await res.json()) as Card;
            set({ currentCard: card });
          }
        } catch {
          // ignore
        }
      }
    } else {
      set({ currentCard: null });
    }
  })
  socket.on('round:tick', ({ remainingMs }: { remainingMs: number }) => {
    set({ remainingMs })
  })
  socket.on('toast', ({ text }: { text: string }) => {
    // minimal toast
    // eslint-disable-next-line no-alert
    console.log('Toast:', text)
  })

  return {
    meId: socket.id,
    roomCode: null,
    playerName: '',
    state: null,
    remainingMs: 60000,
    currentCard: null,
    setRoomCode: (code: string) => set({ roomCode: code }),
    setPlayerName: (n: string) => set({ playerName: n }),
    rematch: () => {
      // Backend'e rematch isteği gönder
      const st = get().state;
      if (!st) return;
      socket.emit('room:rematch');
    }
  }
})


