import { Box, Typography, Paper } from "@mui/material"
import { Timer } from 'lucide-react'

export const ExamHeader = ({ examName, remainingTime }) => {
  // Convertir el tiempo restante (en segundos) a formato hh:mm:ss
  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <Paper 
      elevation={2} 
      sx={{ 
        p: 3, 
        mb: 3, 
        display: 'flex', 
        justifyContent: 'space-between',
        alignItems: 'center',
        borderLeft: '4px solid',
        borderColor: 'primary.main'
      }}
    >
      <Box>
        <Typography variant="h5" component="h1" sx={{ fontWeight: 'bold', color: 'text.primary' }}>
          {examName}
        </Typography>
      </Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Timer size={24} />
        <Typography 
          variant="h6" 
          sx={{ 
            fontFamily: 'monospace',
            fontWeight: 'medium',
            color: remainingTime <= 300 ? 'error.main' : 'text.primary' // Rojo cuando quedan 5 minutos o menos
          }}
        >
          {formatTime(remainingTime)}
        </Typography>
      </Box>
    </Paper>
  )
}
