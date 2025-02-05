"use client"

import React, { useEffect, useState } from 'react';
import { Box, Paper, Typography, TextField, Button, Grid, MenuItem, FormControl, InputLabel, Select, Alert, Snackbar,} from '@mui/material';
import { Save as SaveIcon } from '@mui/icons-material';
import { validateStudentForm } from '../helpers/formValidation';
import { useAuthStore } from '../../hooks/useAuthStore';
import { useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';

const carreras = [
  'Ingeniería en Software',
  'Ingeniería en Sistemas Computacionales',
  'Ingeniería en Tecnologías de la Información',
];

const semestres = Array.from({ length: 12 }, (_, i) => i + 1);
const grupos = ['1', '2', '3'];
const ciclos = [
  'enero-junio2025',
  'julio-diciembre2025',
  'enero-junio2026',
  'julio-diciembre2026'
];

export const RegisterPage = () => {
  const { error } = useSelector(state => state.auth);
  const navigate = useNavigate();

  const { startRegisterStudent } = useAuthStore();
  const [formData, setFormData] = useState({
    nombre: '',
    apellido_paterno: '',
    apellido_materno: '',
    numero_cuenta: '',
    nip: '',
    carrera: '',
    email: '',
    semestre: '',
    grupo: '',
    ciclo_escolar: '',
  });

  const [errors, setErrors] = useState({});
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  });

  const validateForm = () => {
    const newErrors = validateStudentForm(formData);
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when field is modified
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    
    if (validateForm()) {
      try {
        // Here you would typically make an API call to save the student
        //ENVIO AL SERVIDOR
        startRegisterStudent(formData)

        //Alerta de guardado
        setSnackbar({
          open: true,
          message: 'Estudiante registrado exitosamente',
          severity: 'success',
        });
        navigate('/student/home');
        
        // Optional: Clear form after successful submission
        setFormData({
          nombre: '',
          apellido_paterno: '',
          apellido_materno: '',
          numero_cuenta: '',
          nip: '',
          carrera: '',
          email: '',
          semestre: '',
          grupo: '',
          ciclo_escolar: '',
        });
      } catch (e) {
        console.log(e);
        setSnackbar({
          open: true,
          message: error,
          severity: 'error',
        });
      }
    } else {
      setSnackbar({
        open: true,
        message: 'Por favor, corrija los errores en el formulario',
        severity: 'error',
      });
    }
  };
  // Efecto para actualizar el Snackbar cuando haya un error en Redux
  useEffect(() => {
    if (error) {
      setSnackbar({
        open: true,
        message: error,
        severity: 'error',
      });
    }
  }, [error]);

  return (
    <Box sx={{ 
      maxWidth: { xs: '100%', sm: '600px' },
      mx: 'auto',
      p: { xs: 2, sm: 3 },
    }}>
      <Paper elevation={3} sx={{ p: { xs: 2, sm: 3 } }}>
        <Typography variant="h5" component="h2" gutterBottom sx={{ mb: 3 }}>
          Registro de Estudiante
        </Typography>

        <form onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Nombre(s)"
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                error={!!errors.nombre}
                helperText={errors.nombre}
                sx={{ '& .MuiInputBase-input': { fontSize: '1.1rem' } }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Apellido Paterno"
                name="apellido_paterno"
                value={formData.apellido_paterno}
                onChange={handleChange}
                error={!!errors.apellido_paterno}
                helperText={errors.apellido_paterno}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Apellido Materno"
                name="apellido_materno"
                value={formData.apellido_materno}
                onChange={handleChange}
                error={!!errors.apellido_materno}
                helperText={errors.apellido_materno}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Número de Cuenta"
                name="numero_cuenta"
                value={formData.numero_cuenta}
                onChange={handleChange}
                error={!!errors.numero_cuenta}
                helperText={errors.numero_cuenta}
                inputProps={{ maxLength: 6 }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="NIP"
                name="nip"
                type="password"
                value={formData.nip}
                onChange={handleChange}
                error={!!errors.nip}
                helperText={errors.nip}
              />
            </Grid>

            <Grid item xs={12}>
              <FormControl fullWidth error={!!errors.carrera}>
                <InputLabel>Carrera</InputLabel>
                <Select
                  name="carrera"
                  value={formData.carrera}
                  onChange={handleChange}
                  label="Carrera"
                >
                  {carreras.map((carrera) => (
                    <MenuItem key={carrera} value={carrera}>
                      {carrera}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                error={!!errors.email}
                helperText={errors.email}
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <FormControl fullWidth error={!!errors.semestre}>
                <InputLabel>Semestre</InputLabel>
                <Select
                  name="semestre"
                  value={formData.semestre}
                  onChange={handleChange}
                  label="Semestre"
                >
                  {semestres.map((semestre) => (
                    <MenuItem key={semestre} value={semestre}>
                      {semestre}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={4}>
              <FormControl fullWidth error={!!errors.grupo}>
                <InputLabel>Grupo</InputLabel>
                <Select
                  name="grupo"
                  value={formData.grupo}
                  onChange={handleChange}
                  label="Grupo"
                >
                  {grupos.map((grupo) => (
                    <MenuItem key={grupo} value={grupo}>
                      {grupo}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={4}>
              <FormControl fullWidth error={!!errors.ciclo_escolar}>
                <InputLabel>Ciclo Escolar</InputLabel>
                <Select
                  name="ciclo_escolar"
                  value={formData.ciclo_escolar}
                  onChange={handleChange}
                  label="Ciclo Escolar"
                >
                  {ciclos.map((ciclo) => (
                    <MenuItem key={ciclo} value={ciclo}>
                      {ciclo}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  startIcon={<SaveIcon />}
                  sx={{ 
                    mt: 2,
                    bgcolor: theme => theme.palette.primary.main,
                    '&:hover': {
                      bgcolor: theme => theme.palette.primary.dark,
                    },
                  }}
                  fullWidth 
                >
                  Registrar Estudiante
                </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
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
}

