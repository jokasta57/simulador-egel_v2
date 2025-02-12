import {
  Typography,
  Paper,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Button,
} from "@mui/material"
import CheckCircleIcon from "@mui/icons-material/CheckCircle"
import CancelIcon from "@mui/icons-material/Cancel"

const examData = {
  nombre: "Examen de Programación",
  carrera: "Ingeniería en Sistemas",
  area: "Informática",
  periodo: "2023-A"
};

const resultData = {
  calificacion: 85,
  respuestas: [
    { id_opcion: "Nigga", es_correcta: true },
    { id_opcion: "B", es_correcta: false },
    { id_opcion: "C", es_correcta: true },
    // ... más respuestas
  ]
};

export const ExamResult = () => {
  // Calcula el porcentaje de respuestas correctas
  const correctAnswers = resultData.respuestas.filter((r) => r.es_correcta).length
  const totalQuestions = resultData.respuestas.length
  const percentage = (correctAnswers / totalQuestions) * 100

  return (
    <Box sx={{ maxWidth: 800, margin: "auto", mt: 4 }}>
      <Paper elevation={3} sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          Resultado del Examen
        </Typography>

        <Box sx={{ mb: 3 }}>
          <Typography variant="h6">{examData.nombre}</Typography>
          <Typography variant="body1">Carrera: {examData.carrera}</Typography>
          <Typography variant="body1">Área: {examData.area}</Typography>
          <Typography variant="body1">Periodo: {examData.periodo}</Typography>
        </Box>

        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
          <Typography variant="h5">Calificación: {resultData.calificacion}</Typography>
          <Chip
            label={`${percentage.toFixed(2)}% Correctas`}
            color={percentage >= 60 ? "success" : "error"}
            sx={{ fontSize: "1.1rem", p: 1 }}
          />
        </Box>

        <TableContainer component={Paper} sx={{ mb: 3 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Pregunta</TableCell>
                <TableCell align="center">Respuesta</TableCell>
                <TableCell align="center">Correcta</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {resultData.respuestas.map((respuesta, index) => (
                <TableRow key={index}>
                  <TableCell>{`Pregunta ${index + 1}`}</TableCell>
                  <TableCell align="center">{respuesta.id_opcion}</TableCell>
                  <TableCell align="center">
                    {respuesta.es_correcta ? <CheckCircleIcon color="success" /> : <CancelIcon color="error" />}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <Box sx={{ display: "flex", justifyContent: "space-between" }}>
          <Button variant="contained" color="primary">
            Ver detalles
          </Button>
          <Button variant="outlined" color="secondary">
            Volver al dashboard
          </Button>
        </Box>
      </Paper>
    </Box>
  )
}

