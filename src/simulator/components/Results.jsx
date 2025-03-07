"use client"

import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Card,
  CardContent,
  Grid,
  useTheme,
  CircularProgress,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  IconButton,
  Snackbar,
  Alert,
} from "@mui/material"
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Stars as StarsIcon,
  Assessment as AssessmentIcon,
  Search as SearchIcon,
  FilterList as FilterListIcon,
  Visibility as VisibilityIcon,
} from "@mui/icons-material"

import { useStudentStatsStore } from "../../hooks/statistics/useStudentStatsStore"
import { useSelector } from "react-redux"
import { LoadingSpinner } from "./LoadingSpinner"

export const Results = () => {
  const theme = useTheme()
  const [examenes, setExamenes] = useState([])
  const [resultados, setResultados] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [dateFilter, setDateFilter] = useState("")
  const [areaFilter, setAreaFilter] = useState("")

  const calificacionMinima = 70 // Definir la calificación mínima para aprobar
  const { user } = useSelector((state) => state.auth)
  const { handleStudentResults } = useStudentStatsStore()

  useEffect(() => {
    const getResults = async () => {
      try {
        setLoading(true)
        setError(null)

        // Esperar la respuesta de la API
        const data = await handleStudentResults(user.numero_cuenta)

        if (!data.ok) {
          throw new Error(data.msg || "Error al obtener los resultados")
        }


        // Guardar los datos en el estado
        setResultados(data.resultados)
        setExamenes(data.historialExamenes)
        console.log(examenes);
        setLoading(false)
      } catch (error) {
        setError(error.response?.data?.msg || error.message || 'Error al cargar la pagina')
      } finally {
        setLoading(false)
      }
    }

    getResults()
  }, [user.numero_cuenta])

  if (loading) return <LoadingSpinner />
  if (error) return <Typography color="error">{error}</Typography>

  // Calcular estadísticas
  const totalIntentos = resultados?.totalIntentos || "N/A"
  // Formatear calificaciones a dos decimales
  const formatCalificacion = (calificacion) => {
    return calificacion ? Number.parseFloat(calificacion).toFixed(2) : 0
  }

  // Calcular estadísticas con formato correcto
  const promedioCalificaciones = formatCalificacion(resultados?.promedioGeneral?.promedioGeneral)
  const mejorExamen = formatCalificacion(resultados?.mejorCalificacion?.calificacion)
  const peorExamen = formatCalificacion(resultados?.menorCalificacion?.calificacion)

  // Definir colores personalizados
  const customColors = {
    promedioGeneral: "#FFC107",
    mejorCalificacion: theme.palette.success.light,
    menorCalificacion: "#D32F2F",
    totalIntentos: "#3F51B5",
  }

  const cardStyle = {
    height: "100%",
    boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
    transition: "box-shadow 0.3s ease-in-out",
    "&:hover": {
      boxShadow: "0 6px 12px rgba(0,0,0,0.15)",
    },
  }

  const handleCloseSnackbar = () => {
    setError("")
  }

  // Get unique areas from examenes
  const uniqueAreas = [...new Set(examenes.map((examen) => examen.area))]

  return (
    <Box sx={{ maxWidth: 1200, margin: "0 auto", p: 3 }}>
      <Typography variant="h4" component="h1" sx={{ color: theme.palette.text.primary, mb: 4, fontWeight: "bold", }}>
        Mis Resultados
      </Typography>
      <Typography variant="body2" sx={{
        color: "text.disabled",
        textTransform: "uppercase",
        letterSpacing: 1,
        borderBottom: "2px solid rgba(0, 0, 0, 0.12)",
        paddingBottom: 1,
        mb: 2,
        fontWeight: 600, // Aumenta el peso para que no se pierda tanto
        fontSize: '1rem', // Tamaño más pequeño pero aún legible
        mt: -2, // Ajusta este valor para moverlo hacia arriba
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
            {examenes
              .filter((examen) => {
                const searchTermLower = searchTerm.toLowerCase()
                const matchesSearch =
                  examen.nombre.toLowerCase().includes(searchTermLower) ||
                  examen.area.toLowerCase().includes(searchTermLower)
                const matchesStatus =
                  statusFilter === "all" ||
                  (statusFilter === "aprobado" && examen.calificacion >= calificacionMinima) ||
                  (statusFilter === "reprobado" && examen.calificacion < calificacionMinima)
                const matchesDate = !dateFilter || examen.fecha_aplicacion.includes(dateFilter)
                const matchesArea = !areaFilter || examen.area === areaFilter

                return matchesSearch && matchesStatus && matchesDate && matchesArea
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
                  <TableCell>{examen.calificacion >= calificacionMinima ? "Aprobado" : "Reprobado"}</TableCell>
                  <TableCell>
                    <Button
                      component={Link}
                      to={`/student/exams/${examen.id_intento}/review`}
                      startIcon={<VisibilityIcon />}
                      variant="outlined"
                      size="small"
                      onClick={() => console.log(`Redirigiendo a: /student/results/revision/${examen.id_intento}`)}
                    >
                      Ver Revisión
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
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

