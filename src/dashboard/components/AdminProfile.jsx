"use client"

import { useState, useCallback } from "react"
import { Box, Typography, Card, CardContent, Grid, Avatar, Divider, useTheme, TextField, Button, Alert, Snackbar, CircularProgress, InputAdornment, IconButton, } from "@mui/material"
import { Person as PersonIcon, Lock as LockIcon, LockClock as LockClockIcon, Visibility as VisibilityIcon, VisibilityOff as VisibilityOffIcon, Key as KeyIcon, LockPerson, } from "@mui/icons-material"
import { useAuthStore } from "../../hooks/useAuthStore"
import { useSelector } from "react-redux"
import { LoadingSpinner } from "../../simulator/components/LoadingSpinner"

export const AdminProfile = () => {
    const theme = useTheme(); // Obtiene el tema actual de Material UI

    // Estados para manejar la carga, errores y éxito en la actualización de contraseña
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [showSuccess, setShowSuccess] = useState(false); // Controla la visibilidad del mensaje de éxito

    // Obtiene la información del usuario autenticado
    const { user } = useSelector((state) => state.auth);
    const { startUpdatePassword } = useAuthStore(); // Acción para actualizar la contraseña

    // Estado para manejar los valores de los campos de contraseña
    const [passwords, setPasswords] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
    });

    // Estado para manejar la visibilidad de las contraseñas
    const [showPasswords, setShowPasswords] = useState({
        currentPassword: false,
        newPassword: false,
        confirmPassword: false,
    });

    // Maneja el cambio en los inputs de contraseña
    const handleInputChange = useCallback((event) => {
        const { name, value } = event.target;
        setPasswords((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    }, []);

    // Alterna la visibilidad de las contraseñas
    const handleTogglePasswordVisibility = (field) => {
        setShowPasswords((prev) => ({ ...prev, [field]: !prev[field] }));
    };

    // Maneja el envío del formulario para actualizar la contraseña
    const handleSubmit = useCallback(
        async (e) => {
            e.preventDefault();
            setError("");
            setSuccess("");

            // Validación: Verifica que la nueva contraseña coincida con la confirmación
            if (passwords.newPassword !== passwords.confirmPassword) {
                setError("Los NIP's nuevos no coinciden");
                return;
            }

            try {
                setIsLoading(true);
                // Llama a la función que actualiza la contraseña en la base de datos
                const msg = await startUpdatePassword(
                    user.numero_identificacion,
                    passwords.currentPassword,
                    passwords.newPassword
                );
                setSuccess(msg);
                setPasswords({
                    currentPassword: "",
                    newPassword: "",
                    confirmPassword: "",
                });
                setShowSuccess(true);
            } catch (err) {
                setError(err);
            } finally {
                setIsLoading(false);
            }
        },
        [passwords, startUpdatePassword]
    );

    // Cierra la notificación de éxito
    const handleCloseSnackbar = useCallback(() => {
        setShowSuccess(false);
    }, []);

    // Muestra un spinner de carga mientras se está procesando la petición
    if (isLoading) return <LoadingSpinner />;

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
                                        {user.carrera ? ` de ${user.carrera}` : ''}
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

