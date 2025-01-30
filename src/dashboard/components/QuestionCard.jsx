import React, { memo, useCallback, useState, useEffect } from "react"
import { Card, CardContent, Typography, TextField, Button, Box, CircularProgress, Snackbar, Alert } from "@mui/material"
import { Delete as DeleteIcon, Save as SaveIcon } from "@mui/icons-material"
import { OptionList } from "./OptionList"
import { ImageUpload } from "./ImageUpload"
import { useSelector } from "react-redux"
import { useExamsStore } from "../../hooks/exams/useExamsStore"

export const QuestionCard = memo(({ index, onDelete }) => {
  const { currentQuestion } = useSelector((state) => state.exams)
  const { handleUpdateQuestion, handleSaveQuestion, handleResetCurrentQuestion, isLoading } = useExamsStore()

  const [isSaved, setIsSaved] = useState(false)
  const [localQuestion, setLocalQuestion] = useState(currentQuestion || {})
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");

  const opcionesValidas = localQuestion.opcion?.filter(op =>
    (op.contenido?.trim() !== "" || op.imagen_url !== null)
  ) || [];


  useEffect(() => {
    if (currentQuestion) {
      setLocalQuestion({
        ...currentQuestion,
        imagen_url: currentQuestion.imagen_url || null, // ✅ Asegurar que la imagen cambia
      });
    }
  }, [currentQuestion]);

  useEffect(() => {
    return () => {
      handleResetCurrentQuestion();
    }
  }, [handleResetCurrentQuestion])


  const handleQuestionChange = useCallback((e) => {
    const newContent = e.target.value
    setIsSaved(false)
    setLocalQuestion((prev) => ({ ...prev, contenido: newContent }))
  }, [])

  const handleImageUpload = useCallback((imageFile) => {
    setLocalQuestion((prev) => ({
      ...prev,
      imagen_url: imageFile, // ✅ Almacenar correctamente la imagen nueva
    }));
  }, []);

  const handleOptionUpdate = useCallback((opcionIndex, campo, valor) => {
    setLocalQuestion((prev) => {
      const nuevasOpciones = [...(prev.opcion || [])]
      if (campo === "add") {
        nuevasOpciones.push(valor)
      } else if (campo === "delete") {
        nuevasOpciones.splice(opcionIndex, 1)
      } else if (campo === "update_all") {
        return { ...prev, opcion: valor }
      } else {
        nuevasOpciones[opcionIndex] = { ...nuevasOpciones[opcionIndex], [campo]: valor }
      }
      return { ...prev, opcion: nuevasOpciones }
    })
  }, [])

  const handleCorrectAnswerChange = useCallback((opcionIndex) => {
    setIsSaved(false)
    setLocalQuestion((prev) => ({ ...prev, es_correcta: opcionIndex }))
  }, [])

  const handleSave = useCallback(async () => {
    // Filtrar opciones para eliminar las vacías antes de enviarlas
    const opcionesNoVacias = localQuestion.opcion?.filter(op =>
      (op.contenido?.trim() !== "" || op.imagen_url !== null)
    ) || [];

    // Validar pregunta y opciones
    if (!localQuestion.contenido || localQuestion.contenido.trim() === "") {
      setSnackbarMessage("❌ La pregunta no puede estar vacía");
      setShowSnackbar(true);
      return;
    }

    if (opcionesNoVacias.length < 2) {
      setSnackbarMessage("❌ Debes agregar al menos 2 opciones con texto o imagen.");
      setShowSnackbar(true);
      return;
    }
    try {
      // ✅ Actualizar `localQuestion` antes de enviarlo al backend
      const preguntaFiltrada = {
        ...localQuestion,
        opcion: opcionesNoVacias // ⬅️ Aquí eliminamos las opciones vacías
      };

      const response = await handleUpdateQuestion(preguntaFiltrada)
      // await handleSaveQuestion()
      setIsSaved(true);
      setSnackbarMessage(response?.msg || "Pregunta guardada con éxito ✅");
      setShowSnackbar(true);
      // Aquí puedes manejar el éxito del guardado, por ejemplo, mostrando un mensaje
    } catch (error) {
      console.error("Error al guardar la pregunta:", error.response.data.errors.contenido.msg);

      let errorMessage = "❌ Error al guardar la pregunta";

      if (error.response?.data?.errors) {
        // ✅ Extraer y concatenar los mensajes de error
        errorMessage = Object.values(error.response.data.errors)
          .map(err => err.msg) // Obtener solo los mensajes
          .join(", "); // Unir en un solo string
      } else if (typeof error.response?.data?.msg === "string") {
        errorMessage = error.response.data.msg;
      }

      setSnackbarMessage(errorMessage);
      setShowSnackbar(true);
    }
  }, [localQuestion, handleUpdateQuestion])

  if (!localQuestion) {
    return null
  }

  return (
    <Card id={`pregunta-${localQuestion.id_pregunta}`}>
      <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            justifyContent: "space-between",
            alignItems: { xs: "flex-start", sm: "center" },
            mb: { xs: 2, sm: 3 },
          }}
        >
          <Typography variant="h6" sx={{ mb: { xs: 1, sm: 0 } }}>
            Pregunta {localQuestion.orden || index + 1}
          </Typography>
          <Button
            variant="outlined"
            color="error"
            startIcon={<DeleteIcon />}
            onClick={() => onDelete(localQuestion.id_pregunta)}
            sx={{ width: { xs: "100%", sm: "auto" } }}
          >
            Eliminar Pregunta
          </Button>
        </Box>

        <Box sx={{ mb: 3 }}>
          <TextField
            fullWidth
            multiline
            rows={3}
            label=""
            value={localQuestion.contenido || ""}
            onChange={handleQuestionChange}
            sx={{ mb: 2 }}
            error={!localQuestion.contenido || localQuestion.contenido.trim() === ""}
            helperText={!localQuestion.contenido || localQuestion.contenido.trim() === "" ? "La pregunta no puede estar vacía" : ""}
            required
          />

          <ImageUpload
            currentImage={localQuestion.imagen_url}
            onImageUpload={handleImageUpload}
            setIsSaved={setIsSaved}
            label="Imagen de la pregunta"
          />
        </Box>

        <OptionList
          opciones={localQuestion.opcion}
          respuestaCorrecta={localQuestion.es_correcta}
          onOptionUpdate={handleOptionUpdate}
          onCorrectAnswerChange={handleCorrectAnswerChange}
          isSaved={isSaved}
          setIsSaved={setIsSaved}
        />

        <Box sx={{ mt: { xs: 2, sm: 3 } }}>
          <Button
            variant="contained"
            color={isSaved ? "success" : "primary"}
            startIcon={<SaveIcon />}
            onClick={handleSave}
            disabled={
              isLoading ||
              !localQuestion.contenido ||
              localQuestion.contenido.trim() === "" ||
              (localQuestion.opcion?.filter(op => (op.contenido?.trim() !== "" || op.imagen_url)) || []).length < 2 ||
              opcionesValidas.length < 2
            }
            sx={{ width: { xs: "100%", sm: "auto" } }}
          >
            {/* {isSaved ? "Guardado" : "Guardar Pregunta"} */}
            {isLoading ? <CircularProgress size={24} color="inherit" /> : (isSaved ? "Guardado" : "Guardar Pregunta")}
          </Button>
        </Box>
      </CardContent>
      {/* Snackbar para notificaciones */}
      <Snackbar
        open={showSnackbar}
        autoHideDuration={3000}
        onClose={() => setShowSnackbar(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity={snackbarMessage.includes("Error") ? "error" : "success"} variant="filled">
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Card>
  )
})

QuestionCard.displayName = "QuestionCard"

