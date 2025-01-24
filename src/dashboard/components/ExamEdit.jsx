import React, { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { Box, Typography, TextField, Button, Card, CardContent, Stack, CircularProgress, Alert } from "@mui/material"
import { useForm } from "react-hook-form"
import { useExamsStore } from "../../hooks/exams/useExamsStore"

export const ExamEdit = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { handleLoadExam, handleUpdateExam, currentExam, isLoading, error, success } = useExamsStore()
  const [loadError, setLoadError] = useState(null)
  const [isInitialLoading, setIsInitialLoading] = useState(true)

  const { register, handleSubmit, reset } = useForm({
    defaultValues: {
      nombre: "",
      periodo: "",
      duracion: "",
      carrera: "",
    },
  })

  useEffect(() => {
    const loadExam = async () => {
      setIsInitialLoading(true)
      try {
        console.log("Iniciando carga del examen:", id)
        const exam = await handleLoadExam(id)
        console.log("Examen cargado:", exam)
        reset({
          nombre: exam.nombre,
          periodo: exam.periodo,
          duracion: exam.duracion,
          carrera: exam.carrera,
        })
      } catch (error) {
        console.error("Error loading exam:", error)
        setLoadError("No se pudo cargar el examen. Por favor, inténtelo de nuevo.")
      } finally {
        setIsInitialLoading(false)
      }
    }

    loadExam()
  }, [id, handleLoadExam, reset])

  const onSubmit = async (data) => {
    try {
      await handleUpdateExam(id, data)
      navigate("/admin/exams") // Redirigir a la lista de exámenes después de actualizar
    } catch (error) {
      console.error("Error updating exam:", error)
    }
  }

  if (isInitialLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
        <CircularProgress />
      </Box>
    )
  }

  if (loadError) {
    return (
      <Box sx={{ maxWidth: 800, margin: "0 auto", p: 3 }}>
        <Alert severity="error">{loadError}</Alert>
        <Button onClick={() => navigate("/admin/exams")} sx={{ mt: 2 }}>
          Volver a la lista de exámenes
        </Button>
      </Box>
    )
  }

  if (isLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
        <CircularProgress />
      </Box>
    )
  }

  return (
    <Box sx={{ maxWidth: 800, margin: "0 auto", p: 3 }}>
      <Typography variant="h4" component="h1" sx={{ mb: 4 }}>
        Editar Examen
      </Typography>

      <Card>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)}>
            <Stack spacing={3}>
              <TextField label="Nombre del Examen" fullWidth {...register("nombre", { required: true })} />
              <TextField label="Periodo" fullWidth {...register("periodo", { required: true })} />
              <TextField label="Duración (HH:MM:SS)" fullWidth {...register("duracion", { required: true })} />
              <TextField label="Carrera" fullWidth {...register("carrera", { required: true })} />

              {error && <Alert severity="error">{error}</Alert>}

              <Box sx={{ display: "flex", gap: 2, justifyContent: "flex-end" }}>
                <Button variant="outlined" onClick={() => navigate("/admin/exams")}>
                  Cancelar
                </Button>
                <Button type="submit" variant="contained" disabled={isLoading}>
                  {isLoading ? "Guardando..." : "Guardar Cambios"}
                </Button>
              </Box>
            </Stack>
          </form>
        </CardContent>
      </Card>
    </Box>
  )
}

