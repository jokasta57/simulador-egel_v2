import { Box, Typography, Button, Container, Paper, useTheme } from "@mui/material"
import { motion } from "framer-motion"
import SearchOffIcon from "@mui/icons-material/SearchOff"
import HomeIcon from "@mui/icons-material/Home"
import { useNavigate } from "react-router-dom"

const AnimatedNumber = ({ number }) => {
  const theme = useTheme()
  return (
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{
        type: "spring",
        stiffness: 260,
        damping: 20,
      }}
    >
      <Typography
        variant="h1"
        component="span"
        sx={{
          fontSize: "15rem",
          fontWeight: "bold",
          color: theme.palette.primary.main,
          textShadow: `2px 2px 4px ${theme.palette.primary.light}`,
          [theme.breakpoints.down("sm")]: {
            fontSize: "10rem",
          },
        }}
      >
        {number}
      </Typography>
    </motion.div>
  )
}

export default function NotFoundPage() {
  const theme = useTheme()
  const navigate = useNavigate()

  const handleGoHome = () => {
    navigate(-1)
  }

  return (
    <Container maxWidth="md" sx={{ height: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <Paper
        elevation={3}
        sx={{
          p: 5,
          borderRadius: 2,
          background: `linear-gradient(45deg, ${theme.palette.background.paper} 30%, ${theme.palette.background.default} 90%)`,
          boxShadow: "0 3px 5px 2px rgba(255, 105, 135, .3)",
        }}
      >
        <Box sx={{ textAlign: "center" }}>
          <motion.div
            initial={{ y: -50 }}
            animate={{ y: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 15 }}
          >
            <SearchOffIcon sx={{ fontSize: 100, color: theme.palette.error.main, mb: 2 }} />
          </motion.div>

          <Box sx={{ display: "flex", justifyContent: "center", mb: 4 }}>
            <AnimatedNumber number="4" />
            <AnimatedNumber number="0" />
            <AnimatedNumber number="4" />
          </Box>

          <Typography variant="h4" gutterBottom sx={{ fontWeight: "bold", color: theme.palette.text.primary }}>
            ¡Oops! Página no encontrada
          </Typography>

          <Typography variant="body1" paragraph sx={{ color: theme.palette.text.secondary }}>
            Lo sentimos, parece que no pudimos encontrar lo que estabas buscando. Esta página no existe o ha sido
            movida.
          </Typography>

          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              variant="contained"
              color="primary"
              size="large"
              startIcon={<HomeIcon />}
              onClick={handleGoHome}
              sx={{
                mt: 2,
                boxShadow: "0 3px 5px 2px rgba(33, 203, 243, .3)",
                transition: "all 0.3s ease-in-out",
                "&:hover": {
                  transform: "translateY(-3px)",
                  boxShadow: "0 6px 10px 4px rgba(33, 203, 243, .3)",
                },
              }}
            >
              Volver al Inicio
            </Button>
          </motion.div>
        </Box>
      </Paper>
    </Container>
  )
}

