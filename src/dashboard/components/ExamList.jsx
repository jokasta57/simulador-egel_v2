"use client"

import React, { useEffect, useState } from "react"
import {
  Box,
  Typography,
  Card,
  CardContent,
  IconButton,
  Stack,
  useTheme,
  TextField,
  InputAdornment,
  MenuItem,
  FormControl,
  Select,
  InputLabel,
  Button,
} from "@mui/material"
import {
  Edit as EditIcon,
  DeleteOutline as DeleteIcon,
  Search as SearchIcon,
  Add as AddIcon,
} from "@mui/icons-material"
import Swal from "sweetalert2"
import { useSelector } from "react-redux"
import { useExamsStore } from "../../hooks/exams/useExamsStore"
import { Link } from "react-router-dom"

const periodosFiltro = ["Todos", "Último mes", "Últimos 3 meses", "Último año"]

export const ExamList = () => {
  const theme = useTheme()
  const [searchTerm, setSearchTerm] = useState("")
  const [periodoFilter, setPeriodoFilter] = useState("Todos")

  const { handleLoadExams, handleClearError, handleClearSuccess } = useExamsStore()

  useEffect(() => {
    handleLoadExams()
  }, [handleLoadExams])

  const { exams } = useSelector((state) => state.exams)

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
      return matchesSearch && matchesPeriodo
    }) || []

  const handleDelete = (examenId, examenNombre) => {
    Swal.fire({
      title: "¿Estás seguro?",
      text: `¿Deseas eliminar el examen "${examenNombre}"?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: theme.palette.error.main,
      cancelButtonColor: theme.palette.grey[500],
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    }).then((result) => {
      if (result.isConfirmed) {
        // Aquí iría la lógica para eliminar el examen en el backend
        console.log(`Eliminar examen con ID: ${examenId}`)
        Swal.fire("¡Eliminado!", "El examen ha sido eliminado.", "success")
      }
    })
  }

  // Función para formatear la duración del formato "HH:MM:SS" a minutos
  const formatDuration = (duration) => {
    const [hours, minutes] = duration.split(":")
    return Number.parseInt(hours) * 60 + Number.parseInt(minutes)
  }

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
          Exámenes EGEL de {exams?.[0]?.carrera || "Ingeniería"}
        </Typography>
        <Button
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
      </Box>

      <Stack spacing={2}>
        {filteredExams.map((examen) => (
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
                  }}
                >
                  Última actualización: {new Date(examen.fecha_modificacion).toLocaleDateString()}
                </Typography>
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
                <IconButton
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
                </IconButton>
              </Box>
            </CardContent>
          </Card>
        ))}
      </Stack>
    </Box>
  )
}
