"use client"

import { useEffect, useMemo, useState } from "react"
import { Typography, RadioGroup, FormControlLabel, Radio, Paper, Box, Button } from "@mui/material"
import { useSelector, useDispatch } from "react-redux"
import { LoadingSpinner } from "./LoadingSpinner"
import { useNavigate, useParams } from "react-router-dom"
import { setCurrentQuestion } from "../../store"

export const QuestionForm = ({ loading, onAnswerChange, onSaveAnswer, onNextQuestion }) => {
  const dispatch = useDispatch();
  const { currentQuestion, totalQuestions, currentOrder } = useSelector((state) => state.exams);
  const navigate = useNavigate();
  const { id } = useParams();

  const [selectedValue, setSelectedValue] = useState("");

  // **Mantiene la respuesta seleccionada en el estado global**
  useEffect(() => {
    if (currentQuestion && Array.isArray(currentQuestion.opcion)) {
      const answeredOption = currentQuestion.opcion.find(option => option.respuesta && option.respuesta.length > 0);
      setSelectedValue(answeredOption ? answeredOption.id_opcion.toString() : "");
    }
  }, [currentQuestion]);

  if (loading || !currentQuestion || !Array.isArray(currentQuestion.opcion)) {
    return <LoadingSpinner />;
  }

  // **Manejo del cambio de selección**
  const handleRadioChange = (event) => {
    const newValue = event.target.value;
    setSelectedValue(newValue);
    onAnswerChange(newValue);
  };

  const handleFinishExam = () => {
    navigate(`/student/exams/${id}/result`);
  };

  return (
    <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
      <Box display="flex" flexDirection="column" alignItems="flex-start" mb={3}>
        <Typography variant="h6" sx={{ color: "text.primary", mb: 2 }}>
          {currentQuestion.contenido}
        </Typography>
        {currentQuestion.imagen_url && (
          <img
            src={currentQuestion.imagen_url || "/placeholder.svg"}
            alt="Imagen de la Pregunta"
            style={{
              width: "100%",
              maxWidth: "450px",
              maxHeight: "300px",
              objectFit: "contain",
              marginTop: "8px",
            }}
          />
        )}
      </Box>

      <RadioGroup value={selectedValue} onChange={handleRadioChange}>
        {currentQuestion.opcion.map((option) => (
          <Box key={option.id_opcion} display="flex" alignItems="center" mb={2}>
            <FormControlLabel
              value={option.id_opcion.toString()}
              control={<Radio />}
              label=""
              sx={{ marginRight: "8px" }}
            />
            {option.imagen_url && (
              <img
                src={option.imagen_url || "/placeholder.svg"}
                alt={`Opción ${option.id_opcion}`}
                style={{
                  width: "200px",
                  height: "200px",
                  objectFit: "contain",
                  marginRight: "16px",
                }}
              />
            )}
            <Typography sx={{ fontSize: "1.2rem" }}>{option.contenido}</Typography>
          </Box>
        ))}
      </RadioGroup>

      <Box sx={{ mt: 3, display: "flex", justifyContent: "space-between" }}>
        <Button
          variant="contained"
          onClick={onSaveAnswer}
          disabled={!selectedValue}
          sx={{
            bgcolor: "grey.300",
            color: "text.primary",
            "&:hover": { bgcolor: "grey.400" },
            "&:disabled": { bgcolor: "grey.200", color: "text.disabled" },
          }}
        >
          Guardar Respuesta
        </Button>

        <Button
          variant="contained"
          onClick={totalQuestions === currentOrder ? handleFinishExam : onNextQuestion}
          sx={{
            bgcolor: "#e23d28",
            color: "white",
            "&:hover": { bgcolor: "#c62828" },
          }}
        >
          {totalQuestions === currentOrder ? "Terminar Intento" : "Siguiente Pregunta"}
        </Button>
      </Box>
    </Paper>
  );
};
