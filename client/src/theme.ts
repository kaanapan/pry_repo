import { createTheme } from '@mui/material/styles'

export const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2', // Mavi
      light: '#63a4ff',
      dark: '#004ba0',
      contrastText: '#fff'
    },
    secondary: {
      main: '#e91e63', // Pembe
      light: '#ff6090',
      dark: '#b0003a',
      contrastText: '#fff'
    },
    background: {
      default: '#e3f2fd',
      paper: '#fff'
    }
  },
  shape: {
    borderRadius: 12
  },
  typography: {
    fontFamily: 'Montserrat, Arial, sans-serif'
  }
})