import React, { useState } from 'react'
import { socket } from '../socket'
import { useGameStore } from '../store'

export function Home({ onGoLobby }: { onGoLobby: () => void }) {
  const [name, setName] = useState('')
  const [code, setCode] = useState('')
  const setRoomCode = useGameStore(s => s.setRoomCode)

  function create() {
    if (!name) return
    useGameStore.getState().setPlayerName(name)
    socket.emit('room:create', { name })
    onGoLobby()
  }
  function join() {
    if (!name || !code) return
    useGameStore.getState().setPlayerName(name)
    socket.emit('room:join', { code, name })
    setRoomCode(code.toUpperCase())
    onGoLobby()
  }

  return (
    <div>
      <h1>Taboo 2v2 MVP</h1>
      <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
        <input placeholder="Your name" value={name} onChange={e => setName(e.target.value)} />
        <button onClick={create}>Create Room</button>
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <input placeholder="Join code" value={code} onChange={e => setCode(e.target.value.toUpperCase())} />
        <button onClick={join}>Join</button>
      </div>
    </div>
  )
}


