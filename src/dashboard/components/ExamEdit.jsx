import React, { useState, useMemo, useEffect } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { Box, Typography, TextField, Button, Stack, CircularProgress, Alert, FormControlLabel, Switch, Autocomplete, IconButton, Chip, Snackbar, Grid, } from "@mui/material"
import { useForm, Controller } from "react-hook-form"
import { useExamsStore } from "../../hooks/exams/useExamsStore"
import { useDispatch, useSelector } from "react-redux"
import { addNewQuestionTemp, resetCurrentOrder, resetPreguntaNueva, resetTotalQuestions, setCurrentOrder, setIsLoadingFalse, setPreguntaNueva, setTotalQuestions, resetCurrentExam } from "../../store/exams/examsSlice"
import Swal from "sweetalert2"
import EditIcon from "@mui/icons-material/Edit"
import { ArrowLeft } from "lucide-react"
import { QuestionCard } from "./QuestionCard"
import { FloatingAddButton } from "./FloatingAddButton"
import QuestionPanel from "./QuestionPanel"
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
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Estados del store
  const { handleLoadExam, handleUpdateExam, handleLoadQuestion, handleClearError, handleClearSuccess, handleLoadQuestionsByExam, handleUpdateQuestion, handleResetCurrentQuestion, handleAddNewQuestion, handleDeleteQuestion, currentExam, isLoading } = useExamsStore();

  const { error, success, totalQuestions, currentOrder, preguntaNueva, currentQuestion } = useSelector(state => state.exams);

  // Estados locales
  const [isInitialLoading, setIsInitialLoading] = useState(true); // Carga inicial
  const [isExamInfoEditable, setIsExamInfoEditable] = useState(false); // Permite editar la info del examen
  const [localError, setLocalError] = useState(""); // Error local
  const [localSuccess, setLocalSuccess] = useState(""); // Éxito local
  const [isDirty, setIsDirty] = useState(false); // Indica si hay cambios sin guardar
  const [hasCorrectOption, setHasCorrectOption] = useState(false); // Verifica si hay una opción correcta en la pregunta

  // useForm para manejar los datos del examen
  const { control, handleSubmit, reset, watch } = useForm({
    defaultValues: {
      nombre: "",
      periodo: "",
      duracion: "",
      carrera: "",
      area: "",
      estado: "activo",
    },
  });

  // Observar cambios en la información del examen
  const examInfo = watch();

  // Verifica si todos los campos del examen están completos
  const isExamInfoComplete = useMemo(() => {
    return Object.values(examInfo).every(value => value !== "");
  }, [examInfo]);

  // Manejo de alertas y estado de carga
  const handleCloseSnackbar = () => {
    if (error) handleClearError();
    if (success) handleClearSuccess();
    if (localError) setLocalError("");
    if (localSuccess) setLocalSuccess("");
    if (isLoading) {
      dispatch(setIsLoadingFalse());
    }
  };

  // Agrega una nueva pregunta temporal
  const iniciarNuevaPregunta = () => {
    dispatch(addNewQuestionTemp());
  };

  // Marca que hay cambios sin guardar si se detecta una nueva pregunta
  useEffect(() => {
    if (preguntaNueva) {
      setIsDirty(true);
    }
  }, [preguntaNueva]);

  // Carga inicial del examen y sus preguntas
  useEffect(() => {
    const loadExam = async () => {
      setIsInitialLoading(true);
      try {
        // Carga la información del examen
        const exam = await handleLoadExam(id);
        const questionsLength = await handleLoadQuestionsByExam(id);

        // Establece los valores en el formulario
        reset({
          nombre: exam.nombre || "",
          periodo: exam.periodo || "",
          duracion: exam.duracion || "",
          carrera: exam.carrera || "",
          area: exam.area || "",
          estado: exam.estado || "activo",
        });

        // Actualiza la cantidad total de preguntas
        dispatch(setTotalQuestions(questionsLength.length || 0));

        // Carga la pregunta actual si hay una seleccionada
        if (currentOrder) {
          await handleLoadQuestion(id, currentOrder);
        }
      } catch (error) {
        console.error("Error loading exam:", error);

        // Manejo de error si el examen no existe
        if (error?.response?.status === 404) {
          Swal.fire({
            title: "Examen no encontrado",
            text: "El examen que intentas acceder no existe o ha sido eliminado.",
            icon: "error",
            confirmButtonText: "Volver",
            confirmButtonColor: "#d33",
          }).then(() => {
            navigate(-1);
          });
        }
      } finally {
        setIsInitialLoading(false);
        setIsExamInfoEditable(false);
      }
    };

    if (id) {
      loadExam();
    }
  }, [id, handleLoadExam, handleLoadQuestionsByExam, reset]);

  // Cleanup: Reinicia los estados cuando el componente se desmonta
  useEffect(() => {
    return () => {
      handleResetCurrentQuestion(); // Reinicia la pregunta actual
      dispatch(resetCurrentOrder()); // Reinicia el número de orden de la pregunta
      dispatch(resetTotalQuestions()); // Reinicia el total de preguntas
      dispatch(resetPreguntaNueva()); // Reinicia el estado de nueva pregunta
      dispatch(resetCurrentExam()); // Reinicia el examen actual
    };
  }, [handleResetCurrentQuestion]);

  // Verifica si la pregunta actual tiene al menos una opción marcada como correcta
  useEffect(() => {
    if (!currentQuestion || !currentQuestion.opcion || currentQuestion.opcion.length === 0) {
      setHasCorrectOption(false);
      return;
    }

    const correctOptionExists = currentQuestion.opcion.some(opcion => opcion.es_correcta);
    setHasCorrectOption(correctOptionExists);
  }, [currentQuestion]);

  // Manejo de `currentOrder`: Evita que apunte a una pregunta eliminada y carga la pregunta con un pequeño delay
  useEffect(() => {
    if (currentOrder && !preguntaNueva && totalQuestions > 0) {
      // Si `currentOrder` apunta a una pregunta inexistente, lo ajustamos
      if (currentOrder > totalQuestions) {
        console.warn("La pregunta seleccionada no existe, actualizando currentOrder...");
        dispatch(setCurrentOrder(totalQuestions > 0 ? totalQuestions : null));
        return;
      }

      // Cargar la pregunta con un delay para evitar errores de estado
      setTimeout(() => {
        handleLoadQuestion(id, currentOrder).catch(error => {
          console.error("Error al cargar la pregunta:", error);
        });
      }, 100);
    }
  }, [currentOrder, id, preguntaNueva, totalQuestions]);


  //Seleccion de pregunta por orden
  const handleQuestionSelect = async (orden) => {
    try {
      const pregunta = await handleLoadQuestion(id, orden)
      dispatch(setCurrentOrder(orden))
    } catch (error) {
      console.error("Error loading question:", error)
    }
  }

  const formatDuration = (value) => {
    let cleanValue = value.replace(/[^0-9]/g, ""); // Elimina caracteres no numéricos
  
    // Asegura que solo haya hasta 6 dígitos (HHMMSS)
    if (cleanValue.length > 6) {
      cleanValue = cleanValue.slice(0, 6);
    }
  
    // Inserta ":" automáticamente cada dos dígitos
    let formatted = cleanValue.replace(/(\d{2})(?=\d)/g, "$1:");
  
    // Si el usuario borra todo, deja vacío
    return cleanValue.length === 0 ? "" : formatted;
  };
  

  const onSubmit = async (data) => {
    try {
      await handleUpdateExam(id, data);
      setIsExamInfoEditable(false);
      
      // Recargar la pregunta actual si existe
      if (currentOrder) {
        await handleLoadQuestion(id, currentOrder);
      }
  
      setLocalSuccess("Examen actualizado correctamente");
    } catch (error) {
      if (error?.status === 404) {
        Swal.fire({
          title: "Examen no encontrado",
          text: "El examen que intentas acceder no existe o ha sido eliminado.",
          icon: "error",
          confirmButtonText: "Volver",
          confirmButtonColor: "#d33",
        }).then(() => navigate(-1));
      }
    }
  };
  

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
    }).then(async (result) => {
      if (result.isConfirmed) {
        setIsDirty(false);

        if (preguntaId == null || Boolean(preguntaNueva)) {
          // 🔹 Si es una pregunta nueva, solo la eliminamos de Redux
          setLocalSuccess("Pregunta eliminada correctamente")
          dispatch(resetPreguntaNueva());
          dispatch(setTotalQuestions(Math.max(0, totalQuestions - 1)));
          dispatch(setCurrentOrder(currentOrder - 1)); // ✅ Evita que el `useEffect` cargue una pregunta eliminada
          return;
        }

        try {
          // 🔹 Si la pregunta tiene ID, la eliminamos del backend
          await handleDeleteQuestion(preguntaId);
          dispatch(setTotalQuestions(totalQuestions - 1));
          setLocalSuccess("Pregunta eliminada correctamente")
          if (totalQuestions > 1) {
            const newOrder = Math.max(1, currentOrder - 1);
            dispatch(setCurrentOrder(newOrder));
            setTimeout(() => handleQuestionSelect(newOrder), 100); // 🔹 Retrasar la selección para evitar errores
          } else {
            dispatch(setCurrentOrder(null));
          }
        } catch (error) {
          setLocalError(error)
        }
      }
    });
  };

  const actualizarPregunta = (preguntaId, campo, valor) => {
    if (!currentQuestion) return
    const updatedQuestion = { ...currentQuestion, [campo]: valor }
    handleUpdateQuestion(preguntaId, updatedQuestion)
    setLocalSuccess("Pregunta actualizada correctamente")
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
              rules={{ pattern: /^([0-1][0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/ }}
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
              // disabled={isLoading || !isExamInfoComplete || !isExamInfoEditable}
              disabled={isLoading || !isExamInfoEditable}
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
            hasCorrectOption={hasCorrectOption}
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
        open={Boolean(error || success || localError || localSuccess)}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={(error || localError) ? 'error' : 'success'}
          variant="filled"
        >
          {(error || localError) ? (typeof error === 'string' ? (error || localError) : JSON.stringify((error || localError))) :
            (typeof success === 'string' ? (success || localSuccess) : JSON.stringify((success || localSuccess)))}
        </Alert>
      </Snackbar>
    </Box>
  )
}
