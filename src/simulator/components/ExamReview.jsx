"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { Box, Typography, Card, CardContent, Button, Paper, Tooltip, IconButton, Grid } from "@mui/material"
import { CheckCircle, Calendar, ClipboardList, GraduationCap, ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react"
import { useParams, useNavigate } from "react-router-dom"
import { useExamsStore } from "../../hooks/exams/useExamsStore"
import { useSelector } from "react-redux"
import { LoadingSpinner } from "./LoadingSpinner"

const examData = {
  id_intento: 1,
  numero_cuenta: 399098,
  id_examen: 7,
  fecha_aplicacion: "2025-01-17",
  nombre: "Examen de Programación Avanzada",
  carrera: "Ingeniería en Sistemas",
  area: "Informática",
  periodo: "2025-A",
  totalPreguntas: 50,
  respuestasCorrectas: 45,
  respuestasIncorrectas: 5,
  preguntas: Array.from({ length: 50 }, (_, i) => ({
    numero: i + 1,
    pregunta: `Pregunta de ejemplo ${i + 1}?`,
    respuestaUsuario: i < 45 ? "Opción A: Respuesta Correcta" : "Opción B: Respuesta Incorrecta",
    respuestaCorrecta: "Opción A: Respuesta Correcta",
    imagen_url: i % 5 === 0 ? "/example-image.jpg" : null,
    esCorrecta: i < 45,
  })),
}

export const ExamReview = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [examData, setExamData] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoadingState] = useState(true);
  const rowsPerPage = 5;
  const scrollRef = useRef(null);
  const { handleReviewAttempt } = useExamsStore();
  const { currentAttempt } = useSelector((state) => state.exams)

  const fetchReviewData = useCallback(async () => {
    if (!currentAttempt) return; // ✅ Espera hasta que currentAttempt esté disponible
    setIsLoadingState(true);
    try {
      const data = await handleReviewAttempt(currentAttempt.id_intento, currentPage, rowsPerPage);
      setExamData(data);
      console.log(data);
    } catch (error) {
      console.error("Error al obtener revisión:", error);
    } finally {
      setIsLoadingState(false);
    }
  }, [currentAttempt, currentPage, rowsPerPage, handleReviewAttempt]);

  useEffect(() => {
    if (currentAttempt) {
      fetchReviewData();
    }
  }, [currentAttempt, currentPage]);

  if (isLoading || !examData) {
    return <LoadingSpinner />;
  }

  const handlePageChange = (event, value) => {
    setCurrentPage(value)
  }

  const handleScroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = 150
      scrollRef.current.scrollBy({ left: direction === "left" ? -scrollAmount : scrollAmount, behavior: "smooth" })
    }
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
              <strong>Número de Intento:</strong> {examData.intento.id_intento}
            </Typography>
          </Grid>
          <Grid item xs={6} display="flex" alignItems="center">
            <CheckCircle size={20} color="#4caf50" style={{ marginRight: 8 }} />
            <Typography variant="body1">
              {/* <strong>Calificación:</strong> {examData.respuestasCorrectas}/{examData.totalPreguntas} */}
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
          {Array.from({ length: examData.totalPreguntas }).map((_, index) => (
            <Tooltip key={index} title={`Pregunta ${index + 1}`} arrow>
              <Button
                variant="contained"
                sx={{
                  backgroundColor: examData.preguntas.some((p) => p.id_pregunta === index + 1) ? "#4caf50" : "#f44336",
                  color: "white",
                  fontSize: "0.8rem",
                  minWidth: "30px",
                  height: "30px",
                  borderRadius: "6px",
                  boxShadow: "none",
                  "&:hover": { opacity: 0.8 },
                }}
                onClick={() => setCurrentPage(Math.floor(index / rowsPerPage) + 1)}
              >
                {index + 1}
              </Button>
            </Tooltip>
          ))}
        </Box>
        <IconButton onClick={() => handleScroll("right")}>
          {" "}
          <ChevronRight size={24} />{" "}
        </IconButton>
      </Box>

      {examData.preguntas.map((p) => (
        <Card key={p.id_pregunta} sx={{ mb: 3, p: 3, boxShadow: 2, backgroundColor: "#ffffff", borderRadius: "12px", border: "1px solid #ddd" }}>
          <CardContent>
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
            </Paper>
            <Paper sx={{ p: 2, textAlign: "center", backgroundColor: "#e3f2fd", borderRadius: "8px" }}>
              <Typography variant="subtitle2" sx={{ fontWeight: "bold", color: "#333" }}>
                Opción Correcta
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: "bold", color: "#555" }}>
                {p.opcion_correcta}
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
    </Box>
  )
}

