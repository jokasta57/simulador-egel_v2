"use client"

import { useState, useRef, useEffect } from "react"
import { Box, Typography, TextField, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Card, CardContent, Grid, IconButton, useMediaQuery, Tooltip, CircularProgress, Autocomplete, Snackbar, Alert, } from "@mui/material"
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon, Close as CloseIcon } from "@mui/icons-material"
import { useTheme } from "@mui/material/styles"
import Swal from "sweetalert2"
import { useAdminStore } from "../../hooks/useAdminStore"
import { Controller } from "react-hook-form"
import { LoadingSpinner } from "../../simulator/components/LoadingSpinner"


export const GestionAdministradores = () => {
  const [administrators, setAdministrators] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [editingAdmin, setEditingAdmin] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const formRef = useRef(null)
  const [reload, setReload] = useState(false);
  const [newAdmin, setNewAdmin] = useState({
    nombre: "",
    apellido_paterno: "",
    apellido_materno: "",
    carrera: "",
    numero_identificacion: "",
    nip: "",
    confirmarNip: "", // Nuevo campo para confirmar NIP
  })
  const [errors, setErrors] = useState({})

  const { handleGetAdmins, handleAddNewAdmin, handleUpdateAdmin, handleDeleteAdmin } = useAdminStore();

  const theme = useTheme()

  useEffect(() => {
    getAdmins();
  }, [editingAdmin, reload])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setNewAdmin((prev) => ({ ...prev, [name]: value }))
    // Limpiar error cuando el usuario empieza a escribir
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }))
    }
  }

  const getAdmins = async () => {
    setIsLoading(true)
    try {
      const data = await handleGetAdmins();
      setAdministrators(data.administradores);
    } catch (error) {
      setError(error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCloseSnackbar = () => {
    if (error) setError("");
    if (success) setSuccess("");
  };

  const handleAddOrUpdateAdmin = async (e) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      let message = "";

      if (editingAdmin) {
        await handleUpdateAdmin(editingAdmin.id_admin, newAdmin);
        message = "Los datos del administrador han sido actualizados correctamente.";
        setEditingAdmin(null);
      } else {
        await handleAddNewAdmin(newAdmin);
        message = "El nuevo administrador ha sido registrado correctamente.";
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
      setIsLoading(false)
      setReload((prev) => !prev); // 🔄 Forzar recarga de datos

      Swal.fire({
        title: editingAdmin ? "Administrador actualizado" : "Administrador creado",
        text: message,
        icon: "success",
        timer: 1500, // ⏳ Se cerrará en 1.5 segundos
        showConfirmButton: true,
        confirmButtonText: "Entendido",
        allowOutsideClick: false,
        color: "#511013",
        confirmButtonColor: "#B91116",
        customClass: {
          popup: "swal-custom-popup",
          title: "swal-custom-title",
          confirmButton: "swal-custom-button",
        },
      });

    } catch (error) {
      setError(error);
    } finally {
      setIsLoading(false);
    }

  }

  const deleteAdmin = async (id, nombre) => {
    Swal.fire({
      title: `¿Estás seguro de eliminar al administrador "${nombre}"?`,
      text: "Esta acción no se puede deshacer. Para confirmar, escribe 'eliminar'.",
      input: "text",
      inputLabel: "Confirmación de eliminación",
      inputPlaceholder: "Escribe 'eliminar'",
      showCancelButton: true,
      confirmButtonText: "Eliminar",
      cancelButtonText: "Cancelar",
      confirmButtonColor: theme.palette.error.main,
      cancelButtonColor: theme.palette.grey[500],
      icon: "warning",
      inputValidator: (value) => {
        if (value !== 'eliminar') {
          return "La palabra no es correcta. Debes escribir 'eliminar' para proceder.";
        }
      },
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await handleDeleteAdmin(id);
          setReload((prev) => !prev); // 🔄 Forzar recarga de datos
          Swal.fire({
            title: "Administrador eliminado",
            text: `El administrador "${nombre}" ha sido eliminado correctamente.`,
            icon: "success",
            timer: 2000, // ⏳ Se cerrará automáticamente
            showConfirmButton: false,
          });
        } catch (error) {
          Swal.fire({
            title: "Error",
            text: error,
            icon: "error",
            confirmButtonText: "Entendido",
          });
        }
      }
    });

  }

  const handleEditAdmin = (admin) => {
    setEditingAdmin(admin)
    setNewAdmin({
      nombre: admin.nombre,
      apellido_paterno: admin.apellido_paterno,
      apellido_materno: admin.apellido_materno,
      carrera: admin.carrera || "",
      numero_identificacion: admin.numero_identificacion,
      nip: "",
      confirmarNip: "",
    })
    setShowForm(true)
    if (formRef.current) {
      formRef.current.scrollIntoView({ behavior: "smooth", block: "start" })
    }
  }

  if (isLoading) return <LoadingSpinner />

  return (
    <Box sx={{ maxWidth: 1200, margin: "0 auto", p: 3 }}>
      <Card elevation={3} sx={{ p: 2 }}>
        <Typography
          variant="h4"
          component="h1"
          sx={{
            color: theme.palette.text.primary,
            fontWeight: "bold",
            mb: 3
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
                  Número de Identificación
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
              {administrators.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    No hay administradores disponibles.
                  </TableCell>
                </TableRow>
              ) : (
                administrators.map((admin, index) => (
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
                    <TableCell>{admin.carrera}</TableCell>
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
                          onClick={() => deleteAdmin(admin.id_admin, admin.nombre)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))
              )}
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
                      type="number"
                      value={newAdmin.numero_identificacion}
                      onChange={handleInputChange}
                      required
                      variant="outlined"
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
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Apellido Materno"
                      name="apellido_materno"
                      value={newAdmin.apellido_materno}
                      onChange={handleInputChange}
                      variant="outlined"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Autocomplete
                      onChange={(event, newValue) => {
                        setNewAdmin((prev) => ({ ...prev, carrera: newValue }));
                      }}
                      options={[
                        "Ingeniería de Software",
                        "Medicina",
                        "Licenciatura en Administración",
                        "Enfermería"
                      ]}
                      value={newAdmin.carrera || ""}  // Esto debería ser el valor de la carrera
                      renderInput={(params) => (
                        <TextField {...params}
                          label="Carrera"
                          required
                          inputProps={{ ...params.inputProps, readOnly: true }} />
                      )}
                    />
                  </Grid>
                  {!editingAdmin && (
                    <>
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
                        />
                      </Grid>
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
                        />
                      </Grid>
                    </>
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
      <Snackbar
        open={Boolean(error || success)}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={error ? 'error' : 'success'}
          variant="filled"
        >
          {error ? (typeof error === 'string' ? error : JSON.stringify(error)) :
            (typeof success === 'string' ? success : JSON.stringify(success))}
        </Alert>
      </Snackbar>
    </Box>
  )
}

