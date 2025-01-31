import React, { useEffect, useState } from 'react';
import { Box, Tooltip, IconButton, Avatar, Snackbar, Alert } from '@mui/material';
import { Image as ImageIcon, Delete as DeleteIcon } from '@mui/icons-material';

export const ImageUpload = ({ currentImage, onImageUpload, label, setIsSaved }) => {
  const [previewUrl, setPreviewUrl] = useState(currentImage)


  useEffect(() => {
    if (currentImage instanceof File) {
      setPreviewUrl(URL.createObjectURL(currentImage)); // ✅ Solo crea URL si es un File
    } else if (typeof currentImage === "string") {
      setPreviewUrl(currentImage); // ✅ Si es una URL, úsala directamente
    } else {
      setPreviewUrl(null); // ✅ Si es null o undefined, no mostrar imagen
    }
  }, [currentImage]);



  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Crear una URL temporal para la vista previa
      const objectUrl = URL.createObjectURL(file)
      setPreviewUrl(objectUrl)

      // Enviar el archivo original al componente padre
      onImageUpload(file)

      // Marcar como no guardado
      setIsSaved(false)
    }
  };

  const handleDeleteImage = () => {
    setPreviewUrl(null)
    setIsSaved(false)
    onImageUpload(null);
  };

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <Tooltip title={previewUrl ? 'Cambiar Imagen' : 'Agregar Imagen'}>
        <IconButton component="label" size="small">
          <input
            type="file"
            hidden
            accept="image/*"
            onChange={handleImageUpload}
          />
          {previewUrl ? (
            <Avatar src={previewUrl} alt={label} sx={{ width: 24, height: 24 }} />
          ) : (
            <ImageIcon fontSize="small" />
          )}
        </IconButton>
      </Tooltip>
      {previewUrl && (
        <Tooltip title="Eliminar imagen">
          <IconButton onClick={handleDeleteImage} size="small">
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      )}
      {/* <Snackbar open={Boolean(error || success)} autoHideDuration={3000} onClose={handleCloseSnackbar}>
        <Alert severity={error ? "error" : "success"} variant="filled">
          {error ? (typeof error === 'string' ? error : JSON.stringify(error)) :
            (typeof success === 'string' ? success : JSON.stringify(success))}
        </Alert>
      </Snackbar> */}
    </Box>
  );
};

