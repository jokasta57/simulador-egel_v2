import React, { useState, useCallback, useMemo } from 'react';
import { Button, TextField, Paper, Typography, Box, InputAdornment, IconButton, useTheme, useMediaQuery, Snackbar, Alert } from '@mui/material';
import { LockOutlined as LockOutlinedIcon, Visibility, VisibilityOff, Badge as BadgeIcon } from '@mui/icons-material';
import { useAuthStore } from '../../hooks/useAuthStore';
import { useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';

export const LoginPage = () => {
  const { startLoginAdmin, startLoginStudent } = useAuthStore();
  const { error } = useSelector(state => state.auth);
  const navigate = useNavigate();

  const location = useLocation();
  const role = location.state?.role || 'student';

  const [formData, setFormData] = useState({
    numeroIdentificacion: '',
    nip: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  });

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const handleInputChange = useCallback((event) => {
    const { name, value } = event.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
  }, []);

  const handleSubmit = useCallback(async (event) => {
    event.preventDefault();
    const { numeroIdentificacion, nip } = formData;

    if (!numeroIdentificacion || !nip) {
      setSnackbar({
        open: true,
        message: !numeroIdentificacion && !nip
          ? 'Por favor, ingrese número de identificación y NIP'
          : !numeroIdentificacion
          ? 'Por favor, ingrese número de identificación'
          : 'Por favor, ingrese NIP',
        severity: 'warning',
      });
      return;
    }

    try {
      if(role === "admin"){
        await startLoginAdmin(numeroIdentificacion, nip);
        setSnackbar({
          open: true,
          message: 'Inicio de sesión exitoso',
          severity: 'success',
        });
        navigate('/admin/dashboard');
      } else if(role === "student"){
        await startLoginStudent(numeroIdentificacion, nip);
        setSnackbar({
          open: true,
          message: 'Inicio de sesión exitoso',
          severity: 'success',
        });
        navigate('/student/home');
      }
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Error al iniciar sesión. Por favor, verifica tus credenciales.',
        severity: 'error',
      });
    }
  }, [formData, startLoginAdmin, navigate]);

  const handleTogglePasswordVisibility = useCallback(() => {
    setShowPassword(prevShow => !prevShow);
  }, []);

  const handleCloseSnackbar = useCallback(() => {
    setSnackbar(prev => ({ ...prev, open: false }));
  }, []);

  const paperStyles = useMemo(() => ({
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
  }), [theme]);

  const buttonStyles = useMemo(() => ({
    mt: 3,
    mb: 2,
    py: 1.5,
    fontSize: '1rem',
    fontWeight: 'bold',
    textTransform: 'none',
    borderRadius: 2,
  }), []);

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
      <Paper elevation={3} sx={paperStyles}>
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
          {
            role === "admin" ? "Accede a la dashboard para administradores de EGEL" : "Pon a prueba tus conocimientos y prepárate para el EGEL con nuestros exámenes simulados."
          }
        </Typography>
        <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
          <TextField
            margin="normal"
            fullWidth
            id="numeroIdentificacion"
            label="Número de Identificación"
            name="numeroIdentificacion"
            autoComplete="username"
            autoFocus
            value={formData.numeroIdentificacion}
            onChange={handleInputChange}
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
            value={formData.nip}
            onChange={handleInputChange}
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
            sx={buttonStyles}
          >
            Iniciar Sesión
          </Button>
        </Box>
      </Paper>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

