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
  FormHelperText,
  Alert,
  Button,
  CircularProgress,
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
  Legend,
} from "recharts"
import { useExamsStore } from "../../hooks/exams/useExamsStore"
import { useSelector } from "react-redux"
import Swal from "sweetalert2"
import DeleteIcon from "@mui/icons-material/Delete"
import { useAdminStatsStore } from "../../hooks/statistics/useAdminStatsStore"

const COLORS = ["#2196f3", "#f44336"] // Azul para aprobados, Rojo para reprobados

const emptyPieData = [
  { name: "Aprobados", value: 0 },
  { name: "Reprobados", value: 0 },
]

export const Statistics = () => {
  const theme = useTheme()

  //Examen seleccionado
  const [selectedExam, setSelectedExam] = useState("")

  //Filtro de fechas inicio y fin
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")

  //Filtro de estado en la tabla de estudiantes y barra de busqueda
  const [statusFilter, setStatusFilter] = useState("all")
  const [searchTerm, setSearchTerm] = useState("")

  //Info de las preguntas para las graficas de 
  const [preguntasData, setPreguntasData] = useState([])

  //para la grafica de distribucion de calificaciones
  const [distribucionCalificaciones, setDistribucionCalificaciones] = useState([])
  //Grafica de pastel
  const [aprobacion, setAprobacion] = useState(emptyPieData)
  //Tabla de estudiantes
  const [calificaciones, setCalificaciones] = useState([])
  const [resumen, setResumen] = useState({})
  
  //Preguntas por pagina para la grafica de moda
  const preguntasPorPagina = 5; // Mínimo 5 preguntas por página
  const [paginaActual, setPaginaActual] = useState(0);

  //Loading
  const [isLoading, setIsLoading] = useState(false)
  
  //Hook de estadisticas
  const { handlePerformancePerQuestion, handleLastExamAttempt, handleSummaryAndGrades } = useAdminStatsStore();
  const { handleLoadExams } = useExamsStore()


  const handleExamChange = (event) => {
    setSelectedExam(event.target.value)
    if (event.target.value) {
      // Aquí cargarías los datos reales del examen seleccionado
      // setCalificaciones(calificacionesFake)

    } else {
      // Resetear datos cuando no hay examen seleccionado
      setDistribucionCalificaciones([])
      setAprobacion(emptyPieData)
      setCalificaciones([])
    }
  }
  // Calcular el rango de preguntas a mostrar
  const inicio = paginaActual * preguntasPorPagina;
  const fin = Math.min(inicio + preguntasPorPagina, preguntasData.length);
  const preguntasPagina = Array.isArray(preguntasData) ? preguntasData.slice(inicio, fin) : [];


  // Obtener todas las opciones posibles en la página actual
  const todasLasOpciones = [...new Set(preguntasPagina.flatMap((p) => p.opciones.map((o) => o.opcion)))];

  // Transformar los datos para que cada pregunta tenga todas las opciones, incluso con frecuencia 0 si no existe
  const datosTransformados = preguntasPagina.map((pregunta) => {
    let data = { pregunta: `P${pregunta.pregunta}` }; // Se mantiene única en el eje X
    pregunta.opciones.forEach((opcion) => {
      data[opcion.opcion] = opcion.frecuencia; // Se asigna cada opción como clave con su frecuencia
    });

    // Asegurar que todas las opciones están presentes (incluso si faltan en la pregunta)
    todasLasOpciones.forEach((opcion) => {
      if (!(opcion in data)) {
        data[opcion] = 0; // Si no hay datos para esa opción, poner 0
      }
    });

    return data;
  });

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value)
  }

  useEffect(() => {
    setIsLoading(true);
    handleLoadExams();
    getLastExamAttempt();
    setIsLoading(false);
  }, [])

  useEffect(() => {
    setIsLoading(true);
    getPerformancePerQuestion();
    getSummaryAndGrades()
    setIsLoading(false);
  }, [selectedExam, startDate, endDate])

  const { exams } = useSelector((state) => state.exams)

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

  const getPerformancePerQuestion = async() => {
    try {
      const data = await handlePerformancePerQuestion(selectedExam, startDate, endDate);
      setPreguntasData(data.intentos)
    } catch (error) {
      console.log(error);
    }
  }

  const getLastExamAttempt = async() => {
    try {
      const data = await handleLastExamAttempt();
      setSelectedExam(data.examen.id_examen)
    } catch (error) {
      console.log(error);
    }
  }

  const getSummaryAndGrades = async() => {
    try {
      const data = await handleSummaryAndGrades(selectedExam, startDate, endDate);
      setDistribucionCalificaciones(data.resumen.distribucion_calificaciones)
      setAprobacion(data.resumen.aprobacion)
      setCalificaciones(data.calificaciones)
      setResumen(data.resumen)
    } catch (error) {
      console.log(error);
    }
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


  if (isLoading) return <CircularProgress sx={{ display: "block", margin: "auto", mt: 5 }} />
  

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Typography
        variant="h4"
        component="h1"
        sx={{
          color: theme.palette.text.primary,
          fontWeight: "bold",
        }}
      >
        Estadísticas por examen
      </Typography>
      <br />
      {!selectedExam && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          Por favor, selecciona un examen para ver las estadísticas.
        </Alert>
      )}
      <br />
      <Grid container spacing={3}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <FormControl fullWidth error={!selectedExam}>
              <InputLabel>Seleccionar Examen</InputLabel>
              <Select
                value={selectedExam || ""}
                label="Seleccionar Examen"
                onChange={handleExamChange}
              >
                <MenuItem value="" disabled>
                  -- Selecciona un examen --
                </MenuItem>
                {exams.map((exam) => (
                  <MenuItem key={exam.id_examen} value={exam.id_examen}>
                    {exam.nombre} - {exam.periodo}
                  </MenuItem>
                ))}
              </Select>
              {!selectedExam && <FormHelperText>Debe seleccionar un examen</FormHelperText>}
            </FormControl>
          </Grid>
          <Grid item xs={6} md={3}>
            <TextField
              fullWidth
              id="start-date"
              label="Fecha de Inicio (Opcional)"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>

          <Grid item xs={6} md={3}>
            <TextField
              fullWidth
              id="end-date"
              label="Fecha de Fin (Opcional)"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
              inputProps={{ min: startDate }}
            />
          </Grid>
        </Grid>


        {/* Resumen General */}
        <Grid item xs={12}>
          <Paper elevation={3} sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Resumen General
            </Typography>
            {!selectedExam ? (
              <Typography color="error">Selecciona un examen para ver las estadísticas</Typography>
            ) : (
              <Grid container spacing={2}>
                <Grid item xs={12} sm={4}>
                  <Typography variant="body1">Promedio General: {resumen.promedio_general}</Typography>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Typography variant="body1">Total de Estudiantes: {resumen.total_estudiantes}</Typography>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Typography variant="body1">Tasa de Aprobación: {resumen.tasa_aprobacion}%</Typography>
                </Grid>
              </Grid>
            )}
          </Paper>
        </Grid>

        {/* Rendimiento por pregunta */}
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Rendimiento por pregunta
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={preguntasData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="pregunta" label={{ value: "Pregunta", position: "insideBottom", offset: -5}}/>
                <YAxis domain={[0, 1]} tickFormatter={(value) => `${value * 100}%`} label={{value: "Acertividad (%)", angle: -90, position: "insideLeft", dy: 60}} />
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
                <XAxis dataKey="rango" label={{ value: "Rango de calificaciones", position: "insideBottom", offset: -5}}/>
                <YAxis label={{value: "Número de estudiantes", angle: -90, position: "insideLeft", dy: 80}}/>


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
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={datosTransformados}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="pregunta"
                  label={{ value: "Número de Pregunta", position: "insideBottom", offset: -5 }}
                />
                <YAxis label={{ value: "Frecuencia", angle: -90, position: "insideLeft" }} />
                <Tooltip />
                <Legend />

                {/* Generar líneas dinámicamente según las opciones disponibles */}
                {todasLasOpciones.map((opcion, index) => (
                  <Line
                    key={opcion}
                    type="linear"
                    dataKey={opcion}
                    name={`Opción ${opcion}`}
                    stroke={["#8884d8", "#82ca9d", "#ffc658", "#ff7300", "#ff1493", "#32cd32"][index % 6]} // Colores dinámicos
                    dot={{ r: 5 }} // Tamaño de los puntos
                    connectNulls={true} // Evita cortes en la línea si una opción no está presente en una pregunta
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
            {/* Controles de paginación */}
            <div style={{ display: "flex", justifyContent: "center", marginTop: "10px" }}>
              <Button
                variant="contained"
                onClick={() => setPaginaActual((prev) => Math.max(prev - 1, 0))}
                disabled={paginaActual === 0}
              >
                Anterior
              </Button>
              <span style={{ margin: "0 10px" }}>
                Página {paginaActual + 1} de {Math.ceil(preguntasData.length / preguntasPorPagina)}
              </span>
              <Button
                variant="contained"
                onClick={() => setPaginaActual((prev) => (prev + 1 < Math.ceil(preguntasData.length / preguntasPorPagina) ? prev + 1 : prev))}
                disabled={fin >= preguntasData.length}
              >
                Siguiente
              </Button>
            </div>



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
                    <TableCell align="right">No. de Intentos</TableCell>
                    <TableCell align="center">Estado</TableCell>
                    {/* <TableCell align="center">Acciones</TableCell> */}
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
                      <TableCell align="right">{row.total_intentos}</TableCell>
                      <TableCell align="center">
                        <Chip
                          label={row.calificacion >= 70 ? "Aprobado" : "Reprobado"}
                          color={row.calificacion >= 70 ? "success" : "error"}
                        />
                      </TableCell>
                      {/* <TableCell align="center">
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
                      </TableCell> */}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
      </Grid>

    </Box >
  )
}

