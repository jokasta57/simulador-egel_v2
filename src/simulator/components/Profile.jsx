import { useState } from "react"
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Avatar,
  Divider,
  useTheme,
  IconButton,
  TextField,
  Button,
  Alert,
  Snackbar,
  MenuItem,
} from "@mui/material"
import {
  School as SchoolIcon,
  Email as EmailIcon,
  Group as GroupIcon,
  CalendarToday as CalendarIcon,
  Edit as EditIcon,
} from "@mui/icons-material"

export const Profile = () => {
  const theme = useTheme()
  const [isEditing, setIsEditing] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

  // Ejemplo de datos del estudiante (reemplazar con datos reales)
  const [studentData, setStudentData] = useState({
    nombre: "Juan",
    apellido_paterno: "Pérez",
    apellido_materno: "García",
    carrera: "Ingeniería en Sistemas Computacionales",
    carreras: [
      "Medicina",
      "Administración",
      "Enfermería",
      "Ingeniería en Software",
      "Ingeniería en Sistemas Computacionales",
    ],
    email: "juan.perez@estudiantes.edu.mx",
    semestre: "6",
    grupo: "6A",
    ciclo_escolar: "2024-1",
  })

  const [formData, setFormData] = useState(studentData)

  const handleInputChange = (field) => (event) => {
    setFormData({
      ...formData,
      [field]: event.target.value,
    })
  }

  const handleSave = () => {
    // Aquí irían las validaciones necesarias
    setStudentData(formData)
    setIsEditing(false)
    setShowSuccess(true)
    // Aquí iría la llamada a la API para guardar los cambios
  }

  const handleCloseSnackbar = () => {
    setShowSuccess(false)
  }

  const InfoField = ({ icon, label, field, value, options }) => (
    <Box sx={{ display: "flex", alignItems: "start", mb: 2 }}>
      {icon}
      <Box sx={{ ml: 2, flex: 1 }}>
        {isEditing ? (
          options ? (
            <TextField
              select
              fullWidth
              label={label}
              value={formData[field]}
              onChange={handleInputChange(field)}
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
          ) : (
            <TextField
              fullWidth
              label={label}
              value={formData[field]}
              onChange={handleInputChange(field)}
              variant="outlined"
              size="small"
              sx={{ mt: -1 }}
            />
          )
        ) : (
          <>
            <Typography variant="body2" color="text.secondary">
              {label}
            </Typography>
            <Typography variant="body1">{value}</Typography>
          </>
        )}
      </Box>
    </Box>
  )

  return (
    <Box sx={{ maxWidth: 1200, margin: "0 auto", p: 3 }}>
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 4 }}>
        <Typography variant="h4" component="h1" sx={{ color: theme.palette.primary.main }}>
          Mi Perfil
        </Typography>
        {!isEditing && (
          <IconButton onClick={() => setIsEditing(true)} color="primary">
            <EditIcon />
          </IconButton>
        )}
      </Box>

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
                  {studentData.nombre[0]}
                  {studentData.apellido_paterno[0]}
                </Avatar>
                <Box sx={{ ml: 2, flex: 1 }}>
                  {isEditing ? (
                    <Grid container spacing={2}>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="Nombre"
                          value={formData.nombre}
                          onChange={handleInputChange("nombre")}
                          size="small"
                        />
                      </Grid>
                      <Grid item xs={6}>
                        <TextField
                          fullWidth
                          label="Apellido Paterno"
                          value={formData.apellido_paterno}
                          onChange={handleInputChange("apellido_paterno")}
                          size="small"
                        />
                      </Grid>
                      <Grid item xs={6}>
                        <TextField
                          fullWidth
                          label="Apellido Materno"
                          value={formData.apellido_materno}
                          onChange={handleInputChange("apellido_materno")}
                          size="small"
                        />
                      </Grid>
                    </Grid>
                  ) : (
                    <>
                      <Typography variant="h5">
                        {`${studentData.nombre} ${studentData.apellido_paterno} ${studentData.apellido_materno}`}
                      </Typography>
                      <Typography variant="body1" color="text.secondary">
                        Estudiante
                      </Typography>
                    </>
                  )}
                </Box>
              </Box>

              <Divider sx={{ my: 2 }} />

              <InfoField
                icon={<EmailIcon color="action" sx={{ mt: 1 }} />}
                label="Correo Electrónico"
                field="email"
                value={studentData.email}
              />
              <InfoField
                icon={<SchoolIcon color="action" sx={{ mt: 1 }} />}
                label="Carrera"
                field="carrera"
                value={studentData.carrera}
                options={studentData.carreras}
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
                icon={<SchoolIcon color="action" sx={{ mt: 1 }} />}
                label="Semestre"
                field="semestre"
                value={`${studentData.semestre}° Semestre`}
              />
              <InfoField
                icon={<GroupIcon color="action" sx={{ mt: 1 }} />}
                label="Grupo"
                field="grupo"
                value={studentData.grupo}
              />
              <InfoField
                icon={<CalendarIcon color="action" sx={{ mt: 1 }} />}
                label="Ciclo Escolar"
                field="ciclo_escolar"
                value={studentData.ciclo_escolar}
              />

              {isEditing && (
                <Box sx={{ mt: 3, display: "flex", justifyContent: "flex-end", gap: 2 }}>
                  <Button variant="outlined" onClick={() => setIsEditing(false)}>
                    Cancelar
                  </Button>
                  <Button variant="contained" onClick={handleSave}>
                    Guardar Cambios
                  </Button>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Snackbar open={showSuccess} autoHideDuration={6000} onClose={handleCloseSnackbar}>
        <Alert onClose={handleCloseSnackbar} severity="success" variant="filled">
          Cambios guardados exitosamente
        </Alert>
      </Snackbar>
    </Box>
  )
}

