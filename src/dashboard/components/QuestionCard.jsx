import React, { memo, useCallback, useState, useEffect } from "react"
import { Card, CardContent, Typography, TextField, Button, Box, CircularProgress, Snackbar, Alert } from "@mui/material"
import { Delete as DeleteIcon, Save as SaveIcon } from "@mui/icons-material"
import { OptionList } from "./OptionList"
import { ImageUpload } from "./ImageUpload"
import { useSelector } from "react-redux"
import { useExamsStore } from "../../hooks/exams/useExamsStore"
import { LoadingSpinner } from "../../simulator/components/LoadingSpinner"

export const QuestionCard = memo(({ onDelete, onUpdate, setIsDirty }) => {
  const { currentQuestion, preguntaNueva, currentOrder, currentExam } = useSelector((state) => state.exams)
  const { handleUpdateQuestion, handleSaveQuestion, handleResetCurrentQuestion, isLoading, handleAddNewQuestion } = useExamsStore()
  const { newExamInfo } = useSelector((state) => state.createExam)


  const [isSaved, setIsSaved] = useState(false)
  const [localQuestion, setLocalQuestion] = useState(currentQuestion || {})
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [hasAttemptedSave, setHasAttemptedSave] = useState(false);


  const opcionesValidas = localQuestion.opcion?.filter(op =>
    (op.contenido?.trim() !== "" || op.imagen_url !== null)
  ) || [];

  const questionToShow = preguntaNueva || currentQuestion;

  if (!questionToShow) {
    return null;
  }

  useEffect(() => {
    if (currentQuestion) {
      setLocalQuestion({
        ...currentQuestion,
        imagen_url: currentQuestion.imagen_url || null,
      });
      setIsSaved(false); // 🔹 Resetear estado de guardado al cambiar de pregunta
      setHasAttemptedSave(false); // 🔹 Reiniciar validaciones
    }
  }, [currentQuestion]);

  useEffect(() => {
    return () => {
      handleResetCurrentQuestion();
    }
  }, [])


  const handleQuestionChange = useCallback((e) => {
    setIsDirty(true)
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
    setIsDirty(true)
    setLocalQuestion((prev) => {
      const nuevasOpciones = [...(prev.opcion || [])]
      if (campo === "add") {
        nuevasOpciones.push(valor)
      } else if (campo === "delete") {
        nuevasOpciones.splice(opcionIndex, 1)
      } else if (campo === "update_all") {
        setIsDirty(false)
        return { ...prev, opcion: valor }
      } else {
        setIsDirty(false)
        nuevasOpciones[opcionIndex] = { ...nuevasOpciones[opcionIndex], [campo]: valor }
        // Si el campo actualizado es previewUrl, mantener isDirty en true
        if (campo === "previewUrl") {
          setIsDirty(true);
        }
      }
      return { ...prev, opcion: nuevasOpciones }
    })
  }, [])

  const handleCorrectAnswerChange = useCallback((opcionIndex) => {
    setIsSaved(false)
    setLocalQuestion((prev) => ({ ...prev, es_correcta: opcionIndex }))
  }, [])

  const handleSave = useCallback(async () => {
    setHasAttemptedSave(true); // 🔹 Activar validaciones después del intento de guardar
    // Verificar si `localQuestion.opcion` es un array
    const opciones = Array.isArray(localQuestion.opcion) ? localQuestion.opcion : [localQuestion.opcion];

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
    // **Verificar si alguna opción está marcada como correcta**
    const tieneOpcionCorrecta = opcionesNoVacias.some(op => op.es_correcta === true);
    if (!tieneOpcionCorrecta) {
      setSnackbarMessage("❌ Debes seleccionar una opción como respuesta correcta.");
      setShowSnackbar(true);
      return;
    }

    try {
      // ✅ Actualizar `localQuestion` antes de enviarlo al backend
      const preguntaFiltrada = {
        ...localQuestion,
        opcion: opcionesNoVacias // ⬅️ Aquí eliminamos las opciones vacías
      };

      let response;
      if (localQuestion.id_pregunta) {
        // Si ya existe, actualizar con PUT
        try {
          response = await handleUpdateQuestion(preguntaFiltrada);
        } catch (error) {
          setSnackbarMessage("❌ Error al actualizar la pregunta");
        }
      } else {
        const examId = currentExam?.id_examen || newExamInfo?.id_examen;
        if (examId) {
          try {
            response = await handleAddNewQuestion(preguntaFiltrada, examId, preguntaNueva.orden);
          } catch (error) {
            setSnackbarMessage("❌ ", error);
          }
        } else {
          setSnackbarMessage("❌ El examen no existe o ha sido eliminado");
          return;
        }
      }
      // await handleSaveQuestion()
      console.log(response);
      setIsSaved(true);
      setSnackbarMessage(response?.msg || "Pregunta guardada con éxito ✅");
      setShowSnackbar(true);
      setIsDirty(false)
      // Aquí puedes manejar el éxito del guardado, por ejemplo, mostrando un mensaje
    } catch (error) {
      let errorMessage = error || "❌ Error al guardar la pregunta";
      console.log(errorMessage);
      setSnackbarMessage('❌ ' + errorMessage);
      setShowSnackbar(true);
    }
  }, [localQuestion, handleUpdateQuestion])

  if (!localQuestion) {
    return null
  }

  if (isLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100%" }}>
        <LoadingSpinner />
      </Box>
    );
  }

  return (
    <Card id={`pregunta-${localQuestion.id_pregunta}`} >
      <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            justifyContent: "space-between",
            alignItems: { xs: "flex-start", sm: "center" },
            mb: { xs: 2, sm: 3 },
            mt: { xs: 2, sm: 3 }, // Agregar margen superior
          }}
        >
          <Typography variant="h6" sx={{ mb: { xs: 1, sm: 0 } }}>
            Pregunta {currentOrder}
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
            rows={5}
            label=""
            placeholder="Escribe la pregunta aquí..." // Placeholder agregado
            value={localQuestion.contenido || ""}
            onChange={handleQuestionChange}
            sx={{ mb: 2 }}
            error={hasAttemptedSave && (!localQuestion.contenido || localQuestion.contenido.trim() === "")}
            helperText={hasAttemptedSave && (!localQuestion.contenido || localQuestion.contenido.trim() === "") ? "La pregunta no puede estar vacía" : ""}
            required
          />

          <ImageUpload
            currentImage={localQuestion.imagen_url}
            currentQuestion={localQuestion}
            setCurrentQuestion={setLocalQuestion}
            onImageUpload={handleImageUpload}
            isSaved={isSaved}
            setIsSaved={setIsSaved}
            setIsDirty={setIsDirty}
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
          hasAttemptedSave={hasAttemptedSave}
        />

        <Box sx={{ mt: { xs: 2, sm: 3 } }}>
          <Button
            variant="contained"
            color={isSaved ? "success" : "primary"}
            startIcon={<SaveIcon />}
            onClick={handleSave}
            sx={{ width: { xs: "100%", sm: "auto" } }}
          >
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
        <Alert
          severity={snackbarMessage.includes("❌") ? "error" : "success"}
          variant="filled"
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Card>
  )
})

QuestionCard.displayName = "QuestionCard"

