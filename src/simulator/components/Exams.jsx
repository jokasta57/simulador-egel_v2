"use client"

import { useState, useEffect, useMemo } from "react"
import {
  Box,
  Typography,
  Card,
  CardContent,
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
import { Search as SearchIcon, PlayArrow as StartIcon } from "@mui/icons-material"
import { useNavigate } from "react-router-dom"
import { useExamsStore } from "../../hooks/exams/useExamsStore"
import { useSelector } from "react-redux"
import { LoadingSpinner } from "./LoadingSpinner"
import Swal from "sweetalert2"

export const Exams = () => {
  const theme = useTheme()
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState("")
  const [areaFilter, setAreaFilter] = useState("Todas")
  const [isLoading, setIsLoading] = useState(false)
  const { exams } = useSelector((state) => state.exams)
  const { user } = useSelector((state) => state.auth)

  const { handleLoadExams, handleClearError, handleClearSuccess, handleLoadExamsByCareer } = useExamsStore()

  useEffect(() => {
    if (user?.carrera) {
      const fetchExams = async () => {
        setIsLoading(true)
        await handleLoadExamsByCareer(user.carrera)
        setIsLoading(false)
      }
      fetchExams()
    }
  }, [user?.carrera]) // Added handleLoadExamsByCareer to dependencies

  const areasFiltro = useMemo(() => {
    const uniqueAreas = new Set(exams.map((exam) => exam.area))
    return ["Todas", ...uniqueAreas]
  }, [exams])

  const filteredExams = exams?.filter((exam) => {
    const matchesSearch = exam.nombre.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesArea = areaFilter === "Todas" || exam.area === areaFilter
    return matchesSearch && matchesArea
  })

  const handleStartExam = (exam) => {
    const formatDuration = (duration) => {
      const [hours, minutes] = duration.split(":").map(Number)
      if (hours > 0) return `${hours} h ${minutes} min`
      return `${minutes} min`
    }

    Swal.fire({
      title: "Confirmación de inicio",
      text: `Vas a iniciar el examen: "${exam.nombre}". Tienes ${formatDuration(exam.duracion)} y no podrás pausarlo. 
  ¿Quieres continuar?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Sí, comenzar",
      cancelButtonText: "Cancelar",
    }).then((result) => {
      if (result.isConfirmed) {
        navigate(`/student/exams/${exam.id_examen}`)
      }
    });
  }

  if (isLoading) {
    return <LoadingSpinner />
  }

  return (
    <Box sx={{ maxWidth: 1200, margin: "0 auto", p: 3 }}>
      <Typography variant="h4" component="h1" sx={{ color: theme.palette.text.primary, mb: 4, fontWeight: "bold", }}>
        Simulaciones de Examen EGEL
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
          <InputLabel>Área</InputLabel>
          <Select value={areaFilter} label="Área" onChange={(e) => setAreaFilter(e.target.value)}>
            {areasFiltro.map((area) => (
              <MenuItem key={area} value={area}>
                {area}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      <Stack spacing={2}>
        {filteredExams.map((exam) => (
          <Card
            key={exam.id_examen}
            sx={{
              border: `1px solid ${theme.palette.divider}`,
              borderRadius: 2,
              boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
              transition: "all 0.3s ease-in-out",
              "&:hover": {
                transform: "translateY(-5px)",
                boxShadow: "0 6px 12px rgba(0,0,0,0.15)",
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
                  {exam.nombre}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    color: theme.palette.text.secondary,
                    mb: 1,
                  }}
                >
                  Área: {exam.area} | Duración: {exam.duracion} minutos
                </Typography>
              </Box>
              <Button
                onClick={() => handleStartExam(exam)}
                variant="contained"
                startIcon={<StartIcon />}
                sx={{
                  backgroundColor: theme.palette.success.main,
                  "&:hover": {
                    backgroundColor: theme.palette.success.dark,
                  },
                }}
              >
                Iniciar Examen
              </Button>
            </CardContent>
          </Card>
        ))}
      </Stack>
    </Box>
  )
}

