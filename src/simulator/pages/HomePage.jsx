import { Box, Button, Typography, Paper, Container, Grid, useTheme, useMediaQuery } from '@mui/material';
import { School as SchoolIcon, AdminPanelSettings as AdminIcon } from '@mui/icons-material';
import { Link, useNavigate } from 'react-router-dom';

export const HomePage = () => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const navigate = useNavigate();

    return (
        <Box
            sx={{
                minHeight: '100vh',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                backgroundColor: theme.palette.background.default,
            }}
        >
            <Container maxWidth="md">
                <Paper
                    elevation={3}
                    sx={{
                        padding: 4,
                        textAlign: 'center',
                        border: `1px solid ${theme.palette.grey[300]}`,
                    }}
                >
                    <Typography
                        variant="h3"
                        component="h1"
                        gutterBottom
                        sx={{
                            color: theme.palette.primary.main,
                            marginBottom: 3,
                        }}
                    >
                        Bienvenido al Simulador EGEL
                    </Typography>
                    <Typography
                        variant="h6"
                        sx={{
                            color: theme.palette.text.secondary,
                            marginBottom: 4,
                        }}
                    >
                        Selecciona tu tipo de acceso para continuar
                    </Typography>

                    <Grid container spacing={4} justifyContent="center">
                        <Grid item xs={12} sm={6}>
                            <Paper
                                elevation={2}
                                sx={{
                                    p: 3,
                                    height: '100%',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    transition: 'transform 0.3s, box-shadow 0.3s',
                                    border: `1px solid ${theme.palette.grey[300]}`,
                                    '&:hover': {
                                        transform: 'translateY(-5px)',
                                        boxShadow: theme.shadows[6],
                                        borderColor: theme.palette.primary.main,
                                    },
                                }}
                            >
                                <SchoolIcon
                                    sx={{
                                        fontSize: 60,
                                        color: theme.palette.primary.main,
                                        mb: 2
                                    }}
                                />
                                <Typography
                                    variant="h5"
                                    component="h2"
                                    gutterBottom
                                    sx={{
                                        color: theme.palette.primary.dark,
                                        fontWeight: 'bold',
                                    }}
                                >
                                    Estudiante
                                </Typography>
                                <Typography
                                    variant="body1"
                                    sx={{
                                        color: theme.palette.text.secondary,
                                        mb: 3,
                                    }}
                                >
                                    Accede para realizar simulacros y evaluar tu preparación.
                                </Typography>
                                <Button
                                    variant="contained"
                                    color="primary"
                                    size="large"
                                    fullWidth={isMobile}
                                    sx={{
                                        mt: 'auto',
                                        py: 1.5,
                                    }}
                                    onClick={() => navigate('/login', {state: {role: 'student'}})} //Envias el tipo de rol
                                    >
                                    Ingresar como Estudiante
                                </Button>
                            </Paper>
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <Paper
                                elevation={2}
                                sx={{
                                    p: 3,
                                    height: '100%',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    transition: 'transform 0.3s, box-shadow 0.3s',
                                    border: `1px solid ${theme.palette.grey[300]}`,
                                    '&:hover': {
                                        transform: 'translateY(-5px)',
                                        boxShadow: theme.shadows[6],
                                        borderColor: theme.palette.secondary.main,
                                    },
                                }}
                            >
                                <AdminIcon
                                    sx={{
                                        fontSize: 60,
                                        color: theme.palette.secondary.main,
                                        mb: 2
                                    }}
                                />
                                <Typography
                                    variant="h5"
                                    component="h2"
                                    gutterBottom
                                    sx={{
                                        color: theme.palette.secondary.dark,
                                        fontWeight: 'bold',
                                    }}
                                >
                                    Administrador
                                </Typography>
                                <Typography
                                    variant="body1"
                                    sx={{
                                        color: theme.palette.text.secondary,
                                        mb: 3,
                                    }}
                                >
                                    Acceso único para administradores.
                                </Typography>
                                <Button
                                    variant="contained"
                                    color="secondary"
                                    size="large"
                                    fullWidth={isMobile}
                                    sx={{
                                        mt: 'auto',
                                        py: 1.5,
                                    }}
                                    onClick={() => navigate('/login', {state: {role: 'admin'}})} //Envias el tipo de rol
                                    >
                                    Ingresar como Administrador
                                </Button>
                            </Paper>
                        </Grid>
                    </Grid>
                </Paper>
            </Container>
        </Box>
    );
};
