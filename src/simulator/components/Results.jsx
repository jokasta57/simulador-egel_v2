"use client"

import { useEffect, useState } from "react"
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
} from "@mui/material"
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Stars as StarsIcon,
  Assessment as AssessmentIcon,
} from "@mui/icons-material"

import { useStudentStatsStore } from "../../hooks/statistics/useStudentStatsStore"
import { useSelector } from "react-redux"

export const Results = () => {
  const theme = useTheme()
  const [examenes, setExamenes] = useState([])
  const [resultados, setResultados] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

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
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    getResults()
  }, [user.numero_cuenta]) // Added handleStudentResults to dependencies

  if (loading) return <CircularProgress sx={{ display: "block", margin: "auto", mt: 5 }} />
  if (error) return <Typography color="error">{error}</Typography>

  // Calcular estadísticas
  const totalIntentos = resultados?.totalIntentos || "N/A"
  // Formatear calificaciones a dos decimales
  const formatCalificacion = (calificacion) => {
    return calificacion ? parseFloat(calificacion).toFixed(2) : "No hay datos";
  };

  // Calcular estadísticas con formato correcto
  const promedioCalificaciones = formatCalificacion(resultados?.promedioGeneral?.promedioGeneral);
  const mejorExamen = formatCalificacion(resultados?.mejorCalificacion?.calificacion);
  const peorExamen = formatCalificacion(resultados?.menorCalificacion?.calificacion);

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

  return (
    <Box sx={{ maxWidth: 1200, margin: "0 auto", p: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom sx={{ mb: 4, color: theme.palette.primary.main }}>
        Mis Resultados
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
      <TableContainer component={Paper} sx={{ mb: 4, boxShadow: "0 2px 4px rgba(0,0,0,0.1)" }}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: theme.palette.primary.main }}>
              <TableCell sx={{ color: "white" }}>Examen</TableCell>
              <TableCell sx={{ color: "white" }}>Área</TableCell>
              <TableCell sx={{ color: "white" }}>Fecha</TableCell>
              <TableCell sx={{ color: "white" }}>Numero de Intento</TableCell>
              <TableCell sx={{ color: "white" }}>Calificación</TableCell>
              <TableCell sx={{ color: "white" }}>Estado</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {examenes.map((examen, index) => (
              <TableRow key={index} hover>
                <TableCell>{examen.nombre}</TableCell>
                <TableCell>{examen.area}</TableCell>
                <TableCell>{examen.fecha_aplicacion}</TableCell>
                <TableCell>{examen.intento}°</TableCell>
                <TableCell>{examen.calificacion ? formatCalificacion(examen.calificacion) : "No hay datos"}</TableCell>
                <TableCell>{examen.estado}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  )
}

