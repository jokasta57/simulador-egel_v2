"use client"

import { useState, useMemo, useEffect } from "react"
import { Box, Typography, Grid, Paper, useTheme, FormControl, InputLabel, Select, MenuItem, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Chip, Alert, Button, Snackbar, TablePagination, } from "@mui/material"
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, } from "recharts"
import { useExamsStore } from "../../hooks/exams/useExamsStore"
import { useSelector } from "react-redux"
import { useAdminStatsStore } from "../../hooks/statistics/useAdminStatsStore"
import { LoadingSpinner } from "../../simulator/components/LoadingSpinner"
import DownloadIcon from "@mui/icons-material/Download"
import * as XLSX from "xlsx"

const COLORS = ["#2196f3", "#f44336"] // Azul para aprobados, Rojo para reprobados

const emptyPieData = [
  { name: "Aprobados", value: 0 },
  { name: "Reprobados", value: 0 },
]

export const Statistics = () => {
  const theme = useTheme()

  //Examen seleccionado
  const [selectedExam, setSelectedExam] = useState("")
  const [error, setError] = useState("")

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
  const preguntasPorPagina = 5 // Mínimo 5 preguntas por página
  const [paginaActual, setPaginaActual] = useState(0)

  const [page, setPage] = useState(0);  // Página actual
  const [rowsPerPage, setRowsPerPage] = useState(5);  // Filas por página


  //Loading
  const [isLoading, setIsLoading] = useState(false)
  const [isExamAvailable, setIsExamAvailable] = useState(true) // Estado para verificar si hay exámenes

  //Hook de estadisticas
  const { handlePerformancePerQuestion, handleLastExamAttempt, handleSummaryAndGrades } = useAdminStatsStore()
  const { handleLoadExams } = useExamsStore()

  const { exams } = useSelector((state) => state.exams)
  const { user } = useSelector((state) => state.auth)

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
  const inicio = paginaActual * preguntasPorPagina
  const fin = Math.min(inicio + preguntasPorPagina, preguntasData.length)
  const preguntasPagina = Array.isArray(preguntasData) ? preguntasData.slice(inicio, fin) : []

  // Obtener todas las opciones posibles en la página actual
  const todasLasOpciones = [...new Set(preguntasPagina.flatMap((p) => p.opciones.map((o) => o.opcion)))]

  // Transformar los datos para que cada pregunta tenga todas las opciones, incluso con frecuencia 0 si no existe
  const datosTransformados = preguntasPagina.map((pregunta) => {
    const data = { pregunta: `P${pregunta.pregunta}` } // Se mantiene única en el eje X
    pregunta.opciones.forEach((opcion) => {
      data[opcion.opcion] = opcion.frecuencia // Se asigna cada opción como clave con su frecuencia
    })

    // Asegurar que todas las opciones están presentes (incluso si faltan en la pregunta)
    todasLasOpciones.forEach((opcion) => {
      if (!(opcion in data)) {
        data[opcion] = 0 // Si no hay datos para esa opción, poner 0
      }
    })

    return data
  })

  // Maneja el cambio en el campo de búsqueda
  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value)
  }

  useEffect(() => {
    // Función asíncrona para cargar los datos al montar el componente
    const loadData = async () => {
      setIsLoading(true)
      try {
        // Verifica si el usuario tiene una carrera asignada
        if (!user?.carrera) {
          setError("No se pudo obtener la información del usuario. Por favor, vuelve a iniciar sesión.")
        }
        // Carga los exámenes y el último intento de examen en paralelo
        await Promise.all([handleLoadExams(user.carrera), getLastExamAttempt()])
      } catch (error) {
        // Manejo de errores: si el usuario no tiene carrera, mostramos el mismo mensaje de error
        if (!user?.carrera) {
          setError("No se pudo obtener la información del usuario. Por favor, vuelve a iniciar sesión.")
        } else {
          setError("Error al cargar los exámenes. Intenta de nuevo más tarde.")
        }
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, []) // Solo se ejecuta una vez al montar el componente

  useEffect(() => {
    if (!selectedExam) return // Evita ejecutar si selectedExam está vacío
    // Función para cargar los datos de rendimiento
    const loadPerformanceData = async () => {
      setIsLoading(true)
      try {
        await Promise.all([getPerformancePerQuestion(), getSummaryAndGrades()])
      } catch (error) {
        setError("Error al cargar los datos de rendimiento")
      } finally {
        setIsLoading(false)
      }
    }

    loadPerformanceData()
  }, [selectedExam, startDate, endDate]) // Se ejecuta cuando cambian estos valores

  // Obtiene el rendimiento por pregunta
  const getPerformancePerQuestion = async () => {
    try {
      const data = await handlePerformancePerQuestion(selectedExam, startDate, endDate)
      setPreguntasData(data.intentos)
    } catch (error) {
      setError("Error al cargar los datos de rendimiento")
    }
  }

  // Obtiene el último intento de examen del usuario
  const getLastExamAttempt = async () => {
    try {
      // Si no se puede obtener la carrera del usuario, mostramos un mensaje de error
      if (!user?.carrera) {
        setError("No pudimos obtener tu información de usuario. Intenta cerrar sesión y volver a ingresar.")
        return
      }
      const data = await handleLastExamAttempt(user.carrera)
      setSelectedExam(data.examen.id_examen)
      setIsExamAvailable(true)
    } catch (error) {
      setError(error)
      // Si no hay exámenes disponibles, marcamos que no hay exámenes disponibles
      exams.length === 0 ? setIsExamAvailable(false) : setIsExamAvailable(true)
    }
  }

  // Obtiene el resumen y las calificaciones del examen
  const getSummaryAndGrades = async () => {
    try {
      const data = await handleSummaryAndGrades(selectedExam, startDate, endDate)
      setDistribucionCalificaciones(data.resumen.distribucion_calificaciones)
      setAprobacion(data.resumen.aprobacion)
      setCalificaciones(data.calificaciones)
      setResumen(data.resumen)
    } catch (error) {
      setError("Error al cargar datos")
    }
  }

  // Filtra a los estudiantes en función del término de búsqueda y el estado de aprobación
  const filteredStudents = useMemo(() => {
    return calificaciones.filter((student) => {
      // Verifica si el término de búsqueda coincide con algún valor dentro del objeto del estudiante
      const matchesSearch = Object.values(student).some((value) =>
        value.toString().toLowerCase().includes(searchTerm.toLowerCase()),
      )
      // Filtra por estado de aprobación
      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "passed" && student.calificacion >= 70) ||
        (statusFilter === "failed" && student.calificacion < 70)
      return matchesSearch && matchesStatus
    })
  }, [searchTerm, statusFilter, calificaciones])

  const handleCloseSnackbar = () => {
    if (error) setError("")
  }

  // Función para exportar los datos a Excel
  const exportToExcel = () => {
    try {
      // Obtener el nombre del examen seleccionado
      const selectedExamName = exams.find((exam) => exam.id_examen === selectedExam)?.nombre || "Examen"
      const selectedExamPeriod = exams.find((exam) => exam.id_examen === selectedExam)?.periodo || ""

      // Crear un nuevo libro de trabajo
      const workbook = XLSX.utils.book_new()

      // Crear una hoja con la información general
      const infoData = [
        ["Nombre del Examen", `${selectedExamName} - ${selectedExamPeriod}`],
        ["Fecha de Inicio", startDate || "No especificada"],
        ["Fecha de Fin", endDate || "No especificada"],
        ["Promedio General", resumen.promedio_general || "N/A"],
        ["Total de Estudiantes", resumen.total_estudiantes || 0],
        ["Tasa de Aprobación", resumen.tasa_aprobacion ? `${resumen.tasa_aprobacion}%` : "N/A"],
      ]

      const infoSheet = XLSX.utils.aoa_to_sheet(infoData)
      XLSX.utils.book_append_sheet(workbook, infoSheet, "Información General")

      // Crear una hoja para el rendimiento por pregunta
      if (preguntasData.length > 0) {
        const rendimientoData = [["Pregunta", "Porcentaje de Aciertos"]]

        preguntasData.forEach((item) => {
          rendimientoData.push([`Pregunta ${item.pregunta}`, (item.porcentaje_aciertos * 100).toFixed(2) + "%"])
        })

        const rendimientoSheet = XLSX.utils.aoa_to_sheet(rendimientoData)
        XLSX.utils.book_append_sheet(workbook, rendimientoSheet, "Rendimiento por Pregunta")
      }

      // Crear una hoja para la distribución de calificaciones
      if (distribucionCalificaciones.length > 0) {
        const distribucionData = [["Rango de Calificaciones", "Cantidad de Estudiantes"]]

        distribucionCalificaciones.forEach((item) => {
          distribucionData.push([item.rango, item.cantidad])
        })

        const distribucionSheet = XLSX.utils.aoa_to_sheet(distribucionData)
        XLSX.utils.book_append_sheet(workbook, distribucionSheet, "Distribución de Calificaciones")
      }

      // Crear una hoja para la moda de respuestas
      if (datosTransformados.length > 0) {
        const modaData = [["Pregunta", ...todasLasOpciones.map((opcion) => `Opción ${opcion}`)]]

        datosTransformados.forEach((item) => {
          const row = [item.pregunta]
          todasLasOpciones.forEach((opcion) => {
            row.push(item[opcion] || 0)
          })
          modaData.push(row)
        })

        const modaSheet = XLSX.utils.aoa_to_sheet(modaData)
        XLSX.utils.book_append_sheet(workbook, modaSheet, "Moda de Respuestas")
      }

      // Crear una hoja para aprobados vs reprobados
      if (aprobacion.length > 0) {
        const aprobacionData = [["Estado", "Porcentaje"]]

        aprobacion.forEach((item) => {
          aprobacionData.push([item.name, `${item.value}%`])
        })

        const aprobacionSheet = XLSX.utils.aoa_to_sheet(aprobacionData)
        XLSX.utils.book_append_sheet(workbook, aprobacionSheet, "Aprobados vs Reprobados")
      }

      // Crear una hoja para las calificaciones de estudiantes
      if (calificaciones.length > 0) {
        const calificacionesData = [
          [
            "Número de Cuenta",
            "Nombre",
            "Apellido Paterno",
            "Apellido Materno",
            "Calificación",
            "No. de Intentos",
            "Estado",
          ],
        ]

        calificaciones.forEach((student) => {
          calificacionesData.push([
            student.numero_cuenta,
            student.nombre,
            student.apellido_paterno,
            student.apellido_materno,
            student.calificacion,
            student.total_intentos,
            student.calificacion >= 70 ? "Aprobado" : "Reprobado",
          ])
        })

        const calificacionesSheet = XLSX.utils.aoa_to_sheet(calificacionesData)
        XLSX.utils.book_append_sheet(workbook, calificacionesSheet, "Calificaciones por Estudiante")
      }

      // Generar el archivo Excel y descargarlo
      const fileName = `${selectedExamName}_Estadisticas_${new Date().toISOString().split("T")[0]}.xlsx`
      XLSX.writeFile(workbook, fileName)
    } catch (error) {
      setError("Error al exportar a Excel: " + error.message)
    }
  }


  // Función para manejar el cambio de página
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  // Función para manejar el cambio de filas por página
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));  // Filas por página
    setPage(0);  // Resetea la página cuando cambian las filas por página
  };

  if (isLoading) return <LoadingSpinner />

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
      {isExamAvailable ? (
        !selectedExam && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            Por favor, selecciona un examen para ver las estadísticas.
          </Alert>
        )
      ) : (
        <Alert severity="warning" sx={{ mb: 2 }}>
          No hay exámenes disponibles. Por favor, agrega exámenes para ver las estadísticas.
        </Alert>
      )}
      <br />
      <Grid container spacing={3}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <FormControl fullWidth error={!selectedExam}>
              {isExamAvailable ? (
                <InputLabel>Seleccionar Examen</InputLabel>
              ) : (
                <InputLabel>No hay exámenes disponibles</InputLabel>
              )}
              <Select
                value={selectedExam || ""}
                label="Seleccionar Examen"
                onChange={handleExamChange}
                disabled={exams.length === 0} // Desactiva el select si no hay exámenes disponibles
              >
                <MenuItem value="" disabled>
                  -- Selecciona un examen --
                </MenuItem>
                {exams.length === 0 ? (
                  <MenuItem disabled>No hay exámenes disponibles</MenuItem> // Mensaje si no hay exámenes
                ) : (
                  exams.map((exam) => (
                    <MenuItem key={exam.id_examen} value={exam.id_examen}>
                      {exam.nombre} - {exam.periodo}
                    </MenuItem>
                  ))
                )}
              </Select>
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
              disabled={exams.length === 0}
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
              disabled={exams.length === 0}
            />
          </Grid>
        </Grid>

        {/* Botón de exportar a Excel */}
        <Grid item xs={12}>
          <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 2 }}>
            <Button
              variant="contained"
              color="primary"
              startIcon={<DownloadIcon />}
              onClick={exportToExcel}
              disabled={!selectedExam || isLoading}
            >
              Exportar a Excel
            </Button>
          </Box>
        </Grid>

        {/* Resumen General */}
        <Grid item xs={12}>
          <Paper elevation={3} sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Resumen General
            </Typography>
            {isExamAvailable ? (
              !selectedExam ? (
                <Typography color="error">Selecciona un examen para ver las estadísticas</Typography>
              ) : (
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={4}>
                    <Typography variant="body1">
                      <strong>Promedio General: </strong>
                      {isNaN(resumen.promedio_general) || resumen.promedio_general === null
                        ? "Sin resultados aún"
                        : resumen.promedio_general}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Typography variant="body1">
                      <strong> Total de Estudiantes: </strong>
                      {resumen.total_estudiantes}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Typography variant="body1">
                      {" "}
                      <strong> Tasa de Aprobación: </strong>
                      {isNaN(resumen.tasa_aprobacion) || resumen.tasa_aprobacion === null
                        ? "Sin resultados aún"
                        : resumen.tasa_aprobacion + "%"}
                    </Typography>
                  </Grid>
                </Grid>
              )
            ) : (
              <Typography color="error">No hay datos disponibles</Typography>
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
                <XAxis dataKey="pregunta" label={{ value: "Pregunta", position: "insideBottom", offset: -5 }} />
                <YAxis
                  domain={[0, 1]}
                  tickFormatter={(value) => `${value * 100}%`}
                  label={{ value: "Acertividad (%)", angle: -90, position: "insideLeft", dy: 60 }}
                />
                <Tooltip formatter={(value) => `${(value * 100).toFixed(0)}%`} />
                <Line type="monotone" dataKey="porcentaje_aciertos" stroke={theme.palette.primary.main} />

                {/* Mensaje si no hay datos */}
                {preguntasData.length === 0 && (
                  <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" fill="#888" fontSize="16">
                    No hay datos disponibles
                  </text>
                )}
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Distribución de Calificaciones */}
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Distribución de Promedios
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={distribucionCalificaciones}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="rango"
                  label={{ value: "Rango de calificaciones", position: "insideBottom", offset: -5 }}
                />
                <YAxis
                  label={{ value: "Número de estudiantes", angle: -90, position: "insideLeft", dy: 80 }}
                  tickFormatter={(value) => Math.floor(value)}  // Asegura que los números sean enteros
                />

                <Tooltip />
                <Bar dataKey="cantidad" fill={theme.palette.primary.main} />
                {/* Mensaje si no hay datos */}
                {distribucionCalificaciones.every((item) => item.cantidad === 0) && (
                  <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" fill="#888" fontSize="16">
                    No hay datos disponibles
                  </text>
                )}
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
                {datosTransformados.length === 0 && (
                  <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" fill="#888" fontSize="16">
                    No hay datos disponibles
                  </text>
                )}
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
                onClick={() =>
                  setPaginaActual((prev) =>
                    prev + 1 < Math.ceil(preguntasData.length / preguntasPorPagina) ? prev + 1 : prev,
                  )
                }
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
                {aprobacion.every((item) => item.value === null) && (
                  <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" fill="#888" fontSize="16">
                    No hay datos disponibles
                  </text>
                )}
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
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: theme.palette.primary.main }}>
                    <TableCell sx={{ color: "white" }}>Número de Cuenta</TableCell>
                    <TableCell sx={{ color: "white" }}>Nombre</TableCell>
                    <TableCell sx={{ color: "white" }}>Apellido Paterno</TableCell>
                    <TableCell sx={{ color: "white" }}>Apellido Materno</TableCell>
                    <TableCell sx={{ color: "white" }} align="right">Promedio</TableCell>
                    <TableCell sx={{ color: "white" }} align="right">No. de Intentos</TableCell>
                    <TableCell sx={{ color: "white" }} align="center">Estado</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredStudents.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} align="center">
                        No hay estudiantes disponibles.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredStudents
                      .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                      .map((row) => (
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
                        </TableRow>
                      ))
                  )}
                </TableBody>
              </Table>
              {/* Paginación */}
              <TablePagination
                rowsPerPageOptions={[5, 10, 25]}  // Opciones de filas por página
                component="div"
                count={filteredStudents.length}  // Total de registros
                rowsPerPage={rowsPerPage}  // Número de filas por página
                page={page}  // Página actual
                onPageChange={handleChangePage}  // Cambiar de página
                onRowsPerPageChange={handleChangeRowsPerPage}  // Cambiar las filas por página
              />
            </TableContainer>
          </Paper>
        </Grid>
      </Grid>
      <Snackbar
        open={Boolean(error)}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert onClose={handleCloseSnackbar} severity={"error"} variant="filled">
          {typeof error === "string" ? error : JSON.stringify(error)}
        </Alert>
      </Snackbar>
    </Box>
  )
}

