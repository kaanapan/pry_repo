import React, { useEffect, useState } from 'react'
import { Home } from './pages/Home'
import { Lobby } from './pages/Lobby'
import { Round } from './pages/Round'
import { useGameStore } from './store'
import { GameOver } from './pages/GameOver'

export function App() {
  const status = useGameStore(s => s.state?.status)
  const [page, setPage] = useState<'home' | 'lobby' | 'round' | 'ended'>('home')

  useEffect(() => {
    if (status === 'lobby') setPage('lobby')
    if (status === 'live') setPage('round')
    if (status === 'ended') setPage('ended')
  }, [status])

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', padding: 16, maxWidth: 900, margin: '0 auto' }}>
      {page === 'home' && <Home onGoLobby={() => setPage('lobby')} />}
      {page === 'lobby' && <Lobby />}
      {page === 'round' && <Round />}
      {page === 'ended' && <GameOver />}
    </div>
  )
}


