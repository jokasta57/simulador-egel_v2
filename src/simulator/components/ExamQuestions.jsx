"use client"

import { useState, useEffect } from "react"
import { Container, Box, Snackbar, Alert } from "@mui/material"
import { QuestionForm, ExamHeader } from "./"
import QuestionPanel from "../../dashboard/components/QuestionPanel"
import { useNavigate, useParams } from "react-router-dom"
import { useExamsStore } from "../../hooks/exams/useExamsStore"
import { useDispatch, useSelector } from "react-redux"
import { LoadingSpinner } from "./LoadingSpinner"
import {
  resetCurrentOrder,
  resetPreguntaNueva,
  resetTotalQuestions,
  setCurrentOrder,
  setTotalQuestions,
  setAnsweredQuestion,
  resetAnsweredQuestions,
  setRemainingTime,
  resetRemainingTime
} from "../../store"
import Swal from "sweetalert2"

export const ExamQuestions = () => {
  const { id } = useParams()
  const dispatch = useDispatch()
  const navigate = useNavigate();

  const {
    handleLoadQuestion,
    handleLoadExam,
    handleLoadQuestionsByExam,
    handleResetCurrentQuestion,
    handleLoadQuestionAndAnswer,
    handleNewAttempt,
    handleSaveAnswer,
    handleUpdateAnswer,
  } = useExamsStore()
  const { currentExam, currentAttempt, currentOrder, currentQuestion, answeredQuestions, remainingTime } = useSelector(
    (state) => state.exams,
  )
  const { user } = useSelector((state) => state.auth)

  const [question, setCurrentQuestion] = useState(1)
  const [answers, setAnswers] = useState({})
  const [success, setSuccess] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchExamInfo = async () => {
      setLoading(true)
      try {
        const exam = await handleLoadExam(id)

        const questionsLength = await handleLoadQuestionsByExam(id)
        dispatch(setTotalQuestions(questionsLength.length || 0))

        await handleNewAttempt(user.numero_cuenta, id)

        const pregunta = await handleLoadQuestionAndAnswer(id, 1, currentAttempt.id_intento)
        if (!pregunta || pregunta.ok === false) {
          setLoading(false)
          throw new Error(pregunta?.msg || "Error desconocido al cargar la pregunta")
        }

        dispatch(setCurrentOrder(1))

        // 📌 Solo seteamos el tiempo si `remainingTime` aún no tiene valor
        if (exam?.duracion && remainingTime === "00:00:00") {
          const [horas, minutos, segundos] = exam.duracion.split(":").map(Number);
          const totalSeconds = horas * 3600 + minutos * 60 + segundos;
          dispatch(setRemainingTime(totalSeconds));
        }
      } catch (error) {
        console.error("Error al cargar el examen:", error)
        setLoading(false)
        setError(error.response?.data?.msg || error.message)
      }
      setLoading(false)
    }

    fetchExamInfo()
  }, [])

  useEffect(() => {
    return () => {
      handleResetCurrentQuestion()
      dispatch(resetCurrentOrder())
      dispatch(resetTotalQuestions())
      dispatch(resetPreguntaNueva())
      dispatch(resetAnsweredQuestions())
      dispatch(resetRemainingTime())
    }
  }, [])

  // Countdown timer effect
  useEffect(() => {
    let timer;
    if (remainingTime > 0) {
      timer = setInterval(() => {
        dispatch(setRemainingTime(remainingTime - 1));
      }, 1000);
    } else if (remainingTime === 0) {
      // ✅ Mostrar SweetAlert con colores institucionales
      Swal.fire({
        title: "¡Tiempo terminado!",
        text: "Tu intento ha concluido. Dirigiéndote a la página de resultados...",
        icon: "info",
        timer: 5000, // ⏳ Se cerrará en 3 segundos
        showConfirmButton: true, // 🔹 Botón "OK"
        confirmButtonText: "Ir a resultados",
        allowOutsideClick: false, // 🔒 Evita que el usuario lo cierre manualmente
        color: "#511013", // 🎨 Color del texto del modal
        confirmButtonColor: "#B91116", // 🎨 Rojo institucional para el botón
        customClass: {
          popup: "swal-custom-popup",
          title: "swal-custom-title",
          confirmButton: "swal-custom-button",
        },
      }).then(() => {
        navigate(`/student/exams/${id}/result`);
      });
    }

    return () => clearInterval(timer);
  }, [remainingTime, id]);

  const handleQuestionSelect = async (orden) => {
    if (!Number.isInteger(orden) || orden < 1) {
      setError("Orden de pregunta no válido")
      return
    }

    setLoading(true)
    setError(null) // Limpiar errores previos

    try {
      const pregunta = await handleLoadQuestionAndAnswer(id, orden, currentAttempt.id_intento)

      if (!pregunta || pregunta.ok === false) {
        throw new Error(pregunta?.msg || "Error al cargar la pregunta")
      }

      dispatch(setCurrentOrder(orden))
    } catch (error) {
      setError(error?.response?.data?.msg || error.message || "Error desconocido")
    } finally {
      setLoading(false) // Se ejecuta siempre, evitando duplicación
    }
  }

  const handleAnswerChange = (answer) => {
    setAnswers((prev) => ({
      ...prev,
      [question]: answer,
    }))
  }

  const saveAnswer = async () => {
    try {
      if (!answeredQuestions.includes(currentOrder)) {
        setLoading(true)

        await handleSaveAnswer(currentAttempt.id_intento, answers[question])

        await handleLoadQuestionAndAnswer(id, currentOrder, currentAttempt.id_intento)

        dispatch(setAnsweredQuestion(currentOrder))

        setLoading(false)
        setSuccess("Respuesta guardada exitosamente")
      } else {
        setLoading(true)

        const pregunta = await handleLoadQuestionAndAnswer(id, currentOrder, currentAttempt.id_intento)

        const answeredOption = pregunta?.opcion?.find((opt) => opt.respuesta && opt.respuesta.length > 0)
        const answeredId = answeredOption?.respuesta[0]?.id_respuesta

        await handleUpdateAnswer(answeredId, answers[question])

        await handleLoadQuestionAndAnswer(id, currentOrder, currentAttempt.id_intento)
        dispatch(setAnsweredQuestion(currentOrder))

        setLoading(false)
        setSuccess("Respuesta actualizada exitosamente")
      }
    } catch (error) {
      console.error("Error al guardar la respuesta:", error)
      setError(error.response?.data?.msg || error.message)
    }
  }

  const handleCloseSnackbar = () => {
    setError("")
    setSuccess("")
  }

  const formatTime = (totalSeconds) => {
    if (totalSeconds == null) return "00:00:00"
    const horas = Math.floor(totalSeconds / 3600)
    const minutos = Math.floor((totalSeconds % 3600) / 60)
    const segundos = totalSeconds % 60
    return `${String(horas).padStart(2, "0")}:${String(minutos).padStart(2, "0")}:${String(segundos).padStart(2, "0")}`
  }

  if (loading || !currentExam) {
    return <LoadingSpinner />
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        <ExamHeader examName={currentExam.nombre} remainingTime={formatTime(remainingTime)} />

        <QuestionPanel onQuestionSelect={handleQuestionSelect} />

        <QuestionForm
          loading={loading}
          selectedAnswer={answers[question]}
          onAnswerChange={handleAnswerChange}
          onSaveAnswer={saveAnswer}
          onNextQuestion={() => handleQuestionSelect(currentOrder + 1)}
          onPreviousQuestion={() => handleQuestionSelect(currentOrder - 1)}
        />
      </Box>

      <Snackbar
        open={Boolean(error || success)}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert onClose={handleCloseSnackbar} severity={error ? "error" : "success"} variant="filled">
          {error
            ? typeof error === "string"
              ? error
              : JSON.stringify(error)
            : typeof success === "string"
              ? success
              : JSON.stringify(success)}
        </Alert>
      </Snackbar>
    </Container>
  )
}

