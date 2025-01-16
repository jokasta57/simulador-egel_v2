import React from 'react';
import { Fab, Tooltip, Box } from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';

export const FloatingAddButton = ({ onClick, disabled }) => {
  return (
    <Box
      sx={{
        position: 'fixed',
        bottom: 32,
        right: 32,
        zIndex: 1000,
      }}
    >
      <Tooltip title={disabled ? "Complete la información del examen" : "Agregar Pregunta"} placement="left">
        <span>
          <Fab
            color="primary"
            onClick={onClick}
            disabled={disabled}
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
            <AddIcon />
          </Fab>
        </span>
      </Tooltip>
    </Box>
  );
};



