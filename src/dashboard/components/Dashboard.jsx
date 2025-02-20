"use client"

import { useState, useEffect } from "react"
import { Grid, Typography, Box, useTheme, Card, CardContent, Button, Select, MenuItem, TextField } from "@mui/material"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import { Assignment, People, Edit, Event } from "@mui/icons-material"
import { Link as RouterLink } from "react-router-dom"
import { useAdminStatsStore } from "../../hooks/statistics/useAdminStatsStore"

// Mock data for the line chart
// const dataLineas = [
//   { fecha: "2025-01-15", nombre: "Matemáticas I", porcentajeAprobados: 75 },
//   { fecha: "2025-02-01", nombre: "Física Básica", porcentajeAprobados: 68 },
//   { fecha: "2025-02-15", nombre: "Química General", porcentajeAprobados: 82 },
//   { fecha: "2025-03-01", nombre: "Cálculo Diferencial", porcentajeAprobados: 71 },
//   { fecha: "2025-03-15", nombre: "Programación I", porcentajeAprobados: 88 },
//   { fecha: "2025-04-01", nombre: "Álgebra Lineal", porcentajeAprobados: 79 },
// ]

// Mock data based on the SQL structure
// const examenesBorrador = [
//   { id: 1, nombre: "Examen de Química", fecha_modificacion: "12 Feb 2025" },
//   { id: 2, nombre: "Examen de Biología", fecha_modificacion: "13 Feb 2025" },
//   { id: 3, nombre: "Examen de Historia", fecha_modificacion: "14 Feb 2025" },
//   { id: 4, nombre: "Examen de Literatura", fecha_modificacion: "15 Feb 2025" },
//   { id: 5, nombre: "Examen de Geografía", fecha_modificacion: "16 Feb 2025" },
// ]

// const dataPie = [
//   { name: "Aprobados", value: 750 },
//   { name: "Reprobados", value: 250 },
// ]

const COLORS = ["#0088FE", "#FF8042"]

export const Dashboard = () => {
  const theme = useTheme()
  const [resumenData, setResumenData] = useState([])
  const [dataLineas, setDataLineas] = useState([])
  const [dataPie, setDataPie] = useState([])
  const [examenesBorrador, setExamenesBorrador] = useState([])

  //Filtros
  const [selectedExam, setSelectedExam] = useState(""); // Examen seleccionado
  const [startDate, setStartDate] = useState(""); // Fecha inicial
  const [endDate, setEndDate] = useState(""); // Fecha final

  // Obtener todos los exámenes únicos
  const uniqueExams = Array.from(new Set(dataLineas.map((item) => item.nombre)));

  // Filtrar datos por examen y rango de fechas
  const filteredData = dataLineas.filter((item) => {
    const examFilter = selectedExam ? item.nombre === selectedExam : true;
    const dateFilter =
      (!startDate || new Date(item.fecha) >= new Date(startDate)) &&
      (!endDate || new Date(item.fecha) <= new Date(endDate));
    return examFilter && dateFilter;
  });

  //************** */
  const { handlePercentageByDate, handlePercentage, handleDrafts } = useAdminStatsStore();

  useEffect(() => {
    getPercentages();
    getPercentagesByDate()
    getDrafts();
  }, [])

  const getPercentagesByDate = async () => {
    try {
      const data = await handlePercentageByDate();
      // Transformamos los datos antes de usarlos en el gráfico
      const lineas = procesarDatos(data.porcentajesPorFecha);
      setDataLineas(lineas);
      console.log(dataLineas);
      console.log(lineas, 'LINEASSS');
    } catch (error) {
      console.log(error);
    }
  }

  const getDrafts = async () => {
    try {
      const data = await handleDrafts();
      // Formatear fechas antes de actualizar el estado
      const borradoresFormateados = data.borradores.map((borrador) => ({
        ...borrador,
        fecha_modificacion: new Date(borrador.fecha_modificacion).toLocaleDateString("es-ES", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }),
      }));
      setExamenesBorrador(borradoresFormateados);
    } catch (error) {
      console.log(error);
    }
  }

  const procesarDatos = (data) => {
    return data.flatMap((item) => {
      return item.nombre.split(", ").map((examen) => ({
        fecha: item.fecha,
        nombre: examen,
        porcentajeAprobados: parseFloat(item.porcentajeAprobados), // Convertir a número,
        totalIntentos: item.totalIntentos
      }));
    });
  };

  const getPercentages = async () => {
    try {
      const data = await handlePercentage();

      // Transformar datos para el gráfico de pastel
      const transformedData = [
        { name: "Aprobados", value: parseFloat(data.porcentajes.aprobados) },
        { name: "Reprobados", value: parseFloat(data.porcentajes.reprobados) }
      ];
      setDataPie(transformedData);

      // Transformar datos para la sección de resumen
      const transformedResumen = [
        {
          title: "Total de Exámenes",
          value: data.datosInicio.totalExamenes.toString(),
          icon: <Assignment sx={{ fontSize: 28 }} />,
          valueColor: "#B91116",
        },
        {
          title: "Estudiantes Registrados",
          value: data.datosInicio.estudiantesRegistrados.toString(),
          icon: <People sx={{ fontSize: 28 }} />,
          valueColor: "#B91116",
        },
        {
          title: "Último Examen Aplicado",
          value: `${data.datosInicio.ultimoExamen.examen.nombre}`,
          subvalue: new Date(data.datosInicio.ultimoExamen.fecha_aplicacion).toLocaleDateString("es-ES", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          }),
          icon: <Event sx={{ fontSize: 28 }} />,
          valueColor: "#B91116",
        },
      ];
      setResumenData(transformedResumen);

    } catch (error) {
      console.log(error);
    }
  };

  //colores para las lineas
  const lineColors = [
    '#B91116', // Rojo principal
    '#511013', // Marrón oscuro
    '#E24622', // Naranja
    '#F53020', // Naranja/Amarillo
    '#E8641C', // Naranja oscuro
  ];

  return (
    <Box sx={{ maxWidth: "100%", overflow: "hidden" }}>
      <Typography variant="h5" component="h2" sx={{ color: "#B91116", mb: 3, fontWeight: 500 }}>
        Dashboard
      </Typography>
      <Grid container spacing={3}>
        {resumenData.map((item, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <Card
              elevation={0}
              sx={{
                height: "100%",
                border: "1px solid",
                borderColor: "rgba(0, 0, 0, 0.12)",
                borderRadius: 2,
                transition: "all 0.3s ease",
                "&:hover": {
                  borderColor: "#B91116",
                  transform: "translateY(-2px)",
                  boxShadow: "0 4px 8px rgba(185, 17, 22, 0.1)",
                },
              }}
            >
              <CardContent
                sx={{
                  height: "100%",
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "flex-start",
                  p: 2,
                }}
              >
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: "50%",
                    backgroundColor: "rgba(185, 17, 22, 0.1)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#B91116",
                    mr: 2,
                  }}
                >
                  {item.icon}
                </Box>
                <Box>
                  <Typography
                    variant="h5"
                    component="div"
                    sx={{
                      fontWeight: 600,
                      color: "#B91116",
                      mb: 0.5,
                    }}
                  >
                    {item.value}
                  </Typography>
                  <Typography
                    color="textSecondary"
                    sx={{
                      fontSize: "0.9rem",
                      fontWeight: 500,
                      color: "rgba(0, 0, 0, 0.6)",
                    }}
                  >
                    {item.title}
                  </Typography>
                  {item.subvalue && (
                    <Typography
                      variant="body2"
                      sx={{
                        color: "rgba(0, 0, 0, 0.6)",
                        fontSize: "0.8rem",
                        mt: 0.5,
                      }}
                    >
                      {item.subvalue}
                    </Typography>
                  )}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}

        <Grid item xs={12}>
          <Card
            elevation={0}
            sx={{
              border: "1px solid",
              borderColor: "rgba(0, 0, 0, 0.12)",
              transition: "all 0.3s ease",
              "&:hover": {
                borderColor: "#B91116",
              },
            }}
          >
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ color: "#B91116" }}>
                Porcentaje de Aprobados por Examen
              </Typography>
              {/* Controles de filtros */}
              <div style={{ display: "flex", gap: "10px", marginBottom: "10px", alignItems: "center" }}>

                {/* Selección de examen */}
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                  <Typography variant="caption">Filtrar por examen</Typography>
                  <Select
                    value={selectedExam}
                    onChange={(e) => setSelectedExam(e.target.value)}
                    displayEmpty
                    size="small"
                  >
                    <MenuItem value="">Todos los exámenes</MenuItem>
                    {uniqueExams.map((exam) => (
                      <MenuItem key={exam} value={exam}>{exam}</MenuItem>
                    ))}
                  </Select>
                </div>

                {/* Fecha de inicio */}
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                  <Typography variant="caption">Fecha de inicio</Typography>
                  <TextField
                    type="date"
                    size="small"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>

                {/* Fecha límite */}
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                  <Typography variant="caption">Fecha límite</Typography>
                  <TextField
                    type="date"
                    size="small"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={filteredData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="fecha" tickFormatter={(value) => new Date(value).toLocaleDateString("es-ES", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })} />
                  <YAxis domain={[0, 100]} />
                  <Tooltip
                    labelFormatter={(value) => new Date(value).toLocaleDateString("es-ES", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                    formatter={(value, name, props) => [
                      `${value}% (Intentos: ${props.payload.totalIntentos})`,
                      props.payload.nombre,
                    ]}
                  />
                  <Legend />
                  {Array.from(new Set(filteredData.map((item) => item.nombre))).map((examen, index) => (
                    <Line
                      key={examen}
                      type="monotone"
                      dataKey={(entry) => (entry.nombre === examen ? entry.porcentajeAprobados : null)}
                      stroke={lineColors[index] || `hsl(${(index * 60) % 360}, 70%, 50%)`} // Usa los colores fijos y si faltan, genera dinámicamente
                      name={examen}
                      connectNulls
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>

            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card
            elevation={0}
            sx={{
              height: "100%",
              border: "1px solid",
              borderColor: "rgba(0, 0, 0, 0.12)",
              transition: "all 0.3s ease",
              "&:hover": {
                borderColor: "#B91116",
              },
            }}
          >
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ color: "#B91116" }}>
                Alumnos Aprobados vs Reprobados
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={dataPie}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {dataPie.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card
            elevation={0}
            sx={{
              height: "100%",
              border: "1px solid",
              borderColor: "rgba(0, 0, 0, 0.12)",
              transition: "all 0.3s ease",
              "&:hover": {
                borderColor: "#B91116",
              },
            }}
          >
            <CardContent>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                <Typography variant="h6" sx={{ color: "#B91116" }}>
                  Borradores de Exámenes
                </Typography>
                <Edit sx={{ color: "#B91116" }} />
              </Box>
              <Box sx={{ maxHeight: 300, overflowY: "auto" }}>
                {examenesBorrador.map((examen, index) => (
                  <Box
                    key={examen.id_examen}
                    sx={{
                      p: 2,
                      mb: 1,
                      borderRadius: 1,
                      backgroundColor: "background.paper",
                      border: "1px solid",
                      borderColor: "rgba(0, 0, 0, 0.08)",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      transition: "all 0.2s ease",
                      "&:hover": {
                        backgroundColor: `rgba(185, 17, 22, 0.08)`,
                        borderColor: "#B91116",
                      },
                    }}
                  >
                    <Box>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        {examen.nombre}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        {examen.fecha_modificacion}
                      </Typography>
                    </Box>
                    <Button
                      component={RouterLink}
                      to={`/admin/exams/${examen.id_examen}/edit`}
                      variant="outlined"
                      size="small"
                      sx={{
                        color: "#B91116",
                        borderColor: "#B91116",
                        "&:hover": {
                          backgroundColor: "rgba(185, 17, 22, 0.04)",
                          borderColor: "#B91116",
                        },
                      }}
                    >
                      Editar
                    </Button>
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  )
}

