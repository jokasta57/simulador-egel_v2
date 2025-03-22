import React from 'react';
import { Fab, Tooltip, Box, CircularProgress } from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { useExamsStore } from '../../hooks/exams/useExamsStore';

// Botón flotante para agregar preguntas
export const FloatingAddButton = ({ onClick, disabled, isDirty }) => {
  const { isLoading } = useExamsStore();
  return (
    <Box
      sx={{
        position: 'fixed',
        bottom: { xs: 16, sm: 32 },
        right: { xs: 16, sm: 32 },
        zIndex: 1100,
      }}
    >
      {/* Tooltip con mensaje según estado */}
      <Tooltip title={(disabled || isDirty) ? "Debe guardar la información del examen" : "Agregar Pregunta"} placement="left">
        <span>
          {/* Botón flotante con icono de agregar */}
          <Fab
            color="primary"
            onClick={onClick}
            disabled={disabled || isLoading || isDirty}
            sx={{
              bgcolor: 'black',
              '&:hover': {
                bgcolor: 'rgba(0, 0, 0, 0.8)',
              },
              '&.Mui-disabled': {
                bgcolor: 'rgba(0, 0, 0, 0.3)',
              },
            }}
          >
            {isLoading ? <CircularProgress size={24} color="inherit" /> : <AddIcon />}
          </Fab>
        </span>
      </Tooltip>
    </Box>
  );
};
