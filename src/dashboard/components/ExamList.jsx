"use client"

import { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { Box, Typography, Card, CardContent, IconButton, Stack, useTheme, TextField, InputAdornment, MenuItem, FormControl, Select, InputLabel, Button, Switch, Snackbar, Alert, CircularProgress, } from "@mui/material"
import { Edit as EditIcon, DeleteOutline as DeleteIcon, Search as SearchIcon, Add as AddIcon, } from "@mui/icons-material"
import { Link } from "react-router-dom"
import Swal from "sweetalert2"
import { LoadingSpinner } from "../../simulator/components/LoadingSpinner"
import { useExamsStore } from "../../hooks/exams/useExamsStore"

const periodosFiltro = ["Todos", "Último mes", "Últimos 3 meses", "Último año"]

export const ExamList = () => {
  const theme = useTheme()
  const [searchTerm, setSearchTerm] = useState("")
  const [periodoFilter, setPeriodoFilter] = useState("Todos")
  const [stateFilter, setStateFilter] = useState("Todos")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(false)
  const [loadingStates, setLoadingStates] = useState({});
  const { handleLoadExams, handleSwitchState, resetExams } = useExamsStore()



  const dispatch = useDispatch();
  const { exams } = useSelector((state) => state.exams)
  const { user } = useSelector((state) => state.auth)

  useEffect(() => {
    if (!user) return;

    getExams()
    return () => {
      dispatch(resetExams())
    };
  }, [user]) // Added handleLoadExams to dependencies


  const filtrarPorPeriodo = (examen) => {
    const hoy = new Date()
    const fechaActualizacion = new Date(examen.fecha_modificacion)
    const diferenciaDias = (hoy - fechaActualizacion) / (1000 * 60 * 60 * 24)

    switch (periodoFilter) {
      case "Último mes":
        return diferenciaDias <= 30
      case "Últimos 3 meses":
        return diferenciaDias <= 90
      case "Último año":
        return diferenciaDias <= 365
      default:
        return true
    }
  }

  // Filtrar exámenes basado en búsqueda y filtro de periodo
  const filteredExams =
    exams?.filter((examen) => {
      const matchesSearch = examen.nombre.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesPeriodo = filtrarPorPeriodo(examen)
      const matchesState = stateFilter === "Todos" || examen.estado === stateFilter
      return matchesSearch && matchesPeriodo && matchesState
    }) || []

  const getExams = async () => {
    setLoading(true)
    try {
      if (!user?.carrera) {
        setError("No pudimos obtener tu información de usuario. Intenta cerrar sesión y volver a ingresar.");
        return;
      }
      await handleLoadExams(user.carrera)
    } catch (error) {
      setError(error)
    } finally {
      setLoading(false)
    }
  }

  // const handleDelete = (examenId, examenNombre) => {
  //   Swal.fire({
  //     title: "¿Estás seguro?",
  //     text: `¿Deseas eliminar el examen "${examenNombre}"?`,
  //     icon: "warning",
  //     showCancelButton: true,
  //     confirmButtonColor: theme.palette.error.main,
  //     cancelButtonColor: theme.palette.grey[500],
  //     confirmButtonText: "Sí, eliminar",
  //     cancelButtonText: "Cancelar",
  //   }).then((result) => {
  //     if (result.isConfirmed) {
  //       // Aquí iría la lógica para eliminar el examen en el backend
  //       Swal.fire("¡Eliminado!", "El examen ha sido eliminado.", "success")
  //     }
  //   })
  // }

  const handleToggleState = async (examen) => {
    const { id_examen } = examen;
    setLoadingStates((prev) => ({ ...prev, [id_examen]: true }));

    const nuevoEstado = examen.estado === "activo" ? "borrador" : "activo"
    try {
      // ✅ Petición al backend para actualizar estado
      await handleSwitchState(nuevoEstado, id_examen)
      if (!user?.carrera) {
        setError("No pudimos obtener tu información de usuario. Intenta cerrar sesión y volver a ingresar.");
        return;
      }
      await handleLoadExams(user.carrera)
    } catch (error) {
      Swal.fire("Error", error, "error")
    } finally {
      setLoadingStates((prev) => ({ ...prev, [id_examen]: false }));
    }
  }

  // Función para formatear la duración del formato "HH:MM:SS" a minutos
  const formatDuration = (duration) => {
    const [hours, minutes] = duration.split(":")
    return Number.parseInt(hours) * 60 + Number.parseInt(minutes)
  }

  const getStateStyle = (state) => {
    switch (state.toLowerCase()) {
      case "activo":
        return { color: theme.palette.success.main }
      case "inactivo":
        return { color: theme.palette.error.main }
      case "borrador":
        return { color: theme.palette.warning.main }
      default:
        return { color: theme.palette.text.secondary }
    }
  }

  const handleCloseSnackbar = () => {
    if (error) setError("");
  };

  if (loading) return <LoadingSpinner message="Cargando exámenes..." />


  return (
    <Box sx={{ maxWidth: 1200, margin: "0 auto", p: 3 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 4,
        }}
      >
        <Typography
          variant="h4"
          component="h1"
          sx={{
            color: theme.palette.text.primary,
            fontWeight: "bold",
          }}
        >
          Exámenes EGEL de {user.carrera}
        </Typography>
        <Button
          component={Link} // Usa Link de React Router
          to={'/admin/crear-examen'} // Ruta destino
          variant="contained"
          startIcon={<AddIcon />}
          sx={{
            backgroundColor: theme.palette.primary.main,
            "&:hover": {
              backgroundColor: theme.palette.primary.dark,
            },
          }}
        >
          Crear Examen
        </Button>
      </Box>

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
          <InputLabel>Última actualización</InputLabel>
          <Select value={periodoFilter} label="Última actualización" onChange={(e) => setPeriodoFilter(e.target.value)}>
            {periodosFiltro.map((periodo) => (
              <MenuItem key={periodo} value={periodo}>
                {periodo}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl sx={{ flex: 1, minWidth: 200 }}>
          <InputLabel>Estado</InputLabel>
          <Select value={stateFilter} label="Estado" onChange={(e) => setStateFilter(e.target.value)}>
            <MenuItem value="Todos">Todos</MenuItem>
            <MenuItem value="borrador">Borrador</MenuItem>
            <MenuItem value="activo">Activo</MenuItem>
          </Select>
        </FormControl>
      </Box>

      <Stack spacing={2}>

        {filteredExams.length > 0 ? (
          filteredExams.map((examen) => (
            <Card
              key={examen.id_examen}
              sx={{
                border: `1px solid ${theme.palette.divider}`,
                borderRadius: 2,
                boxShadow: "none",
                transition: "all 0.2s ease-in-out",
                "&:hover": {
                  borderColor: theme.palette.primary.main,
                  transform: "translateY(-2px)",
                  boxShadow: "0 4px 10px rgba(0,0,0,0.05)",
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
                    {examen.nombre}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      color: theme.palette.text.secondary,
                      mb: 1,
                    }}
                  >
                    Periodo: {examen.periodo} | {formatDuration(examen.duracion)} minutos
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      color: theme.palette.primary.main,
                      fontWeight: 500,
                      mb: 1,
                    }}
                  >
                    Última actualización: {new Date(examen.fecha_modificacion).toLocaleDateString("es-ES", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </Typography>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                    }}
                  >
                    <Switch
                      checked={examen.estado === "activo"}
                      onChange={() => handleToggleState(examen)}
                      color="primary"
                      size="small"
                    />
                    {loadingStates[examen.id_examen] ? (
                      <CircularProgress
                        size={24}
                        sx={{
                          color: theme.palette.primary.main,
                        }}
                      />
                    ) : (
                      <Typography
                        variant="caption"
                        sx={{
                          fontWeight: "medium",
                          textTransform: "uppercase",
                          ...getStateStyle(examen.estado),
                        }}
                      >
                        {examen.estado}
                      </Typography>
                    )}
                  </Box>
                </Box>
                <Box
                  sx={{
                    display: "flex",
                    gap: 1,
                    alignSelf: { xs: "flex-end", sm: "center" },
                  }}
                >
                  <Link to={`/admin/exams/${examen.id_examen}/edit`}>
                    <IconButton
                      size="small"
                      sx={{
                        color: theme.palette.primary.main,
                        "&:hover": {
                          backgroundColor: theme.palette.primary.lighter,
                        },
                      }}
                    >
                      <EditIcon />
                    </IconButton>
                  </Link>

                  {/* <IconButton
                    size="small"
                    onClick={() => handleDelete(examen.id_examen, examen.nombre)}
                    sx={{
                      color: theme.palette.error.main,
                      "&:hover": {
                        backgroundColor: theme.palette.error.lighter,
                      },
                    }}
                  >
                    <DeleteIcon />
                  </IconButton> */}
                </Box>
              </CardContent>
            </Card>
          ))) : (
          <Box sx={{ textAlign: "center", p: 3 }}>
            <Typography variant="h6" color="textSecondary">
              No hay exámenes disponibles
            </Typography>
            <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
              Empieza a crear un nuevo examen para verlo aquí.
            </Typography>
          </Box>
        )}
      </Stack>
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

