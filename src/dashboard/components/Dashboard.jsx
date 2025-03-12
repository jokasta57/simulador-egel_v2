"use client"

import { useState, useEffect } from "react"
import { useSelector } from "react-redux"
import { Grid, Typography, Box, useTheme, Card, CardContent, Button, Select, MenuItem, TextField, CircularProgress, Snackbar, Alert } from "@mui/material"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell,} from "recharts"
import { Assignment, People, Edit, Event } from "@mui/icons-material"
import { Link as RouterLink } from "react-router-dom"
import { useAdminStatsStore } from "../../hooks/statistics/useAdminStatsStore"
import { LoadingSpinner } from "../../simulator/components/LoadingSpinner"

const COLORS = ["#0088FE", "#FF8042"]

export const Dashboard = () => {
  const theme = useTheme()
  const [resumenData, setResumenData] = useState([])
  const [dataLineas, setDataLineas] = useState([])
  const [dataPie, setDataPie] = useState([])
  const [examenesBorrador, setExamenesBorrador] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')


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
  const { user } = useSelector(state => state.auth)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        await Promise.all([
          getPercentages(),
          getPercentagesByDate(),
          getDrafts()
        ]);
      } catch (error) {
        setError("Error al cargar los datos");
      } finally {
        setLoading(false); // ✅ Solo se ejecuta cuando TODO ha terminado
      }
    };

    fetchData();
  }, [])

  const getPercentagesByDate = async () => {
    try {
      if (!user?.carrera) {
        setError("No pudimos obtener tu información de usuario. Intenta cerrar sesión y volver a ingresar.");
        return;
      }
      const data = await handlePercentageByDate(user.carrera);
      // Transformamos los datos antes de usarlos en el gráfico
      const lineas = procesarDatos(data.porcentajesPorFecha);
      setDataLineas(lineas);
    } catch (error) {
      setError("Error al obtener porcentajes");
    }
  }

  const getDrafts = async () => {
    try {
      if (!user?.carrera) {
        setError("No pudimos obtener tu información de usuario. Intenta cerrar sesión y volver a ingresar.");
        return;
      }
      const data = await handleDrafts(user.carrera);
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
      setError((prevError) => `${prevError} ${error}`);
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
      if (!user?.carrera) {
        setError("No pudimos obtener tu información de usuario. Intenta cerrar sesión y volver a ingresar.");
        return;
      }

      const data = await handlePercentage(user.carrera);

      // Transformar datos para el gráfico de pastel
      const transformedData = [
        { name: "Aprobados", value: parseFloat(data.porcentajes.aprobados) || 0 },
        { name: "Reprobados", value: parseFloat(data.porcentajes.reprobados) || 0 }
      ];
      setDataPie(transformedData);

      // Transformar datos para la sección de resumen
      const transformedResumen = [
        {
          title: "Total de Exámenes",
          value: data.datosInicio?.totalExamenes?.toString() || 'No hay datos disponibles',
          icon: <Assignment sx={{ fontSize: 28 }} />,
          valueColor: "#B91116",
        },
        {
          title: "Estudiantes Registrados",
          value: data.datosInicio?.estudiantesRegistrados?.toString() || 'No hay datos disponibles',
          icon: <People sx={{ fontSize: 28 }} />,
          valueColor: "#B91116",
        },
        {
          title: "Último Examen Aplicado",
          value: data.datosInicio?.ultimoExamen?.examen?.nombre || 'No hay datos disponibles',
          subvalue: (() => {
            if (!data.datosInicio?.ultimoExamen?.fecha_aplicacion) {
              return 'No hay fecha disponible';
            }
            const fechaStr = data.datosInicio.ultimoExamen.fecha_aplicacion;
            const partes = fechaStr.split("-");
            const fechaLocal = new Date(partes[0], partes[1] - 1, partes[2]);

            return fechaLocal.toLocaleDateString("es-ES", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            });
          })(),
          icon: <Event sx={{ fontSize: 28 }} />,
          valueColor: "#B91116",
        },
      ];
      setResumenData(transformedResumen);

    } catch (error) {

      // Si el error es 404, mostrar datos vacíos
      if (error.status === 404) {
        setDataPie([
          { name: "Aprobados", value: 0 },
          { name: "Reprobados", value: 0 }
        ]);

        setResumenData([
          {
            title: "Total de Exámenes",
            value: "Sin datos",
            icon: <Assignment sx={{ fontSize: 28 }} />,
            valueColor: "#B91116",
          },
          {
            title: "Estudiantes Registrados",
            value: "Sin datos",
            icon: <People sx={{ fontSize: 28 }} />,
            valueColor: "#B91116",
          },
          {
            title: "Último Examen Aplicado",
            value: "Sin datos",
            subvalue: "N/A",
            icon: <Event sx={{ fontSize: 28 }} />,
            valueColor: "#B91116",
          },
        ]);
        setError('Aún no hay intentos de examen registrados.')
      }
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

  const handleCloseSnackbar = () => {
    if (error) setError("");
  };

  if (loading) return <LoadingSpinner />


  return (
    <Box sx={{ maxWidth: "100%", overflow: "hidden" }}>
      <Typography variant="h4" component="h1" sx={{ color: theme.palette.text.primary, fontWeight: "bold", }}>
        Dashboard
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
      }}>
        {user.carrera}
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
                  {filteredData.length === 0 && (
                    <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" fill="#888" fontSize="16">
                      No hay datos disponibles
                    </text>

                  )}
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
                  {dataPie.every(item => item.value === 0) && (
                    <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" fill="#888" fontSize="16">
                      No hay datos disponibles
                    </text>
                  )}
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
                {examenesBorrador.length === 0 ? (
                  <Typography variant="body2" color="textSecondary">
                    No hay borradores disponibles
                  </Typography>
                ) : (
                  examenesBorrador.map((examen, index) => (
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
                  ))
                )}
              </Box>
            </CardContent>

          </Card>
        </Grid>
      </Grid>
      <Snackbar
        open={Boolean(error)}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={'error'}
          variant="filled"
        >
          {typeof error === 'string' ? error : JSON.stringify(error)}
        </Alert>
      </Snackbar>
    </Box>
  )
}

