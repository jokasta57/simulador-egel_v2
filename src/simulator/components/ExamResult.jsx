"use client"

import { useCallback, useEffect, useState } from "react"
import { Box, Typography, Card, CardContent, Button, Grid, LinearProgress, Paper, Snackbar, Alert } from "@mui/material"
import { CheckCircle, XCircle, AlertCircle, ArrowLeft } from "lucide-react"
import { Link, useNavigate, useParams } from "react-router-dom"
import { useExamsStore } from "../../hooks/exams/useExamsStore"
import { useDispatch, useSelector } from "react-redux"
import { LoadingSpinner } from "./LoadingSpinner"
import { resetCurrentAttempt } from "../../store"
import { clearErrorMessage, setError } from "../../store/auth/authSlice"; // Importamos la acción para limpiar el error

export const ExamResult = () => {
  const { currentAttempt, error } = useSelector((state) => state.exams); // Obtiene el intento actual del estado global
  const { handleGetResultsAttempt } = useExamsStore(); // Función para obtener los resultados del intento
  const { id } = useParams(); // Obtiene el parámetro "id" desde la URL
  const [examData, setExamData] = useState({}); // Almacena los datos del examen
  const [isLoading, setIsLoading] = useState(false); // Indica si los datos están cargando
  const [idIntento, setIdIntento] = useState(currentAttempt.id_intento); // Indica si los datos están cargando
  const navigate = useNavigate(); // Hook para navegación
  const dispatch = useDispatch(); // Hook para manejar acciones de Redux


  // 🔹 Manejo del botón de retroceso del navegador para evitar que el usuario regrese
  useEffect(() => {
    const handleBackButton = () => {
      navigate("/student/home", { replace: true }); // Redirige a la página de inicio del estudiante
    };

    window.history.pushState(null, "", window.location.href); // Agrega un nuevo estado en el historial
    window.addEventListener("popstate", handleBackButton); // Escucha el evento de retroceso

    return () => {
      window.removeEventListener("popstate", handleBackButton); // Limpia el evento al desmontar
    };
  }, [navigate]);

  // 🔹 Obtiene los resultados del intento actual al cargar el componente
  useEffect(() => {
    getResults(idIntento);
    // return () => {
    //   dispatch(resetCurrentAttempt()); // Resetea el intento actual al desmontar el componente
    // };
  }, []);

  // 🔹 Función para obtener los resultados del examen
  const getResults = async (currentAttempt) => {
    setIsLoading(true); // Activa el estado de carga

    try {
      const data = await handleGetResultsAttempt(currentAttempt); // Obtiene los resultados desde el backend

      // Actualiza el estado con los datos obtenidos
      setExamData((prevData) => ({
        ...prevData,
        id_intento: data.examen?.id_intento || 0,
        numero_cuenta: Number(data.examen?.numero_cuenta) || 0, // Convierte a número o asigna 0 si es undefined
        id_examen: data.examen?.id_examen || 0,
        fecha_aplicacion: data.examen?.fecha_aplicacion || "",
        calificacion: data.respuestas?.calificacionFinal || 0, // Convierte a número
        nombre: data.examen?.examen?.nombre || "Desconocido",
        carrera: data.examen?.examen?.carrera || "No especificado",
        area: data.examen?.examen?.area || "No especificado",
        periodo: data.examen?.examen?.periodo || "No especificado",
        totalPreguntas: data.respuestas?.totalPreguntas || 0,
        respuestasCorrectas: data.respuestas?.correctas || 0,
        respuestasIncorrectas: data.respuestas?.incorrectas || 0,
        mensaje: data.respuestas?.mensaje || "",
      }));
    } catch (error) {
      setError("No se pudieron obtener los resultados del examen.")
    } finally {
      setIsLoading(false); // Finaliza el estado de carga
    }
  };

  // 🔹 Calcula el porcentaje de respuestas correctas
  const porcentajeCorrectas = (examData.respuestasCorrectas / examData.totalPreguntas) * 100;

  const handleCloseSnackbar = useCallback(() => {
    setError("")
  }, [])

  // 🔹 Muestra un spinner si los datos aún están cargando
  if (isLoading || !examData) {
    return <LoadingSpinner message="Obteniendo resultados del examen..."/>;
  }

  return (
    <Box sx={{ maxWidth: 800, margin: "0 auto", p: 3 }}>
      <Card sx={{ mb: 4, boxShadow: "0 4px 6px rgba(0,0,0,0.1)" }}>
        <CardContent>
          <Typography variant="h4" sx={{ color: "#B91116", fontWeight: "bold", mb: 2 }}>
            Resultado del Examen
          </Typography>
          <Typography variant="h6" sx={{ mb: 2 }}>
            {examData.nombre}
          </Typography>

          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid item xs={12} sm={6}>
              <Typography variant="body1">Carrera: {examData.carrera}</Typography>
              <Typography variant="body1">Área: {examData.area}</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="body1">Periodo: {examData.periodo}</Typography>
              <Typography variant="body1">Fecha: {examData.fecha_aplicacion}</Typography>
            </Grid>
          </Grid>

          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
            <Typography variant="h5">Calificación Final</Typography>
            <Typography variant="h3" sx={{ color: "#B91116", fontWeight: "bold" }}>
              {porcentajeCorrectas.toFixed(1)}%
            </Typography>
          </Box>

          <LinearProgress
            variant="determinate"
            value={porcentajeCorrectas}
            sx={{
              height: 10,
              borderRadius: 5,
              backgroundColor: "#f0f0f0",
              "& .MuiLinearProgress-bar": {
                backgroundColor: "#B91116",
              },
            }}
          />

          <Grid container spacing={2} sx={{ mt: 4 }}>
            <Grid item xs={12} sm={6}>
              <Card sx={{ backgroundColor: "#e8f5e9", height: "100%" }}>
                <CardContent sx={{ display: "flex", alignItems: "center" }}>
                  <CheckCircle size={32} color="#4caf50" />
                  <Box sx={{ ml: 2 }}>
                    <Typography variant="body2">Respuestas Correctas</Typography>
                    <Typography variant="h5" sx={{ fontWeight: "bold", color: "#4caf50" }}>
                      {examData.respuestasCorrectas}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Card sx={{ backgroundColor: "#ffebee", height: "100%" }}>
                <CardContent sx={{ display: "flex", alignItems: "center" }}>
                  <XCircle size={32} color="#f44336" />
                  <Box sx={{ ml: 2 }}>
                    <Typography variant="body2">Respuestas Incorrectas</Typography>
                    <Typography variant="h5" sx={{ fontWeight: "bold", color: "#f44336" }}>
                      {examData.respuestasIncorrectas}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          <Paper elevation={0} sx={{ mt: 4, p: 2, backgroundColor: "#f5f5f5" }}>
            <Typography variant="h6" sx={{ mb: 2, display: "flex", alignItems: "center" }}>
              <AlertCircle size={24} style={{ marginRight: "8px", color: "#B91116" }} />
              Resumen y Recomendaciones
            </Typography>
            <Typography variant="body2" sx={{ mb: 1 }}>
              {examData.mensaje}
            </Typography>
          </Paper>

          <Box sx={{ mt: 4 }}>
            <Button component={Link} to={`/student/exams/${idIntento}/review`} variant="contained" sx={{ backgroundColor: "#4caf50", color: "white", "&:hover": { backgroundColor: "#388e3c" } }}>
              Ver Revisión
            </Button>
          </Box>
        </CardContent>
      </Card>

      <Box sx={{ mt: 4, textAlign: "center" }}>
        <Button component={Link} to="/student/home" variant="outlined" startIcon={<ArrowLeft size={16} />} sx={{ borderColor: "#B91116", color: "#B91116", "&:hover": { borderColor: "#8B0000", backgroundColor: "rgba(185, 17, 22, 0.04)" } }}>
          Volver a Exámenes de Práctica
        </Button>
      </Box>
      {/* ✅ Snackbar para errores y éxito en el mismo formato */}
      <Snackbar
        open={Boolean(error)}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert onClose={handleCloseSnackbar} severity="error" variant="filled">
          {error}
        </Alert>
      </Snackbar>
    </Box>
  )
}
