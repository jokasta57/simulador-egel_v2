import React from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';

export const LoadingSpinner = () => {
  return (
    <Box
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      height="100vh"
    >
      <CircularProgress size={60} thickness={4} />
      <Typography variant="h6" style={{ marginTop: '20px' }}>
        Cargando...
      </Typography>
    </Box>
  );
};