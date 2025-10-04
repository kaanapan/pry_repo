import { socket } from '../socket'
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
import PersonIcon from '@mui/icons-material/Person'
import CloseIcon from '@mui/icons-material/Close';
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import StarIcon from '@mui/icons-material/Star';

export function Lobby() {
  const state = useGameStore(s => s.state)
  const meId = useGameStore(s => s.meId)
  const code = state?.code ?? ''
  const isLeader = state?.members.find(m => m.id === meId)?.isLeader;
  const teamA = state?.members.filter(m => m.team === 'A') ?? [];
  const teamB = state?.members.filter(m => m.team === 'B') ?? [];
  const noTeam = state?.members.filter(m => m.team == null) ?? [];
  const allReady = !!state && !!state.members && state.members.length > 0 && state.members.every(m => m.isReady);
  const is2v2 = teamA.length === 2 && teamB.length === 2;

  function setTeam(team: 'A' | 'B') {
    socket.emit('room:setTeam', { team })
  }
  function toggleReady() {
    socket.emit('room:ready')
  }
  function start() {
    socket.emit('room:start')
  }

  // ...existing code...

  return (
    <Box minHeight="100vh" display="flex" alignItems="center" justifyContent="center" bgcolor="background.default" px={{ xs: 1, sm: 2, md: 0 }}>
      <Paper elevation={8} sx={{ p: { xs: 2, sm: 4, md: 7 }, width: '100%', maxWidth: 800, minHeight: 540, borderRadius: 6, background: 'background.paper', boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.15)' }}>
        <Stack spacing={4} alignItems="center">
          <Box display="flex" alignItems="center" justifyContent="center" gap={2} width="100%" mb={1}>
        
            <Typography variant="h6" fontWeight={600} color="text.primary" sx={{ ml: 2, mr: 1 }}>
              Lobi Kodu:
            </Typography>
            <Chip label={code} color="secondary" size="medium" sx={{ fontWeight: 700, fontSize: 20, height: 40 }} />
            <Button
              size="small"
              sx={{ minWidth: 0, ml: 1, p: 1 }}
              onClick={() => {
                navigator.clipboard.writeText(code)
              }}
              aria-label="Kodu kopyala"
            >
              <ContentCopyIcon />
            </Button>
          </Box>
          <Box width="100%" display="flex" justifyContent="center" alignItems="center" gap={10} mb={1}>
            <Box display="flex" alignItems="center" gap={1} sx={{ flex: 1, justifyContent: 'center' }}>
              <Typography variant="h5" fontWeight={700} color="primary" textAlign="center">
                Mavi Takım
              </Typography>
              <Chip label={state?.scores?.A ?? 0} color="primary" size="medium" sx={{ fontWeight: 700, fontSize: 18, height: 32, ml: 1 }} />
            </Box>
            <Box display="flex" alignItems="center" gap={1} sx={{ flex: 1, justifyContent: 'center' }}>
              <Typography variant="h5" fontWeight={700} color="secondary" textAlign="center">
                Kırmızı Takım
              </Typography>
              <Chip label={state?.scores?.B ?? 0} color="secondary" size="medium" sx={{ fontWeight: 700, fontSize: 18, height: 32, ml: 1 }} />
            </Box>
          </Box>
          <Box width="100%" display="flex" justifyContent="center" alignItems="flex-start" gap={4}>
            <Box flex={1} display="flex" justifyContent="center">
              <TeamBlock members={teamA} color="primary" />
            </Box>
            <Box flex={1} display="flex" justifyContent="center">
              <TeamBlock members={teamB} color="secondary" />
            </Box>
          </Box>
          <Box width="100%">
            <Divider sx={{ my: 2 }}>Beklemede</Divider>
            <Stack direction="row" spacing={1} flexWrap="wrap">
              {noTeam.length === 0 ? (
                <Chip label="" sx={{ opacity: 0, mb: 1, minWidth: 80 }} />
              ) : (
                noTeam.map(m => (
                  <Chip
                    key={m.id}
                    icon={m.isLeader ? <StarIcon style={{ color: 'gold' }} /> : <PersonIcon />}
                    label={<span>{m.name} </span>}
                    color="default"
                    sx={{ mb: 1 }}
                  />
                ))
              )}
            </Stack>
          </Box>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} width="100%" justifyContent="center">
            <Button variant="contained" color="primary" onClick={() => setTeam('A')} fullWidth={true} sx={{ fontWeight: 600 }}>
              Mavi Takıma Katıl
            </Button>
            <Button variant="contained" color="secondary" onClick={() => setTeam('B')} fullWidth={true} sx={{ fontWeight: 600 }}>
              Kırmızı Takıma Katıl
            </Button>
            {!isLeader && (
              <Button
                variant="outlined"
                color="success"
                onClick={toggleReady}
                fullWidth={true}
                sx={{ fontWeight: 600 }}
                disabled={!state?.members.find(m => m.id === meId)?.team}
              >
                Hazır
              </Button>
            )}
            {isLeader && (
              <Button
                variant="outlined"
                color="warning"
                onClick={start}
                fullWidth={true}
                sx={{ fontWeight: 600 }}
                disabled={!(is2v2 && allReady)}
              >
                Başla
              </Button>
            )}
          </Stack>
          {/* <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            Sen: <Chip label={meId} size="small" />
          </Typography> */}
        </Stack>
      </Paper>
    </Box>
  )
}

function TeamBlock({ members, color }: { members: { id: string; name: string; isReady: boolean, isLeader?: boolean }[]; color: 'primary' | 'secondary' }) {
  const theme = useTheme();
  const bgColor = theme.palette[color].main;
  const textColor = theme.palette[color].contrastText;
  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        borderRadius: 5,
        minHeight: 180,
        bgcolor: bgColor,
        color: textColor,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 2px 12px 0 rgba(0,0,0,0.08)',
        width: { xs: '100%', sm: 220, md: 260 },
        mb: 1
      }}
    >
      <Stack spacing={1} alignItems="center" width="100%">
        {members.length === 0 ? (
          <Typography variant="body2" color="inherit">Oyuncu Yok</Typography>
        ) : (
          members.map(m => {
            let icon = null;
            if (m.isLeader) {
              icon = <StarIcon style={{color: "gold"}}/>;
            }
            else if (m.isReady) {
              icon = <CheckCircleIcon style={{ color: 'green' }} />;
            } else {
              icon = <CloseIcon style={{ color: 'red' }} />;
            }
            return (
              <Chip
                key={m.id}
                icon={icon}
                label={<span>{m.name}</span>}
                color="default"
                sx={{ bgcolor: 'rgba(255,255,255,0.18)', color: textColor, fontWeight: 600 }}
              />
            );
          })
        )}
      </Stack>
    </Paper>
  )
}


