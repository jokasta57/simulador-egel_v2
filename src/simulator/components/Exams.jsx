"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import { useExamsStore } from "../../hooks/exams/useExamsStore"
import { useSelector } from "react-redux"
import Swal from "sweetalert2"
import { Box, Typography, Card, CardContent, Stack, useTheme, TextField, InputAdornment, MenuItem, FormControl, Select, InputLabel, Button, Snackbar, Alert, } from "@mui/material"
import { Search as SearchIcon, PlayArrow as StartIcon } from "@mui/icons-material"
import { LoadingSpinner } from "./LoadingSpinner"

export const Exams = () => {
  const theme = useTheme()
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState("") // Estado para el término de búsqueda
  const [areaFilter, setAreaFilter] = useState("Todas") // Estado para el filtro de área
  const [isLoading, setIsLoading] = useState(false) // Estado para indicar si se están cargando los exámenes

  // Obtener exámenes y usuario desde Redux
  const { exams, remainingTime, currentAttempt } = useSelector((state) => state.exams)
  const { user } = useSelector((state) => state.auth)

  // Obtener funciones del store para manejar errores y cargar exámenes
  const { handleClearError, handleLoadExamsByCareer, error } = useExamsStore()

  // Cargar los exámenes automáticamente cuando se tenga la carrera del usuario
  useEffect(() => {
    if (user?.carrera) {
      fetchExams()
    }
  }, [user?.carrera])

  // Obtener las áreas únicas de los exámenes para el filtro
  const areasFiltro = useMemo(() => {
    const uniqueAreas = new Set(exams.map((exam) => exam.area))
    return ["Todas", ...uniqueAreas]
  }, [exams])

  // Función para cargar los exámenes según la carrera del usuario
  const fetchExams = async () => {
    setIsLoading(true);
    await handleLoadExamsByCareer(user.carrera).finally(() => setIsLoading(false));
  };  

  // Filtrar exámenes según el término de búsqueda y el área seleccionada
  const filteredExams = exams?.filter((exam) => {
    const matchesSearch = exam.nombre.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesArea = areaFilter === "Todas" || exam.area === areaFilter
    return matchesSearch && matchesArea
  })

  // Función para manejar el inicio de un examen
  const handleStartExam = (exam) => {
    // Formatea la duración del examen para mostrarla en el mensaje
    const formatDuration = (duration) => {
      const [hours, minutes] = duration.split(":").map(Number)
      if (hours > 0) return `${hours} h ${minutes} min`
      return `${minutes} min`
    }

    // Muestra una alerta de confirmación antes de iniciar el examen
    Swal.fire({
      title: "Confirmación de inicio",
      text: `Vas a iniciar el examen: "${exam.nombre}". Tienes ${formatDuration(exam.duracion)} y no podrás pausarlo. 
  ¿Quieres continuar?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Sí, comenzar",
      cancelButtonText: "Cancelar",
    }).then((result) => {
      if (result.isConfirmed) {
        navigate(`/student/exams/${exam.id_examen}`) // Redirige al usuario al examen seleccionado
      }
    });
  }

  // Cierra la notificación de error
  const handleCloseSnackbar = useCallback(() => {
    handleClearError();
  }, [])

  // Si los exámenes están cargando, muestra el spinner
  if (isLoading) {
    return <LoadingSpinner />
  }

  return (
    <Box sx={{ maxWidth: 1200, margin: "0 auto", p: 3 }}>
      <Typography variant="h4" component="h1" sx={{ color: theme.palette.text.primary, mb: 4, fontWeight: "bold", }}>
        Simulaciones de Examen EGEL
      </Typography>
      <Typography variant="body2" sx={{
        color: "text.disabled",
        textTransform: "uppercase",
        letterSpacing: 1,
        borderBottom: "2px solid rgba(0, 0, 0, 0.12)",
        paddingBottom: 1,
        mb: 2,
        fontWeight: 600,
        fontSize: '1rem',
        mt: -2,
      }}>
        {user.carrera}
      </Typography>

      <Box
        sx={{
          display: "flex",
          gap: 2,
          mb: 4,
          flexDirection: { xs: "column", sm: "row" },
        }}
      >
        <TextField
          fullWidth
          placeholder="Buscar examen..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: "text.secondary" }} />
              </InputAdornment>
            ),
          }}
          sx={{ flex: 2 }}
        />
        <FormControl sx={{ flex: 1, minWidth: 200 }}>
          <InputLabel>Área</InputLabel>
          <Select value={areaFilter} label="Área" onChange={(e) => setAreaFilter(e.target.value)}>
            {areasFiltro.map((area) => (
              <MenuItem key={area} value={area}>
                {area}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      <Stack spacing={2}>
        {filteredExams.length > 0 ? (
          filteredExams.map((exam) => (
            <Card
              key={exam.id_examen}
              sx={{
                border: `1px solid ${theme.palette.divider}`,
                borderRadius: 2,
                boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
                transition: "all 0.3s ease-in-out",
                "&:hover": {
                  transform: "translateY(-5px)",
                  boxShadow: "0 6px 12px rgba(0,0,0,0.15)",
                },
              }}
            >
              <CardContent
                sx={{
                  display: "flex",
                  flexDirection: { xs: "column", sm: "row" },
                  alignItems: { xs: "flex-start", sm: "center" },
                  justifyContent: "space-between",
                  gap: 2,
                  p: "24px !important",
                }}
              >
                <Box sx={{ flex: 1 }}>
                  <Typography
                    variant="h6"
                    component="h3"
                    sx={{
                      fontWeight: "medium",
                      color: theme.palette.text.primary,
                      mb: 1,
                    }}
                  >
                    {exam.nombre}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      color: theme.palette.text.secondary,
                      mb: 1,
                    }}
                  >
                    Área: {exam.area} | Duración: {exam.duracion} minutos
                  </Typography>
                </Box>
                <Button
                  onClick={() => handleStartExam(exam)}
                  variant="contained"
                  startIcon={<StartIcon />}
                  sx={{
                    backgroundColor: theme.palette.success.main,
                    "&:hover": {
                      backgroundColor: theme.palette.success.dark,
                    },
                  }}
                >
                  Iniciar Examen
                </Button>
              </CardContent>
            </Card>
          ))) : (
          <Box sx={{ textAlign: "center", p: 3 }}>
            <Typography variant="h6" color="textSecondary">
              No hay exámenes disponibles
            </Typography>
            <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
              No encontramos exámenes en este momento. Intenta nuevamente más tarde o revisa tu búsqueda.
            </Typography>
          </Box>
        )}
      </Stack>
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

