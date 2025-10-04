// CardDisplay: shows the main word and taboos stacked as a card
type CardDisplayProps = {
  target?: string;
  taboos?: string[];
};

function CardDisplay(props: CardDisplayProps) {
  const { target, taboos } = props;
  const theme = useTheme();
  return (
    <Paper
      elevation={8}
      sx={{
        minWidth: 200,
        maxWidth: 320,
        p: 3,
        borderRadius: 4,
        bgcolor: theme.palette.background.paper,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        mb: 1,
        boxShadow: '0 4px 24px 0 rgba(31,38,135,0.10)',
        border: `2px solid ${theme.palette.grey[800]}`
      }}
    >
      <Typography variant="h4" fontWeight={800} color="primary" mb={1} sx={{ letterSpacing: 2, textShadow: '0 2px 8px #0002' }}>
        {target ?? '—'}
      </Typography>
      <Divider sx={{ width: '100%', my: 1 }}>
        <Typography variant="caption" color="error" fontWeight={700}>TABU</Typography>
      </Divider>
      <Stack spacing={1} width="100%" alignItems="center">
        {(taboos ?? []).map((t: string, i: number) => (
          <Chip key={i} label={t} color="error" variant="filled" sx={{ fontWeight: 700, fontSize: 18, width: '100%' }} />
        ))}
      </Stack>
    </Paper>
  );
}

import React from 'react'
import { socket } from '../socket'
import { useGameStore } from '../store'
import {
  Box,
  Paper,
  Typography,
  Stack,
  Button,
  TextField,
  Chip,
  Divider,
  useTheme
} from '@mui/material'
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import GroupIcon from '@mui/icons-material/Group';
import CheckIcon from '@mui/icons-material/Check';
import BlockIcon from '@mui/icons-material/Block';

export function Round() {
  const state = useGameStore(s => s.state)
  const remainingMs = useGameStore(s => s.remainingMs)
  const meId = useGameStore(s => s.meId)
  const card = useGameStore(s => s.currentCard)
  const scores = state?.scores ?? { A: 0, B: 0 }
  const team = state?.turnTeam
  const round = state?.round
  const scoreLimit = state?.scoreLimit ?? 7;
  const roundDuration = state?.roundDuration ?? 60;

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

  const theme = useTheme();

  return (
    <Box minHeight="100vh" display="flex" alignItems="center" justifyContent="center" bgcolor="background.default" px={{ xs: 1, sm: 2, md: 0 }}>
      <Paper elevation={8} sx={{ p: { xs: 2, sm: 4, md: 7 }, width: '100%', maxWidth: 1000, minHeight: 540, borderRadius: 6, background: 'background.paper', boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.15)' }}>
        <Stack spacing={4} alignItems="center">
          <Typography variant="subtitle1" color="text.secondary" fontWeight={600} sx={{ mt: 1, mb: -2, letterSpacing: 0.5 }}>
            {scoreLimit} olan kazanır &nbsp;|&nbsp; Tur süresi: {roundDuration} sn
          </Typography>
          <Box display="flex" alignItems="center" justifyContent="center" gap={2} width="100%" mb={1}>
              <Chip label={<span style={{ fontWeight: 700 }}>Mavi: {scores.A}</span>} color="primary" sx={{ fontSize: 18, height: 40 }} />
            <Chip label={<span style={{ fontWeight: 700 }}>Kırmızı: {scores.B}</span>} color="secondary" sx={{ fontSize: 18, height: 40 }} />
            <Chip icon={<AccessTimeIcon />} label={<b>{Math.ceil(remainingMs / 1000)}s</b>} color="default" sx={{ fontSize: 18, height: 40, fontWeight: 700, ml: 2 }} />
            <Chip icon={<GroupIcon />} label={<b>Sıra: {team === "A" ? "Mavi" : "Kırmızı"}</b>} color={team === 'A' ? 'primary' : team === 'B' ? 'secondary' : 'default'} sx={{ fontSize: 18, height: 40, fontWeight: 700, ml: 2 }} />
          </Box>
          <Box width="100%" display="flex" flexDirection={{ xs: 'column', md: 'row' }} gap={4}>
            {isClueGiver && (
              <RoleBlock
                title="Sen anlatıyorsun. Takım arkadaşına anlat."
                active={true}
                color={team === 'A' ? 'primary' : team === 'B' ? 'secondary' : 'default'}
                content={
                  <Stack spacing={2} alignItems="center">
                    <CardDisplay target={card?.target} taboos={card?.taboos} />
                    <Stack direction="row" spacing={2}>
                      <Button variant="contained" color="warning" onClick={pass} startIcon={<BlockIcon />}>Pas (-1)</Button>
                      <Button variant="contained" color="success" onClick={correct} startIcon={<CheckIcon />}>Doğru (+1)</Button>
                    </Stack>
                  </Stack>
                }
              />
            )}
            {isGuesser && (
              <RoleBlock
                title="Takım arkadaşın sana anlatıyor. Sen tahmin ediyorsun."
                active={true}
                color={team === 'A' ? 'primary' : team === 'B' ? 'secondary' : 'default'}
                content={
                  <Stack spacing={2} alignItems="center">
                    <CardDisplay target={"*****"} taboos={Array(5).fill("*****")} />
                  </Stack>
                }
              />
            )}
            {isOpponent && (
              <RoleBlock
                title="Diğer takım anlatıyor. "
                active={true}
                color="default"
                content={
                  <Stack spacing={2} alignItems="center">
                    <CardDisplay target={card?.target} taboos={card?.taboos} />
                    <Button onClick={buzz} variant="contained" color="error" sx={{ fontSize: 20, fontWeight: 700 }}>Tabu!</Button>
                  </Stack>
                }
              />
            )}



          </Box>
        </Stack>
      </Paper>
    </Box>
  )
}

function RoleBlock({ title, active, color, content }: { title: string, active: boolean, color: 'primary' | 'secondary' | 'default', content: React.ReactNode }) {
  const theme = useTheme();
  let borderColor: string;
  if (color === 'primary' || color === 'secondary') {
    borderColor = theme.palette[color].main;
  } else {
    borderColor = theme.palette.grey[700];
  }
  const bgColor = active ? theme.palette.action.selected : theme.palette.background.paper;
  return (
    <Paper
      elevation={active ? 6 : 1}
      sx={{
        flex: 1,
        minWidth: 260,
        p: 3,
        borderRadius: 5,
        border: `2px solid ${borderColor}`,
        bgcolor: bgColor,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-start',
        boxShadow: active ? '0 4px 24px 0 rgba(31,38,135,0.10)' : '0 2px 8px 0 rgba(0,0,0,0.06)',
        transition: 'all 0.2s',
        mb: { xs: 2, md: 0 }
      }}
    >
      <Typography variant="h6" fontWeight={700} color={active && color !== 'default' ? color : 'text.primary'} mb={2}>
        {title}
      </Typography>
      {content}
    </Paper>
  )
}


