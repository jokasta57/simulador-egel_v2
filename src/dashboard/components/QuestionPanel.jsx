import { Box, Typography, Grid, Chip } from "@mui/material"
import { useDispatch, useSelector } from "react-redux"
import { setCurrentOrder, setIsLoadingFalse, setPreguntaNueva, setTotalQuestions } from "../../store/exams/examsSlice"
import Swal from "sweetalert2"

const QuestionPanel = ({ onQuestionSelect, isDirty, setIsDirty, hasCorrectOption }) => {
  const dispatch = useDispatch()
  // Extraemos del estado global de Redux la información necesaria sobre el examen
  const { totalQuestions, currentOrder, preguntaNueva, isLoading, answeredQuestions, currentQuestion, remainingTime } = useSelector((state) => state.exams)

  // Maneja el clic en una pregunta específica
  const handleQuestionClick = (orden) => {
    // Evita cambiar de pregunta si no hay opción correcta y el tiempo ha terminado
    if ((!remainingTime || remainingTime === "00:00:00") && Object.keys(currentQuestion).length > 0 && !hasCorrectOption) {
      Swal.fire({
        title: "Atención",
        text: "No hay ninguna opción marcada como correcta. Debes seleccionar una antes de continuar.",
        icon: "warning",
        confirmButtonColor: "#d32f2f",
        confirmButtonText: "Entendido"
      });
      return; // Detenemos la ejecución para evitar el cambio de pregunta
    }

    // Si la pregunta seleccionada es la nueva pregunta en edición, la seleccionamos directamente
    if (preguntaNueva && preguntaNueva.orden === orden) {
      onQuestionSelect(orden); // Cambiamos la pregunta seleccionada
      dispatch(setCurrentOrder(orden)); // Actualizamos el orden actual en Redux
      dispatch(setIsLoadingFalse()); // Indicamos que ya no estamos en estado de carga
      return;
    }
    //Si hay cambios sin guardar, mostramos una alerta antes de cambiar de pregunta
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
          setIsDirty(false); //Restablecemos el estado de edición
          onQuestionSelect(orden); // Cambiamos de pregunta
          dispatch(setCurrentOrder(orden)); //Actualizamos el estado global con la nueva pregunta
          dispatch(setIsLoadingFalse()); //Quitamos el estado de carga

          // Si la pregunta actual era una nueva, la eliminamos y ajustamos el conteo total
          if (preguntaNueva !== null && preguntaNueva !== undefined) {
            dispatch(setTotalQuestions(totalQuestions - 1)); // Reducimos el total de preguntas
            dispatch(setPreguntaNueva(null)); // Eliminamos la nueva pregunta temporal
            dispatch(setIsLoadingFalse()); // Quitamos el estado de carga
          }
        } else {
          dispatch(setIsLoadingFalse()); // Si el usuario cancela, mantenemos el estado actual
        }
      })
    } else {
      //Si no hay cambios sin guardar, cambiamos directamente de pregunta
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

