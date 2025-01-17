import React, { useState } from 'react';
import { Button, TextField, Paper, Typography, Box, InputAdornment, IconButton, useTheme, useMediaQuery, Snackbar, Alert } from '@mui/material';
import { LockOutlined as LockOutlinedIcon, Visibility, VisibilityOff, Badge as BadgeIcon } from '@mui/icons-material';
import { useAuthStore } from '../../hooks/useAuthStore';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

export const LoginPage = () => {
  const {startLoginAdmin} = useAuthStore();
  const { error } = useSelector(state => state.auth);
  const navigate = useNavigate();

  const [numeroIdentificacion, setNumeroIdentificacion] = useState('');
  const [nip, setNip] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  });
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const handleSubmit = async (event) => {
    event.preventDefault();

    // Validación de campos
    if (!numeroIdentificacion && !nip) {
      setSnackbar({
        open: true,
        message: 'Por favor, ingrese número de identificación y NIP',
        severity: 'warning',
      });
      return;
    }
    if (!numeroIdentificacion) {
      setSnackbar({
        open: true,
        message: 'Por favor, ingrese número de identificación',
        severity: 'warning',
      });
      return;
    }
    if (!nip) {
      setSnackbar({
        open: true,
        message: 'Por favor, ingrese NIP',
        severity: 'warning',
      });
      return;
    }

    try {
      await startLoginAdmin(numeroIdentificacion, nip);
      setSnackbar({
        open: true,
        message: 'Inicio de sesión exitoso',
        severity: 'success',
      });
      navigate('/admin/dashboard')
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Error al iniciar sesión. Por favor, verifica tus credenciales.',
        severity: 'error',
      });
    }
  };

  const handleTogglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        backgroundColor: theme.palette.background.default,
      }}
    >
      <Paper
        elevation={3}
        sx={{
          padding: theme.spacing(4),
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          maxWidth: 400,
          width: '100%',
          borderRadius: 2,
          [theme.breakpoints.down('sm')]: {
            padding: theme.spacing(3),
            maxWidth: '90%',
          },
        }}
      >
        <Box
          sx={{
            backgroundColor: theme.palette.primary.main,
            borderRadius: '50%',
            padding: theme.spacing(2),
            marginBottom: theme.spacing(2),
          }}
        >
          <LockOutlinedIcon sx={{ fontSize: 40, color: 'white' }} />
        </Box>
        <Typography component="h1" variant="h4" gutterBottom fontWeight="bold">
          Iniciar Sesión
        </Typography>
        <Typography variant="body1" color="text.secondary" align="center" sx={{ mb: 3 }}>
          Accede a la dashboard para administradores de EGEL
        </Typography>
        <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
          <TextField
            margin="normal"
            fullWidth
            id="numero_identificacion"
            label="Número de Identificación"
            name="numero_identificacion"
            autoComplete="username"
            autoFocus
            value={numeroIdentificacion}
            onChange={(e) => setNumeroIdentificacion(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <BadgeIcon color="action" />
                </InputAdornment>
              ),
            }}
          />
          <TextField
            margin="normal"
            fullWidth
            name="nip"
            label="NIP"
            type={showPassword ? "text" : "password"}
            id="nip"
            autoComplete="current-password"
            value={nip}
            onChange={(e) => setNip(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <LockOutlinedIcon color="action" />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle nip visibility"
                    onClick={handleTogglePasswordVisibility}
                    edge="end"
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{
              mt: 3,
              mb: 2,
              py: 1.5,
              fontSize: '1rem',
              fontWeight: 'bold',
              textTransform: 'none',
              borderRadius: 2,
            }}
          >
            Iniciar Sesión
          </Button>
        </Box>
      </Paper>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))} 
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

