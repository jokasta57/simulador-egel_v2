"use client"

import { useState, useEffect } from "react";
import { Container, Box, Snackbar, Typography, Alert } from "@mui/material";
import { QuestionForm, ExamHeader } from "./";
import QuestionPanel from "../../dashboard/components/QuestionPanel";
import { useParams } from "react-router-dom";
import { useExamsStore } from "../../hooks/exams/useExamsStore";
import { useDispatch, useSelector } from "react-redux";
import { LoadingSpinner } from "./LoadingSpinner";
import { resetCurrentOrder, resetPreguntaNueva, resetTotalQuestions, setCurrentOrder, setTotalQuestions } from "../../store";

export const ExamQuestions = () => {
  const { id } = useParams();
  const dispatch = useDispatch();

  const { handleLoadQuestion, handleLoadExam, handleLoadQuestionsByExam, handleResetCurrentQuestion, handleNewAttempt, handleSaveAnswer } = useExamsStore();
  const { currentExam, currentAttempt } = useSelector((state) => state.exams);
  const { user } = useSelector((state) => state.auth);

  const [currentQuestion, setCurrentQuestion] = useState(1);
  const [answers, setAnswers] = useState({});
  const [success, setSuccess] = useState(""); // ✅ Estado para mensajes de éxito
  const [error, setError] = useState(""); // ✅ Estado para mensajes de error
  const [remainingTime, setRemainingTime] = useState(null);
  const [loading, setLoading] = useState(true); // ✅ Estado de carga

  useEffect(() => {
    const fetchExamInfo = async () => {
      setLoading(true);
      try {
        await handleLoadExam(id);

        //Setea total de preguntas
        const questionsLength = await handleLoadQuestionsByExam(id);
        dispatch(setTotalQuestions(questionsLength.length || 0));

        //guardar el intento
        await handleNewAttempt(user.numero_cuenta, id);

        // Intentar cargar la primera pregunta
        const pregunta = await handleLoadQuestion(id, 1);
        if (!pregunta || pregunta.ok === false) {
          setLoading(false);
          throw new Error(pregunta?.msg || "Error desconocido al cargar la pregunta");
        }

        dispatch(setCurrentOrder(1));
      } catch (error) {
        console.error("Error al cargar el examen:", error);
        setLoading(false);
        setError( error.response.data.msg || error.message);
      }
      setLoading(false);
    };

    fetchExamInfo();
  }, [id]);

  useEffect(() => {
    return () => {
      handleResetCurrentQuestion();
      dispatch(resetCurrentOrder());
      dispatch(resetTotalQuestions());
      dispatch(resetPreguntaNueva());
    };
  }, []);

  // ✅ Configurar el tiempo restante en segundos cuando el examen esté listo
  useEffect(() => {
    if (currentExam?.duracion) {
      const [horas, minutos, segundos] = currentExam.duracion.split(":").map(Number);
      setRemainingTime(horas * 3600 + minutos * 60 + segundos); // Convierte a segundos
    }
  }, [currentExam]);

  const handleQuestionSelect = async (orden) => {
    try {
      const pregunta = await handleLoadQuestion(id, orden);
      if (!pregunta || pregunta.ok === false) {
        throw new Error(pregunta?.msg || "Error al cargar la pregunta");
      }
      dispatch(setCurrentOrder(orden));
    } catch (error) {
      console.error("Error al cargar la pregunta:", error);
      setError(error.message);
    }
  };

  const handleAnswerChange = (answer) => {
    setAnswers((prev) => ({
      ...prev,
      [currentQuestion]: answer,
    }));
  };

  const saveAnswer = async () => {
    try {
      setLoading(true);
      
      await handleSaveAnswer(currentAttempt.id_intento, answers[currentQuestion]); // ✅ Ahora sí, sin recursión
  
      setLoading(false);
      console.log(`Respuesta guardada para la pregunta ${currentQuestion}: ${answers[currentQuestion]}`);
      setSuccess("Respuesta guardada exitosamente");
    } catch (error) {
      console.error("Error al guardar la respuesta:", error);
      setError(error.response?.data?.msg || error.message);
    }
  };

  const handleCloseSnackbar = () => {
    setError("");
    setSuccess("");
  };

  // ✅ Convertir segundos a formato HH:MM:SS
  const formatTime = (totalSeconds) => {
    const horas = Math.floor(totalSeconds / 3600);
    const minutos = Math.floor((totalSeconds % 3600) / 60);
    const segundos = totalSeconds % 60;
    return `${String(horas).padStart(2, "0")}:${String(minutos).padStart(2, "0")}:${String(segundos).padStart(2, "0")}`;
  };

  if (loading || !currentExam) {
    return <LoadingSpinner />;
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        <ExamHeader examName={currentExam.nombre} remainingTime={remainingTime} />

        <QuestionPanel onQuestionSelect={handleQuestionSelect} />

        <QuestionForm
          loading={loading}
          selectedAnswer={answers[currentQuestion]}
          onAnswerChange={handleAnswerChange}
          onSaveAnswer={saveAnswer}
          onNextQuestion={() => handleQuestionSelect(currentQuestion + 1)}
        />
      </Box>

      {/* ✅ Snackbar para errores y éxito en el mismo formato */}
      <Snackbar
        open={Boolean(error || success)}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={error ? "error" : "success"}
          variant="filled"
        >
          {error ? (typeof error === "string" ? error : JSON.stringify(error)) : 
            (typeof success === "string" ? success : JSON.stringify(success))}
        </Alert>
      </Snackbar>
    </Container>
  );
};