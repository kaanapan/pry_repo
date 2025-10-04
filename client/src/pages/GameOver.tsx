
import { useGameStore } from '../store'
import {
  Box,
  Button,
  Typography,
  Paper,
  Stack,
  Chip,
  Divider,
  useTheme
} from '@mui/material'
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import ReplayIcon from '@mui/icons-material/Replay';


export function GameOver() {
  const state = useGameStore(s => s.state)
  const theme = useTheme();
  const scores = state?.scores ?? { A: 0, B: 0 };
  const teamA = state?.members?.filter(m => m.team === 'A') ?? [];
  const teamB = state?.members?.filter(m => m.team === 'B') ?? [];
  return (
    <Box minHeight="100vh" display="flex" alignItems="center" justifyContent="center" bgcolor="background.default" px={{ xs: 1, sm: 2, md: 0 }}>
      <Paper elevation={8} sx={{ p: { xs: 2, sm: 4, md: 7 }, width: '100%', maxWidth: 500, minHeight: 340, borderRadius: 6, background: 'background.paper', boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.15)' }}>
        <Stack spacing={4} alignItems="center" justifyContent="center">
          <EmojiEventsIcon sx={{ fontSize: 60, color: theme.palette.warning.main, mb: 1 }} />
          <Typography variant="h3" fontWeight={800} color="primary" textAlign="center" gutterBottom>
            Oyun Bitti
          </Typography>
          <Divider sx={{ width: '100%' }}>Skor</Divider>
          <Stack direction="row" spacing={4} alignItems="flex-start" justifyContent="center" width="100%">
            <Stack alignItems="center" flex={1} minWidth={120}>
              <Chip label={<span style={{ fontWeight: 700 }}>Mavi: {scores.A}</span>} color="primary" sx={{ fontSize: 22, height: 48, px: 2, fontWeight: 700, mb: 1 }} />
              <Stack spacing={0.5} alignItems="center" width="100%">
                {teamA.length === 0 ? (
                  <Typography variant="body2" color="text.secondary">Oyuncu Yok</Typography>
                ) : (
                  teamA.map(m => (
                    <Typography key={m.id} variant="body1" color="primary" fontWeight={600} sx={{ letterSpacing: 0.5 }}>
                      {m.name}
                    </Typography>
                  ))
                )}
              </Stack>
            </Stack>
            <Typography variant="h5" fontWeight={700} color="text.secondary" sx={{ mt: 2 }}>-</Typography>
            <Stack alignItems="center" flex={1} minWidth={120}>
              <Chip label={<span style={{ fontWeight: 700 }}>Kırmızı: {scores.B}</span>} color="secondary" sx={{ fontSize: 22, height: 48, px: 2, fontWeight: 700, mb: 1 }} />
              <Stack spacing={0.5} alignItems="center" width="100%">
                {teamB.length === 0 ? (
                  <Typography variant="body2" color="text.secondary">Oyuncu Yok</Typography>
                ) : (
                  teamB.map(m => (
                    <Typography key={m.id} variant="body1" color="secondary" fontWeight={600} sx={{ letterSpacing: 0.5 }}>
                      {m.name}
                    </Typography>
                  ))
                )}
              </Stack>
            </Stack>
          </Stack>
          <Button
            variant="contained"
            color="success"
            size="large"
            startIcon={<ReplayIcon />}
            sx={{ mt: 3, fontWeight: 700, fontSize: 20, px: 4, borderRadius: 3 }}
            onClick={() => useGameStore.getState().rematch()}
          >
            Tekrar Oyna
          </Button>
        </Stack>
      </Paper>
    </Box>
  );
}



