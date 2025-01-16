import React, { useState } from 'react';
import { Button, TextField, Paper, Typography, Box, Link, InputAdornment, IconButton, useTheme, useMediaQuery } from '@mui/material';
import { LockOutlined as LockOutlinedIcon, Visibility, VisibilityOff, Email as EmailIcon } from '@mui/icons-material';

export const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const handleSubmit = (event) => {
    event.preventDefault();
    console.log('Email:', email);
    console.log('Password:', password);
    // Aquí iría la lógica de autenticación
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
            required
            fullWidth
            id="email"
            label="Correo Electrónico"
            name="email"
            autoComplete="email"
            autoFocus
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <EmailIcon color="action" />
                </InputAdornment>
              ),
            }}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="Contraseña"
            type={showPassword ? "text" : "password"}
            id="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <LockOutlinedIcon color="action" />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle password visibility"
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
    </Box>
  );
};
