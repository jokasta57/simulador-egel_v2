"use client"

import { useState, useCallback } from "react"
import {
    Box,
    Typography,
    Card,
    CardContent,
    Grid,
    Avatar,
    Divider,
    useTheme,
    TextField,
    Button,
    Alert,
    Snackbar,
    CircularProgress,
    InputAdornment,
    IconButton,
} from "@mui/material"
import {
    Person as PersonIcon,
    Lock as LockIcon,
    LockClock as LockClockIcon,
    Visibility as VisibilityIcon,
    VisibilityOff as VisibilityOffIcon,
    Key as KeyIcon,
    LockPerson,
} from "@mui/icons-material"
import { useAuthStore } from "../../hooks/useAuthStore"
import { useSelector } from "react-redux"
import { LoadingSpinner } from "../../simulator/components/LoadingSpinner"

export const AdminProfile = () => {
    const theme = useTheme()
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState("")
    const [success, setSuccess] = useState("") // Added success state
    const [showSuccess, setShowSuccess] = useState(false)

    const { user } = useSelector((state) => state.auth)
    const { startUpdatePassword } = useAuthStore()

    const [passwords, setPasswords] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
    })

    const [showPasswords, setShowPasswords] = useState({
        currentPassword: false,
        newPassword: false,
        confirmPassword: false,
    })

    const handleInputChange = useCallback((event) => {
        const { name, value } = event.target
        setPasswords((prevData) => ({
            ...prevData,
            [name]: value,
        }))
    }, [])

    const handleTogglePasswordVisibility = (field) => {
        setShowPasswords((prev) => ({ ...prev, [field]: !prev[field] }))
    }

    const handleSubmit = useCallback(
        async (e) => {
            e.preventDefault()
            setError("")
            setSuccess("")

            if (passwords.newPassword !== passwords.confirmPassword) {
                setError("Los NIP's nuevos no coinciden")
                return
            }

            try {
                setIsLoading(true)
                const msg = await startUpdatePassword(user.numero_identificacion, passwords.currentPassword, passwords.newPassword)
                setSuccess(msg)
                setPasswords({
                    currentPassword: "",
                    newPassword: "",
                    confirmPassword: "",
                })
                setShowSuccess(true)
                setIsLoading(false)
            } catch (err) {
                setError(err)
            } finally {
                setIsLoading(false)
            }
        },
        [passwords, startUpdatePassword],
    )

    const handleCloseSnackbar = useCallback(() => {
        setShowSuccess(false)
    }, [])

    if (isLoading) return <LoadingSpinner />

    return (
        <Box sx={{ maxWidth: 600, margin: "0 auto", p: 3 }}>
            <Typography variant="h4" component="h1" sx={{ color: theme.palette.text.primary, mb: 4, fontWeight: "bold", }}>
                Mi Perfil
            </Typography>

            <Grid container spacing={3}>
                <Grid item xs={12}>
                    <Card
                        sx={{
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
                                    {user.nombre?.[0] ?? ""}
                                    {user.apellido_paterno?.[0] ?? ""}
                                </Avatar>
                                <Box sx={{ ml: 2 }}>
                                    <Typography variant="h5">
                                        {`${user.nombre ?? ""} ${user.apellido_paterno ?? ""} ${user.apellido_materno ?? ""}`}
                                    </Typography>
                                    <Typography variant="body1" color="text.secondary">
                                        {user.role === 'superAdmin' ? 'Super Administrador' : 'Administrador'}
                                    </Typography>
                                </Box>
                            </Box>

                            <Divider sx={{ my: 2 }} />

                            <Typography variant="h6" gutterBottom>
                                Cambiar NIP
                            </Typography>

                            <form onSubmit={handleSubmit}>
                                <TextField
                                    margin="normal"
                                    fullWidth
                                    name="currentPassword"
                                    label="NIP actual"
                                    type={showPasswords.currentPassword ? "text" : "password"}
                                    value={passwords.currentPassword}
                                    onChange={handleInputChange}
                                    variant="outlined"
                                    size="small"
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <LockClockIcon color="primary" />
                                            </InputAdornment>
                                        ),
                                        endAdornment: (
                                            <InputAdornment position="end">
                                                <IconButton
                                                    aria-label="toggle password visibility"
                                                    onClick={() => handleTogglePasswordVisibility("currentPassword")}
                                                    edge="end"
                                                >
                                                    {showPasswords.currentPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                                                </IconButton>
                                            </InputAdornment>
                                        ),
                                    }}
                                />
                                <Divider sx={{ my: 2 }} />
                                <Typography variant="subtitle1" gutterBottom sx={{ mt: 2, mb: 1 }}>
                                    Nuevo NIP
                                </Typography>
                                <TextField
                                    margin="normal"
                                    fullWidth
                                    name="newPassword"
                                    label="Nuevo NIP"
                                    type={showPasswords.newPassword ? "text" : "password"}
                                    value={passwords.newPassword}
                                    onChange={handleInputChange}
                                    variant="outlined"
                                    size="small"
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <LockPerson color="secondary" />
                                            </InputAdornment>
                                        ),
                                        endAdornment: (
                                            <InputAdornment position="end">
                                                <IconButton
                                                    aria-label="toggle password visibility"
                                                    onClick={() => handleTogglePasswordVisibility("newPassword")}
                                                    edge="end"
                                                >
                                                    {showPasswords.newPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                                                </IconButton>
                                            </InputAdornment>
                                        ),
                                    }}
                                />
                                <TextField
                                    margin="normal"
                                    fullWidth
                                    name="confirmPassword"
                                    label="Confirmar nuevo NIP"
                                    type={showPasswords.confirmPassword ? "text" : "password"}
                                    value={passwords.confirmPassword}
                                    onChange={handleInputChange}
                                    variant="outlined"
                                    size="small"
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <LockIcon color="secondary" />
                                            </InputAdornment>
                                        ),
                                        endAdornment: (
                                            <InputAdornment position="end">
                                                <IconButton
                                                    aria-label="toggle password visibility"
                                                    onClick={() => handleTogglePasswordVisibility("confirmPassword")}
                                                    edge="end"
                                                >
                                                    {showPasswords.confirmPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                                                </IconButton>
                                            </InputAdornment>
                                        ),
                                    }}
                                />

                                {error && (
                                    <Alert severity="error" sx={{ mt: 2 }}>
                                        {error}
                                    </Alert>
                                )}

                                <Box sx={{ mt: 3, display: "flex", justifyContent: "flex-end" }}>
                                    <Button variant="contained" type="submit">
                                        Actualizar NIP
                                    </Button>
                                </Box>
                            </form>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
            <Snackbar 
                open={showSuccess} 
                autoHideDuration={6000} 
                onClose={handleCloseSnackbar}         
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }} 
            >
                <Alert onClose={handleCloseSnackbar} severity="success" variant="filled">
                    {success || "NIP actualizado exitosamente"}
                </Alert>
            </Snackbar>                    
        </Box>
    )
}

