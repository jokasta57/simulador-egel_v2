import { Typography, RadioGroup, FormControlLabel, Radio, Paper, Box, Button } from "@mui/material";
import { useSelector } from "react-redux";
import { LoadingSpinner } from "./LoadingSpinner";
import { useNavigate, useParams } from "react-router-dom";

export const QuestionForm = ({
  loading,
  selectedAnswer,
  onAnswerChange,
  onSaveAnswer,
  onNextQuestion,
  isLastQuestion,
}) => {
  const { currentQuestion, totalQuestions, currentOrder } = useSelector((state) => state.exams);
  const navigate = useNavigate(); // ✅ Hook para redirigir
  const { id } = useParams(); // ✅ Obtener el id del examen desde la URL

  // ✅ Verificar si la pregunta no está lista
  if (loading || !currentQuestion || !Array.isArray(currentQuestion.opcion)) {
    return <LoadingSpinner />;
  }

  // ✅ Manejar la acción del botón "Terminar Intento"
  const handleFinishExam = () => {
    navigate(`/student/exams/${id}/result`);
  };

  return (
    <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
      {/* Pregunta con el texto arriba y la imagen abajo */}
      <Box display="flex" flexDirection="column" alignItems="flex-start" mb={3}>
        <Typography variant="h6" sx={{ color: "text.primary", mb: 2 }}>
          {currentQuestion.contenido}
        </Typography>
        {currentQuestion.imagen_url && (
          <img
            src={currentQuestion.imagen_url}
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

      {/* Opciones con imágenes más grandes */}
      <RadioGroup value={selectedAnswer || ""} onChange={(e) => onAnswerChange(e.target.value)}>
        {currentQuestion.opcion.map((option) => (
          <FormControlLabel
            key={option.id_opcion}
            value={option.id_opcion}
            control={<Radio />}
            label={
              <Box display="flex" alignItems="center">
                {option.imagen_url && (
                  <img
                    src={option.imagen_url}
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
            }
            sx={{
              mb: 2,
              "& .MuiFormControlLabel-label": {
                color: "text.primary",
              },
            }}
          />
        ))}
      </RadioGroup>

      <Box sx={{ mt: 3, display: "flex", justifyContent: "space-between" }}>
        <Button
          variant="contained"
          onClick={onSaveAnswer}
          disabled={!selectedAnswer}
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
          onClick={totalQuestions === currentOrder ? handleFinishExam : onNextQuestion} // ✅ Lógica de redirección
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
