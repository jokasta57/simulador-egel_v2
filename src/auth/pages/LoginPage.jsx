"use client"

import { useState, useCallback, useMemo, useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import { Link, Link as RouterLink, useLocation, useNavigate } from "react-router-dom"
import { Button, TextField, Paper, Typography, Box, InputAdornment, IconButton, useTheme, useMediaQuery, Snackbar, Alert,} from "@mui/material"
import { LockOutlined as LockOutlinedIcon, Visibility, VisibilityOff, Badge as BadgeIcon, Home as HomeIcon, } from "@mui/icons-material"
import { useAuthStore } from "../../hooks/useAuthStore"
import { clearErrorMessage, setError } from "../../store/auth/authSlice"; // Importamos la acción para limpiar el error

export const LoginPage = () => {
  const { startLoginAdmin, startLoginStudent } = useAuthStore()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { error } = useSelector((state) => state.auth)

  const location = useLocation()
  const role = location.state?.role || "student"
  
  const [formData, setFormData] = useState({
    numeroIdentificacion: "",
    nip: "",
  })
  const [showPassword, setShowPassword] = useState(false)
  
  // ✅ Estado para mensajes de éxito y error
  const [success, setSuccess] = useState("")

  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"))

  const handleInputChange = useCallback((event) => {
    const { name, value } = event.target
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }))
  }, [])

  const handleSubmit = useCallback(
    async (event) => {
      event.preventDefault()
      const { numeroIdentificacion, nip } = formData

      if (!numeroIdentificacion || !nip) {
        dispatch(setError(
          !numeroIdentificacion && !nip
            ? "Por favor, ingrese número de identificación y NIP"
            : !numeroIdentificacion
            ? "Por favor, ingrese número de identificación"
            : "Por favor, ingrese NIP"
        ))
        setTimeout(() => dispatch(clearErrorMessage()), 3000);
        return
      }

      try {
        if (role === "admin") {
          await startLoginAdmin(numeroIdentificacion, nip)
        } else {
          await startLoginStudent(numeroIdentificacion, nip)
        }

        setSuccess("Inicio de sesión exitoso")

        // Wait for the success message to be shown before navigating
        await new Promise((resolve) => setTimeout(resolve, 1000))
        navigate(role === "admin" ? "/admin/dashboard" : "/student/home")
      } catch (error) {
        setError(error || "Error al iniciar sesión. Verifica tus credenciales.")
      }
    },
    [formData, role],
  )

  const handleTogglePasswordVisibility = useCallback(() => {
    setShowPassword((prevShow) => !prevShow)
  }, [])

  const handleCloseSnackbar = useCallback(() => {
    setError("")
    setSuccess("")
  }, [])

  const handleGoHome = useCallback(() => {
    navigate("/")
  }, [navigate])

  const paperStyles = useMemo(
    () => ({
      padding: theme.spacing(4),
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      maxWidth: 400,
      width: "100%",
      borderRadius: 2,
      [theme.breakpoints.down("sm")]: {
        padding: theme.spacing(3),
        maxWidth: "90%",
      },
    }),
    [theme]
  )

  const buttonStyles = useMemo(
    () => ({
      mt: 3,
      mb: 2,
      py: 1.5,
      fontSize: "1rem",
      fontWeight: "bold",
      textTransform: "none",
      borderRadius: 2,
    }),
    []
  )

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        backgroundColor: theme.palette.background.default,
      }}
    >
      <Paper elevation={3} sx={paperStyles}>
        <Box sx={{ display: "flex", justifyContent: "flex-end", width: "100%", mb: 2 }}>
          <IconButton onClick={handleGoHome} aria-label="ir a inicio">
            <HomeIcon />
          </IconButton>
        </Box>
        <Box
          sx={{
            backgroundColor: theme.palette.primary.main,
            borderRadius: "50%",
            padding: theme.spacing(2),
            marginBottom: theme.spacing(2),
          }}
        >
          <LockOutlinedIcon sx={{ fontSize: 40, color: "white" }} />
        </Box>
        <Typography component="h1" variant="h4" gutterBottom fontWeight="bold">
          Iniciar Sesión
        </Typography>
        <Typography variant="h6" color="primary" gutterBottom>
          {role === "admin" ? "Administrador" : "Estudiante"}
        </Typography>
        <Typography variant="body1" color="text.secondary" align="center" sx={{ mb: 3 }}>
          {role === "admin"
            ? "Accede a la dashboard para administradores de EGEL"
            : "Pon a prueba tus conocimientos y prepárate para el EGEL con nuestros exámenes simulados."}
        </Typography>
        <Box component="form" onSubmit={handleSubmit} sx={{ width: "100%" }}>
          <TextField
            margin="normal"
            fullWidth
            id="numeroIdentificacion"
            label="Número de Identificación"
            name="numeroIdentificacion"
            autoComplete="username"
            autoFocus
            value={formData.numeroIdentificacion}
            onChange={handleInputChange}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <BadgeIcon color="action" />
                </InputAdornment>
              ),
            }}
          />
          <TextField
            margin="normal"
            fullWidth
            name="nip"
            label="NIP"
            type={showPassword ? "text" : "password"}
            id="nip"
            autoComplete="current-password"
            value={formData.nip}
            onChange={handleInputChange}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <LockOutlinedIcon color="action" />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton aria-label="toggle nip visibility" onClick={handleTogglePasswordVisibility} edge="end">
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
          <Button type="submit" fullWidth variant="contained" sx={buttonStyles}>
            Iniciar Sesión
          </Button>
          {role === "student" && (
            <Box sx={{ mt: 2, textAlign: "center" }}>
              <Typography variant="body2" color="text.secondary">
                ¿No tienes cuenta?{" "}
                <Link
                  component={RouterLink}
                  to="/student/register"
                  sx={{
                    color: theme.palette.primary.main,
                    textDecoration: "none",
                    fontWeight: "medium",
                    "&:hover": {
                      textDecoration: "underline",
                    },
                  }}
                >
                  Regístrate
                </Link>
              </Typography>
            </Box>
          )}
        </Box>
      </Paper>

      {/* ✅ Snackbar para errores y éxito en el mismo formato */}
      <Snackbar
        open={Boolean(error || success )}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert onClose={handleCloseSnackbar} severity={error ? "error" : "success"} variant="filled">
          {error || success}
        </Alert>
      </Snackbar>
    </Box>
  )
}
