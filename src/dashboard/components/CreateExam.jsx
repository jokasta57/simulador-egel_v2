"use client"

import { useState, useMemo, useEffect, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import {
  Box,
  Typography,
  TextField,
  Button,
  Stack,
  CircularProgress,
  Alert,
  FormControlLabel,
  Switch,
  Autocomplete,
  IconButton,
  Snackbar,
  InputAdornment,
} from "@mui/material"
import { useExamsStore } from "../../hooks/exams/useExamsStore"
import { useCreateExamStore } from "../../hooks/useCreateExamStore"
import EditIcon from "@mui/icons-material/Edit"
import ScheduleIcon from "@mui/icons-material/Schedule"
import { QuestionCard } from "./QuestionCard"
import { FloatingAddButton } from "./FloatingAddButton"
import { useDispatch, useSelector } from "react-redux"
import {
  addNewQuestionTemp,
  resetCurrentOrder,
  resetPreguntaNueva,
  resetTotalQuestions,
  setCurrentOrder,
  setIsLoadingFalse,
  setPreguntaNueva,
  setTotalQuestions,
} from "../../store/exams/examsSlice"
import Swal from "sweetalert2"
import QuestionPanel from "./QuestionPanel"
import { resetNewExamInfo } from "../../store"
import { ArrowLeft } from "lucide-react"
import { LoadingSpinner } from "../../simulator/components/LoadingSpinner"

const generatePeriodOptions = () => {
  const currentYear = new Date().getFullYear()
  const currentMonth = new Date().getMonth()
  const startYear = currentMonth < 6 ? currentYear : currentYear + 1
  const options = []

  for (let i = 0; i < 4; i++) {
    const year = startYear + Math.floor(i / 2)
    const period = i % 2 === 0 ? "1" : "2"
    options.push(`${year}-${period}`)
  }

  return options
}

export const CreateExam = () => {
  const {
    handleUpdateExam,
    handleLoadQuestion,
    handleClearError,
    handleClearSuccess,
    handleUpdateQuestion,
    handleResetCurrentQuestion,
    handleAddNewQuestion,
    handleDeleteQuestion,
    handleLoadExam,
  } = useExamsStore()

  const { handleSaveExamInfo } = useCreateExamStore()

  const [examInfo, setExamInfo] = useState({
    nombre: "",
    periodo: "",
    duracion: "",
    carrera: "",
    area: "",
    estado: "borrador",
  })


  const [isExamInfoEditable, setIsExamInfoEditable] = useState(true)
  const [isDirty, setIsDirty] = useState(false)
  const [isExamCreated, setIsExamCreated] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [loadingMessage, setLoadingMessage] = useState("Cargando...")


  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { totalQuestions, currentOrder, preguntaNueva, currentQuestion, currentExam } = useSelector((state) => state.exams)
  const { newExamInfo } = useSelector((state) => state.createExam)
  const { user } = useSelector(state => state.auth)

  useEffect(() => {
    if (!user) return;
    setExamInfo((prev) => ({ ...prev, carrera: user.carrera }))
  }, [user])

  const handleCloseSnackbar = () => {
    setError(null)
    setSuccess(null)
    if (isLoading) {
      setIsLoading(false)
    }
  }

  const handleInputChange = (event) => {
    const { name, value } = event.target
    setExamInfo((prev) => ({ ...prev, [name]: value }))
    setIsDirty(true)
  }

  const handleDurationChange = (event) => {
    let value = event.target.value.replace(/[^0-9]/g, ""); // Eliminar cualquier caracter no numérico

    // Asegurar que solo tenga hasta 6 dígitos (HHMMSS)
    if (value.length > 6) {
      value = value.slice(0, 6);
    }

    // Insertar ":" automáticamente cada dos dígitos
    let formatted = value.replace(/(\d{2})(?=\d)/g, "$1:");

    // Si el usuario borra todo, dejar vacío
    if (value.length === 0) {
      formatted = "";
    }

    setExamInfo((prev) => ({ ...prev, duracion: formatted }));
    setIsDirty(true);
  };



  const handleAutocompleteChange = (name, value) => {
    setExamInfo((prev) => ({ ...prev, [name]: value }))
    setIsDirty(true)
  }

  const handleSwitchChange = (event) => {
    setExamInfo((prev) => ({ ...prev, estado: event.target.checked ? "activo" : "borrador" }))
    setIsDirty(true)
  }

  const isExamInfoComplete = useMemo(() => {
    return Object.values(examInfo).every((value) => value !== "")
  }, [examInfo])

  const guardarInformacionExamen = useCallback(
    async (e) => {
      e.preventDefault()
      if (!isExamInfoComplete) {
        setError("Por favor, complete toda la información del examen antes de guardar.")
        return
      }

      setIsLoading(true)
      setLoadingMessage('Guardando examen...')
      try {
        let examen;

        if (newExamInfo.id_examen) {
          // Si ya existe un ID de examen, actualizar con PUT
          examen = await handleUpdateExam(newExamInfo.id_examen, examInfo);
        } else {
          // Si no existe un ID de examen, crear nuevo con POST
          examen = await handleSaveExamInfo(
            examInfo.nombre,
            examInfo.duracion,
            examInfo.carrera,
            examInfo.periodo,
            examInfo.area
          );
        }

        // Si la operación fue exitosa y tenemos un examen válido
        if (examen) {
          setIsExamCreated(true);  // Se marca como creado solo si el examen es válido
          setIsExamInfoEditable(false); // Bloquea la edición después de guardar
          setSuccess("Información del examen guardada exitosamente");
          setIsDirty(false); // Marca que no hay cambios pendientes
        }
      } catch (error) {
        setError(error || "Error al guardar la información del examen")
      } finally {
        setIsLoading(false)
        setLoadingMessage('Cargando...')
      }
    },
    [
      examInfo,
      newExamInfo.id_examen,
      isExamInfoComplete,
      handleUpdateExam,
      handleSaveExamInfo,
      handleLoadExam,
      dispatch,
    ],
  )

  const iniciarNuevaPregunta = () => {
    dispatch(addNewQuestionTemp())
  }

  useEffect(() => {
    if (preguntaNueva) {
      setIsDirty(true)
    }
  }, [preguntaNueva])

  useEffect(() => {
    return () => {
      handleResetCurrentQuestion()
      dispatch(resetCurrentOrder())
      dispatch(resetTotalQuestions())
      dispatch(resetPreguntaNueva())
    }
  }, [handleResetCurrentQuestion, dispatch])

  useEffect(() => {
    return () => {
      dispatch(resetNewExamInfo()); // ✅ Se ejecuta cuando se desmonta el componente
    };
  }, [dispatch]);

  useEffect(() => {
    if (currentOrder && !preguntaNueva && totalQuestions > 0) {
      if (currentOrder > totalQuestions) {
        console.warn("La pregunta seleccionada no existe, actualizando currentOrder...")
        dispatch(setCurrentOrder(totalQuestions > 0 ? totalQuestions : null))
        return
      }

      setTimeout(() => {
        handleLoadQuestion(newExamInfo.id_examen, currentOrder).catch((error) => {
          console.error("Error al cargar la pregunta:", error)
        })
      }, 100)
    }
  }, [currentOrder, examInfo.id_examen, preguntaNueva, totalQuestions, dispatch, handleLoadQuestion])

  const handleQuestionSelect = async (orden) => {
    // if (preguntaNueva && orden === preguntaNueva.orden) return
    try {
      const examId = newExamInfo.id_examen
      if (!examId) throw new Error("No se pudo determinar el ID del examen.")
      const pregunta = await handleLoadQuestion(examId, orden)
      dispatch(setCurrentOrder(orden))
    } catch (error) {
      console.error("Error loading question:", error)
    }
  }

  const toggleExamInfoEdit = () => {
    if (isDirty) {
      Swal.fire({
        title: "¡Cambios sin guardar!",
        text: "Si cambias de pregunta, perderás los cambios no guardados.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Sí, cambiar",
        cancelButtonText: "Cancelar",
        confirmButtonColor: "#d33",
        cancelButtonColor: "#3085d6",
      }).then((result) => {
        if (result.isConfirmed) {
          setIsDirty(false)
          dispatch(setCurrentOrder(null))
          dispatch(setTotalQuestions(totalQuestions - 1))
          dispatch(setPreguntaNueva(null))
          setIsExamInfoEditable(!isExamInfoEditable)
        }
      })
    } else {
      setIsExamInfoEditable(!isExamInfoEditable)
    }
  }

  const eliminarPregunta = async (preguntaId) => {
    Swal.fire({
      title: "¿Estás seguro de eliminar esta pregunta?",
      text: "Esta acción eliminará la pregunta de forma permanente.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
    }).then(async (result) => {
      if (result.isConfirmed) {
        setIsDirty(false)

        if (preguntaId == null || Boolean(preguntaNueva)) {
          setSuccess("Pregunta eliminada correctamente")
          dispatch(resetPreguntaNueva())
          dispatch(setTotalQuestions(Math.max(0, totalQuestions - 1)))
          dispatch(setCurrentOrder(currentOrder - 1))
          return
        }
        
        try {
          await handleDeleteQuestion(preguntaId)
          dispatch(setTotalQuestions(totalQuestions - 1))
          setSuccess("Pregunta eliminada correctamente")
          if (totalQuestions > 1) {
            const newOrder = Math.max(1, currentOrder - 1)
            dispatch(setCurrentOrder(newOrder))
            setTimeout(() => handleQuestionSelect(newOrder), 100)
          } else {
            dispatch(setCurrentOrder(null))
          }
        } catch (error) {
          setError(error)
        }
      }
    })
  }

  const actualizarPregunta = (preguntaId, campo, valor) => {
    if (!currentQuestion) return
    const updatedQuestion = { ...currentQuestion, [campo]: valor }
    handleUpdateQuestion(preguntaId, updatedQuestion)
  }

  const guardarPregunta = async (preguntaId) => {
    if (!currentQuestion) return
    try {
      await handleUpdateQuestion(preguntaId, currentQuestion)
    } catch (error) {
      console.error("Error saving question:", error)
    }
  }

  if (isLoading) return <LoadingSpinner message={loadingMessage} />

  return (
    <Box
      sx={{
        maxWidth: { xs: "100%", sm: "540px", md: "720px", lg: "960px", xl: "1140px" },
        margin: "0 auto",
        p: { xs: 2, sm: 3 },
        pb: { xs: 16, sm: 10 },
      }}
    >
      {/* Back Button */}
      <Button
        variant="outlined"
        startIcon={<ArrowLeft />}
        onClick={() => navigate(-1)}
        sx={{ mb: 3, borderRadius: "8px" }}
      >
        Regresar
      </Button>
      <Typography
        variant="h4"
        component="h1"
        sx={{
          mb: { xs: 2, sm: 4 },
          fontWeight: "bold",
          fontSize: { xs: "1.5rem", sm: "2rem", md: "2.125rem" },
        }}
      >
        Crear Nuevo Examen
      </Typography>

      <Box sx={{ position: "relative", mb: 4 }}>
        <form onSubmit={guardarInformacionExamen}>
          <Stack spacing={3}>
            <TextField
              label="Nombre del Examen"
              fullWidth
              name="nombre"
              value={examInfo.nombre}
              onChange={handleInputChange}
              disabled={!isExamInfoEditable}
              placeholder="Ej: Simulacro EGEL - Bases de datos"
            />

            <Autocomplete
              value={examInfo.periodo}
              onChange={(event, newValue) => handleAutocompleteChange("periodo", newValue)}
              options={generatePeriodOptions()}
              renderInput={(params) => <TextField {...params} label="Periodo" />}
              disabled={!isExamInfoEditable}
            />

            <TextField
              label="Duración (HH:MM:SS)"
              fullWidth
              name="duracion"
              value={examInfo.duracion}
              onChange={handleDurationChange}
              disabled={!isExamInfoEditable}
              placeholder="00:00:00"
              helperText="Formato: HH:MM:SS"
            />

            <Autocomplete
              value={examInfo.carrera}  // El valor se obtiene de user.carrera
              onChange={(event, newValue) => setExamInfo((prev) => ({ ...prev, carrera: newValue }))} // Actualiza solo "carrera"
              options={["Ingeniería de Software", "Medicina", "Licenciatura en Administración", "Enfermería"]}
              disableClearable  // No permite limpiar el campo manualmente
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Carrera"
                  disabled={!isExamInfoEditable}
                  // value={user.carrera}  // Muestra el valor de user.carrera
                  inputProps={{ ...params.inputProps }} // Hace que el campo sea de solo lectura
                />
              )}
            // disabled={true}  // Deshabilita el campo para que no sea editable por el usuario
            />

            <TextField
              label="Área"
              fullWidth
              name="area"
              value={examInfo.area}
              onChange={handleInputChange}
              disabled={!isExamInfoEditable}
              placeholder="Ej: Bases de datos, Bioquímica, Economía"
            />

            <FormControlLabel
              control={
                <Switch
                  checked={examInfo.estado === "activo"}
                  onChange={handleSwitchChange}
                  color="primary"
                  disabled={!isExamInfoEditable}
                />
              }
              label={examInfo.estado === "activo" ? "Activo" : "Borrador"}
            />
          </Stack>

          <Box
            sx={{
              display: "flex",
              justifyContent: "flex-end",
              gap: 2,
              mt: { xs: 1, sm: 2 },
              mb: { xs: 2, sm: 4 },
            }}
          >
            <Button
              variant="outlined"
              color="error"
              onClick={() => setIsExamInfoEditable(false)} // Función para manejar la cancelación
              disabled={isLoading || !isExamInfoEditable || (!currentExam || Object.keys(currentExam).length === 0)}
              sx={{ width: { xs: "100%", sm: "auto" } }}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="contained"
              // disabled={isLoading || !isExamInfoComplete || !isExamInfoEditable}
              disabled={isLoading || !isExamInfoEditable}
              sx={{
                width: { xs: "100%", sm: "auto" },
              }}
            >
              {isExamInfoComplete ? (isExamInfoEditable ? (
                isLoading ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  "Guardar información"
                )
              ) : (
                "Edite con el ícono de arriba"
              )) : "Complete todos los campos"}
            </Button>
          </Box>
        </form>

        {!isExamInfoEditable && (
          <IconButton disabled={isLoading} onClick={toggleExamInfoEdit} sx={{ position: "absolute", top: 0, right: 0 }}>
            <EditIcon />
          </IconButton>
        )}
      </Box>

      {isExamCreated && !isExamInfoEditable && (
        <>
          <QuestionPanel onQuestionSelect={handleQuestionSelect} isDirty={isDirty} setIsDirty={setIsDirty} />
          {preguntaNueva ? (
            <Box>
              <QuestionCard
                key="nueva"
                onDelete={eliminarPregunta}
                onUpdate={(campo, valor) => {
                  dispatch(setPreguntaNueva({ ...preguntaNueva, [campo]: valor }))
                }}
                onSave={async () => {
                  await handleAddNewQuestion(preguntaNueva, examInfo.id_examen, preguntaNueva.orden)
                  dispatch(resetPreguntaNueva())
                  dispatch(setTotalQuestions(totalQuestions + 1))
                }}
                setIsDirty={setIsDirty}
              />
            </Box>
          ) : currentOrder && currentQuestion ? (
            <Box>
              {currentQuestion.id}
              <QuestionCard
                key={currentQuestion.id}
                index={currentOrder - 1}
                onDelete={eliminarPregunta}
                onUpdate={actualizarPregunta}
                onSave={guardarPregunta}
                setIsDirty={setIsDirty}
              />
            </Box>
          ) : (
            <Box>
              <Typography variant="h6">
                {currentOrder ? `Detalles de la Pregunta ${currentOrder}` : "Sin pregunta seleccionada"}
              </Typography>
              <Typography variant="subtitle1" color="textSecondary">
                {currentOrder
                  ? "No hay detalles disponibles para esta pregunta."
                  : "Seleccione una pregunta del panel para ver sus detalles o cree una nueva para continuar."}
              </Typography>
            </Box>
          )}
        </>
      )}

      <FloatingAddButton
        onClick={iniciarNuevaPregunta}
        disabled={!isExamCreated || isExamInfoEditable}
        isDirty={isDirty}
      />

      <Snackbar
        open={Boolean(error || success)}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert onClose={handleCloseSnackbar} severity={error ? "error" : "success"} variant="filled">
          {error
            ? typeof error === "string"
              ? error
              : JSON.stringify(error)
            : typeof success === "string"
              ? success
              : JSON.stringify(success)}
        </Alert>
      </Snackbar>
    </Box>
  )
}

