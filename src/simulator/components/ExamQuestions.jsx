"use client"

import { useState, useEffect } from "react"
import { Container, Box, Snackbar } from "@mui/material"
import { QuestionForm, QuestionPanel, ExamHeader } from "./"



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

// Configuración del examen
const examConfig = {
  name: "Simulador EGEL - Bases de Datos",
  duration: 3600, // Duración en segundos (1 hora)
}

export const ExamQuestions = () => {
  const [currentQuestion, setCurrentQuestion] = useState(1)
  const [answers, setAnswers] = useState({})
  const [snackbarOpen, setSnackbarOpen] = useState(false)
  const [remainingTime, setRemainingTime] = useState(examConfig.duration)

  // Efecto para el temporizador
  useEffect(() => {
    const timer = setInterval(() => {
      setRemainingTime((prevTime) => {
        if (prevTime <= 1) {
          clearInterval(timer)
          // Aquí puedes agregar la lógica para cuando se acabe el tiempo
          return 0
        }
        return prevTime - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [])

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

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        <ExamHeader examName={examConfig.name} remainingTime={remainingTime} />

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

