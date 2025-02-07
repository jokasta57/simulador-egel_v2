import React, { useEffect } from "react";
import { Box, Typography, Grid, Chip } from "@mui/material";
import Swal from "sweetalert2";
import { useDispatch, useSelector } from "react-redux";
import { setCurrentOrder, setIsLoading, setIsLoadingFalse, setPreguntaNueva, setTotalQuestions } from "../../store/exams/examsSlice";

const QuestionPanel = ({ onQuestionSelect, isDirty, setIsDirty, }) => {
    const dispatch = useDispatch();
    const { totalQuestions, currentOrder, preguntaNueva, isLoading } = useSelector((state) => state.exams);

    const handleQuestionClick = (orden) => {
        // dispatch(setIsLoading());

        if (preguntaNueva && preguntaNueva.orden === orden) {
            setCurrentOrder(orden); // Mantener la nueva pregunta seleccionada
            dispatch(setIsLoadingFalse());
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
                    dispatch(setIsLoadingFalse());
                    if(preguntaNueva !== null && preguntaNueva !== undefined) {
                        dispatch(setTotalQuestions(totalQuestions - 1))
                        dispatch(setPreguntaNueva(null))
                        dispatch(setIsLoadingFalse());
                    }
                } else{
                    dispatch(setIsLoadingFalse());
                }
            });
        } else {
            onQuestionSelect(orden);
            dispatch(setIsLoadingFalse());
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
