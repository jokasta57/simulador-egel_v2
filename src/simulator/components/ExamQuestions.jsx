"use client"

import { useState, useEffect } from "react"
import { Container, Box, Snackbar, Alert } from "@mui/material"
import { QuestionForm, ExamHeader } from "./"
import QuestionPanel from "../../dashboard/components/QuestionPanel"
import { useNavigate, useParams } from "react-router-dom"
import { useExamsStore } from "../../hooks/exams/useExamsStore"
import { useDispatch, useSelector } from "react-redux"
import { LoadingSpinner } from "./LoadingSpinner"
import { resetCurrentOrder, resetPreguntaNueva, resetTotalQuestions, setCurrentOrder, setTotalQuestions, setAnsweredQuestion, resetAnsweredQuestions, setRemainingTime, resetRemainingTime, resetCurrentAttempt, resetCurrentExam} from "../../store"
import Swal from "sweetalert2"
import { useDrawer } from "../../context/DrawerContext"

export const ExamQuestions = () => {
  const { open, setOpen } = useDrawer();
  // Obtener parámetros y hooks de navegación
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Obtener estado global
  const { currentExam, currentAttempt, currentOrder, remainingTime, answeredQuestions } = useSelector(state => state.exams);
  const { user } = useSelector(state => state.auth);

  // Estado local para gestionar preguntas, respuestas y mensajes de feedback
  const [question, setCurrentQuestion] = useState(1);
  const [answers, setAnswers] = useState({});
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadingMessage, setLoadingMessage] = useState('Cargando...');

  // Obtener funciones de la tienda de exámenes
  const { handleLoadExam, handleLoadQuestionsByExam, handleNewAttempt, handleLoadQuestionAndAnswer, handleResetCurrentQuestion, handleSaveAnswer, handleUpdateAnswer, } = useExamsStore();

  useEffect(() => {
    // Cargar información del examen al montar el componente
    fetchExamInfo();
    setOpen(false);
    return () => {
      // Limpiar estado al desmontar el componente
      handleResetCurrentQuestion();
      dispatch(resetCurrentOrder());
      dispatch(resetTotalQuestions());
      dispatch(resetPreguntaNueva());
      dispatch(resetAnsweredQuestions());
      dispatch(resetRemainingTime());
      dispatch(resetCurrentAttempt());
      dispatch(resetCurrentExam());
    };
  }, []);
  

  // Temporizador de cuenta regresiva
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

  //Obtener info del examen
  const fetchExamInfo = async () => {
    setLoading(true);
    try {
      const exam = await handleLoadExam(id); // Carga la información del examen
      const questionsLength = await handleLoadQuestionsByExam(id); // Obtiene el número total de preguntas
      dispatch(setTotalQuestions(questionsLength.length || 0)); // Almacena el total de preguntas en el estado global

      await handleNewAttempt(user.numero_cuenta, id); // Registra un nuevo intento para el usuario
      const pregunta = await handleLoadQuestionAndAnswer(id, 1, currentAttempt.id_intento); // Carga la primera pregunta

      if (!pregunta || pregunta.ok === false) {
        setLoading(false)
        throw new Error(pregunta?.msg || "Error desconocido al cargar la pregunta")
      }

      dispatch(setCurrentOrder(1)); // Establece el número de orden de la pregunta actual en 1

      // Inicializa el tiempo restante solo si aún no ha sido definido
      if (exam?.duracion && remainingTime === "00:00:00") {
        const [horas, minutos, segundos] = exam.duracion.split(":").map(Number);
        dispatch(setRemainingTime(horas * 3600 + minutos * 60 + segundos)); // Convierte la duración en segundos y la almacena
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Cambiar de pregunta
  const handleQuestionSelect = async (orden) => {
    handleCloseSnackbar();
    if (!Number.isInteger(orden) || orden < 1) return setError("Orden de pregunta no válido");
    setLoading(true);
    try {
      const pregunta = await handleLoadQuestionAndAnswer(id, orden, currentAttempt.id_intento);
      if (!pregunta || pregunta.ok === false) {
        throw new Error(pregunta?.msg || "Error al cargar la pregunta")
      }
      dispatch(setCurrentOrder(orden));
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Manejar cambio de respuesta
  const handleAnswerChange = (answer) => {
    setAnswers((prev) => ({ ...prev, [question]: answer }));
  };

  const saveAnswer = async () => {
    setLoading(true) // Indica que la operación está en curso
    setLoadingMessage('Guardando respuesta...')
    try {
      if (!answeredQuestions.includes(currentOrder)) {
        await handleSaveAnswer(currentAttempt.id_intento, answers[question]) // Guarda la respuesta
        await handleLoadQuestionAndAnswer(id, currentOrder, currentAttempt.id_intento) // Recarga la pregunta
        dispatch(setAnsweredQuestion(currentOrder)) // Marca la pregunta como respondida
        setSuccess("Respuesta guardada exitosamente")
      } else {
        const pregunta = await handleLoadQuestionAndAnswer(id, currentOrder, currentAttempt.id_intento) // Obtiene la pregunta y respuestas
        const answeredOption = pregunta?.opcion?.find((opt) => opt.respuesta?.length > 0) // Busca la respuesta guardada
        const answeredId = answeredOption?.respuesta[0]?.id_respuesta // Obtiene el ID de la respuesta
        await handleUpdateAnswer(answeredId, answers[question]) // Actualiza la respuesta existente
        await handleLoadQuestionAndAnswer(id, currentOrder, currentAttempt.id_intento) // Recarga la pregunta
        dispatch(setAnsweredQuestion(currentOrder)) // Marca la pregunta como respondida
        setSuccess("Respuesta actualizada exitosamente")
      }
    } catch (error) {
      setError(error.response?.data?.msg || error.message) // Muestra el mensaje de error
    } finally {
      setLoading(false)
      setLoadingMessage('Cargando...')
    }
  }


  // Cerrar mensajes emergentes
  const handleCloseSnackbar = () => {
    setError("");
    setSuccess("");
  };

  // Formatear el tiempo restante a formato hh:mm:ss
  const formatTime = (totalSeconds) => {
    if (!totalSeconds) return "00:00:00";
    const horas = Math.floor(totalSeconds / 3600);
    const minutos = Math.floor((totalSeconds % 3600) / 60);
    const segundos = totalSeconds % 60;
    return `${String(horas).padStart(2, "0")}:${String(minutos).padStart(2, "0")}:${String(segundos).padStart(2, "0")}`;
  };

  if (loading || !currentExam) {
    return <LoadingSpinner message={loadingMessage} />
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

