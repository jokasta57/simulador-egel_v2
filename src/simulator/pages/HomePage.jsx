import { Box, Button, Typography, Paper, Container, Grid, useTheme, useMediaQuery, Stack } from "@mui/material"
import { School as SchoolIcon, AdminPanelSettings as AdminIcon } from "@mui/icons-material"
import { useNavigate } from "react-router-dom"
import { Footer } from "../components"

export const HomePage = () => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"))
  const navigate = useNavigate()

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Main content wrapper */}
      <Box
        sx={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          py: 4, // Add some padding top and bottom
        }}
      >
        <Container maxWidth="md">
          <Paper
            elevation={3}
            sx={{
              padding: 4,
              textAlign: "center",
              border: `1px solid ${theme.palette.grey[300]}`,
              borderRadius: 2,
            }}
          >
            <Typography
              variant="subtitle1"
              sx={{
                color: theme.palette.text.secondary,
                marginBottom: 2,
                fontWeight: "medium",
              }}
            >
              Escuela Superior de Tlahuelilpan
            </Typography>
            <Typography
              variant="h3"
              component="h1"
              gutterBottom
              sx={{
                color: "#c41010", // Color rojo del diseño original
                marginBottom: 3,
                fontWeight: "bold",
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
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    transition: "transform 0.3s, box-shadow 0.3s",
                    border: `1px solid ${theme.palette.grey[300]}`,
                    borderRadius: 2,
                    "&:hover": {
                      transform: "translateY(-5px)",
                      boxShadow: theme.shadows[6],
                      borderColor: "#c41010",
                    },
                  }}
                >
                  <SchoolIcon
                    sx={{
                      fontSize: 60,
                      color: "#c41010",
                      mb: 2,
                    }}
                  />
                  <Typography
                    variant="h5"
                    component="h2"
                    gutterBottom
                    sx={{
                      color: "#c41010",
                      fontWeight: "bold",
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
                    size="large"
                    fullWidth={isMobile}
                    sx={{
                      mt: "auto",
                      py: 1.5,
                      backgroundColor: "#c41010",
                      "&:hover": {
                        backgroundColor: "#a00d0d",
                      },
                    }}
                    onClick={() => navigate("/login", { state: { role: "student" } })}
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
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    transition: "transform 0.3s, box-shadow 0.3s",
                    border: `1px solid ${theme.palette.grey[300]}`,
                    borderRadius: 2,
                    "&:hover": {
                      transform: "translateY(-5px)",
                      boxShadow: theme.shadows[6],
                      borderColor: "#f4511e",
                    },
                  }}
                >
                  <AdminIcon
                    sx={{
                      fontSize: 60,
                      color: "#f4511e",
                      mb: 2,
                    }}
                  />
                  <Typography
                    variant="h5"
                    component="h2"
                    gutterBottom
                    sx={{
                      color: "#f4511e",
                      fontWeight: "bold",
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
                    size="large"
                    fullWidth={isMobile}
                    sx={{
                      mt: "auto",
                      py: 1.5,
                      backgroundColor: "#f4511e",
                      "&:hover": {
                        backgroundColor: "#d84315",
                      },
                    }}
                    onClick={() => navigate("/login", { state: { role: "admin" } })}
                  >
                    Ingresar como Administrador
                  </Button>
                </Paper>
              </Grid>
            </Grid>
          </Paper>
        </Container>
      </Box>
      <Footer />
    </Box>
  )
}

