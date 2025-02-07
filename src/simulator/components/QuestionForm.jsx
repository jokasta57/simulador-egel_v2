import { Typography, RadioGroup, FormControlLabel, Radio, Paper, Box, Button } from "@mui/material"

export const QuestionForm = ({
  question,
  selectedAnswer,
  onAnswerChange,
  onSaveAnswer,
  onNextQuestion,
  isLastQuestion,
}) => {
  return (
    <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6" gutterBottom sx={{ color: "text.primary", mb: 3 }}>
        {question.text}
      </Typography>
      <RadioGroup value={selectedAnswer || ""} onChange={(e) => onAnswerChange(e.target.value)}>
        {question.options.map((option, index) => (
          <FormControlLabel
            key={index}
            value={option.value}
            control={<Radio />}
            label={option.text}
            sx={{
              mb: 1,
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
            "&:hover": {
              bgcolor: "grey.400",
            },
            "&:disabled": {
              bgcolor: "grey.200",
              color: "text.disabled",
            },
          }}
        >
          Guardar Respuesta
        </Button>
        <Button
          variant="contained"
          onClick={onNextQuestion}
          sx={{
            bgcolor: "#e23d28",
            color: "white",
            "&:hover": {
              bgcolor: "#c62828",
            },
          }}
        >
          {isLastQuestion ? "Terminar Intento" : "Siguiente Pregunta"}
        </Button>
      </Box>
    </Paper>
  )
}

