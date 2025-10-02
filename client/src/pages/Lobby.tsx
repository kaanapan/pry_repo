import React from 'react'
import { socket } from '../socket'
import { useGameStore } from '../store'

export function Lobby() {
  const state = useGameStore(s => s.state)
  const meId = useGameStore(s => s.meId)
  const code = state?.code ?? ''

  function setTeam(team: 'A' | 'B') {
    socket.emit('room:setTeam', { team })
  }
  function toggleReady() {
    socket.emit('room:ready')
  }
  function start() {
    socket.emit('room:start')
  }

  const teamA = state?.members.filter(m => m.team === 'A') ?? []
  const teamB = state?.members.filter(m => m.team === 'B') ?? []

  return (
    <div>
      <h2>Lobby — Code {code}</h2>
      <div style={{ display: 'flex', gap: 24 }}>
        <TeamBlock name="Team A" members={teamA} />
        <TeamBlock name="Team B" members={teamB} />
      </div>
      <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
        <button onClick={() => setTeam('A')}>Join Team A</button>
        <button onClick={() => setTeam('B')}>Join Team B</button>
        <button onClick={toggleReady}>Ready</button>
        <button onClick={start}>Start</button>
      </div>
      <div style={{ marginTop: 12 }}>
        You are: {meId}
      </div>
    </div>
  )
}

function TeamBlock({ name, members }: { name: string; members: { id: string; name: string; isReady: boolean }[] }) {
  return (
    <div>
      <h3>{name}</h3>
      <ul>
        {members.map(m => (
          <li key={m.id}>{m.name} {m.isReady ? '✅' : ''}</li>
        ))}
      </ul>
    </div>
  )
}


