import React, { useState } from 'react'
import { socket } from '../socket'
import { useGameStore } from '../store'
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  Stack,
  Divider,
  Avatar
} from '@mui/material'

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
    <Box
      minHeight="100vh"
      display="flex"
      alignItems="center"
      justifyContent="center"
      bgcolor="linear-gradient(135deg, #e3f2fd 0%, #fce4ec 100%)"
      px={{ xs: 1, sm: 2, md: 0 }}
    >
      <Paper
        elevation={8}
        sx={{
          p: { xs: 2, sm: 3, md: 5 },
          width: '100%',
          maxWidth: 400,
          borderRadius: 4,
          boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.15)'
        }}
      >
        <Stack spacing={{ xs: 2, sm: 3, md: 4 }} alignItems="center">
          <Typography
            variant="h4"
            fontWeight={700}
            color="primary"
            gutterBottom
            fontSize={{ xs: 26, sm: 32, md: 36 }}
            textAlign="center"
          >
            Taboo 2v2
          </Typography>
          <TextField
            label="İsim"
            value={name}
            onChange={e => setName(e.target.value)}
            fullWidth
            autoFocus
            sx={{ bgcolor: 'white', borderRadius: 1 }}
            inputProps={{ maxLength: 20 }}
          />
          <Button
            variant="contained"
            color="primary"
            fullWidth
            size="large"
            onClick={create}
            disabled={!name}
            sx={{
              fontWeight: 600,
              letterSpacing: 1,
              py: { xs: 1, sm: 1.2 },
              borderRadius: 2,
              boxShadow: '0 2px 8px 0 rgba(33, 150, 243, 0.10)'
            }}
          >
            Oda Yarat
          </Button>
          <Divider flexItem sx={{ width: '100%' }}>veya bir odaya katıl</Divider>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} width="100%">
            <TextField
              label="Katılma kodu"
              value={code}
              onChange={e => setCode(e.target.value.toUpperCase())}
              fullWidth
              sx={{ bgcolor: 'white', borderRadius: 1 }}
              inputProps={{ maxLength: 8 }}
            />
            <Button
              variant="outlined"
              color="primary"
              onClick={join}
              disabled={!name || !code}
              sx={{
                minWidth: { xs: '100%', sm: 100 },
                fontWeight: 600,
                borderRadius: 2,
                py: { xs: 1, sm: 1.2 }
              }}
            >
              Katıl
            </Button>
          </Stack>
        </Stack>
      </Paper>
    </Box>
  )
}