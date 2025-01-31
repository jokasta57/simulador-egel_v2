import React from "react"
import { RadioGroup, FormControlLabel, Radio, TextField, IconButton, Box, Button, Stack, Tooltip } from "@mui/material"
import { Delete as DeleteIcon, Add as AddIcon, Image as ImageIcon } from "@mui/icons-material"

const defaultOptions = [
  { contenido: "", imagen_url: null, es_correcta: false, public_id_imagen: null },
  { contenido: "", imagen_url: null, es_correcta: false, public_id_imagen: null },
  { contenido: "", imagen_url: null, es_correcta: false, public_id_imagen: null },
  { contenido: "", imagen_url: null, es_correcta: false, public_id_imagen: null },
]

export const OptionList = ({
  opciones = defaultOptions,
  opcion = [],
  respuestaCorrecta,
  onOptionUpdate,
  onCorrectAnswerChange,
  isSaved,
  setIsSaved,
}) => {
  const options = opciones.length > 0 ? opciones : opcion.length > 0 ? opcion : defaultOptions

  const handleOptionTextChange = (index, value) => {
    setIsSaved(false);
    
    const newOptions = [...options];
    newOptions[index] = { ...newOptions[index], contenido: value };
  
    onOptionUpdate(-1, "update_all", newOptions);
  };

  const handleOptionImageUpload = (index, imageData) => {
    onOptionUpdate(index, "imagen_url", imageData)
  }

  const handleAddOption = () => {
    if (options.length < 6) {
      const newOption = {
        contenido: "",
        imagen_url: null,
        es_correcta: false,
        public_id_imagen: null,
      };
  
      const updatedOptions = [...options, newOption];
      onOptionUpdate(-1, "update_all", updatedOptions);
  
      // ✅ Deshabilitar el botón si la nueva opción es vacía
      setIsSaved(false);
    }
  };

  const handleDeleteOption = (index) => {
    if (options.length > 2) {
      const newOptions = options.filter((_, i) => i !== index)
      onOptionUpdate(-1, "update_all", newOptions)
    }
  }

  return (
    <Box sx={{ width: "100%" }}>
      <RadioGroup value={respuestaCorrecta} onChange={(e) => onCorrectAnswerChange(Number(e.target.value))}>
        <Stack spacing={1.5}>
          {options.map((opcion, index) => (
            <Box
              key={index}
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
              }}
            >
              <FormControlLabel
                value={index}
                control={
                  <Radio
                    checked={opcion.es_correcta || index === respuestaCorrecta}
                    onChange={(e) => {
                      const newOptions = options.map((opt, i) => ({
                        ...opt,
                        es_correcta: i === index,
                      }))
                      onOptionUpdate(-1, "update_all", newOptions)
                      onCorrectAnswerChange(index)
                    }}
                    sx={{
                      "&.Mui-checked": {
                        color: "#d32f2f",
                      },
                    }}
                  />
                }
                label=""
                sx={{ m: 0 }}
              />
              <TextField
                fullWidth
                placeholder={`Opción ${index + 1}`}
                value={opcion.contenido || ""}
                onChange={(e) => handleOptionTextChange(index, e.target.value)}
                size="small"
                error={!opcion.contenido?.trim() && !opcion.imagen_url} // ❌ Si no tiene texto ni imagen, marcar como error
                helperText={!opcion.contenido?.trim() && !opcion.imagen_url ? "Debe agregar texto o una imagen. Si no, elimínela" : ""}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    backgroundColor: "#fff",
                  },
                  "& .MuiOutlinedInput-input::placeholder": {
                    color: "rgba(0, 0, 0, 0.38)",
                  },
                }}
              />
              <Box sx={{ display: "flex", gap: 0.5 }}>
                <Tooltip title="Agregar imagen">
                  <IconButton
                    size="small"
                    onClick={() => handleOptionImageUpload(index, "URL_DE_IMAGEN")} // Aquí deberías implementar la lógica real de carga de imágenes
                    sx={{
                      color: "action.active",
                      "&:hover": {
                        color: "#d32f2f",
                      },
                    }}
                  >
                    <ImageIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                {options.length > 2 && (
                  <Tooltip title="Eliminar opción">
                    <IconButton
                      size="small"
                      onClick={() => handleDeleteOption(index)}
                      sx={{
                        color: "action.active",
                        "&:hover": {
                          color: "#d32f2f",
                        },
                      }}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                )}
              </Box>
            </Box>
          ))}
        </Stack>
      </RadioGroup>

      <Button
        startIcon={<AddIcon />}
        onClick={handleAddOption}
        disabled={options.length >= 6}
        sx={{
          mt: 2,
          color: "#d32f2f",
          textTransform: "none",
          fontWeight: "normal",
          "&:hover": {
            backgroundColor: "rgba(211, 47, 47, 0.04)",
          },
        }}
      >
        Agregar Opción
      </Button>
    </Box>
  )
}

