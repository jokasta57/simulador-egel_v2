import { useState } from "react"
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
} from "@mui/material"
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Stars as StarsIcon,
  Assessment as AssessmentIcon,
} from "@mui/icons-material"

// Datos de ejemplo (reemplazar con datos reales de tu API)
const examData = [
  {
    id: 1,
    nombre: "Examen Bases de datos",
    area: "Bases de datos",
    fecha_aplicacion: "2024-02-02",
    intentos: 2,
    calificacion: 85,
  },
  {
    id: 2,
    nombre: "Examen Inteligencia Artificial",
    area: "Inteligencia Artificial",
    fecha_aplicacion: "2024-01-28",
    intentos: 1,
    calificacion: 65,
  },
  {
    id: 3,
    nombre: "Examen General",
    area: "General",
    fecha_aplicacion: "2024-01-15",
    intentos: 3,
    calificacion: 90,
  },
]

export const Results = () => {
  const theme = useTheme()
  const [examenes, setExamenes] = useState(examData)
  const calificacionMinima = 70 // Definir la calificación mínima para aprobar

  // Calcular estadísticas
  const promedioCalificaciones = examenes?.reduce((acc, exam) => acc + exam.calificacion, 0) / examenes.length
  const totalIntentos = examenes?.reduce((acc, exam) => acc + exam.intentos, 0)
  const mejorExamen = examenes?.reduce((prev, current) => (prev.calificacion > current.calificacion ? prev : current))
  const peorExamen = examenes?.reduce((prev, current) => (prev.calificacion < current.calificacion ? prev : current))

  // Definir colores personalizados
  const customColors = {
    promedioGeneral: "#FFC107", // Amarillo más oscuro
    mejorCalificacion: theme.palette.success.light,
    menorCalificacion: "#D32F2F", // Rojo más oscuro para mejor contraste
    totalIntentos: "#3F51B5", // Azul
  }

  const cardStyle = {
    height: "100%",
    boxShadow: "0 4px 8px rgba(0,0,0,0.1)", // Sombra suave para las tarjetas
    transition: "box-shadow 0.3s ease-in-out",
    "&:hover": {
      boxShadow: "0 6px 12px rgba(0,0,0,0.15)", // Sombra más pronunciada al pasar el mouse
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
                <Typography variant="h6" component="div" sx={{ color: "rgba(0, 0, 0, 0.7)" }}>
                  Promedio General
                </Typography>
              </Box>
              <Typography variant="h4" sx={{ color: "rgba(0, 0, 0, 0.8)" }}>
                {promedioCalificaciones.toFixed(1)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ ...cardStyle, bgcolor: customColors.mejorCalificacion }}>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <TrendingUpIcon sx={{ mr: 1, color: "white" }} />
                <Typography variant="h6" component="div" sx={{ color: "white" }}>
                  Mejor Calificación
                </Typography>
              </Box>
              <Typography variant="h4" sx={{ color: "white" }}>
                {mejorExamen.calificacion}
              </Typography>
              <Typography variant="subtitle2" sx={{ color: "white" }}>
                {mejorExamen.nombre}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ ...cardStyle, bgcolor: customColors.menorCalificacion }}>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <TrendingDownIcon sx={{ mr: 1, color: "white" }} />
                <Typography variant="h6" component="div" sx={{ color: "white" }}>
                  Menor Calificación
                </Typography>
              </Box>
              <Typography variant="h4" sx={{ color: "white" }}>
                {peorExamen.calificacion}
              </Typography>
              <Typography variant="subtitle2" sx={{ color: "white" }}>
                {peorExamen.nombre}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ ...cardStyle, bgcolor: customColors.totalIntentos }}>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <StarsIcon sx={{ mr: 1, color: "white" }} />
                <Typography variant="h6" component="div" sx={{ color: "white" }}>
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
      <Typography variant="h5" component="h2" gutterBottom sx={{ mt: 4, mb: 2 }}>
        Historial de Exámenes
      </Typography>
      <TableContainer component={Paper} sx={{ mb: 4, boxShadow: "0 2px 4px rgba(0,0,0,0.1)" }}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: theme.palette.primary.main }}>
              <TableCell sx={{ color: "white" }}>Examen</TableCell>
              <TableCell sx={{ color: "white" }}>Área</TableCell>
              <TableCell sx={{ color: "white" }}>Fecha</TableCell>
              <TableCell sx={{ color: "white" }}>Intentos</TableCell>
              <TableCell sx={{ color: "white" }}>Calificación</TableCell>
              <TableCell sx={{ color: "white" }}>Estado</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {examenes?.map((examen) => (
              <TableRow key={examen.id} hover>
                <TableCell>{examen.nombre}</TableCell>
                <TableCell>{examen.area}</TableCell>
                <TableCell>{new Date(examen.fecha_aplicacion).toLocaleDateString()}</TableCell>
                <TableCell>{examen.intentos}</TableCell>
                <TableCell>{examen.calificacion}</TableCell>
                <TableCell>
                  <Box
                    sx={{
                      display: "inline-flex",
                      alignItems: "center",
                      px: 1,
                      py: 0.5,
                      borderRadius: 1,
                      backgroundColor:
                        examen.calificacion >= calificacionMinima
                          ? customColors.mejorCalificacion
                          : customColors.menorCalificacion,
                      color: "white",
                      fontWeight: "bold", // Aumentar el peso de la fuente para mejor contraste
                    }}
                  >
                    {examen.calificacion >= calificacionMinima ? "Aprobado" : "Reprobado"}
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  )
}

