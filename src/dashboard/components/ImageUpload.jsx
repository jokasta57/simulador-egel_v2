import React from 'react';
import { Box, Tooltip, IconButton, Avatar } from '@mui/material';
import { Image as ImageIcon, Delete as DeleteIcon } from '@mui/icons-material';

export const ImageUpload = ({ currentImage, onImageUpload, label }) => {
  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onImageUpload(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDeleteImage = () => {
    onImageUpload(null);
  };

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <Tooltip title={currentImage ? 'Cambiar Imagen' : 'Agregar Imagen'}>
        <IconButton component="label" size="small">
          <input
            type="file"
            hidden
            accept="image/*"
            onChange={handleImageUpload}
          />
          {currentImage ? (
            <Avatar
              src={currentImage}
              alt={label}
              sx={{ width: 24, height: 24 }}
            />
          ) : (
            <ImageIcon fontSize="small" />
          )}
        </IconButton>
      </Tooltip>
      {currentImage && (
        <Tooltip title="Eliminar imagen">
          <IconButton onClick={handleDeleteImage} size="small">
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      )}
    </Box>
  );
};

