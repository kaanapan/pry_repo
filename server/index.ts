import express from 'express'
import * as http from 'http'
import cors from 'cors'
import { Server } from 'socket.io'
import { createGameServer } from './game'
import fs from 'fs'
import path from 'path'

export function createServer() {
  const app = express()
  app.use(cors())

  const server = http.createServer(app)
  const io = new Server(server, {
    cors: { origin: '*' }
  })

  // Health
  app.get('/health', (_req, res) => res.json({ ok: true }))
  app.get('/cards/:id', (req, res) => {
    try {
      const wordsRaw = fs.readFileSync(path.join(process.cwd(), 'server', 'words.tr.json'), 'utf-8')
      const words = JSON.parse(wordsRaw) as Array<{ id: string; target: string; taboos: string[] }>
      const card = words.find(w => w.id === String(req.params.id))
      if (!card) return res.status(404).json({ error: 'Not found' })
      res.json(card)
    } catch (e) {
      res.status(500).json({ error: 'Failed to read words' })
    }
  })

  // Serve client build if present (single-URL deploy)
  const clientDist = path.join(process.cwd(), 'client', 'dist')
  app.use(express.static(clientDist))
  app.get('*', (_req, res) => {
    const indexPath = path.join(clientDist, 'index.html')
    if (fs.existsSync(indexPath)) return res.sendFile(indexPath)
    return res.status(404).send('Not Found')
  })

  createGameServer(io)

  const PORT = process.env.PORT ? Number(process.env.PORT) : 5174
  server.listen(PORT, () => {
    // eslint-disable-next-line no-console
    console.log(`Server listening on http://localhost:${PORT}`)
  })

  return { app, server, io }
}

  createServer()



