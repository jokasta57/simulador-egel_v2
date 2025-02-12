"use client"

import { useState, useEffect } from "react"
import { Container, Box, Snackbar, CircularProgress, Typography } from "@mui/material"
import { QuestionForm, QuestionPanel, ExamHeader } from "./"
import { useParams } from "react-router-dom"
import { useExamsStore } from "../../hooks/exams/useExamsStore"
import { useSelector } from "react-redux"



const sampleQuestions = [
  {
    id: 1,
    text: "¿Cuál es el propósito principal de la normalización de bases de datos?",
    options: [
      { value: "a", text: "Reducir la redundancia de datos" },
      { value: "b", text: "Aumentar el tamaño de la base de datos" },
      { value: "c", text: "Complicar las consultas" },
      { value: "d", text: "Ninguna de las anteriores" },
    ],
  },
  {
    id: 2,
    text: "¿Qué significa SQL?",
    options: [
      { value: "a", text: "Structured Query Language" },
      { value: "b", text: "Simple Query Language" },
      { value: "c", text: "Standard Query Language" },
      { value: "d", text: "System Query Language" },
    ],
  },
]

export const ExamQuestions = () => {
  const { id } = useParams()
  
  const [currentQuestion, setCurrentQuestion] = useState(1)
  const [answers, setAnswers] = useState({})
  const [snackbarOpen, setSnackbarOpen] = useState(false)
  const [remainingTime, setRemainingTime] = useState(null)
  const [loading, setLoading] = useState(true) // ✅ Estado de carga
  
  const { handleLoadExam } = useExamsStore()
  const { currentExam } = useSelector((state) => state.exams)

  useEffect(() => {
    const fetchExamInfo = async () => {
      setLoading(true)
      await handleLoadExam(id)
      setLoading(false)
    }
    fetchExamInfo()
  }, [id])

  // ✅ Configurar el tiempo restante en segundos cuando el examen esté listo
  useEffect(() => {
    if (currentExam?.duracion) {
      const [horas, minutos, segundos] = currentExam.duracion.split(":").map(Number)
      setRemainingTime(horas * 3600 + minutos * 60 + segundos) // Convierte a segundos
    }
  }, [currentExam])

  // ✅ Temporizador que decrementa el tiempo cada segundo
  useEffect(() => {
    if (remainingTime === null) return // Evitar que el temporizador se ejecute si no hay tiempo establecido

    const timer = setInterval(() => {
      setRemainingTime((prevTime) => {
        if (prevTime <= 1) {
          clearInterval(timer) // Detener el temporizador cuando llegue a 0
          return 0
        }
        return prevTime - 1
      })
    }, 1000)

    return () => clearInterval(timer) // Limpiar temporizador al desmontar el componente
  }, [remainingTime])

  // ✅ Mostrar un indicador de carga mientras los datos no estén listos
  if (loading || !currentExam) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ py: 4, textAlign: "center" }}>
          <CircularProgress />
          <Typography variant="h6" sx={{ mt: 2 }}>
            Cargando examen...
          </Typography>
        </Box>
      </Container>
    )
  }

  const handleQuestionSelect = (questionNumber) => {
    setCurrentQuestion(questionNumber)
  }

  const handleAnswerChange = (answer) => {
    setAnswers((prev) => ({
      ...prev,
      [currentQuestion]: answer,
    }))
  }

  const handleSaveAnswer = () => {
    console.log(`Respuesta guardada para la pregunta ${currentQuestion}: ${answers[currentQuestion]}`)
    setSnackbarOpen(true)
  }

  const handleNextQuestion = () => {
    if (currentQuestion < sampleQuestions.length) {
      setCurrentQuestion(currentQuestion + 1)
    }
  }

  const handleCloseSnackbar = (event, reason) => {
    if (reason === "clickaway") {
      return
    }
    setSnackbarOpen(false)
  }

  // ✅ Convertir segundos a formato HH:MM:SS
  const formatTime = (totalSeconds) => {
    const horas = Math.floor(totalSeconds / 3600)
    const minutos = Math.floor((totalSeconds % 3600) / 60)
    const segundos = totalSeconds % 60
    return `${String(horas).padStart(2, "0")}:${String(minutos).padStart(2, "0")}:${String(segundos).padStart(2, "0")}`
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        <ExamHeader examName={currentExam.nombre} remainingTime={remainingTime} />

        <QuestionPanel
          totalQuestions={sampleQuestions.length}
          currentQuestion={currentQuestion}
          onQuestionSelect={handleQuestionSelect}
        />

        <QuestionForm
          question={sampleQuestions[currentQuestion - 1]}
          selectedAnswer={answers[currentQuestion]}
          onAnswerChange={handleAnswerChange}
          onSaveAnswer={handleSaveAnswer}
          onNextQuestion={handleNextQuestion}
          isLastQuestion={currentQuestion === sampleQuestions.length}
        />
      </Box>
      <Snackbar
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "center",
        }}
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        message="Respuesta guardada exitosamente"
      />
    </Container>
  )
}