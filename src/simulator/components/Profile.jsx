"use client"

import { useEffect, useState, useRef } from "react"
import { useSelector } from "react-redux"
import { useForm, Controller } from "react-hook-form"
import {
  Box, Typography, Card, CardContent, Grid, Avatar, Divider,
  useTheme, IconButton, TextField, Button, Alert, Snackbar,
  MenuItem, CircularProgress
} from "@mui/material"
import {
  School as SchoolIcon, Email as EmailIcon, Group as GroupIcon,
  CalendarToday as CalendarIcon, Edit as EditIcon
} from "@mui/icons-material"
import { useAuthStore } from "../../hooks/useAuthStore"
import { LoadingSpinner } from "./LoadingSpinner"

// Estado inicial del formulario
const initialFormData = {
  nombre: "",
  apellido_paterno: "",
  apellido_materno: "",
  carrera: "",
  email: "",
  semestre: "",
  grupo: "",
  ciclo_escolar: "",
}

export const Profile = () => {
  const theme = useTheme()
  const inputRef = useRef(null) // Referencia a los inputs

  // Estado global del usuario
  const { user } = useSelector((state) => state.auth)

  // Estados locales
  const [isEditing, setIsEditing] = useState(false) // Modo edición
  const [success, setSuccess] = useState(false) // Mensaje de éxito
  const [isLoading, setIsLoading] = useState(true) // Carga de datos
  const [error, setError] = useState(null) // Manejo de errores
  const [studentData, setStudentData] = useState(initialFormData) // Datos del usuario

  // Opciones de carrera
  const carreras = [
    "Ingeniería de Software",
    "Medicina",
    "Administración de Empresas",
    "Enfermería",
  ]

  // Métodos personalizados para autenticación
  const { getUserInfo, updateInfoStudent } = useAuthStore()

  // Configuración de react-hook-form
  const { control, handleSubmit, reset } = useForm({
    defaultValues: initialFormData
  })

  /** Obtiene la información del usuario al cargar el componente o cuando cambia el usuario */
  useEffect(() => {
    handleUserInfo()
  }, [user])

  /** Restaura el formulario cuando cambian los datos del estudiante */
  useEffect(() => {
    if (studentData) {
      reset(studentData)
    }
  }, [studentData, reset])

  /** Función para obtener la información del usuario */
  const handleUserInfo = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const data = await getUserInfo(user.numero_cuenta)

      // Limpia valores nulos o indefinidos
      const sanitizedData = Object.fromEntries(
        Object.entries(data).map(([key, value]) => [key, value ?? ""])
      )

      setStudentData(sanitizedData)
      reset(sanitizedData)
    } catch (error) {
      setError("No se pudo cargar la información del usuario. Intente de nuevo más tarde.")
    } finally {
      setIsLoading(false)
    }
  }

  /** Manejo del envío del formulario */
  const onSubmit = async (formData) => {
    setIsLoading(true)
    try {
      await updateInfoStudent(user.numero_cuenta, formData)
      setStudentData(formData)
      setIsEditing(false)
      setSuccess("Cambios guardados exitosamente")
    } catch (error) {
      setError(error)
    } finally {
      setIsLoading(false)
    }
  }

  /** Cierra los mensajes de éxito o error */
  const handleCloseSnackbar = () => {
    setSuccess("")
    setError("")
  }

  /** Componente reutilizable para mostrar o editar información del usuario */
  const InfoField = ({ icon, label, field, value, options }) => (
    <Box sx={{ display: "flex", alignItems: "start", mb: 2 }}>
      {icon}
      <Box sx={{ ml: 2, flex: 1 }}>
        {isEditing ? (
          options ? (
            <Controller
              name={field}
              control={control}
              render={({ field: { onChange, value } }) => (
                <TextField
                  inputRef={inputRef}
                  select
                  fullWidth
                  label={label}
                  value={value || ""}
                  onChange={onChange}
                  variant="outlined"
                  size="small"
                  sx={{ mt: -1 }}
                >
                  {options.map((option) => (
                    <MenuItem key={option} value={option}>
                      {option}
                    </MenuItem>
                  ))}
                </TextField>
              )}
            />
          ) : (
            <Controller
              name={field}
              control={control}
              render={({ field: { onChange, value } }) => (
                <TextField
                  inputRef={inputRef}
                  fullWidth
                  label={label}
                  value={value || ""}
                  onChange={onChange}
                  variant="outlined"
                  size="small"
                  sx={{ mt: -1 }}
                />
              )}
            />
          )
        ) : (
          <>
            <Typography variant="body2" color="text.secondary">
              {label}
            </Typography>
            <Typography variant="body1">{value ?? ""}</Typography>
          </>
        )}
      </Box>
    </Box>
  )

  // Muestra un spinner mientras se cargan los datos
  if (isLoading) return <LoadingSpinner />

  return (
    <Box sx={{ maxWidth: 1200, margin: "0 auto", p: 3 }}>
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 4 }}>
        <Typography variant="h4" component="h1" sx={{ color: theme.palette.text.primary, mb: 4, fontWeight: "bold", }}>
          Mi Perfil
        </Typography>
        {!isEditing && (
          <IconButton onClick={() => setIsEditing(true)} color="primary">
            <EditIcon />
          </IconButton>
        )}
      </Box>

      <form onSubmit={handleSubmit(onSubmit)}>
        <Grid container spacing={3}>
          {/* Tarjeta de Información Personal */}
          <Grid item xs={12} md={6}>
            <Card
              sx={{
                height: "100%",
                boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
                transition: "box-shadow 0.3s ease-in-out",
                "&:hover": {
                  boxShadow: "0 6px 12px rgba(0,0,0,0.15)",
                },
              }}
            >
              <CardContent>
                <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
                  <Avatar
                    sx={{
                      width: 80,
                      height: 80,
                      bgcolor: theme.palette.primary.main,
                      fontSize: "2rem",
                    }}
                  >
                    {studentData.nombre?.[0] ?? ""}
                    {studentData.apellido_paterno?.[0] ?? ""}
                  </Avatar>
                  <Box sx={{ ml: 2, flex: 1 }}>
                    {isEditing ? (
                      <Grid container spacing={2}>
                        <Grid item xs={12}>
                          <Controller
                            name="nombre"
                            control={control}
                            render={({ field }) => (
                              <TextField
                                inputRef={inputRef}
                                key="nombre-input"
                                fullWidth
                                label="Nombre"
                                value={field.value ?? ""}
                                onChange={field.onChange}
                                size="small"
                              />
                            )}
                          />
                        </Grid>
                        <Grid item xs={6}>
                          <Controller
                            name="apellido_paterno"
                            control={control}
                            render={({ field }) => (
                              <TextField
                                inputRef={inputRef}
                                key="apellido-paterno-input"
                                fullWidth
                                label="Apellido Paterno"
                                value={field.value ?? ""}
                                onChange={field.onChange}
                                size="small"
                              />
                            )}
                          />
                        </Grid>
                        <Grid item xs={6}>
                          <Controller
                            name="apellido_materno"
                            control={control}
                            render={({ field }) => (
                              <TextField
                                inputRef={inputRef}
                                key="apellido-materno-input"
                                fullWidth
                                label="Apellido Materno"
                                value={field.value ?? ""}
                                onChange={field.onChange}
                                size="small"
                              />
                            )}
                          />
                        </Grid>
                      </Grid>
                    ) : (
                      <>
                        <Typography variant="h5">
                          {`${studentData.nombre ?? ""} ${studentData.apellido_paterno ?? ""} ${studentData.apellido_materno ?? ""}`}
                        </Typography>
                        <Typography variant="body1" color="text.secondary">
                          Estudiante de {user.carrera}
                        </Typography>
                      </>
                    )}
                  </Box>
                </Box>

                <Divider sx={{ my: 2 }} />

                <InfoField
                  inputRef={inputRef}
                  icon={<EmailIcon color="action" sx={{ mt: 1 }} />}
                  label="Correo Electrónico"
                  field="email"
                  value={studentData.email}
                />
                <InfoField
                  inputRef={inputRef}
                  icon={<SchoolIcon color="action" sx={{ mt: 1 }} />}
                  label="Carrera"
                  field="carrera"
                  value={studentData.carrera}
                  options={carreras}
                />
              </CardContent>
            </Card>
          </Grid>

          {/* Tarjeta de Información Académica */}
          <Grid item xs={12} md={6}>
            <Card
              sx={{
                height: "100%",
                boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
                transition: "box-shadow 0.3s ease-in-out",
                "&:hover": {
                  boxShadow: "0 6px 12px rgba(0,0,0,0.15)",
                },
              }}
            >
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Información Académica
                </Typography>

                <Divider sx={{ my: 2 }} />

                <InfoField
                  inputRef={inputRef}
                  icon={<SchoolIcon color="action" sx={{ mt: 1 }} />}
                  label="Semestre"
                  field="semestre"
                  value={`${studentData.semestre ?? ""}° Semestre`}
                />
                <InfoField
                  inputRef={inputRef}
                  icon={<GroupIcon color="action" sx={{ mt: 1 }} />}
                  label="Grupo"
                  field="grupo"
                  value={studentData.grupo}
                />
                <InfoField
                  inputRef={inputRef}
                  icon={<CalendarIcon color="action" sx={{ mt: 1 }} />}
                  label="Ciclo Escolar"
                  field="ciclo_escolar"
                  value={studentData.ciclo_escolar}
                />

                {isEditing && (
                  <Box sx={{ mt: 3, display: "flex", justifyContent: "flex-end", gap: 2 }}>
                    <Button variant="outlined" onClick={() => {
                      setIsEditing(false);
                      reset(studentData); // Reset form to original data on cancel
                    }}>
                      Cancelar
                    </Button>
                    <Button variant="contained" type="submit">
                      Guardar Cambios
                    </Button>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </form>
      
      {/* Notificacion de error o exito */}
      <Snackbar
        open={Boolean(error || success)}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={error ? 'error' : 'success'}
          variant="filled"
        >
          {error ? (typeof error === 'string' ? error : JSON.stringify(error)) :
            (typeof success === 'string' ? success : JSON.stringify(success))}
        </Alert>
      </Snackbar>
    </Box>
  )
}