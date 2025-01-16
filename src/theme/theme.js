import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    primary: {
      main: '#B91116', // Rojo principal
      light: '#F5E6B3', // Rosa claro para variantes claras
      dark: '#511013', // Marrón oscuro para variantes oscuras
    },
    secondary: {
      main: '#E24622', // Naranja
      light: '#F53020', // Naranja/Amarillo
      dark: '#E8641C', // Naranja oscuro
    },
    grey: {
      500: '#575756', // Gris oscuro
      300: '#9D9D9C', // Gris claro
    },
    background: {
      default: '#ffffff',
      paper: '#ffffff',
    },
    text: {
      primary: '#511013',
      secondary: '#575756',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h3: {
      fontWeight: 700,
      color: '#B91116',
    },
    h5: {
      fontWeight: 600,
      color: '#511013',
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          fontWeight: 600,
        },
        containedPrimary: {
          backgroundColor: '#B91116',
          '&:hover': {
            backgroundColor: '#511013',
          },
        },
        containedSecondary: {
          backgroundColor: '#E24622',
          '&:hover': {
            backgroundColor: '#E8641C',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 12,
        },
      },
    },
  },
});