import React from "react"
import { RadioGroup, FormControlLabel, Radio, TextField, IconButton, Box, Button, Stack, Tooltip, Typography } from "@mui/material"
import { Delete as DeleteIcon, Add as AddIcon, Image as ImageIcon, HideImage } from "@mui/icons-material"

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
  hasAttemptedSave
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
    <Box sx={{
      // maxHeight: "auto", 
      // overflowY: "auto",
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
    }}>
      {/* Contenedor principal con flexGrow para ocupar el espacio disponible */}
      <Box sx={{
        flexGrow: 1,
        overflowY: "auto",  // Permite el desplazamiento en pantallas grandes
        paddingBottom: "20px", // Para evitar que los elementos se salgan de la vista
      }}>
        <RadioGroup value={respuestaCorrecta} onChange={(e) => onCorrectAnswerChange(Number(e.target.value))}>
          <Stack spacing={1.5}>
            {options.map((opcion, index) => (
              <Box key={index} sx={{ display: "flex", flexDirection: "column", gap: 1, mb: 2 }}>
                {/* Opción con radio, texto y botones de acción */}
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <FormControlLabel
                    value={index}
                    control={
                      <Radio
                        checked={opcion.es_correcta || index === respuestaCorrecta}
                        onChange={() => {
                          const newOptions = options.map((opt, i) => ({
                            ...opt,
                            es_correcta: i === index,
                          }));
                          onOptionUpdate(-1, "update_all", newOptions);
                          onCorrectAnswerChange(index);
                        }}
                        sx={{
                          "&.Mui-checked": { color: "#d32f2f" },
                        }}
                      />
                    }
                    label=""
                    sx={{ m: 0 }}
                  />

                  <Box sx={{ flex: 1 }}>
                    <Typography
                      variant="subtitle1"
                      color="textPrimary"
                      sx={{
                        fontWeight: 'bold',
                        marginBottom: 1,
                      }}
                    >
                      Opción {index + 1}
                    </Typography>
                    <TextField
                      fullWidth
                      placeholder={`Opción ${index + 1}`}
                      value={opcion.contenido || ""}
                      onChange={(e) => handleOptionTextChange(index, e.target.value)}
                      size="small"
                      error={hasAttemptedSave && (!opcion.contenido?.trim() && !opcion.imagen_url)}
                      helperText={hasAttemptedSave && (!opcion.contenido?.trim() && !opcion.imagen_url) ? "Debe agregar texto o una imagen." : ""}
                      sx={{
                        "& .MuiOutlinedInput-root": { backgroundColor: "#fff" },
                        "& .MuiOutlinedInput-input::placeholder": { color: "rgba(0, 0, 0, 0.38)" },
                      }}
                    />

                    {opcion.imagen_url && (
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
                          marginTop: 2,
                          marginBottom: 2,
                          transition: "box-shadow 0.3s ease-in-out",
                          "&:hover": {
                            boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.3)",
                          },
                        }}
                      >
                        <img
                          src={opcion.imagen_url}
                          alt="Opción"
                          style={{
                            width: "100%",
                            height: "auto",
                            objectFit: "contain",
                          }}
                        />

                        <IconButton
                          onClick={() => handleRemoveOptionImage(index)}
                          size="small"
                          sx={{
                            position: "absolute",
                            top: 6,
                            right: 6,
                            backgroundColor: "rgba(255, 255, 255, 0.9)",
                            color: "#d32f2f",
                            borderRadius: "50%",
                            border: "2px solid rgba(0, 0, 0, 0.3)",
                            boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.4)",
                            transition: "transform 0.3s ease-in-out, background-color 0.3s ease-in-out, box-shadow 0.3s ease-in-out",
                            "&:hover": {
                              backgroundColor: "rgba(255, 255, 255, 1)",
                              transform: "scale(1.2)",
                              boxShadow: "0px 6px 12px rgba(0, 0, 0, 0.5)",
                            },
                            "&:active": {
                              transform: "scale(1.1)",
                            },
                            "@media (max-width: 600px)": {
                              width: "36px",
                              height: "36px",
                            },
                          }}
                        >
                          <HideImage fontSize="small" />
                        </IconButton>
                      </Box>
                    )}
                  </Box>

                  {/* Botones de acción */}
                  <Box sx={{ display: "flex", gap: 0.5 }}>
                    <Tooltip title="Agregar imagen">
                      <IconButton
                        size="small"
                        onClick={() => handleOptionImageUpload(index)}
                        sx={{ color: "action.active", "&:hover": { color: "#d32f2f" } }}
                      >
                        <ImageIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    {options.length > 2 && (
                      <Tooltip title="Eliminar opción">
                        <IconButton
                          size="small"
                          onClick={() => handleDeleteOption(index)}
                          sx={{ color: "action.active", "&:hover": { color: "#d32f2f" } }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    )}
                  </Box>
                </Box>
              </Box>
            ))}
          </Stack>
        </RadioGroup>
      </Box>

      {/* Contenedor del botón separado del contenido principal */}
      <Box
        sx={{
          mt: 2,
          pt: 1,
          borderTop: '1px solid rgba(0, 0, 0, 0.1)',
        }}
      >
        <Button
          startIcon={<AddIcon />}
          onClick={handleAddOption}
          disabled={options.length >= 6}
          sx={{
            color: "#d32f2f",
            textTransform: "none",
            fontWeight: "normal",
            "&:hover": { backgroundColor: "rgba(211, 47, 47, 0.04)" },
          }}
        >
          Agregar Opción
        </Button>
      </Box>
    </Box>
  );
}

