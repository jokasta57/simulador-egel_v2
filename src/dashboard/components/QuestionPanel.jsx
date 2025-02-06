import React, { useEffect } from "react";
import { Box, Typography, Grid, Chip } from "@mui/material";
import Swal from "sweetalert2";
import { useDispatch, useSelector } from "react-redux";
import { setCurrentOrder, setPreguntaNueva, setTotalQuestions } from "../../store/exams/examsSlice";

const QuestionPanel = ({ onQuestionSelect, isDirty, setIsDirty, }) => {
    const dispatch = useDispatch();
    const { totalQuestions, currentOrder, preguntaNueva } = useSelector((state) => state.exams);

    const handleQuestionClick = (orden) => {

        if (preguntaNueva && preguntaNueva.orden === orden) {
            setCurrentOrder(orden); // Mantener la nueva pregunta seleccionada
            return;
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
                    setIsDirty(false);
                    onQuestionSelect(orden);
                    dispatch(setCurrentOrder(orden))
                    if(preguntaNueva !== null && preguntaNueva !== undefined) {
                        dispatch(setTotalQuestions(totalQuestions - 1))
                        dispatch(setPreguntaNueva(null))
                    }
                }
            });
        } else {
            onQuestionSelect(orden);
        }
    };


    return (
        <Box sx={{ mb: 3, p: 2, border: "1px solid", borderColor: "divider", borderRadius: 1 }}>
            <Typography variant="subtitle1" sx={{ mb: 2 }}>
                Panel de Preguntas
            </Typography>
            <Grid container spacing={1}>
                {Array.from({ length: totalQuestions }, (_, i) => i + 1).map((orden) => (
                    <Grid item key={orden}>
                        <Chip
                            label={`P${orden}`}
                            onClick={() => {
                                handleQuestionClick(orden)
                            }}
                            color={orden === currentOrder ? "primary" : "default"}
                            variant={orden === currentOrder ? "filled" : "outlined"}
                            sx={{ cursor: "pointer" }}
                        />
                    </Grid>
                ))}
            </Grid>
        </Box>
    );
};

export default QuestionPanel;
