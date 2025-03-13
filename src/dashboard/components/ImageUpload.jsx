import React, { useEffect, useState } from 'react';
import { Box, Tooltip, IconButton, Avatar, Snackbar, Alert } from '@mui/material';
import { Image as ImageIcon, Delete as DeleteIcon, HideImage } from '@mui/icons-material';
import Swal from 'sweetalert2';
import { useExamsStore } from '../../hooks/exams/useExamsStore';

export const ImageUpload = ({ currentImage, currentQuestion, setCurrentQuestion, onImageUpload, label, isSaved, setIsSaved, setIsDirty }) => {
  const [previewUrl, setPreviewUrl] = useState(currentImage)
  const { handleDeleteQuestionImage } = useExamsStore()


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
      setIsDirty(true)
      setIsSaved(false)
      // Limpiar el valor del input para permitir volver a subir la misma imagen
      event.target.value = "";
    }
  };

  const handleDeleteImage = () => {
    try {
      Swal.fire({
        title: "¿Eliminar imagen?",
        text: "La imagen de esta pregunta se eliminará permanentemente.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d32f2f",
        cancelButtonColor: "#6c757d",
        confirmButtonText: "Sí, eliminar",
        cancelButtonText: "Cancelar"
      }).then(async (result) => {
        if (result.isConfirmed) {
          setPreviewUrl(null)
          onImageUpload(null);
          setCurrentQuestion((prev) => ({
            ...prev,
            imagen_url: null, // ✅ Almacenar correctamente la imagen nueva
          }));
          if (currentQuestion.id_pregunta !== undefined) {
            await handleDeleteQuestionImage(currentQuestion.id_pregunta);
          }
        }
      });
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 2, width: "100%" }}>
      <Tooltip title={previewUrl ? "Cambiar Imagen" : "Agregar Imagen"}>
        <IconButton component="label" size="small">
          <input type="file" hidden accept="image/*" onChange={handleImageUpload} />
          {!previewUrl && <ImageIcon className="w-6 h-6" />}
        </IconButton>
      </Tooltip>

      {previewUrl && (
        <Box
          sx={{
            position: "relative",
            width: { xs: "100%", sm: "60%", md: "50%", lg: "40%" },
            maxWidth: "400px",
            maxHeight: "250px",
            overflow: "hidden",
            borderRadius: "8px",
            border: "1px solid #ccc",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            transition: "box-shadow 0.3s ease-in-out",
            "&:hover": {
              boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.3)", // 🔹 Aumenta la sombra al pasar el mouse
            },
          }}
        >
          {/* Imagen */}
          <img
            src={previewUrl}
            alt={label}
            style={{
              width: "100%",
              height: "auto",
              objectFit: "contain",
            }}
          />

          {/* Ícono de eliminación con mayor visibilidad */}
          <IconButton
            onClick={handleDeleteImage}
            size="small"
            sx={{
              position: "absolute",
              top: 8,
              right: 8,
              backgroundColor: "rgba(255, 255, 255, 0.9)", // ✅ Más blanco para mejor visibilidad
              color: "#d32f2f", // ✅ Rojo más intenso
              borderRadius: "50%", // ✅ Circular
              border: "2px solid rgba(0, 0, 0, 0.3)", // ✅ Borde más grueso
              boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.4)", // ✅ Sombra más visible
              transition: "transform 0.3s ease-in-out, background-color 0.3s ease-in-out, box-shadow 0.3s ease-in-out",
              "&:hover": {
                backgroundColor: "rgba(255, 255, 255, 1)", // 🔹 Se vuelve completamente blanco
                transform: "scale(1.2)", // 🔹 Hace que el botón crezca más al pasar el mouse
                boxShadow: "0px 6px 12px rgba(0, 0, 0, 0.5)", // 🔹 Aumenta la sombra para destacar más
              },
              "&:active": {
                transform: "scale(1.1)", // 🔹 Reduce el efecto cuando se hace clic
              },
              "@media (max-width: 600px)": {
                width: "40px", // 🔹 Aumenta el tamaño en móviles
                height: "40px",
              },
            }}
          >
            <HideImage fontSize="medium" />
          </IconButton>
        </Box>
      )}
    </Box>
  );
};

