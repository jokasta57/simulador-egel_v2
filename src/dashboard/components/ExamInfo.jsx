import React from 'react';
import {
  Paper,
  Typography,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Stack,
} from '@mui/material';

const periodos = ['2024-1', '2024-2', '2025-1', '2025-2'];

const carreras = [
  'Ingeniería en Software',
  'Ingeniería en Sistemas Computacionales',
  'Ingeniería en Tecnologías de la Información',
];

export const ExamInfo = ({ examInfo, onExamInfoChange }) => {
  const handleChange = (event) => {
    const { name, value } = event.target;
    onExamInfoChange({ ...examInfo, [name]: value });
  };

  return (
    <Paper sx={{ p: 3, mb: 4 }}>
      <Typography variant="h6" sx={{ mb: 3 }}>
        Información del Examen
      </Typography>
      <Stack spacing={3}>
        <TextField
          fullWidth
          label="Título del Examen"
          name="titulo"
          value={examInfo.titulo}
          onChange={handleChange}
        />
        <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
          <TextField
            fullWidth
            label="Duración (minutos)"
            name="duracion"
            type="number"
            value={examInfo.duracion}
            onChange={handleChange}
            sx={{ flex: 1, minWidth: '200px' }}
          />
          <FormControl fullWidth sx={{ flex: 1, minWidth: '200px' }}>
            <InputLabel>Carrera</InputLabel>
            <Select
              name="carrera"
              value={examInfo.carrera}
              label="Carrera"
              onChange={handleChange}
            >
              {carreras.map((carrera) => (
                <MenuItem key={carrera} value={carrera}>
                  {carrera}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth sx={{ flex: 1, minWidth: '200px' }}>
            <InputLabel>Periodo</InputLabel>
            <Select
              name="periodo"
              value={examInfo.periodo}
              label="Periodo"
              onChange={handleChange}
            >
              {periodos.map((periodo) => (
                <MenuItem key={periodo} value={periodo}>
                  {periodo}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      </Stack>
    </Paper>
  );
};
