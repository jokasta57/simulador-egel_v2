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
import { setIsLoadingFalse } from "../../store/exams/examsSlice"
import Swal from "sweetalert2"
import QuestionPanel from "./QuestionPanel"

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
  const { exams, currentQuestion, resetCurrentQuestion } = useSelector((state) => state.exams)
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
    handleAddNewQuestion
  } = useExamsStore()

  const [isInitialLoading, setIsInitialLoading] = useState(true)
  const [isExamInfoEditable, setIsExamInfoEditable] = useState(false)
  const [totalQuestions, setTotalQuestions] = useState(0)
  const [currentOrder, setCurrentOrder] = useState(null)
  const [preguntaNueva, setPreguntaNueva] = useState(null);
  const [isDirty, setIsDirty] = useState(false); // Estado para saber si hay cambios sin guardar
  const [prevTotalQuestions, setPrevTotalQuestions] = useState(0); // ✅ Guardar estado previo


  const navigate = useNavigate();




  const dispatch = useDispatch();
  const { error, success } = useSelector((state) => state.exams);

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
    setPreguntaNueva({
      id_examen: id,
      contenido: "",
      imagen_url: null,
      opcion: [
        { contenido: "", imagen_url: null },
        { contenido: "", imagen_url: null },
      ],
      es_correcta: 0,
      orden: totalQuestions + 1,
    });
    setTotalQuestions((prev) => prev + 1); // ✅ Actualiza visualmente el panel
    setIsDirty(true);
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
        setTotalQuestions(questionsLength.length || 0)
        // Removemos la carga automática de la primera pregunta
        // Si hay una pregunta seleccionada, asegurarnos de que se mantenga
        setPrevTotalQuestions(questionsLength.length || 0); // ✅ Guardamos el número original
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
    }
  }, [handleResetCurrentQuestion])

  useEffect(() => {
    if (currentOrder) {
      handleLoadQuestion(id, currentOrder)
    }
  }, [currentOrder, id])


  const handleQuestionSelect = async (orden) => {
    if (preguntaNueva && orden === preguntaNueva.orden) return; // Evita sobrescribir la nueva pregunta
    try {
      const pregunta = await handleLoadQuestion(id, orden)
      setCurrentOrder(orden)
    } catch (error) {
      console.error("Error loading question:", error)
    }
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
    setIsExamInfoEditable(!isExamInfoEditable)
  }

  const agregarPregunta = async () => {
    const newOrder = totalQuestions + 1
    const newQuestion = {
      id_examen: id,
      contenido: "",
      imagen_url: null,
      opciones: [
        { contenido: "", imagen_url: null },
        { contenido: "", imagen_url: null },
      ],
      es_correcta: 0,
      orden: newOrder,
    }

    try {
      const preguntaGuardada = await handleAddNewQuestion(newQuestion, id, newOrder);

      setTotalQuestions(newOrder);
      setCurrentOrder(newOrder);
    } catch (error) {
      console.error("Error al agregar la pregunta:", error);
    }
  }

  const eliminarPregunta = async (preguntaId) => {
    try {
      const updatedQuestions = currentExam.preguntas.filter((p) => p.id !== preguntaId)
      await handleUpdateExam(id, {
        ...currentExam,
        total_preguntas: totalQuestions - 1,
        preguntas: updatedQuestions,
      })
      setTotalQuestions((prev) => prev - 1)

      if (currentOrder > 1) {
        await handleQuestionSelect(currentOrder - 1)
      } else if (totalQuestions > 1) {
        await handleQuestionSelect(1)
      } else {
        setCurrentOrder(null)
      }
    } catch (error) {
      console.error("Error deleting question:", error)
    }
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


  if (isInitialLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
        <CircularProgress />
      </Box>
    )
  }

  return (
    <Box
      sx={{
        maxWidth: { xs: "100%", sm: "540px", md: "720px", lg: "960px", xl: "1140px" },
        margin: "0 auto",
        p: { xs: 2, sm: 3 },
        pb: { xs: 16, sm: 10 },
      }}
    >
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
                <TextField label="Nombre del Examen" fullWidth {...field} disabled={!isExamInfoEditable} />
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
              rules={{ required: true }}
              render={({ field }) => (
                <TextField label="Duración (HH:MM:SS)" fullWidth {...field} disabled={!isExamInfoEditable} />
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
                  options={["Ingeniería en Software", "Medicina", "Licenciatura en Administración", "Enfermería"]}
                  renderInput={(params) => <TextField {...params} label="Carrera" />}
                  disabled={!isExamInfoEditable}
                />
              )}
            />

            <Controller
              name="area"
              control={control}
              render={({ field }) => <TextField label="Área" fullWidth {...field} disabled={!isExamInfoEditable} />}
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
              mt: { xs: 1, sm: 2 },
              mb: { xs: 2, sm: 4 },
            }}
          >
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
            totalQuestions={totalQuestions} // ✅ Muestra la nueva pregunta en el panel
            prevTotalQuestions={prevTotalQuestions}
            setTotalQuestions={setTotalQuestions} // ✅ Muestra la nueva pregunta en el panel
            currentOrder={preguntaNueva ? preguntaNueva.orden : currentOrder}
            onQuestionSelect={handleQuestionSelect}
            isDirty={isDirty}
            setIsDirty={setIsDirty}
          />
          {preguntaNueva ? (
            <Box>
              <QuestionCard
                key="nueva"
                index={totalQuestions} // Se muestra como la última pregunta
                preguntaNueva={preguntaNueva}
                onDelete={() => {
                  setPreguntaNueva(null);
                  setTotalQuestions(prevTotalQuestions); // ✅ Volvemos al número original
                }} // Si el usuario cancela, se oculta
                onUpdate={(campo, valor) =>
                  setPreguntaNueva((prev) => ({ ...prev, [campo]: valor }))
                }
                onSave={async () => {
                  await handleAddNewQuestion(preguntaNueva, id, preguntaNueva.orden);
                  setPreguntaNueva(null);
                  setPrevTotalQuestions(totalQuestions); // ✅ Guardamos el nuevo estado
                }}
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

      <FloatingAddButton onClick={iniciarNuevaPregunta} disabled={isExamInfoEditable} />

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
