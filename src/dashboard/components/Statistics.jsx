"use client"

import { useState, useMemo, useEffect } from "react"
import {
  Box,
  Typography,
  Grid,
  Paper,
  useTheme,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Chip,
  IconButton,
} from "@mui/material"
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import { useExamsStore } from "../../hooks/exams/useExamsStore"
import { useSelector } from "react-redux"
import Swal from "sweetalert2"
import DeleteIcon from "@mui/icons-material/Delete"

// Datos de ejemplo basados en la estructura de la base de datos
const examenesFake = [
  {
    id_examen: 1,
    nombre: "Examen EGEL Matemáticas",
    periodo: "2024-1",
    carrera: "Ingeniería en Software",
    area: "Matemáticas",
  },
  {
    id_examen: 2,
    nombre: "Examen EGEL Programación",
    periodo: "2024-1",
    carrera: "Ingeniería en Software",
    area: "Programación",
  },
]

// Datos de rendimiento por pregunta
const rendimientoPreguntasFake = [
  {
    pregunta: 1,
    porcentaje_aciertos: 0.85,
    texto_pregunta: "¿Cuánto es 2 + 2?",
    opciones: [
      { opcion: "A", texto: "3", frecuencia: 5 },
      { opcion: "B", texto: "4", frecuencia: 85 },
      { opcion: "C", texto: "5", frecuencia: 8 },
      { opcion: "D", texto: "6", frecuencia: 2 },
    ],
  },
  {
    pregunta: 2,
    porcentaje_aciertos: 0.75,
    texto_pregunta: "¿Qué es un algoritmo?",
    opciones: [
      { opcion: "A", texto: "Un tipo de dato", frecuencia: 10 },
      { opcion: "B", texto: "Una secuencia de pasos para resolver un problema", frecuencia: 75 },
      { opcion: "C", texto: "Un lenguaje de programación", frecuencia: 10 },
      { opcion: "D", texto: "Un dispositivo de entrada", frecuencia: 5 },
    ],
  },
  {
    pregunta: 3,
    porcentaje_aciertos: 0.9,
    texto_pregunta: "¿Cuál es la complejidad de tiempo de la búsqueda binaria?",
    opciones: [
      { opcion: "A", texto: "O(n)", frecuencia: 5 },
      { opcion: "B", texto: "O(log n)", frecuencia: 90 },
      { opcion: "C", texto: "O(n^2)", frecuencia: 3 },
      { opcion: "D", texto: "O(1)", frecuencia: 2 },
    ],
  },
]

// Distribución de calificaciones
const distribucionCalificacionesFake = [
  { rango: "0-20", cantidad: 5 },
  { rango: "21-40", cantidad: 15 },
  { rango: "41-60", cantidad: 25 },
  { rango: "61-80", cantidad: 35 },
  { rango: "81-100", cantidad: 20 },
]

// Datos de aprobación
const aprobacionFake = [
  { name: "Aprobados", value: 75 },
  { name: "Reprobados", value: 25 },
]

// Datos de calificaciones por estudiante
const calificacionesFake = [
  {
    numero_cuenta: "E001",
    nombre: "Juan Pérez",
    apellido_paterno: "Pérez",
    apellido_materno: "García",
    calificacion: 85,
  },
  {
    numero_cuenta: "E002",
    nombre: "María Rodríguez",
    apellido_paterno: "Rodríguez",
    apellido_materno: "López",
    calificacion: 92,
  },
  {
    numero_cuenta: "E003",
    nombre: "Carlos Sánchez",
    apellido_paterno: "Sánchez",
    apellido_materno: "Martínez",
    calificacion: 78,
  },
  {
    numero_cuenta: "E004",
    nombre: "Ana Martínez",
    apellido_paterno: "Martínez",
    apellido_materno: "Gómez",
    calificacion: 65,
  },
  {
    numero_cuenta: "E005",
    nombre: "Luis González",
    apellido_paterno: "González",
    apellido_materno: "Hernández",
    calificacion: 88,
  },
  {
    numero_cuenta: "E006",
    nombre: "Laura Torres",
    apellido_paterno: "Torres",
    apellido_materno: "Ramírez",
    calificacion: 73,
  },
  {
    numero_cuenta: "E007",
    nombre: "Pedro Díaz",
    apellido_paterno: "Díaz",
    apellido_materno: "Flores",
    calificacion: 95,
  },
  {
    numero_cuenta: "E008",
    nombre: "Sofia Vargas",
    apellido_paterno: "Vargas",
    apellido_materno: "Castro",
    calificacion: 82,
  },
  {
    numero_cuenta: "E009",
    nombre: "Miguel Ruiz",
    apellido_paterno: "Ruiz",
    apellido_materno: "Ortiz",
    calificacion: 69,
  },
  {
    numero_cuenta: "E010",
    nombre: "Isabel Morales",
    apellido_paterno: "Morales",
    apellido_materno: "Jiménez",
    calificacion: 91,
  },
]

const COLORS = ["#2196f3", "#f44336"] // Azul para aprobados, Rojo para reprobados

// Componente de tooltip personalizado para la gráfica de moda
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{ backgroundColor: "white", padding: "5px", border: "1px solid #ccc" }}>
        <p>{`Opción ${label}: ${payload[0].value}`}</p>
        <p>{payload[0].payload.texto}</p>
      </div>
    )
  }
  return null
}

const emptyChartData = []
const emptyPieData = [
  { name: "Aprobados", value: 0 },
  { name: "Reprobados", value: 0 },
]

export const Statistics = () => {
  const theme = useTheme()
  const [selectedExam, setSelectedExam] = useState("")
  const [selectedQuestion, setSelectedQuestion] = useState(1)
  const [selectedDate, setSelectedDate] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedOption, setSelectedOption] = useState("all")
  const [searchTerm, setSearchTerm] = useState("")

  const [rendimientoPreguntas, setRendimientoPreguntas] = useState(emptyChartData)
  const [distribucionCalificaciones, setDistribucionCalificaciones] = useState(emptyChartData)
  const [aprobacion, setAprobacion] = useState(emptyPieData)
  const [calificaciones, setCalificaciones] = useState([])

  const handleExamChange = (event) => {
    setSelectedExam(event.target.value)
    if (event.target.value) {
      // Aquí cargarías los datos reales del examen seleccionado
      setRendimientoPreguntas(rendimientoPreguntasFake)
      setDistribucionCalificaciones(distribucionCalificacionesFake)
      setAprobacion(aprobacionFake)
      setCalificaciones(calificacionesFake)
    } else {
      // Resetear datos cuando no hay examen seleccionado
      setRendimientoPreguntas(emptyChartData)
      setDistribucionCalificaciones(emptyChartData)
      setAprobacion(emptyPieData)
      setCalificaciones([])
    }
  }

  const handleQuestionChange = (event) => {
    setSelectedQuestion(event.target.value)
  }

  const handleDateChange = (event) => {
    setSelectedDate(event.target.value)
  }

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value)
  }

  const handleOptionChange = (event) => {
    setSelectedOption(event.target.value)
  }

  const { handleLoadExams, handleClearError, handleClearSuccess, handleSwitchState } = useExamsStore()

  useEffect(() => {
    handleLoadExams()
  }, [])

  const { exams } = useSelector((state) => state.exams)

  const selectedQuestionData = rendimientoPreguntas.find((q) => q.pregunta === selectedQuestion)

  const handleDeleteStudent = (numeroCuenta, nombreCompleto) => {
    Swal.fire({
      title: "¿Estás seguro?",
      text: `¿Deseas eliminar al alumno ${nombreCompleto}?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    }).then((result) => {
      if (result.isConfirmed) {
        // Aquí iría la lógica para eliminar al estudiante
        console.log(`Eliminando al estudiante con número de cuenta: ${numeroCuenta}`)
        // Actualizar el estado o hacer una llamada a la API para eliminar al estudiante
        Swal.fire("¡Eliminado!", "El alumno ha sido eliminado.", "success")
      }
    })
  }

  const filteredStudents = useMemo(() => {
    return calificaciones.filter((student) => {
      const matchesSearch = Object.values(student).some((value) =>
        value.toString().toLowerCase().includes(searchTerm.toLowerCase()),
      )
      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "passed" && student.calificacion >= 70) ||
        (statusFilter === "failed" && student.calificacion < 70)
      return matchesSearch && matchesStatus
    })
  }, [searchTerm, statusFilter, calificaciones])

  // if (!selectedExam) {
  //   return (
  //     <Box sx={{ flexGrow: 1, p: 3 }}>
  //       <Typography variant="h6" gutterBottom>
  //         Por favor, seleccione un examen para ver las estadísticas.
  //       </Typography>
  //       <FormControl fullWidth>
  //         <InputLabel>Seleccionar Examen</InputLabel>
  //         <Select value={selectedExam} label="Seleccionar Examen" onChange={handleExamChange}>
  //           {exams.map((exam) => (
  //             <MenuItem key={exam.id_examen} value={exam.id_examen}>
  //               {exam.nombre} - {exam.periodo}
  //             </MenuItem>
  //           ))}
  //         </Select>
  //       </FormControl>
  //     </Box>
  //   )
  // }

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <FormControl fullWidth>
            <InputLabel>Seleccionar Examen</InputLabel>
            <Select value={selectedExam} label="Seleccionar Examen" onChange={handleExamChange}>
              {exams.map((exam) => (
                <MenuItem key={exam.id_examen} value={exam.id_examen}>
                  {exam.nombre} - {exam.periodo}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            id="date"
            label="Fecha de Aplicación (Opcional)"
            type="date"
            value={selectedDate}
            onChange={handleDateChange}
            InputLabelProps={{
              shrink: true,
            }}
          />
        </Grid>

        {/* Resumen General */}
        <Grid item xs={12}>
          <Paper elevation={3} sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Resumen General
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={4}>
                <Typography variant="body1">Promedio General: 82.5</Typography>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Typography variant="body1">Total de Estudiantes: 100</Typography>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Typography variant="body1">Tasa de Aprobación: 75%</Typography>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* Rendimiento por pregunta */}
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Rendimiento por pregunta
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={rendimientoPreguntas}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="pregunta" />
                <YAxis domain={[0, 1]} tickFormatter={(value) => `${value * 100}%`} />
                <Tooltip formatter={(value) => `${(value * 100).toFixed(0)}%`} />
                <Line type="monotone" dataKey="porcentaje_aciertos" stroke={theme.palette.primary.main} />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Distribución de Calificaciones */}
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Distribución de Calificaciones
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={distribucionCalificaciones}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="rango" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="cantidad" fill={theme.palette.primary.main} />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Moda de Respuesta por Pregunta */}
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Moda de Respuesta por Pregunta
            </Typography>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Seleccionar Pregunta</InputLabel>
              <Select value={selectedQuestion} label="Seleccionar Pregunta" onChange={handleQuestionChange}>
                {rendimientoPreguntas.map((pregunta) => (
                  <MenuItem key={pregunta.pregunta} value={pregunta.pregunta}>
                    Pregunta {pregunta.pregunta}: {pregunta.texto_pregunta}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            {selectedQuestionData && (
              <>
                <Typography variant="body2" gutterBottom>
                  {selectedQuestionData.texto_pregunta}
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={selectedQuestionData.opciones}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="opcion" />
                    <YAxis />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="frecuencia" fill={theme.palette.secondary.main} />
                  </BarChart>
                </ResponsiveContainer>
              </>
            )}
          </Paper>
        </Grid>

        {/* Aprobados vs Reprobados */}
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Aprobados vs Reprobados
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={aprobacion}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={100}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}%`}
                >
                  {aprobacion.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Tabla de Calificaciones por Estudiante */}
        <Grid item xs={12}>
          <Paper elevation={3} sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Calificaciones por Estudiante
            </Typography>
            <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
              <TextField
                label="Buscar estudiante"
                variant="outlined"
                value={searchTerm}
                onChange={handleSearchChange}
                sx={{ flex: 1 }}
              />
              <FormControl sx={{ minWidth: 200 }}>
                <InputLabel id="status-filter-label">Filtrar por Estado</InputLabel>
                <Select
                  labelId="status-filter-label"
                  id="status-filter"
                  value={statusFilter}
                  label="Filtrar por Estado"
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <MenuItem value="all">Todos</MenuItem>
                  <MenuItem value="passed">Aprobados</MenuItem>
                  <MenuItem value="failed">Reprobados</MenuItem>
                </Select>
              </FormControl>
            </Box>
            <TableContainer
              component={Paper}
              sx={{
                height: 400,
                maxHeight: 400,
                overflow: "auto",
                "&::-webkit-scrollbar": {
                  width: "0.4em",
                },
                "&::-webkit-scrollbar-track": {
                  background: "#f1f1f1",
                },
                "&::-webkit-scrollbar-thumb": {
                  backgroundColor: "#888",
                },
                "&::-webkit-scrollbar-thumb:hover": {
                  background: "#555",
                },
              }}
            >
              <Table stickyHeader sx={{ minWidth: 650 }} aria-label="tabla de calificaciones">
                <TableHead>
                  <TableRow>
                    <TableCell>Número de Cuenta</TableCell>
                    <TableCell>Nombre</TableCell>
                    <TableCell>Apellido Paterno</TableCell>
                    <TableCell>Apellido Materno</TableCell>
                    <TableCell align="right">Calificación</TableCell>
                    <TableCell align="center">Estado</TableCell>
                    <TableCell align="center">Acciones</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredStudents.map((row) => (
                    <TableRow key={row.numero_cuenta} sx={{ "&:last-child td, &:last-child th": { border: 0 } }}>
                      <TableCell component="th" scope="row">
                        {row.numero_cuenta}
                      </TableCell>
                      <TableCell>{row.nombre}</TableCell>
                      <TableCell>{row.apellido_paterno}</TableCell>
                      <TableCell>{row.apellido_materno}</TableCell>
                      <TableCell align="right">{row.calificacion}</TableCell>
                      <TableCell align="center">
                        <Chip
                          label={row.calificacion >= 70 ? "Aprobado" : "Reprobado"}
                          color={row.calificacion >= 70 ? "success" : "error"}
                        />
                      </TableCell>
                      <TableCell align="center">
                        <IconButton
                          aria-label="delete"
                          onClick={() =>
                            handleDeleteStudent(
                              row.numero_cuenta,
                              `${row.nombre} ${row.apellido_paterno} ${row.apellido_materno}`,
                            )
                          }
                          sx={{ color: theme.palette.primary.main }}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  )
}

