"use client"

import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  IconButton,
  Stack,
  useTheme,
  TextField,
  InputAdornment,
  MenuItem,
  FormControl,
  Select,
  InputLabel,
  Button,
} from '@mui/material';
import {
  Edit as EditIcon,
  DeleteOutline as DeleteIcon,
  Search as SearchIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import Swal from 'sweetalert2';

// Datos de ejemplo para exámenes EGEL de Ingeniería en Software
const examenes = [
  {
    id: 1,
    titulo: 'EGEL Plus Ingeniería de Software - Desarrollo',
    preguntas: 180,
    duracion: 240,
    ultimaActualizacion: '2023-05-15',
  },
  {
    id: 2,
    titulo: 'EGEL Plus Ingeniería de Software - Arquitectura',
    preguntas: 160,
    duracion: 220,
    ultimaActualizacion: '2023-06-01',
  },
  {
    id: 3,
    titulo: 'EGEL Plus Ingeniería de Software - Bases de Datos',
    preguntas: 150,
    duracion: 200,
    ultimaActualizacion: '2023-04-20',
  },
  {
    id: 4,
    titulo: 'EGEL Plus Ingeniería de Software - Seguridad',
    preguntas: 140,
    duracion: 180,
    ultimaActualizacion: '2023-05-30',
  },
];

const periodosFiltro = ['Todos', 'Último mes', 'Últimos 3 meses', 'Último año'];

export const ExamList = () => {
  const theme = useTheme();
  const [searchTerm, setSearchTerm] = useState('');
  const [periodoFilter, setPeriodoFilter] = useState('Todos');

  const filtrarPorPeriodo = (examen) => {
    const hoy = new Date();
    const fechaActualizacion = new Date(examen.ultimaActualizacion);
    const diferenciaDias = (hoy - fechaActualizacion) / (1000 * 60 * 60 * 24);

    switch (periodoFilter) {
      case 'Último mes':
        return diferenciaDias <= 30;
      case 'Últimos 3 meses':
        return diferenciaDias <= 90;
      case 'Último año':
        return diferenciaDias <= 365;
      default:
        return true;
    }
  };

  // Filtrar exámenes basado en búsqueda y filtro de periodo
  const filteredExams = examenes.filter(examen => {
    const matchesSearch = examen.titulo.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPeriodo = filtrarPorPeriodo(examen);
    return matchesSearch && matchesPeriodo;
  });

  const handleDelete = (examenId, examenTitulo) => {
    Swal.fire({
      title: '¿Estás seguro?',
      text: `¿Deseas eliminar el examen "${examenTitulo}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: theme.palette.error.main,
      cancelButtonColor: theme.palette.grey[500],
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        // Aquí iría la lógica para eliminar el examen en el backend
        console.log(`Eliminar examen con ID: ${examenId}`);
        Swal.fire(
          '¡Eliminado!',
          'El examen ha sido eliminado.',
          'success'
        );
      }
    });
  };

  return (
    <Box sx={{ maxWidth: 1200, margin: '0 auto', p: 3 }}>
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        mb: 4 
      }}>
        <Typography
          variant="h4"
          component="h1"
          sx={{
            color: theme.palette.text.primary,
            fontWeight: 'bold',
          }}
        >
          Exámenes EGEL de Ingeniería en Software
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          sx={{
            backgroundColor: theme.palette.primary.main,
            '&:hover': {
              backgroundColor: theme.palette.primary.dark,
            },
          }}
        >
          Crear Examen
        </Button>
      </Box>

      <Box sx={{ 
        display: 'flex', 
        gap: 2, 
        mb: 4,
        flexDirection: { xs: 'column', sm: 'row' } 
      }}>
        <TextField
          fullWidth
          placeholder="Buscar examen..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: 'text.secondary' }} />
              </InputAdornment>
            ),
          }}
          sx={{ flex: 2 }}
        />
        <FormControl sx={{ flex: 1, minWidth: 200 }}>
          <InputLabel>Última actualización</InputLabel>
          <Select
            value={periodoFilter}
            label="Última actualización"
            onChange={(e) => setPeriodoFilter(e.target.value)}
          >
            {periodosFiltro.map((periodo) => (
              <MenuItem key={periodo} value={periodo}>
                {periodo}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      <Stack spacing={2}>
        {filteredExams.map((examen) => (
          <Card
            key={examen.id}
            sx={{
              border: `1px solid ${theme.palette.divider}`,
              borderRadius: 2,
              boxShadow: 'none',
              transition: 'all 0.2s ease-in-out',
              '&:hover': {
                borderColor: theme.palette.primary.main,
                transform: 'translateY(-2px)',
                boxShadow: '0 4px 10px rgba(0,0,0,0.05)',
              },
            }}
          >
            <CardContent
              sx={{
                display: 'flex',
                flexDirection: { xs: 'column', sm: 'row' },
                alignItems: { xs: 'flex-start', sm: 'center' },
                justifyContent: 'space-between',
                gap: 2,
                p: '24px !important',
              }}
            >
              <Box sx={{ flex: 1 }}>
                <Typography
                  variant="h6"
                  component="h3"
                  sx={{
                    fontWeight: 'medium',
                    color: theme.palette.text.primary,
                    mb: 1,
                  }}
                >
                  {examen.titulo}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    color: theme.palette.text.secondary,
                    mb: 1,
                  }}
                >
                  {examen.preguntas} preguntas | {examen.duracion} minutos
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    color: theme.palette.primary.main,
                    fontWeight: 500,
                  }}
                >
                  Última actualización: {new Date(examen.ultimaActualizacion).toLocaleDateString()}
                </Typography>
              </Box>
              <Box sx={{ 
                display: 'flex', 
                gap: 1,
                alignSelf: { xs: 'flex-end', sm: 'center' }
              }}>
                <IconButton
                  size="small"
                  sx={{
                    color: theme.palette.primary.main,
                    '&:hover': {
                      backgroundColor: theme.palette.primary.lighter,
                    },
                  }}
                >
                  <EditIcon />
                </IconButton>
                <IconButton
                  size="small"
                  onClick={() => handleDelete(examen.id, examen.titulo)}
                  sx={{
                    color: theme.palette.error.main,
                    '&:hover': {
                      backgroundColor: theme.palette.error.lighter,
                    },
                  }}
                >
                  <DeleteIcon />
                </IconButton>
              </Box>
            </CardContent>
          </Card>
        ))}
      </Stack>
    </Box>
  );
};

export default ExamList;

