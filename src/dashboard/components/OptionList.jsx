import React from "react"
import { RadioGroup, FormControlLabel, Radio, TextField, IconButton, Box, Button, Stack, Tooltip } from "@mui/material"
import { Delete as DeleteIcon, Add as AddIcon, Image as ImageIcon } from "@mui/icons-material"

export const OptionList = ({ opciones = [], respuestaCorrecta, onOptionUpdate, onCorrectAnswerChange }) => {
  const handleOptionTextChange = (index, value) => {
    onOptionUpdate(index, "contenido", value)
  }

  const handleOptionImageUpload = (index, imageData) => {
    onOptionUpdate(index, "imagen_url", imageData)
  }

  const handleAddOption = () => {
    onOptionUpdate(opciones.length, "add", {
      contenido: "",
      imagen_url: null,
      es_correcta: false,
      public_id_imagen: null,
    })
  }

  const handleDeleteOption = (index) => {
    if (opciones.length > 2) {
      onOptionUpdate(index, "delete", null)
    }
  }

  return (
    <Box sx={{ width: "100%" }}>
      <RadioGroup value={respuestaCorrecta} onChange={(e) => onCorrectAnswerChange(Number(e.target.value))}>
        <Stack spacing={1.5}>
          {opciones &&
            opciones.map((opcion, index) => (
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
                      checked={opcion.es_correcta}
                      onChange={(e) => {
                        const newOpciones = opciones.map((opt, i) => ({
                          ...opt,
                          es_correcta: i === index,
                        }))
                        onOptionUpdate(-1, "update_all", newOpciones)
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
                  {index > 1 && (
                    <Tooltip title="Eliminar opción">
                      <IconButton
                        size="small"
                        onClick={() => handleDeleteOption(index)}
                        disabled={opciones.length <= 2}
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

