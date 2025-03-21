import React, { useEffect, useRef, useState } from "react"
import { RadioGroup, FormControlLabel, Radio, TextField, IconButton, Box, Button, Stack, Tooltip, Typography } from "@mui/material"
import { Delete as DeleteIcon, Add as AddIcon, Image as ImageIcon, HideImage } from "@mui/icons-material"
import { useExamsStore } from "../../hooks/exams/useExamsStore"
import Swal from "sweetalert2"
import { useSelector } from "react-redux"

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
  setIsDirty,
  hasAttemptedSave,
  setError,
  setSuccess
}) => {

  const [options, setOptions] = useState([]);
  const { currentQuestion } = useSelector((state) => state.exams)
  const fileInputsRef = useRef([]);
  const { handleDeleteOption, handleDeleteOptionImage } = useExamsStore()

  useEffect(() => {
    if (respuestaCorrecta == null) {
      return;
    }
  }, [])

  // useEffect(() => {
  //   setOptions(prevOptions => {
  //     const nuevasOpciones = opciones.map((opt, index) => {
  //       let prevOption = prevOptions[index] || defaultOptions[index] || {
  //         contenido: "",
  //         imagen_url: null,
  //         es_correcta: false,
  //         public_id_imagen: null,
  //       };

  //       let previewUrl =
  //         prevOption?.id_opcion === opt.id_opcion
  //           ? prevOption?.previewUrl ?? opt.imagen_url ?? ""
  //           : "";

  //       if (typeof previewUrl !== "string") {
  //         previewUrl = "";
  //       }

  //       if (previewUrl.startsWith("https")) {
  //         previewUrl = "";
  //       }

  //       return {
  //         ...prevOption,
  //         ...opt,
  //         previewUrl
  //       };
  //     });

  //     // ⚡ Si ya hay opciones enviadas, no agregar opciones vacías
  //     if (nuevasOpciones.length === 0) {
  //       while (nuevasOpciones.length < 4) {
  //         nuevasOpciones.push({
  //           contenido: "",
  //           imagen_url: null,
  //           es_correcta: false,
  //           public_id_imagen: null,
  //           previewUrl: "",
  //         });
  //       }
  //     }

  //     return nuevasOpciones;
  //   });
  // }, [opciones ]);

  useEffect(() => {
    console.log(opciones);
    setOptions(prevOptions => {
      const nuevasOpciones = opciones.map((opt, index) => {
        let prevOption = prevOptions[index] || {
          contenido: "",
          imagen_url: null,
          es_correcta: false,
          public_id_imagen: null,
          previewUrl: "",
        };

        // ⚡ Si la opción cambia, limpiamos previewUrl
        let previewUrl = "";
        if (prevOption?.id_opcion === opt.id_opcion) {
          previewUrl = prevOption?.previewUrl ?? opt.imagen_url ?? "";
        }

        if (typeof previewUrl !== "string" || previewUrl.startsWith("https")) {
          previewUrl = "";
        }

        return {
          ...opt,
          previewUrl
        };
      });

      // ⚡ Asegurar que siempre haya 4 opciones
      while (nuevasOpciones.length < 4) {
        nuevasOpciones.push({
          contenido: "",
          imagen_url: null,
          es_correcta: false,
          public_id_imagen: null,
          previewUrl: "",
        });
      }

      console.log(nuevasOpciones);
      return nuevasOpciones;
    });
  }, [opciones, currentQuestion]);

  const handleOptionTextChange = (index, value) => {
    setIsSaved(false);
    setIsDirty(true)

    const newOptions = [...options];
    newOptions[index] = { ...newOptions[index], contenido: value };

    onOptionUpdate(-1, "update_all", newOptions);
  };

  const handleOptionImageUpload = (event, index) => {
    const file = event.target.files[0];
    if (!file) return;
    setIsDirty(true)
    const objectUrl = URL.createObjectURL(file);

    setOptions(prevOptions => {
      const newOptions = prevOptions.map((opt, i) =>
        i === index ? { ...opt, previewUrl: objectUrl, imagen_url: file } : opt
      );

      // Si hay menos de 4 opciones después de la actualización, agregamos las vacías
      while (newOptions.length < 4) {
        newOptions.push({ contenido: "", imagen_url: null, es_correcta: false, public_id_imagen: null, previewUrl: "" });
      }

      return newOptions;
    });

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
      if (opcion.id_opcion) {
        await handleDeleteOption(opcion.id_opcion, opcion.id_pregunta);
      }

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

          // 🔹 Resetear el input file para permitir volver a seleccionar la misma imagen
          if (fileInputsRef.current[index]) {
            fileInputsRef.current[index].value = "";
          }

          if (id_opcion !== undefined && id_pregunta !== undefined) {
            await handleDeleteOptionImage(id_opcion, id_pregunta);
          }
          setSuccess('Imagen eliminada correctamente')
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
        <RadioGroup onChange={(e) => onCorrectAnswerChange(Number(e.target.value))}>
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
                      Opción {index + 1} {opcion.contenido}
                    </Typography>
                    <TextField
                      fullWidth
                      multiline
                      rows={3} // Aumenta el número de filas para mayor altura
                      placeholder={`Opción ${index + 1}`}
                      value={opcion.contenido || ""}
                      onChange={(e) => handleOptionTextChange(index, e.target.value)}
                      error={hasAttemptedSave && (!opcion.contenido?.trim() && !opcion.imagen_url)}
                      helperText={hasAttemptedSave && (!opcion.contenido?.trim() && !opcion.imagen_url) ? "Debe agregar texto o una imagen." : ""}
                      sx={{
                        "& .MuiOutlinedInput-root": { backgroundColor: "#fff" },
                        "& .MuiOutlinedInput-input::placeholder": { color: "rgba(0, 0, 0, 0.38)" },
                        minHeight: "100px", // Asegura que el campo tenga más altura
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
                        <input
                          type="file"
                          hidden
                          accept="image/*"
                          ref={(el) => (fileInputsRef.current[index] = el)} // 🔹 Guardar la referencia
                          onChange={(e) => handleOptionImageUpload(e, index)}
                        />
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

