import { Grid, Paper, Typography, Box, useTheme, Card, CardContent } from "@mui/material"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import { Assignment, People, Alarm } from "@mui/icons-material"

const dataBarras = [
  { name: "Matemáticas", aprobados: 65, reprobados: 35 },
  { name: "Física", aprobados: 45, reprobados: 55 },
  { name: "Química", aprobados: 75, reprobados: 25 },
]

const dataPie = [
  { name: "Exámenes Activos", value: 15 },
  { name: "Exámenes Inactivos", value: 5 },
  { name: "Exámenes en Borrador", value: 8 },
]

const COLORS = ["#0088FE", "#FF8042", "#00C49F"]

export const Dashboard = () => {
  const theme = useTheme()

  const resumenData = [
    { title: "Total de Exámenes", value: 28, icon: <Assignment /> },
    { title: "Estudiantes Registrados", value: 1250, icon: <People /> },
    { title: "Próximo Examen", value: "15 Mayo", icon: <Alarm /> },
  ]

  return (
    <Box>
      <Typography variant="h5" component="h2" sx={{ color: theme.palette.primary.main, mb: 3 }}>
        Dashboard
      </Typography>
      <Grid container spacing={3}>
        {resumenData.map((item, index) => (
          <Grid item xs={12} md={4} key={index}>
            <Card>
              <CardContent sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    {item.title}
                  </Typography>
                  <Typography variant="h5" component="div">
                    {item.value}
                  </Typography>
                </Box>
                {item.icon}
              </CardContent>
            </Card>
          </Grid>
        ))}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, height: "400px" }}>
            <Typography variant="h6" gutterBottom>
              Resultados por Materia
            </Typography>
            <ResponsiveContainer width="100%" height="90%">
              <BarChart data={dataBarras}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="aprobados" fill={theme.palette.primary.main} />
                <Bar dataKey="reprobados" fill={theme.palette.secondary.main} />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, height: "400px" }}>
            <Typography variant="h6" gutterBottom>
              Estado de Exámenes
            </Typography>
            <ResponsiveContainer width="100%" height="90%">
              <PieChart>
                <Pie
                  data={dataPie}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {dataPie.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  )
}

