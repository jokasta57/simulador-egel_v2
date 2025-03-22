import React, { memo, useCallback, useState, useEffect, useRef } from "react"
import { Card, CardContent, Typography, TextField, Button, Box, CircularProgress, Snackbar, Alert } from "@mui/material"
import { Delete as DeleteIcon, Save as SaveIcon } from "@mui/icons-material"
import { OptionList } from "./OptionList"
import { ImageUpload } from "./ImageUpload"
import { useSelector } from "react-redux"
import { useExamsStore } from "../../hooks/exams/useExamsStore"
import { LoadingSpinner } from "../../simulator/components/LoadingSpinner"

export const QuestionCard = memo(({ onDelete, onUpdate, setIsDirty }) => {
  // Obtener datos del estado global de Redux
  const { currentQuestion, preguntaNueva, currentOrder, currentExam } = useSelector((state) => state.exams);
  const { newExamInfo } = useSelector((state) => state.createExam);

  // Hook personalizado para manejar preguntas
  const { handleUpdateQuestion, handleResetCurrentQuestion, isLoading, handleAddNewQuestion } = useExamsStore();

  // Estados locales
  const [isSaved, setIsSaved] = useState(false);
  const [localQuestion, setLocalQuestion] = useState(currentQuestion || {}); // Estado local de la pregunta
  const [hasAttemptedSave, setHasAttemptedSave] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Determinar la pregunta a mostrar (pregunta nueva o existente)
  const questionToShow = preguntaNueva || currentQuestion;

  // Si no hay pregunta para mostrar, no renderizar nada
  if (!questionToShow) {
    return null;
  }

  // Actualiza el estado local con la pregunta actual y maneja la inicialización de opciones de respuesta.
  useEffect(() => {
    setLocalQuestion(prev => {
      const esPreguntaNueva = !currentQuestion?.id_pregunta;

      return {
        ...currentQuestion,
        imagen_url: currentQuestion.imagen_url || null,
        opcion: esPreguntaNueva
          ? Array(4).fill({
            contenido: "",
            imagen_url: null,
            es_correcta: false,
            public_id_imagen: null
          })
          : currentQuestion.opcion?.length > 0
            ? currentQuestion.opcion.map(op => ({
              id_pregunta: op.id_pregunta,
              id_opcion: op.id_opcion,
              es_correcta: op.es_correcta,
              contenido: op.contenido || "",
              imagen_url: op.imagen_url || null
            }))
            : prev.opcion  // Mantener las opciones previas si ya estaban en `localQuestion`
      }
    });
    // Indicar que los cambios aún no han sido guardados
    setIsSaved(false);
    setHasAttemptedSave(false);

  }, [currentQuestion]); // Dependencia: se ejecuta cada vez que cambia `currentQuestion`


  //Resetea la pregunta actual para evitar datos residuales.
  useEffect(() => {
    return () => {
      handleResetCurrentQuestion();
    }
  }, [])


  const handleQuestionChange = useCallback((e) => {
    setIsDirty(true); // Marcamos el formulario como modificado
    const newContent = e.target.value
    setIsSaved(false)
    setLocalQuestion((prev) => ({ ...prev, contenido: newContent }))
  }, [])

  const handleImageUpload = useCallback((imageFile) => {
    setLocalQuestion((prev) => ({
      ...prev,
      imagen: imageFile, // ✅ Almacenar correctamente la imagen nueva
    }));
  }, []);

  const handleOptionUpdate = useCallback((opcionIndex, campo, valor) => {
    setIsDirty(true); // Marcar el formulario como modificado

    setLocalQuestion((prev) => {
      const nuevasOpciones = [...(prev.opcion || [])];

      if (campo === "add") {
        nuevasOpciones.push(valor);
      } else if (campo === "delete") {
        nuevasOpciones.splice(opcionIndex, 1);
      } else if (campo === "update_all") {
        return { ...prev, opcion: valor };
      } else {
        nuevasOpciones[opcionIndex] = { ...nuevasOpciones[opcionIndex], [campo]: valor };
      }

      return { ...prev, opcion: nuevasOpciones };
    });

    // Asegurar que setIsDirty(false) solo se llame después de actualizar el estado
    // if (campo === "update_all" || (campo !== "previewUrl" && campo !== "add" && campo !== "delete")) {
    //   setTimeout(() => setIsDirty(false), 0);
    // }
  }, []);

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
      (op.contenido?.trim() !== "" || op.imagen_url !== null || op.imagen !== null)
    ) || [];

    // Validar pregunta y opciones
    if (!localQuestion.contenido || localQuestion.contenido.trim() === "") {
      setError("La pregunta no puede estar vacía");
      return;
    }

    if (opcionesNoVacias.length < 2) {
      setError("Debes agregar al menos 2 opciones con texto o imagen.");
      return;
    }
    // **Verificar si alguna opción está marcada como correcta**
    const opcionCorrectaValida = opcionesNoVacias.find(op => op.es_correcta === true);
    const tieneOpcionCorrecta = opcionesNoVacias.some(op => op.es_correcta === true && (op.contenido !== '' || op.imagen_url !== null));

    if (!opcionCorrectaValida) {
      setError("Debes seleccionar al menos una opción como respuesta correcta.");
      return;
    }

    if (opcionCorrectaValida.contenido === '' && opcionCorrectaValida.imagen_url === null) {
      setError("La opción marcada como correcta debe tener texto o una imagen.");
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
          setSuccess("Pregunta actualizada correctamente")
          console.log(success);
          setIsSaved(true);
          setIsDirty(false)
        } catch (error) {
          setError(error);
        }
      } else {
        const examId = currentExam?.id_examen || newExamInfo?.id_examen;
        if (examId) {
          try {
            response = await handleAddNewQuestion(preguntaFiltrada, examId, preguntaNueva.orden);
            setSuccess(response?.msg || "Pregunta guardada correctamente");
            setIsSaved(true);
            setIsDirty(false)
          } catch (error) {
            setError(error);
          }
        } else {
          setError("El examen no existe o ha sido eliminado");
          return;
        }
      }
    } catch (error) {
      setError(error || "Error al guardar la pregunta");
    }
  }, [localQuestion, handleUpdateQuestion])

  if (!localQuestion) {
    return null
  }

  const handleCloseSnackbar = useCallback(() => {
    setError("")
    setSuccess("")
  }, [])

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
          {JSON.stringify(localQuestion.es_correcta)}

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
          setIsDirty={setIsDirty}
          hasAttemptedSave={hasAttemptedSave}
          setError={setError}
          setSuccess={setSuccess}
        />

        <Box sx={{ mt: { xs: 2, sm: 3 } }}>
          <Button
            variant="contained"
            color={"primary"}
            startIcon={<SaveIcon />}
            onClick={handleSave}
            disabled={isLoading}
            sx={{ width: { xs: "100%", sm: "auto" } }}
          >
            {isLoading ? <CircularProgress size={24} color="inherit" /> : "Guardar Pregunta"}
          </Button>
        </Box>
      </CardContent>
      {/* Snackbar para notificaciones */}
      <Snackbar
        open={Boolean(error || success)}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert onClose={handleCloseSnackbar} severity={error ? "error" : "success"} variant="filled">
          {error || success}
        </Alert>
      </Snackbar>
    </Card>
  )
})

QuestionCard.displayName = "QuestionCard"

