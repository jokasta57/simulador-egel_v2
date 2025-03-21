import { Box, Typography, Grid, Chip } from "@mui/material"
import Swal from "sweetalert2"
import { useDispatch, useSelector } from "react-redux"
import { setCurrentOrder, setIsLoadingFalse, setPreguntaNueva, setTotalQuestions } from "../../store/exams/examsSlice"

const QuestionPanel = ({ onQuestionSelect, isDirty, setIsDirty, hasCorrectOption }) => {
  const dispatch = useDispatch()
  const { totalQuestions, currentOrder, preguntaNueva, isLoading, answeredQuestions, currentQuestion, remainingTime } = useSelector(
    (state) => state.exams,
  )

  const handleQuestionClick = (orden) => {
    if ((!remainingTime || remainingTime === "00:00:00") && Object.keys(currentQuestion).length > 0 && !hasCorrectOption) {
      Swal.fire({
        title: "Atención",
        text: "No hay ninguna opción marcada como correcta. Debes seleccionar una antes de continuar.",
        icon: "warning",
        confirmButtonColor: "#d32f2f",
        confirmButtonText: "Entendido"
      });
      return; // 🔴 Evita cambiar de pregunta si no hay opción correcta
    }

    if (preguntaNueva && preguntaNueva.orden === orden) {
      onQuestionSelect(orden)
      dispatch(setCurrentOrder(orden))
      dispatch(setIsLoadingFalse())
      return
    }

    if (isDirty) {
      Swal.fire({
        title: "¡Cambios sin guardar!",
        text: "Si cambias de pregunta, perderás los cambios no guardados.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Sí, cambiar",
        cancelButtonText: "Cancelar",
        confirmButtonColor: "#d33",
        cancelButtonColor: "#3085d6",
      }).then((result) => {
        if (result.isConfirmed) {
          setIsDirty(false)
          onQuestionSelect(orden)
          dispatch(setCurrentOrder(orden))
          dispatch(setIsLoadingFalse())
          if (preguntaNueva !== null && preguntaNueva !== undefined) {
            dispatch(setTotalQuestions(totalQuestions - 1))
            dispatch(setPreguntaNueva(null))
            dispatch(setIsLoadingFalse())
          }
        } else {
          dispatch(setIsLoadingFalse())
        }
      })
    } else {
      onQuestionSelect(orden)
      dispatch(setIsLoadingFalse())
    }
  }

  return (
    <Box sx={{ mb: 3, p: 2, border: "1px solid", borderColor: "divider", borderRadius: 1 }}>
      <Typography variant="subtitle1" sx={{ mb: 2 }}>
        Panel de Preguntas
      </Typography>
      <Grid container spacing={1}>
        {Array.from({ length: totalQuestions }, (_, i) => i + 1).map((orden) => {
          const isAnswered = answeredQuestions?.includes(orden)
          const isCurrent = orden === currentOrder

          return (
            <Grid item key={orden}>
              <Chip
                disabled={isLoading}
                label={`P${orden}`}
                onClick={() => handleQuestionClick(orden)}
                color={isCurrent ? "error" : isAnswered ? "error" : "default"}
                variant="filled"
                sx={{
                  cursor: "pointer",
                  backgroundColor: isCurrent
                    ? "#d32f2f" // Rojo institucional para la pregunta actual
                    : isAnswered
                      ? "#ffcdd2" // Rojo claro para preguntas contestadas
                      : "transparent", // Fondo transparente para las no contestadas
                  color: isCurrent ? "white" : isAnswered ? "#d32f2f" : "inherit",
                  border: "1px solid",
                  borderColor: isCurrent || isAnswered ? "#d32f2f" : "#bdbdbd",
                  fontWeight: isAnswered || isCurrent ? "bold" : "normal",
                  "&:hover": {
                    backgroundColor: isCurrent
                      ? "#b71c1c" // Rojo más oscuro al pasar el mouse sobre la actual
                      : isAnswered
                        ? "#ef9a9a" // Rojo un poco más intenso para hover en respondidas
                        : "rgba(0, 0, 0, 0.08)", // Gris muy claro para hover en no respondidas
                  },
                }}
              />
            </Grid>
          )
        })}
      </Grid>
    </Box>
  )
}

export default QuestionPanel

