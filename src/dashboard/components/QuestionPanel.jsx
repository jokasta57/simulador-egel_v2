import React, { useEffect } from "react";
import { Box, Typography, Grid, Chip } from "@mui/material";
import Swal from "sweetalert2";

const QuestionPanel = ({ totalQuestions, prevTotalQuestions, currentOrder, onQuestionSelect, isDirty, setIsDirty, setTotalQuestions }) => {
    const handleQuestionClick = (orden) => {
        console.log("Pregunta seleccionada:", orden);
        console.log("Pregunta actual antes de cambiar:", currentOrder);
        
        if (isDirty) {
            Swal.fire({
                title: "¡Cambios sin guardar!",
                text: "Si cambias de pregunta, perderás los cambios no guardados.",
                icon: "warning",
                showCancelButton: true,
                confirmButtonText: "Sí, cambiar",
                cancelButtonText: "Cancelar",
            }).then((result) => {
                if (result.isConfirmed) {
                    setIsDirty(false);
                    setTotalQuestions((prev) => prev - 1); // Ajustar número total de preguntas si es necesario
                    onQuestionSelect(orden); // ✅ Asegura que la pregunta se actualiza
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
                            onClick={() => handleQuestionClick(orden)}
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
