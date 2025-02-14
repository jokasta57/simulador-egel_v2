import { Box, Typography, Paper } from "@mui/material"
import { Timer } from "lucide-react"

export const ExamHeader = ({ examName, remainingTime }) => {
  return (
    <Paper
      elevation={2}
      sx={{
        p: 3,
        mb: 3,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        borderLeft: "4px solid",
        borderColor: "primary.main",
      }}
    >
      <Box>
        <Typography variant="h5" component="h1" sx={{ fontWeight: "bold", color: "text.primary" }}>
          {examName}
        </Typography>
      </Box>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 2,
          backgroundColor: "background.paper",
          padding: "8px 16px",
          borderRadius: "20px",
          boxShadow: 1,
        }}
      >
        <Timer size={24} color={remainingTime <= 300 ? "error" : "primary"} />
        <Typography
          variant="h6"
          sx={{
            fontFamily: "monospace",
            fontWeight: "bold",
            color: remainingTime <= 300 ? "error.main" : "primary.main",
            letterSpacing: "0.05em",
          }}
        >
          {remainingTime}
        </Typography>
      </Box>
    </Paper>
  )
}

