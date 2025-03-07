import React, { useState, useMemo, useEffect } from "react"
import { useNavigate, useParams } from "react-router-dom"
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
  Chip,
  Snackbar,
  Grid,
} from "@mui/material"
import { useForm, Controller } from "react-hook-form"
import { useExamsStore } from "../../hooks/exams/useExamsStore"
import EditIcon from "@mui/icons-material/Edit"
import { QuestionCard } from "./QuestionCard"
import { FloatingAddButton } from "./FloatingAddButton"
import { useDispatch, useSelector } from "react-redux"
import { addNewQuestionTemp, resetCurrentOrder, resetPreguntaNueva, resetTotalQuestions, setCurrentOrder, setIsLoadingFalse, setPreguntaNueva, setTotalQuestions } from "../../store/exams/examsSlice"
import Swal from "sweetalert2"
import QuestionPanel from "./QuestionPanel"
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

export const ExamEdit = () => {
  const { id } = useParams()
  const {
    handleLoadExam,
    handleUpdateExam,
    handleLoadQuestion,
    currentExam,
    isLoading,
    // error,
    // success,
    handleClearError,
    handleClearSuccess,
    handleLoadQuestionsByExam,
    handleUpdateQuestion,
    handleResetCurrentQuestion,
    handleAddNewQuestion,
    handleDeleteQuestion
  } = useExamsStore()

  const [isInitialLoading, setIsInitialLoading] = useState(true)
  const [isExamInfoEditable, setIsExamInfoEditable] = useState(false)

  const [isDirty, setIsDirty] = useState(false); // Estado para saber si hay cambios sin guardar
  const [prevTotalQuestions, setPrevTotalQuestions] = useState(0); // ✅ Guardar estado previo


  const navigate = useNavigate();




  const dispatch = useDispatch();
  const { error, success, totalQuestions, currentOrder, preguntaNueva, currentQuestion, resetCurrentQuestion } = useSelector((state) => state.exams);

  const handleCloseSnackbar = () => {

    if (error) handleClearError();
    if (success) handleClearSuccess();
    if (isLoading) {
      dispatch(setIsLoadingFalse())
    };
  };


  const { control, handleSubmit, reset, watch } = useForm({
    defaultValues: {
      nombre: "",
      periodo: "",
      duracion: "",
      carrera: "",
      area: "",
      estado: "activo",
    },
  })


  const iniciarNuevaPregunta = () => {
    dispatch(addNewQuestionTemp());
  };


  const examInfo = watch()

  const isExamInfoComplete = useMemo(() => {
    return Object.values(examInfo).every((value) => value !== "")
  }, [examInfo])

  useEffect(() => {
    if (preguntaNueva) {
      setIsDirty(true); // Marca que hay cambios sin guardar
    }
  }, [preguntaNueva]);


  useEffect(() => {
    const loadExam = async () => {
      setIsInitialLoading(true)
      try {
        const exam = await handleLoadExam(id)
        const questionsLength = await handleLoadQuestionsByExam(id)
        reset({
          nombre: exam.nombre || "",
          periodo: exam.periodo || "",
          duracion: exam.duracion || "",
          carrera: exam.carrera || "",
          area: exam.area || "",
          estado: exam.estado || "activo",
        })
        dispatch(setTotalQuestions(questionsLength.length || 0))
        // Removemos la carga automática de la primera pregunta
        // Si hay una pregunta seleccionada, asegurarnos de que se mantenga
        if (currentOrder) {
          await handleLoadQuestion(id, currentOrder)
        }
      } catch (error) {
        console.error("Error loading exam:", error)
      } finally {
        setIsInitialLoading(false)
        setIsExamInfoEditable(false)
      }
    }

    if (id) {
      loadExam()
    }
  }, [id, handleLoadExam, handleLoadQuestionsByExam, reset])

  useEffect(() => {
    return () => {
      handleResetCurrentQuestion()
      dispatch(resetCurrentOrder())
      dispatch(resetTotalQuestions())
      dispatch(resetPreguntaNueva())
    }
  }, [handleResetCurrentQuestion])

  useEffect(() => {
    if (currentOrder && !preguntaNueva && totalQuestions > 0) {
      // ✅ Verificamos que `currentOrder` no apunte a una pregunta eliminada
      if (currentOrder > totalQuestions) {
        console.warn("La pregunta seleccionada no existe, actualizando currentOrder...");
        dispatch(setCurrentOrder(totalQuestions > 0 ? totalQuestions : null)); // 🔹 Si no hay preguntas, currentOrder debe ser null
        return;
      }

      // ✅ Si todo está bien, cargar la pregunta con un delay para evitar errores de estado
      setTimeout(() => {
        handleLoadQuestion(id, currentOrder).catch((error) => {
          console.error("Error al cargar la pregunta:", error);
        });
      }, 100);
    }
  }, [currentOrder, id, preguntaNueva, totalQuestions]);


  const handleQuestionSelect = async (orden) => {
    if (preguntaNueva && orden === preguntaNueva.orden) return; // Evita sobrescribir la nueva pregunta
    try {
      const pregunta = await handleLoadQuestion(id, orden)
      dispatch(setCurrentOrder(orden))
    } catch (error) {
      console.error("Error loading question:", error)
    }
  }

  const formatDuration = (value) => {
    let cleanValue = value.replace(/[^0-9]/g, "") // Remove non-digit characters

    // Ensure only up to 6 digits (HHMMSS)
    if (cleanValue.length > 6) {
      cleanValue = cleanValue.slice(0, 6)
    }

    // Automatically insert ":" after every two digits
    let formatted = cleanValue.replace(/(\d{2})(?=\d)/g, "$1:")

    // If the user deletes everything, leave it empty
    if (cleanValue.length === 0) {
      formatted = ""
    }

    return formatted
  }

  const onSubmit = async (data) => {
    if (!isExamInfoComplete) return
    console.log(data);

    try {
      await handleUpdateExam(id, data)
      setIsExamInfoEditable(false)
      if (currentOrder) {
        await handleLoadQuestion(id, currentOrder) // Recargar la pregunta actual después de guardar el examen
      }
    } catch (error) {
      console.error(error)
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
          setIsDirty(false);
          dispatch(setCurrentOrder(null))
          dispatch(setTotalQuestions(totalQuestions - 1))
          dispatch(setPreguntaNueva(null))
          setIsExamInfoEditable(!isExamInfoEditable)
        }
      });
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
    }).then((result) => {
      if (result.isConfirmed) {
        setIsDirty(false);

        if (!preguntaId || preguntaNueva) {
          // 🔹 Si es una pregunta nueva, solo la eliminamos de Redux
          dispatch(resetPreguntaNueva());
          dispatch(setTotalQuestions(Math.max(0, totalQuestions - 1)));
          dispatch(setCurrentOrder(currentOrder - 1)); // ✅ Evita que el `useEffect` cargue una pregunta eliminada
          return;
        }

        try {
          // 🔹 Si la pregunta tiene ID, la eliminamos del backend
          dispatch(setTotalQuestions(totalQuestions - 1));
          handleDeleteQuestion(preguntaId);

          if (totalQuestions > 1) {
            const newOrder = Math.max(1, currentOrder - 1);
            dispatch(setCurrentOrder(newOrder));
            setTimeout(() => handleQuestionSelect(newOrder), 100); // 🔹 Retrasar la selección para evitar errores
          } else {
            dispatch(setCurrentOrder(null));
          }
        } catch (error) {
          console.error("Error deleting question:", error);
        }
      }
    });
  };

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


  if (isInitialLoading) return <LoadingSpinner />
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
        {id ? "Editar Examen" : "Crear Nuevo Examen"}
      </Typography>

      <Box sx={{ position: "relative", mb: 4 }}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Stack spacing={3}>
            <Controller
              name="nombre"
              control={control}
              rules={{ required: true }}
              render={({ field }) => (
                <TextField
                  label="Nombre del Examen"
                  fullWidth {...field}
                  disabled={!isExamInfoEditable}
                  placeholder="Ej: Simulacro EGEL - Bases de datos"
                />
              )}

            />

            <Controller
              name="periodo"
              control={control}
              rules={{ required: true }}
              render={({ field: { onChange, value } }) => (
                <Autocomplete
                  value={value}
                  onChange={(event, newValue) => {
                    onChange(newValue)
                  }}
                  options={generatePeriodOptions()}
                  renderInput={(params) => <TextField {...params} label="Periodo" />}
                  disabled={!isExamInfoEditable}
                />
              )}
            />

            <Controller
              name="duracion"
              control={control}
              rules={{ required: true, pattern: /^([0-1][0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/ }}
              render={({ field: { onChange, value }, fieldState: { error } }) => (
                <TextField
                  label="Duración"
                  fullWidth
                  value={value}
                  onChange={(e) => onChange(formatDuration(e.target.value))}
                  disabled={!isExamInfoEditable}
                  placeholder="00:00:00"
                  helperText={error ? "Formato inválido. Use HH:MM:SS" : "Formato: HH:MM:SS"}
                  error={!!error}
                />
              )}
            />

            <Controller
              name="carrera"
              control={control}
              rules={{ required: true }}
              render={({ field: { onChange, value } }) => (
                <Autocomplete
                  value={value}
                  onChange={(event, newValue) => {
                    onChange(newValue)
                  }}
                  options={["Ingeniería de Software", "Medicina", "Licenciatura en Administración", "Enfermería"]}
                  disableClearable // No permite limpiar el campo manualmente
                  renderInput={(params) => <TextField {...params} label="Carrera" inputProps={{ ...params.inputProps, readOnly: true }} />}
                  disabled={!isExamInfoEditable}
                />
              )}
            />

            <Controller
              name="area"
              control={control}
              render={({ field }) =>
                <TextField
                  label="Área"
                  fullWidth {...field}
                  disabled={!isExamInfoEditable}
                  placeholder="Ej: Bases de datos, Bioquímica, Economía"
                />}
            />

            <Controller
              name="estado"
              control={control}
              render={({ field: { onChange, value } }) => (
                <FormControlLabel
                  control={
                    <Switch
                      checked={value === "activo"}
                      onChange={(e) => onChange(e.target.checked ? "activo" : "borrador")}
                      color="primary"
                      disabled={!isExamInfoEditable}
                    />
                  }
                  label={value === "activo" ? "Activo" : "Borrador"}
                />
              )}
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
              disabled={isLoading || !isExamInfoComplete || !isExamInfoEditable}
              sx={{ width: { xs: "100%", sm: "auto" } }}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={isLoading || !isExamInfoComplete || !isExamInfoEditable}
              sx={{
                width: { xs: "100%", sm: "auto" },
              }}
            >
              {isExamInfoEditable ? (isLoading ? <CircularProgress size={24} color="inherit" /> : "Guardar información") : "Edite con el ícono de arriba"}
            </Button>
          </Box>
        </form>

        {!isExamInfoEditable && (
          <IconButton onClick={toggleExamInfoEdit} sx={{ position: "absolute", top: 0, right: 0 }}>
            <EditIcon />
          </IconButton>
        )}
      </Box>

      {!isExamInfoEditable && (
        <>
          <QuestionPanel
            onQuestionSelect={handleQuestionSelect}
            isDirty={isDirty}
            setIsDirty={setIsDirty}
          />
          {preguntaNueva ? (
            <Box>
              <QuestionCard
                key="nueva"
                // onDelete={() => {
                //   dispatch(resetPreguntaNueva()); // 🔹 Limpiar pregunta nueva en Redux
                // }}
                onDelete={eliminarPregunta}
                onUpdate={(campo, valor) => {
                  dispatch(setPreguntaNueva({ ...preguntaNueva, [campo]: valor })); // 🔹 Actualizar Redux
                }}
                onSave={async () => {
                  await handleAddNewQuestion(preguntaNueva, currentExam.id, preguntaNueva.orden);
                  dispatch(resetPreguntaNueva()); // 🔹 Limpiar pregunta nueva después de guardar
                  dispatch(setTotalQuestions(totalQuestions + 1)); // 🔹 Actualizar total de preguntas
                }}
                setIsDirty={setIsDirty}
              />
            </Box>
          ) : currentOrder && currentQuestion ? (
            <Box>
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

      <FloatingAddButton onClick={iniciarNuevaPregunta} disabled={isExamInfoEditable} isDirty={isDirty} />

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
