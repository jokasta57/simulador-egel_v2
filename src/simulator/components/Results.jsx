"use client"

import { useEffect, useState } from "react"
import { useSelector } from "react-redux"
import { useStudentStatsStore } from "../../hooks/statistics/useStudentStatsStore"
import { Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Card, CardContent, Grid, useTheme, CircularProgress, TextField, FormControl, InputLabel, Select, MenuItem, Button, IconButton, Snackbar, Alert, } from "@mui/material"
import { TrendingUp as TrendingUpIcon, TrendingDown as TrendingDownIcon, Stars as StarsIcon, Assessment as AssessmentIcon, Search as SearchIcon, FilterList as FilterListIcon, Visibility as VisibilityIcon, } from "@mui/icons-material"
import { Link } from "react-router-dom"
import { LoadingSpinner } from "./LoadingSpinner"

export const Results = () => {
  const theme = useTheme()

  // Estados para manejar los datos y la UI
  const [examenes, setExamenes] = useState([]) // Almacena la lista de exámenes
  const [resultados, setResultados] = useState(null) // Almacena los resultados generales del estudiante
  const [loading, setLoading] = useState(true) // Estado de carga
  const [error, setError] = useState(null) // Almacena errores si ocurren
  const [searchTerm, setSearchTerm] = useState("") // Término de búsqueda
  const [statusFilter, setStatusFilter] = useState("all") // Filtro por estado del examen
  const [dateFilter, setDateFilter] = useState("") // Filtro por fecha
  const [areaFilter, setAreaFilter] = useState("") // Filtro por área de examen

  const calificacionMinima = 70 // Calificación mínima para aprobar
  const { user } = useSelector((state) => state.auth) // Obtiene los datos del usuario autenticado
  const { handleStudentResults } = useStudentStatsStore() // Función para obtener los resultados del estudiante

  // Efecto que se ejecuta cuando cambia el número de cuenta del usuario
  useEffect(() => {
    getResults()
  }, [user.numero_cuenta])

  // Función para obtener los resultados del estudiante
  const getResults = async () => {
    try {
      setLoading(true) // Activa el estado de carga
      setError(null) // Reinicia cualquier error previo

      // Llama a la API o función que obtiene los resultados
      const data = await handleStudentResults(user.numero_cuenta)

      if (!data.ok) {
        throw new Error(data || "Error al obtener los resultados")
      }

      // Guarda los resultados en el estado
      setResultados(data.resultados)
      setExamenes(data.historialExamenes)
      setLoading(false)
    } catch (error) {
      // Captura y almacena el error
      setError(error.response?.data?.msg || error.message || 'Error al cargar la página')
    } finally {
      setLoading(false) // Desactiva el estado de carga
    }
  }

  // Muestra un spinner mientras se cargan los datos
  if (loading) return <LoadingSpinner />
  // Muestra un mensaje de error si ocurre un problema
  if (error) return <Typography color="error">{error}</Typography>

  // Calcula estadísticas del usuario
  const totalIntentos = resultados?.totalIntentos || "N/A"

  // Formatea la calificación a dos decimales
  const formatCalificacion = (calificacion) => {
    return calificacion ? Number.parseFloat(calificacion).toFixed(2) : 0
  }

  // Calcula estadísticas con formato correcto
  const promedioCalificaciones = formatCalificacion(resultados?.promedioGeneral?.promedioGeneral)
  const mejorExamen = formatCalificacion(resultados?.mejorCalificacion?.calificacion)
  const peorExamen = formatCalificacion(resultados?.menorCalificacion?.calificacion)

  // Define colores personalizados para las métricas
  const customColors = {
    promedioGeneral: "#FFC107", // Amarillo
    mejorCalificacion: theme.palette.success.light, // Verde claro
    menorCalificacion: "#D32F2F", // Rojo
    totalIntentos: "#3F51B5", // Azul
  }

  // Estilos para las tarjetas de estadísticas
  const cardStyle = {
    height: "100%",
    boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
    transition: "box-shadow 0.3s ease-in-out",
    "&:hover": {
      boxShadow: "0 6px 12px rgba(0,0,0,0.15)",
    },
  }

  // Función para cerrar el Snackbar de error
  const handleCloseSnackbar = () => {
    setError("")
  }

  // Obtiene las áreas únicas de los exámenes para los filtros
  const uniqueAreas = [...new Set(examenes.map((examen) => examen.area))]

  return (
    <Box sx={{ maxWidth: 1200, margin: "0 auto", p: 3 }}>
      {/* Título principal */}
      <Typography variant="h4" component="h1" sx={{ color: theme.palette.text.primary, mb: 4, fontWeight: "bold", }}>
        Mis Resultados
      </Typography>

      {/* Información del usuario (carrera) */}
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

      {/* Tarjetas de Estadísticas */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ ...cardStyle, bgcolor: customColors.promedioGeneral }}>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <AssessmentIcon sx={{ mr: 1, color: "rgba(0, 0, 0, 0.7)" }} />
                <Typography variant="h6" sx={{ color: "rgba(0, 0, 0, 0.7)" }}>
                  Promedio General
                </Typography>
              </Box>
              <Typography variant="h4" sx={{ color: "rgba(0, 0, 0, 0.8)" }}>
                {promedioCalificaciones === "N/A" ? "No hay datos" : promedioCalificaciones}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Repetición de tarjetas con distintas métricas */}
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ ...cardStyle, bgcolor: customColors.mejorCalificacion }}>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <TrendingUpIcon sx={{ mr: 1, color: "white" }} />
                <Typography variant="h6" sx={{ color: "white" }}>
                  Mejor Calificación
                </Typography>
              </Box>
              <Typography variant="h4" sx={{ color: "white" }}>
                {mejorExamen === "N/A" ? "No hay datos" : mejorExamen}
              </Typography>
              <Typography variant="subtitle2" sx={{ color: "white" }}>
                {resultados?.mejorCalificacion?.examen?.nombre || "N/A"}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ ...cardStyle, bgcolor: customColors.menorCalificacion }}>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <TrendingDownIcon sx={{ mr: 1, color: "white" }} />
                <Typography variant="h6" sx={{ color: "white" }}>
                  Menor Calificación
                </Typography>
              </Box>
              <Typography variant="h4" sx={{ color: "white" }}>
                {peorExamen === "N/A" ? "No hay datos" : peorExamen}
              </Typography>
              <Typography variant="subtitle2" sx={{ color: "white" }}>
                {resultados?.menorCalificacion?.examen?.nombre || "N/A"}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ ...cardStyle, bgcolor: customColors.totalIntentos }}>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <StarsIcon sx={{ mr: 1, color: "white" }} />
                <Typography variant="h6" sx={{ color: "white" }}>
                  Total de Intentos
                </Typography>
              </Box>
              <Typography variant="h4" sx={{ color: "white" }}>
                {totalIntentos}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabla de Historial de Exámenes */}
      <Typography variant="h5" gutterBottom sx={{ mt: 4, mb: 2 }}>
        Historial de Exámenes
      </Typography>

      {/* Filtros de búsqueda */}
      <Box
        sx={{
          mb: 3,
          display: "flex",
          gap: 2,
          flexWrap: "wrap",
          alignItems: "center",
          backgroundColor: theme.palette.background.paper,
          p: 2,
          borderRadius: theme.shape.borderRadius,
        }}
      >
        <TextField
          placeholder="Buscar examen..."
          variant="outlined"
          size="small"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ flexGrow: 1, minWidth: 200 }}
          InputProps={{
            startAdornment: <SearchIcon sx={{ color: "action.active", mr: 1 }} />,
          }}
        />
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>Estado</InputLabel>
          <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} label="Estado">
            <MenuItem value="all">Todos</MenuItem>
            <MenuItem value="aprobado">Aprobados</MenuItem>
            <MenuItem value="reprobado">Reprobados</MenuItem>
          </Select>
        </FormControl>
        <TextField
          label="Fecha"
          type="date"
          size="small"
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
          sx={{ minWidth: 150 }}
          InputLabelProps={{ shrink: true }}
        />
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>Área</InputLabel>
          <Select value={areaFilter} onChange={(e) => setAreaFilter(e.target.value)} label="Área">
            <MenuItem value="">Todas</MenuItem>
            {uniqueAreas.map((area) => (
              <MenuItem key={area} value={area}>
                {area}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <IconButton color="primary" aria-label="filter list">
          <FilterListIcon />
        </IconButton>
      </Box>
      <TableContainer
        component={Paper}
        sx={{
          mb: 4,
          boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
          maxHeight: "400px",
          overflowY: "auto",
          "& .MuiTable-root": {
            "& .MuiTableHead-root": {
              position: "sticky",
              top: 0,
              zIndex: 1,
              backgroundColor: theme.palette.primary.main,
            },
          },
        }}
      >
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: theme.palette.primary.main }}>
              <TableCell sx={{ color: "white" }}>Examen</TableCell>
              <TableCell sx={{ color: "white" }}>Área</TableCell>
              <TableCell sx={{ color: "white" }}>Fecha</TableCell>
              <TableCell sx={{ color: "white" }}>Numero de Intento</TableCell>
              <TableCell sx={{ color: "white" }}>Calificación</TableCell>
              <TableCell sx={{ color: "white" }}>Estado</TableCell>
              <TableCell sx={{ color: "white" }}>Acción</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {examenes.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  No hay intentos de examen disponibles.
                </TableCell>
              </TableRow>
            ) : (
              examenes
                .filter((examen) => {
                  const searchTermLower = searchTerm.toLowerCase();
                  const matchesSearch =
                    examen.nombre.toLowerCase().includes(searchTermLower) ||
                    examen.area.toLowerCase().includes(searchTermLower);
                  const matchesStatus =
                    statusFilter === "all" ||
                    (statusFilter === "aprobado" && examen.calificacion >= calificacionMinima) ||
                    (statusFilter === "reprobado" && examen.calificacion < calificacionMinima);
                  const matchesDate = !dateFilter || examen.fecha_aplicacion.includes(dateFilter);
                  const matchesArea = !areaFilter || examen.area === areaFilter;

                  return matchesSearch && matchesStatus && matchesDate && matchesArea;
                })
                .map((examen, index) => (
                  <TableRow key={index} hover>
                    <TableCell>{examen.nombre}</TableCell>
                    <TableCell>{examen.area}</TableCell>
                    <TableCell>{examen.fecha_aplicacion}</TableCell>
                    <TableCell>{examen.intento}°</TableCell>
                    <TableCell>
                      {examen.calificacion ? formatCalificacion(examen.calificacion) : 0}
                    </TableCell>
                    <TableCell>
                      {examen.calificacion >= calificacionMinima ? "Aprobado" : "Reprobado"}
                    </TableCell>
                    <TableCell>
                      <Button
                        component={Link}
                        to={`/student/exams/${examen.id_intento}/review`}
                        startIcon={<VisibilityIcon />}
                        variant="outlined"
                        size="small"
                      >
                        Ver Revisión
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
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

