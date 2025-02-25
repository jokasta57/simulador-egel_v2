"use client"

import { useState, useRef } from "react"
import {
  Box,
  Typography,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Card,
  CardContent,
  Grid,
  IconButton,
  useMediaQuery,
  Tooltip,
} from "@mui/material"
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon, Close as CloseIcon } from "@mui/icons-material"
import { useTheme } from "@mui/material/styles"
import Swal from "sweetalert2"

// Mock data
const mockAdministrators = [
  {
    id_admin: 1,
    nombre: "Juan",
    apellido_paterno: "Pérez",
    apellido_materno: "García",
    numero_identificacion: "ADM001",
    nip: "******",
  },
  {
    id_admin: 2,
    nombre: "María",
    apellido_paterno: "López",
    apellido_materno: "Sánchez",
    numero_identificacion: "ADM002",
    nip: "******",
  },
  {
    id_admin: 3,
    nombre: "Carlos",
    apellido_paterno: "Rodríguez",
    apellido_materno: "Martínez",
    numero_identificacion: "ADM003",
    nip: "******",
  },
]

export const GestionAdministradores = () => {
  const [administrators, setAdministrators] = useState(mockAdministrators)
  const [showForm, setShowForm] = useState(false)
  const [editingAdmin, setEditingAdmin] = useState(null)
  const formRef = useRef(null)
  const [newAdmin, setNewAdmin] = useState({
    nombre: "",
    apellido_paterno: "",
    apellido_materno: "",
    numero_identificacion: "",
    nip: "",
    confirmarNip: "", // Nuevo campo para confirmar NIP
  })
  const [errors, setErrors] = useState({})

  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"))

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setNewAdmin((prev) => ({ ...prev, [name]: value }))
    // Limpiar error cuando el usuario empieza a escribir
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }))
    }
  }

  const validateForm = () => {
    const newErrors = {}

    if (!newAdmin.numero_identificacion) {
      newErrors.numero_identificacion = "El número de identificación es requerido"
    }
    if (!newAdmin.nombre) {
      newErrors.nombre = "El nombre es requerido"
    }
    if (!newAdmin.apellido_paterno) {
      newErrors.apellido_paterno = "El apellido paterno es requerido"
    }
    if (!newAdmin.apellido_materno) {
      newErrors.apellido_materno = "El apellido materno es requerido"
    }
    if (!editingAdmin) {
      if (!newAdmin.nip) {
        newErrors.nip = "El NIP es requerido"
      }
      if (!newAdmin.confirmarNip) {
        newErrors.confirmarNip = "La confirmación del NIP es requerida"
      }
      if (newAdmin.nip !== newAdmin.confirmarNip) {
        newErrors.nip = "Los NIPs no coinciden"
        newErrors.confirmarNip = "Los NIPs no coinciden"
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleAddOrUpdateAdmin = async (e) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    if (!editingAdmin) {
      // Confirmar la creación del administrador
      const result = await Swal.fire({
        title: "¿Confirmar NIP?",
        input: "password",
        inputLabel: "Por favor, ingrese el NIP nuevamente para confirmar",
        inputPlaceholder: "Confirmar NIP",
        showCancelButton: true,
        confirmButtonText: "Confirmar",
        cancelButtonText: "Cancelar",
        inputValidator: (value) => {
          if (value !== newAdmin.nip) {
            return "El NIP no coincide"
          }
        },
      })

      if (!result.isConfirmed) {
        return
      }
    }

    if (editingAdmin) {
      setAdministrators(
        administrators.map((admin) => (admin.id_admin === editingAdmin.id_admin ? { ...admin, ...newAdmin } : admin)),
      )
      setEditingAdmin(null)
    } else {
      const newAdminWithId = {
        ...newAdmin,
        id_admin: administrators.length + 1,
        nip: "******",
      }
      setAdministrators([...administrators, newAdminWithId])
    }

    setNewAdmin({
      nombre: "",
      apellido_paterno: "",
      apellido_materno: "",
      numero_identificacion: "",
      nip: "",
      confirmarNip: "",
    })
    setShowForm(false)

    Swal.fire({
      icon: "success",
      title: editingAdmin ? "Administrador actualizado" : "Administrador creado",
      showConfirmButton: false,
      timer: 1500,
    })
  }

  const handleDeleteAdmin = (id) => {
    Swal.fire({
      title: "¿Estás seguro?",
      text: "No podrás revertir esta acción",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    }).then((result) => {
      if (result.isConfirmed) {
        setAdministrators(administrators.filter((admin) => admin.id_admin !== id))
        Swal.fire("Eliminado", "El administrador ha sido eliminado.", "success")
      }
    })
  }

  const handleEditAdmin = (admin) => {
    setEditingAdmin(admin)
    setNewAdmin({
      nombre: admin.nombre,
      apellido_paterno: admin.apellido_paterno,
      apellido_materno: admin.apellido_materno,
      numero_identificacion: admin.numero_identificacion,
      nip: "",
      confirmarNip: "",
    })
    setShowForm(true)
    if (formRef.current) {
      formRef.current.scrollIntoView({ behavior: "smooth", block: "start" })
    }
  }

  return (
    <Box sx={{ maxWidth: 1200, margin: "0 auto", p: 3 }}>
      <Card elevation={3} sx={{ p: 2 }}>
        <Typography
          variant="h4"
          component="h1"
          sx={{
            fontWeight: "bold",
            color: "#8B0000",
            mb: 3,
          }}
        >
          Gestión de Administradores
        </Typography>

        <TableContainer
          component={Paper}
          elevation={0}
          sx={{
            mb: 3,
            maxHeight: "calc(100vh - 300px)",
            overflow: "auto",
          }}
        >
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell
                  sx={{
                    backgroundColor: "#fff",
                    color: "#8B0000",
                    fontWeight: "bold",
                    borderBottom: "2px solid #8B0000",
                  }}
                >
                  Número de Cuenta
                </TableCell>
                <TableCell
                  sx={{
                    backgroundColor: "#fff",
                    color: "#8B0000",
                    fontWeight: "bold",
                    borderBottom: "2px solid #8B0000",
                  }}
                >
                  Nombre
                </TableCell>
                <TableCell
                  sx={{
                    backgroundColor: "#fff",
                    color: "#8B0000",
                    fontWeight: "bold",
                    borderBottom: "2px solid #8B0000",
                  }}
                >
                  Apellido Paterno
                </TableCell>
                <TableCell
                  sx={{
                    backgroundColor: "#fff",
                    color: "#8B0000",
                    fontWeight: "bold",
                    borderBottom: "2px solid #8B0000",
                  }}
                >
                  Apellido Materno
                </TableCell>
                <TableCell
                  sx={{
                    backgroundColor: "#fff",
                    color: "#8B0000",
                    fontWeight: "bold",
                    borderBottom: "2px solid #8B0000",
                  }}
                >
                  Carrera
                </TableCell>
                <TableCell
                  align="right"
                  sx={{
                    backgroundColor: "#fff",
                    color: "#8B0000",
                    fontWeight: "bold",
                    borderBottom: "2px solid #8B0000",
                  }}
                >
                  Acciones
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {administrators.map((admin, index) => (
                <TableRow
                  key={admin.id_admin}
                  sx={{
                    backgroundColor: index % 2 === 0 ? "#f5f5f5" : "#fff",
                    "&:hover": { backgroundColor: "#f0f0f0" },
                  }}
                >
                  <TableCell>{admin.numero_identificacion}</TableCell>
                  <TableCell>{admin.nombre}</TableCell>
                  <TableCell>{admin.apellido_paterno}</TableCell>
                  <TableCell>{admin.apellido_materno}</TableCell>
                  <TableCell>Ing. de software</TableCell>
                  <TableCell align="right">
                    <Tooltip title="Editar">
                      <IconButton size="small" sx={{ color: "#8B0000" }} onClick={() => handleEditAdmin(admin)}>
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Eliminar">
                      <IconButton
                        size="small"
                        sx={{ color: "#8B0000" }}
                        onClick={() => handleDeleteAdmin(admin.id_admin)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <Box sx={{ display: "flex", justifyContent: "center", mb: showForm ? 3 : 0 }}>
          <Button
            variant="contained"
            startIcon={showForm ? <CloseIcon /> : <AddIcon />}
            onClick={() => {
              setShowForm(!showForm)
              setEditingAdmin(null)
              setNewAdmin({
                nombre: "",
                apellido_paterno: "",
                apellido_materno: "",
                numero_identificacion: "",
                nip: "",
                confirmarNip: "",
              })
              setErrors({})
            }}
            color={showForm ? "error" : "primary"}
            sx={{
              backgroundColor: showForm ? "#d32f2f" : "#8B0000",
              "&:hover": {
                backgroundColor: showForm ? "#b71c1c" : "#660000",
              },
            }}
          >
            {showForm ? "Cancelar" : "Agregar Administrador"}
          </Button>
        </Box>

        {showForm && (
          <Card ref={formRef} variant="outlined" sx={{ backgroundColor: "#f8f8f8", mt: 3 }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, color: "#8B0000" }}>
                {editingAdmin ? "Editar Administrador" : "Nuevo Administrador"}
              </Typography>
              <form onSubmit={handleAddOrUpdateAdmin}>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Número de Identificación"
                      name="numero_identificacion"
                      value={newAdmin.numero_identificacion}
                      onChange={handleInputChange}
                      required
                      variant="outlined"
                      error={!!errors.numero_identificacion}
                      helperText={errors.numero_identificacion}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Nombre"
                      name="nombre"
                      value={newAdmin.nombre}
                      onChange={handleInputChange}
                      required
                      variant="outlined"
                      error={!!errors.nombre}
                      helperText={errors.nombre}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Apellido Paterno"
                      name="apellido_paterno"
                      value={newAdmin.apellido_paterno}
                      onChange={handleInputChange}
                      required
                      variant="outlined"
                      error={!!errors.apellido_paterno}
                      helperText={errors.apellido_paterno}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Apellido Materno"
                      name="apellido_materno"
                      value={newAdmin.apellido_materno}
                      onChange={handleInputChange}
                      required
                      variant="outlined"
                      error={!!errors.apellido_materno}
                      helperText={errors.apellido_materno}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Carrera"
                      name="carrera"
                      value='carrera'
                      onChange={handleInputChange}
                      required
                      variant="outlined"
                      // error={!!errors.apellido_materno}
                      // helperText={errors.apellido_materno}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="NIP"
                      name="nip"
                      type="password"
                      value={newAdmin.nip}
                      onChange={handleInputChange}
                      required={!editingAdmin}
                      variant="outlined"
                      error={!!errors.nip}
                      helperText={errors.nip}
                    />
                  </Grid>
                  {!editingAdmin && (
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Confirmar NIP"
                        name="confirmarNip"
                        type="password"
                        value={newAdmin.confirmarNip}
                        onChange={handleInputChange}
                        required
                        variant="outlined"
                        error={!!errors.confirmarNip}
                        helperText={errors.confirmarNip}
                      />
                    </Grid>
                  )}
                  <Grid item xs={12}>
                    <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                      <Button
                        type="submit"
                        variant="contained"
                        size="large"
                        sx={{
                          backgroundColor: "#8B0000",
                          "&:hover": {
                            backgroundColor: "#660000",
                          },
                        }}
                      >
                        {editingAdmin ? "Actualizar Administrador" : "Agregar Administrador"}
                      </Button>
                    </Box>
                  </Grid>
                </Grid>
              </form>
            </CardContent>
          </Card>
        )}
      </Card>
    </Box>
  )
}

