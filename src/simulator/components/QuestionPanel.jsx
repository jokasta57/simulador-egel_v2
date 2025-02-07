import { Box, Typography, Grid, Chip } from "@mui/material"

export const QuestionPanel = ({ totalQuestions, currentQuestion, onQuestionSelect }) => {
    return (
        <Box
            sx={{
                mb: 3,
                p: 2,
                border: "1px solid",
                borderColor: "divider",
                borderRadius: 1,
                backgroundColor: "background.paper",
                boxShadow: 1,
            }}
        >
            <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: "medium" }}>
                Panel de Preguntas
            </Typography>
            <Grid container spacing={1}>
                {Array.from({ length: totalQuestions }, (_, i) => i + 1).map((questionNumber) => (
                    <Grid item key={questionNumber}>
                        <Chip
                            label={`P${questionNumber}`}
                            onClick={() => onQuestionSelect(questionNumber)}
                            color={questionNumber === currentQuestion ? "primary" : "default"}
                            variant={questionNumber === currentQuestion ? "filled" : "outlined"}
                            sx={{
                                cursor: "pointer",
                                "&:hover": {
                                    backgroundColor: questionNumber === currentQuestion ? "primary.main" : "action.hover",
                                },
                            }}
                        />
                    </Grid>
                ))}
            </Grid>
        </Box>
    )
}
