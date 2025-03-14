"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { Box, Typography, Card, CardContent, Button, Paper, Tooltip, IconButton, Grid, Snackbar, Alert } from "@mui/material"
import { CheckCircle, Calendar, ClipboardList, GraduationCap, ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react"
import { useParams, useNavigate } from "react-router-dom"
import { useExamsStore } from "../../hooks/exams/useExamsStore"
import { useDispatch, useSelector } from "react-redux"
import { LoadingSpinner } from "./LoadingSpinner"
import { resetCurrentAttempt } from "../../store"

export const ExamReview = () => {
  // Obtiene el ID de los parámetros de la URL
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Estados locales para manejar la información del examen y su revisión
  const [examData, setExamData] = useState(null);
  const [panelQuestions, setPanelQuestions] = useState(null);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoadingState] = useState(true);
  const rowsPerPage = 5;
  const scrollRef = useRef(null);

  // Obtiene el intento actual desde Redux y las funciones del store
  const { currentAttempt } = useSelector((state) => state.exams);
  const { handleReviewAttempt, handlePanelQuestions } = useExamsStore();

  // Función para obtener los datos de la revisión del examen
  const fetchReviewData = useCallback(async () => {
    setIsLoadingState(true);
    try {
      // Si no hay intento actual o ID, detiene la ejecución
      if (!currentAttempt || !id) return;
      
      // Obtiene la revisión desde el backend
      const data = await handleReviewAttempt(currentAttempt.id_intento || id, currentPage, rowsPerPage);
      setExamData(data);
    } catch (error) {
      // Captura errores y los almacena en el estado
      setError(error.response?.data?.msg || error.message || "Error al obtener revisión");
    } finally {
      setIsLoadingState(false);
    }
  }, [currentAttempt, currentPage, rowsPerPage]);

  // Función para obtener las preguntas del panel de revisión
  const getPanelQuestions = useCallback(async () => {
    if (!currentAttempt || !id) return;
    setIsLoadingState(true);
    try {
      // Obtiene las preguntas desde el backend
      const data = await handlePanelQuestions(currentAttempt.id_intento || id);
      setPanelQuestions(data);
    } catch (error) {
      setError(error.response?.data?.msg || error.message || "Error al obtener revisión");
    } finally {
      setIsLoadingState(false);
    }
  }, [currentAttempt]);

  // Efecto para cargar la revisión del examen cuando haya un intento actual
  useEffect(() => {
    if (currentAttempt) {
      fetchReviewData();
    }
  }, [currentAttempt, currentPage]);

  // Efecto para cargar las preguntas del panel y limpiar el intento al desmontar
  useEffect(() => {
    if (currentAttempt) {
      getPanelQuestions();
    }
    return () => {
      dispatch(resetCurrentAttempt());
    };
  }, []);

  // Función para desplazar el scroll lateralmente
  const handleScroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = 150;
      scrollRef.current.scrollBy({ left: direction === "left" ? -scrollAmount : scrollAmount, behavior: "smooth" });
    }
  };

  // Cierra el Snackbar de error
  const handleCloseSnackbar = () => {
    setError("");
  };

  // Mientras se cargan los datos, muestra un spinner y un snackbar si hay error
  if (isLoading || !examData) {
    return (
      <>
        <LoadingSpinner message="Cargando revisión..." />
        <Snackbar
          open={Boolean(error)}
          autoHideDuration={6000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        >
          <Alert onClose={handleCloseSnackbar} severity="error" variant="filled">
            {typeof error === "string" ? error : JSON.stringify(error)}
          </Alert>
        </Snackbar>
      </>
    );
  }

  return (
    <Box sx={{ maxWidth: 900, margin: "0 auto", p: 3 }}>
      {/* Back Button */}
      <Button
        variant="outlined"
        startIcon={<ArrowLeft />}
        onClick={() => navigate(-1)}
        sx={{ mb: 3, borderRadius: "8px" }}
      >
        Regresar
      </Button>

      {/* Información General del Examen - Moderno */}
      <Paper
        sx={{ p: 3, mb: 3, borderRadius: "12px", backgroundColor: "#ffffff", boxShadow: 3, border: "1px solid #ddd" }}
      >
        <Typography variant="h5" sx={{ fontWeight: "bold", textAlign: "center", mb: 2 }}>
          {examData.intento.examen.nombre}
        </Typography>
        <Grid container spacing={2} justifyContent="center">
          <Grid item xs={6} display="flex" alignItems="center">
            <ClipboardList size={20} style={{ marginRight: 8 }} />
            <Typography variant="body1">
              <strong>Número de Intento:</strong> {examData.numeroIntento}
            </Typography>
          </Grid>
          <Grid item xs={6} display="flex" alignItems="center">
            <CheckCircle size={20} color="#4caf50" style={{ marginRight: 8 }} />
            <Typography variant="body1">
              <strong>Calificación:</strong> {examData.intento.calificacion || 0} %
            </Typography>
          </Grid>
          <Grid item xs={6} display="flex" alignItems="center">
            <Calendar size={20} style={{ marginRight: 8 }} />
            <Typography variant="body1">
              <strong>Fecha de Aplicación:</strong> {examData.intento.fecha_aplicacion}
            </Typography>
          </Grid>
          <Grid item xs={6} display="flex" alignItems="center">
            <GraduationCap size={20} style={{ marginRight: 8 }} />
            <Typography variant="body1">
              <strong>Área:</strong> {examData.intento.examen.area}
            </Typography>
          </Grid>
          <Grid item xs={6} display="flex" alignItems="center">
            <GraduationCap size={20} style={{ marginRight: 8 }} />
            <Typography variant="body1">
              <strong>Periodo:</strong> {examData.intento.examen.periodo}
            </Typography>
          </Grid>
        </Grid>
      </Paper>

      {/* Panel de navegación con slider moderno */}
      <Box sx={{ display: "flex", alignItems: "center", mb: 3, overflow: "hidden" }}>
        <IconButton onClick={() => handleScroll("left")}>
          {" "}
          <ChevronLeft size={24} />{" "}
        </IconButton>
        <Box
          ref={scrollRef}
          sx={{
            display: "flex",
            overflowX: "auto",
            gap: 1,
            p: 1,
            backgroundColor: "#f8f8f8",
            borderRadius: "12px",
            flexGrow: 1,
            scrollBehavior: "smooth",
            whiteSpace: "nowrap",
            "&::-webkit-scrollbar": { display: "none" },
          }}
        >
          {Array.from({ length: examData.totalPreguntas }).map((_, index) => {
            // Busca la pregunta actual según el índice
            const pregunta = panelQuestions.preguntasPanel.find((p) => p.orden === index + 1);

            return (
              <Tooltip key={index} title={`Pregunta ${index + 1}`} arrow>
                <Button
                  variant="contained"
                  sx={{
                    backgroundColor: pregunta?.es_correcta ? "#4caf50" : "#f44336",
                    color: "white",
                    fontSize: "0.8rem",
                    minWidth: "30px",
                    height: "30px",
                    borderRadius: "6px",
                    boxShadow: "none",
                    "&:hover": { opacity: 0.8 },
                  }}
                  onClick={() => {
                    // Calcula la página correcta en función de `rowsPerPage`
                    const pageToGo = Math.floor(index / rowsPerPage) + 1;
                    setCurrentPage(pageToGo);

                    // Pequeño retraso para que el cambio de página ocurra antes del scroll
                    setTimeout(() => {
                      const preguntaElement = document.getElementById(`pregunta-${index + 1}`);
                      if (preguntaElement) {
                        const offset = 80; // Ajusta este valor según la altura de tu navbar o padding superior
                        const rect = preguntaElement.getBoundingClientRect();
                        window.scrollBy({ top: rect.top - offset, behavior: "smooth" });
                      }
                    }, 100);
                  }}
                >
                  {index + 1}
                </Button>
              </Tooltip>
            );
          })}
        </Box>
        <IconButton onClick={() => handleScroll("right")}>
          {" "}
          <ChevronRight size={24} />{" "}
        </IconButton>
      </Box>

      {examData.preguntas.map((p) => (
        <Card key={p.id_pregunta} id={`pregunta-${p.orden}`} sx={{ mb: 3, p: 3, boxShadow: 2, backgroundColor: "#ffffff", borderRadius: "12px", border: "1px solid #ddd" }}>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: "bold", color: "#333" }}>
              {`Pregunta ${p.orden}`}
            </Typography>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: "bold", color: "#333" }}>
              {p.contenido}
            </Typography>
            {p.imagen_url && (
              <Box sx={{ textAlign: "center", mb: 2 }}>
                <img
                  src={p.imagen_url || "/placeholder.svg"}
                  alt={`Imagen de la pregunta ${p.id_pregunta}`}
                  style={{
                    width: "100%",
                    maxWidth: "350px",
                    height: "auto",
                    objectFit: "contain",
                    borderRadius: "8px",
                    boxShadow: "0px 4px 6px rgba(0,0,0,0.1)",
                  }}
                />
              </Box>
            )}
            <Paper sx={{ p: 2, textAlign: "center", backgroundColor: p.opcion_escogida_correcta === false ? "#ffebee" : "#e8f5e9", borderRadius: "8px", mb: 2 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: "bold", color: "#333" }}>
                Opción Escogida
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: "bold", color: "#555" }}>
                {p.opcion_escogida ? p.opcion_escogida : "No se ha seleccionado una respuesta"}
              </Typography>
              {p.opcion_escogida_imagen && (
                <Box sx={{ textAlign: "center", mb: 2 }}>
                  <img
                    src={p.opcion_escogida_imagen || "/placeholder.svg"}
                    alt={`Imagen`}
                    style={{
                      width: "100%",
                      maxWidth: "350px",
                      height: "auto",
                      objectFit: "contain",
                      borderRadius: "8px",
                      boxShadow: "0px 4px 6px rgba(0,0,0,0.1)",
                    }}
                  />
                </Box>
              )}
            </Paper>
            <Paper sx={{ p: 2, textAlign: "center", backgroundColor: "#e3f2fd", borderRadius: "8px" }}>
              <Typography variant="subtitle2" sx={{ fontWeight: "bold", color: "#333" }}>
                Opción Correcta
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: "bold", color: "#555" }}>
                {p.opcion_correcta}
                {p.opcion_correcta_imagen && (
                  <Box sx={{ textAlign: "center", mb: 2 }}>
                    <img
                      src={p.opcion_correcta_imagen || "/placeholder.svg"}
                      alt={`Imagen`}
                      style={{
                        width: "100%",
                        maxWidth: "350px",
                        height: "auto",
                        objectFit: "contain",
                        borderRadius: "8px",
                        boxShadow: "0px 4px 6px rgba(0,0,0,0.1)",
                      }}
                    />
                  </Box>
                )}
              </Typography>
            </Paper>
          </CardContent>
        </Card>
      ))}
      {/* Controles de paginación */}
      <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
        <Button onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))} disabled={currentPage === 1} variant="outlined" startIcon={<ChevronLeft />}>
          Anterior
        </Button>
        <Typography sx={{ mx: 2 }}>Página {currentPage} de {examData.totalPages}</Typography>
        <Button onClick={() => setCurrentPage((prev) => Math.min(prev + 1, examData.totalPages))} disabled={currentPage === examData.totalPages} variant="outlined" endIcon={<ChevronRight />}>
          Siguiente
        </Button>
      </Box>
      <Snackbar
        open={Boolean(error)}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert onClose={handleCloseSnackbar} severity="error" variant="filled">
          {typeof error === "string"
            ? error
            : JSON.stringify(error)
          }
        </Alert>
      </Snackbar>
    </Box>
  )
}

