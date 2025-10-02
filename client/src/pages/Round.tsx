import React from 'react'
import { socket } from '../socket'
import { useGameStore } from '../store'

export function Round() {
  const state = useGameStore(s => s.state)
  const remainingMs = useGameStore(s => s.remainingMs)
  const meId = useGameStore(s => s.meId)

  const card = useGameStore(s => s.currentCard)
  const scores = state?.scores ?? { A: 0, B: 0 }
  const team = state?.turnTeam
  const round = state?.round

  const isClueGiver = round?.clueGiverId === meId
  const isGuesser = round?.guesserId === meId
  const isOpponent = !isClueGiver && !isGuesser

  function pass() { socket.emit('round:pass') }
  function correct() { socket.emit('round:correct') }
  function buzz() { socket.emit('round:buzz') }
  function onGuess(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    const text = String(fd.get('guess') || '')
    if (text) socket.emit('round:guess', { text })
    e.currentTarget.reset()
  }

  return (
    <div>
      <div style={{ fontSize: 24, marginBottom: 8 }}>Team {team} turn — Score A {scores.A} - {scores.B} B</div>
      <div style={{ fontSize: 20, marginBottom: 16 }}>Time: {Math.ceil(remainingMs / 1000)}s</div>
      <div style={{ display: 'flex', gap: 16 }}>
        <div style={{ flex: 1, border: '1px solid #ddd', padding: 12 }}>
          <h3>Clue-Giver</h3>
          {isClueGiver ? (
            <div>
              <div style={{ fontSize: 28 }}>{card?.target ?? '?'}</div>
              <ul>
                {(card?.taboos ?? []).map((t, i) => <li key={i}>{t}</li>)}
              </ul>
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={pass}>Pass (-1)</button>
                <button onClick={correct}>Correct (+1)</button>
              </div>
            </div>
          ) : <div>Waiting...</div>}
        </div>
        <div style={{ flex: 1, border: '1px solid #ddd', padding: 12 }}>
          <h3>Guesser</h3>
          {isGuesser ? (
            <form onSubmit={onGuess}>
              <input name="guess" placeholder="Type your guess..." autoFocus />
              <button type="submit">Send</button>
            </form>
          ) : <div>Waiting...</div>}
        </div>
        <div style={{ flex: 1, border: '1px solid #ddd', padding: 12 }}>
          <h3>Opponents</h3>
          {isOpponent ? (
            <div>
              <div style={{ marginBottom: 8 }}>
                <div style={{ fontWeight: 600 }}>Card (view-only)</div>
                <div style={{ fontSize: 22 }}>{card?.target ?? '?'}</div>
                <ul>
                  {(card?.taboos ?? []).map((t, i) => <li key={i}>{t}</li>)}
                </ul>
              </div>
              <button onClick={buzz} style={{ fontSize: 24 }}>BUZZ (-1)</button>
            </div>
          ) : <div>Waiting...</div>}
        </div>
      </div>
    </div>
  )
}


