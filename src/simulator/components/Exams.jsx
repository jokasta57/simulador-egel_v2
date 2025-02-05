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
import { Link } from "react-router-dom"
import { useExamsStore } from "../../hooks/exams/useExamsStore"
import { useSelector } from "react-redux"


export const Exams = () => {
  const theme = useTheme()
  const [searchTerm, setSearchTerm] = useState("")
  const [areaFilter, setAreaFilter] = useState("Todas")
  const { exams } = useSelector((state) => state.exams)
  const { user } = useSelector((state) => state.auth)

  const { handleLoadExams, handleClearError, handleClearSuccess, handleLoadExamsByCareer } = useExamsStore()


  useEffect(() => {
    if (user?.carrera) {  // ✅ Verifica que user.carrera tenga valor antes de llamar a la API
      handleLoadExamsByCareer(user.carrera);
    }
  }, [user.carrera]); // ✅ Se ejecutará solo cuando user.carrera cambie

  // Dentro del componente Exams
  const areasFiltro = useMemo(() => {
    const uniqueAreas = new Set(exams.map((exam) => exam.area));
    return ["Todas", ...uniqueAreas]; // Agrega "Todas" al inicio
  }, [exams]); // Se recalcula cuando cambia exams


  const filteredExams = exams?.filter((exam) => {
    const matchesSearch = exam.nombre.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesArea = areaFilter === "Todas" || exam.area === areaFilter
    return matchesSearch && matchesArea
  })

  return (
    <Box sx={{ maxWidth: 1200, margin: "0 auto", p: 3 }}>
      <Typography
        variant="h4"
        component="h1"
        sx={{
          color: theme.palette.primary.main,
          fontWeight: "bold",
          mb: 4,
          textAlign: "center",
        }}
      >
        Simulaciones de Examen EGEL
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
                component={Link}
                to={`/student/exams/${exam.id}`}
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

