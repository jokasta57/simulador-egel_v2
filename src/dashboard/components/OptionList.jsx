import React, { useEffect, useState } from "react"
import { RadioGroup, FormControlLabel, Radio, TextField, IconButton, Box, Button, Stack, Tooltip, Typography } from "@mui/material"
import { Delete as DeleteIcon, Add as AddIcon, Image as ImageIcon, HideImage } from "@mui/icons-material"
import { useExamsStore } from "../../hooks/exams/useExamsStore"
import Swal from "sweetalert2"

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

  const [options, setOptions] = useState([]);
  const { handleDeleteOption, handleDeleteOptionImage } = useExamsStore()

  useEffect(() => {
    setOptions(prevOptions =>
      opciones.map((opt, index) => {
        let prevOption = prevOptions[index];

        let previewUrl =
          prevOption?.id_opcion === opt.id_opcion
            ? prevOption?.previewUrl ?? opt.imagen_url ?? ""
            : ""; // Si el ID cambia, se vacía previewUrl

        // Convertir a cadena de manera segura
        if (typeof previewUrl !== "string") {
          previewUrl = "";
        }

        // Si previewUrl comienza con "https", lo vaciamos
        if (previewUrl.startsWith("https")) {
          previewUrl = "";
        }

        return {
          ...opt,
          previewUrl
        };
      })
    );
  }, [opciones]); // Solo ejecuta si `opciones` cambia




  const handleOptionTextChange = (index, value) => {
    setIsSaved(false);

    const newOptions = [...options];
    newOptions[index] = { ...newOptions[index], contenido: value };

    onOptionUpdate(-1, "update_all", newOptions);
  };

  const handleOptionImageUpload = (event, index) => {
    const file = event.target.files[0];
    if (!file) return;

    // Crear URL temporal para la vista previa
    const objectUrl = URL.createObjectURL(file);

    // Actualizar solo la opción correspondiente
    setOptions(prevOptions =>
      prevOptions.map((opt, i) =>
        i === index ? { ...opt, previewUrl: objectUrl } : opt
      )
    );

    // Actualizar valores en el estado principal
    onOptionUpdate(index, "imagen_url", file);
    onOptionUpdate(index, "previewUrl", objectUrl);
  };

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

  const deleteOption = async (index, opcion) => {
    try {
      let message = "¿Estás seguro de que quieres eliminar esta opción?";
      let title = "Confirmar eliminación";

      if (opcion.es_correcta) {
        title = "⚠️ ¡Cuidado! Opción correcta";
        message = `<strong style="color: red;">Esta opción es la respuesta correcta.</strong> <br><br> 
             Si la eliminas, <strong>deberás seleccionar otra como correcta</strong>.`;
      }

      const result = await Swal.fire({
        title: title,
        html: message, // Usa 'html' en lugar de 'text' para personalizar el mensaje
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d32f2f",
        cancelButtonColor: "#6c757d",
        confirmButtonText: "Sí, eliminar",
        cancelButtonText: "Cancelar"
      });

      if (!result.isConfirmed) return; // Si el usuario cancela, salir

      if (options.length > 2) {
        const newOptions = options.filter((_, i) => i !== index)
        onOptionUpdate(-1, "update_all", newOptions)
      }

      await handleDeleteOption(opcion.id_opcion, opcion.id_pregunta);

    } catch (error) {
      console.error(error);

    }
  }

  const handleRemoveOptionImage = async (index, { id_opcion, id_pregunta }) => {
    try {
      Swal.fire({
        title: "¿Eliminar imagen?",
        text: "La imagen de esta opción se eliminará permanentemente.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d32f2f",
        cancelButtonColor: "#6c757d",
        confirmButtonText: "Sí, eliminar",
        cancelButtonText: "Cancelar"
      }).then(async (result) => {
        if (result.isConfirmed) {
          // Actualizar el estado eliminando la imagen de la opción
          setOptions((prevOptions) => {
            const updatedOptions = prevOptions.map((opt, i) =>
              i === index ? { ...opt, imagen_url: "", previewUrl: "" } : opt
            );
            return [...updatedOptions]; // Devuelve un nuevo array para forzar la re-renderización
          });
          onOptionUpdate(index, "imagen_url", null);
          onOptionUpdate(index, "previewUrl", null);
          await handleDeleteOptionImage(id_opcion, id_pregunta);
        }
      });
    } catch (error) {
      console.log(error);
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

                    {(opcion.previewUrl || opcion.imagen_url) && (
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
                          src={opcion.previewUrl || opcion.imagen_url}
                          alt="Opción"
                          style={{
                            width: "100%",
                            height: "auto",
                            objectFit: "contain",
                          }}
                        />
                        <IconButton
                          onClick={() => handleRemoveOptionImage(index, opcion)}
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
                    <Tooltip title={opcion.imagen_url ? "Cambiar Imagen" : "Agregar Imagen"}>
                      <IconButton
                        component="label"
                        size="small"
                        sx={{ color: "action.active", "&:hover": { color: "#d32f2f" } }}
                      >
                        <input type="file" hidden accept="image/*" onChange={(e) => handleOptionImageUpload(e, index)} />
                        {!opcion.imagen_url && <ImageIcon fontSize="small" />}
                      </IconButton>
                    </Tooltip>
                    <Tooltip title={options.length <= 2 ? "No puede haber menos de 2 opciones disponibles" : "Eliminar opción"}>
                      <span>
                        <IconButton
                          size="small"
                          onClick={() => deleteOption(index, opcion)}
                          sx={{ color: "action.active", "&:hover": { color: "#d32f2f" } }}
                          disabled={options.length <= 2}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </span>
                    </Tooltip>
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

