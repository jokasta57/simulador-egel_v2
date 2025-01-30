import React, { useState, useMemo, useCallback } from "react"
import {
  Box,
  Typography,
  Button,
  Stack,
  Snackbar,
  Alert,
  CircularProgress,
  IconButton,
  Grid,
  Paper,
  Chip,
} from "@mui/material"
import EditIcon from "@mui/icons-material/Edit"
import { saveExam, saveQuestion, loadSavedExam } from "../../actions/examActions"
import { ExamInfo } from "./ExamInfo"
import { QuestionCard } from "./QuestionCard"
import { FloatingAddButton } from "./FloatingAddButton"
import { useCreateExamStore } from "../../hooks/useCreateExamStore"

export const CreateExam = () => {
  const [examInfo, setExamInfo] = useState({
    titulo: "",
    duracion: "",
    carrera: "",
    periodo: "",
    area: "",
  })

  const { handleSaveExamInfo } = useCreateExamStore()

  const [preguntas, setPreguntas] = useState([])
  const [preguntasGuardadas, setPreguntasGuardadas] = useState({})
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState(null)
  const [isExamInfoSaved, setIsExamInfoSaved] = useState(false)
  const [isExamInfoEditable, setIsExamInfoEditable] = useState(true)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)

  const handleExamInfoChange = useCallback((newExamInfo) => {
    setExamInfo(newExamInfo)
    setIsExamInfoSaved(false)
  }, [])

  const isExamInfoComplete = useMemo(() => {
    return (
      examInfo.titulo.trim() !== "" &&
      examInfo.duracion.toString().trim() !== "" &&
      examInfo.carrera !== "" &&
      examInfo.periodo !== "" &&
      examInfo.area !== ""
    )
  }, [examInfo])

  const guardarInformacionExamen = useCallback(async () => {
    if (!isExamInfoComplete) {
      setError("Por favor, complete toda la información del examen antes de guardar.")
      return
    }

    setIsLoading(true)
    try {
      await handleSaveExamInfo(examInfo.titulo, examInfo.duracion, examInfo.carrera, examInfo.periodo, examInfo.area)
      setIsExamInfoSaved(true)
      setIsExamInfoEditable(false)
      setSuccess("Información del examen guardada exitosamente")
      setLastSaved(new Date())
    } catch (error) {
      console.error(error)
      setError("Error al guardar la información del examen")
    } finally {
      setIsLoading(false)
    }
  }, [examInfo, isExamInfoComplete, handleSaveExamInfo])

  const agregarPregunta = useCallback(() => {
    if (!isExamInfoSaved) {
      setError("Por favor, guarde la información del examen antes de agregar preguntas.")
      return
    }

    const nuevaPregunta = {
      id: Date.now(),
      pregunta: "",
      imagen: null,
      opciones: Array(4)
        .fill("")
        .map(() => ({ texto: "", imagen: null, es_correcta: false })),
      respuestaCorrecta: 0,
    }
    setPreguntas((prev) => [...prev, nuevaPregunta])
    setCurrentQuestionIndex(preguntas.length)
  }, [isExamInfoSaved, preguntas])

  const eliminarPregunta = useCallback(
    (preguntaId) => {
      setPreguntas((prev) => prev.filter((p) => p.id !== preguntaId))
      setPreguntasGuardadas((prev) => {
        const newPreguntasGuardadas = { ...prev }
        delete newPreguntasGuardadas[preguntaId]
        return newPreguntasGuardadas
      })
      if (currentQuestionIndex >= preguntas.length - 1) {
        setCurrentQuestionIndex(Math.max(0, preguntas.length - 2))
      }
    },
    [preguntas, currentQuestionIndex],
  )

  const actualizarPregunta = useCallback((preguntaId, campo, valor) => {
    setPreguntas((prev) => prev.map((p) => (p.id === preguntaId ? { ...p, [campo]: valor } : p)))
    setPreguntasGuardadas((prev) => ({ ...prev, [preguntaId]: false }))
  }, [])

  const guardarPregunta = useCallback(
    async (preguntaId) => {
      const pregunta = preguntas.find((p) => p.id === preguntaId)
      if (!pregunta) return

      setIsSaving(true)
      try {
        await saveQuestion(pregunta)
        setPreguntasGuardadas((prev) => ({ ...prev, [preguntaId]: true }))
        setLastSaved(new Date())
        setSuccess("Pregunta guardada exitosamente")
      } catch (error) {
        console.error("Error al guardar la pregunta:", error)
        setError("Error al guardar la pregunta")
      } finally {
        setIsSaving(false)
      }
    },
    [preguntas],
  )

  const currentQuestion = useMemo(() => {
    return preguntas[currentQuestionIndex]
  }, [preguntas, currentQuestionIndex])

  const handleCloseSnackbar = useCallback(() => {
    setError(null)
    setSuccess(null)
  }, [])

  const toggleExamInfoEdit = useCallback(() => {
    setIsExamInfoEditable((prev) => !prev)
  }, [])

  const handleQuestionSelect = useCallback((index) => {
    setCurrentQuestionIndex(index)
  }, [])

  return (
    <Box
      sx={{
        maxWidth: { xs: "100%", sm: "540px", md: "720px", lg: "960px", xl: "1140px" },
        margin: "0 auto",
        p: { xs: 2, sm: 3 },
        pb: { xs: 16, sm: 10 },
      }}
    >
      <Typography
        variant="h4"
        component="h1"
        sx={{
          mb: { xs: 2, sm: 4 },
          fontWeight: "bold",
          fontSize: { xs: "1.5rem", sm: "2rem", md: "2.125rem" },
        }}
      >
        Crear Nuevo Examen
      </Typography>

      <Box sx={{ position: "relative", mb: 4 }}>
        <ExamInfo examInfo={examInfo} onExamInfoChange={handleExamInfoChange} disabled={!isExamInfoEditable} />
        {isExamInfoSaved && (
          <IconButton onClick={toggleExamInfoEdit} sx={{ position: "absolute", top: 0, right: 0 }}>
            <EditIcon />
          </IconButton>
        )}
      </Box>

      <Box
        sx={{
          display: "flex",
          justifyContent: "flex-end",
          mt: { xs: 1, sm: 2 },
          mb: { xs: 2, sm: 4 },
        }}
      >
        <Button
          variant="contained"
          onClick={guardarInformacionExamen}
          disabled={isLoading || !isExamInfoComplete || (isExamInfoSaved && !isExamInfoEditable)}
          sx={{
            bgcolor: isExamInfoSaved ? "success.main" : "primary.main",
            "&:hover": {
              bgcolor: isExamInfoSaved ? "success.dark" : "primary.dark",
            },
            width: { xs: "100%", sm: "auto" },
          }}
        >
          {isLoading ? (
            <CircularProgress size={24} color="inherit" />
          ) : isExamInfoSaved && !isExamInfoEditable ? (
            "Información guardada"
          ) : isExamInfoComplete ? (
            "Guardar información"
          ) : (
            "Debe completar la información"
          )}
        </Button>
      </Box>

      {isExamInfoSaved && (
        <>
          <Box sx={{ mb: 3, display: "flex", flexWrap: "wrap", gap: 1 }}>
            {preguntas.map((_, index) => (
              <Chip
                key={index}
                label={`P${index + 1}`}
                onClick={() => handleQuestionSelect(index)}
                color={index === currentQuestionIndex ? "primary" : "default"}
                variant={index === currentQuestionIndex ? "filled" : "outlined"}
              />
            ))}
          </Box>

          {currentQuestion && (
            <QuestionCard
              key={currentQuestion.id}
              pregunta={currentQuestion}
              index={currentQuestionIndex}
              onDelete={eliminarPregunta}
              onSave={guardarPregunta}
              // isSaved={preguntasGuardadas[currentQuestion.id]}
            />
          )}
        </>
      )}

      <FloatingAddButton onClick={agregarPregunta} disabled={!isExamInfoSaved} />

      <Snackbar
        open={error !== null || success !== null}
        autoHideDuration={5000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert onClose={handleCloseSnackbar} severity={error ? "error" : "success"} sx={{ width: "100%" }}>
          {error || success}
        </Alert>
      </Snackbar>
    </Box>
  )
}

