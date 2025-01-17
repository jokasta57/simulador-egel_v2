"use client"

import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Button,
  Stack,
  useTheme,
  Snackbar,
  Alert,
  CircularProgress,
  Pagination,
} from '@mui/material';
import { saveExam, saveQuestion, loadSavedExam } from '../../actions/examActions';
import {ExamInfo} from './ExamInfo';
import {QuestionCard} from './QuestionCard';
import {FloatingAddButton} from './FloatingAddButton';
import { useCreateExamStore } from '../../hooks/useCreateExamStore';

export const CreateExam = () => {
  const theme = useTheme();
  const [examInfo, setExamInfo] = useState({
    titulo: '',
    duracion: '',
    carrera: '',
    periodo: '',
  });

  const { handleSaveExamInfo } = useCreateExamStore();

  const [preguntas, setPreguntas] = useState([]);
  const [preguntasGuardadas, setPreguntasGuardadas] = useState({});
  const lastQuestionRef = useRef(null);
  const scrollToQuestionRef = useRef(null);
  const [shouldScroll, setShouldScroll] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const [isExamInfoSaved, setIsExamInfoSaved] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const questionsPerPage = 10;

  const handleExamInfoChange = (newExamInfo) => {
    setExamInfo(newExamInfo);
    setIsExamInfoSaved(false);
  };

  const isExamInfoComplete = () => {
    return (
      examInfo.titulo.trim() !== '' &&
      examInfo.duracion.toString().trim() !== '' &&
      examInfo.carrera !== '' &&
      examInfo.periodo !== ''
    );
  };

  const guardarInformacionExamen = async () => {
    if (!isExamInfoComplete()) {
      setError('Por favor, complete toda la información del examen antes de guardar.');
      return;
    }

    setIsLoading(true);
    try {
      console.log(examInfo.titulo);
      // Aquí iría la lógica para guardar la información del examen en el backend
      await handleSaveExamInfo(examInfo.titulo, examInfo.duracion, examInfo.carrera, examInfo.periodo)
      // Por ahora, simularemos una operación asíncrona
      await new Promise(resolve => setTimeout(resolve, 1000));
      setIsExamInfoSaved(true);
      setSuccess('Información del examen guardada exitosamente');
      setLastSaved(new Date());
    } catch (error) {
      console.log(error);
      setError('Error al guardar la información del examen');
    } finally {
      setIsLoading(false);
    }
  };

  const agregarPregunta = () => {
    if (!isExamInfoSaved) {
      setError('Por favor, guarde la información del examen antes de agregar preguntas.');
      return;
    }

    const preguntasSinGuardar = preguntas.filter(p => !preguntasGuardadas[p.id]);
    if (preguntasSinGuardar.length > 0) {
      const preguntaIndex = preguntas.indexOf(preguntasSinGuardar[0]) + 1;
      setError(`Por favor, guarde la pregunta ${preguntaIndex} antes de agregar una nueva.`);
      return;
    }

    const nuevaPregunta = {
      id: Date.now(),
      pregunta: '',
      imagen: null,
      opciones: Array(4).fill('').map(() => ({ texto: '', imagen: null, es_correcta: false })),
      respuestaCorrecta: 0
    };
    setPreguntas(prev => [...prev, nuevaPregunta]);
    setShouldScroll(true);
    setCurrentPage(Math.ceil((preguntas.length + 1) / questionsPerPage));
  };

  const eliminarPregunta = (preguntaId) => {
    const index = preguntas.findIndex(p => p.id === preguntaId);
    setPreguntas(prev => {
      const newPreguntas = prev.filter(p => p.id !== preguntaId);
      if (newPreguntas.length > 0) {
        if (index > 0) {
          scrollToQuestionRef.current = newPreguntas[index - 1].id;
        } else {
          scrollToQuestionRef.current = newPreguntas[0].id;
        }
      } else {
        scrollToQuestionRef.current = null;
      }
      return newPreguntas;
    });
    setPreguntasGuardadas(prev => {
      const newPreguntasGuardadas = { ...prev };
      delete newPreguntasGuardadas[preguntaId];
      return newPreguntasGuardadas;
    });
    setShouldScroll(true);
    setCurrentPage(Math.ceil(preguntas.length / questionsPerPage));
  };

  const actualizarPregunta = useCallback((preguntaId, campo, valor) => {
    console.log(`actualizarPregunta: updating pregunta ${preguntaId}, campo ${campo}, valor ${valor}`);
    setPreguntas(prev => prev.map(p => (
      p.id === preguntaId ? { ...p, [campo]: valor } : p
    )));
    setPreguntasGuardadas(prev => ({ ...prev, [preguntaId]: false }));
  }, []);

  const guardarPregunta = (preguntaId) => {
    const pregunta = preguntas.find(p => p.id === preguntaId);
    if (pregunta) {
      setIsSaving(true);
      saveQuestion(pregunta).then(() => {
        setIsSaving(false);
        setLastSaved(new Date());
        setPreguntasGuardadas(prev => ({ ...prev, [preguntaId]: true }));
      }).catch(error => {
        console.error('Error al guardar la pregunta:', error);
        setIsSaving(false);
      });
    }
  };

  const validarExamen = () => {
    let errores = [];

    if (!examInfo.titulo.trim()) errores.push("El título del examen es obligatorio");
    if (!examInfo.duracion) errores.push("La duración del examen es obligatoria");
    if (!examInfo.carrera) errores.push("Debe seleccionar una carrera");
    if (!examInfo.periodo) errores.push("Debe seleccionar un periodo");

    const preguntasValidadas = preguntas.map(pregunta => {
      const opcionesValidas = pregunta.opciones.filter(opcion => opcion.texto.trim() !== '' || opcion.imagen);
      return { ...pregunta, opciones: opcionesValidas };
    });

    preguntasValidadas.forEach((pregunta, index) => {
      if (!pregunta.pregunta.trim()) {
        errores.push(`La pregunta ${index + 1} está vacía`);
      }

      if (pregunta.opciones.length < 2) {
        errores.push(`La pregunta ${index + 1} debe tener al menos 2 opciones válidas`);
      }

      const opcionesUnicas = new Set(pregunta.opciones.map(opcion => 
        opcion.texto.trim().toLowerCase() + (opcion.imagen ? opcion.imagen : '')
      ));
      if (opcionesUnicas.size !== pregunta.opciones.length) {
        errores.push(`La pregunta ${index + 1} tiene opciones repetidas`);
      }
    });

    return { errores, preguntasValidadas };
  };

  const guardarExamen = async () => {
    const { errores, preguntasValidadas } = validarExamen();
    if (errores.length > 0) {
      setError(errores.join('. '));
    } else {
      setIsLoading(true);
      const examenParaGuardar = { ...examInfo, preguntas: preguntasValidadas };
      try {
        const result = await saveExam(examenParaGuardar);
        if (result.success) {
          setSuccess('Examen guardado exitosamente');
        } else {
          setError(result.message);
        }
      } catch (error) {
        setError('Error al guardar el examen');
      } finally {
        setIsLoading(false);
      }
    }
  };

  useEffect(() => {
    const cargarExamenGuardado = async () => {
      const savedExam = await loadSavedExam();
      if (savedExam) {
        setExamInfo(savedExam.info);
        setPreguntas(savedExam.preguntas);
        const guardadas = {};
        savedExam.preguntas.forEach(p => {
          guardadas[p.id] = true;
        });
        setPreguntasGuardadas(guardadas);
        setIsExamInfoSaved(true);
      }
    };
    cargarExamenGuardado();
  }, []);

  useEffect(() => {
    if (shouldScroll) {
      if (scrollToQuestionRef.current) {
        const element = document.getElementById(`pregunta-${scrollToQuestionRef.current}`);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      } else if (lastQuestionRef.current) {
        lastQuestionRef.current.scrollIntoView({ behavior: 'smooth' });
      }
      setShouldScroll(false);
      scrollToQuestionRef.current = null;
    }
  }, [shouldScroll, preguntas]);

  const canAddQuestion = isExamInfoSaved && (Object.values(preguntasGuardadas).every(Boolean) && preguntas.length > 0 ? preguntas.length === Object.keys(preguntasGuardadas).length : true);

  // Pagination logic
  const indexOfLastQuestion = currentPage * questionsPerPage;
  const indexOfFirstQuestion = indexOfLastQuestion - questionsPerPage;
  const currentQuestions = preguntas.slice(indexOfFirstQuestion, indexOfLastQuestion);

  const handleChangePage = (event, value) => {
    setCurrentPage(value);
  };

  return (
    <Box sx={{ 
      maxWidth: { xs: '100%', sm: '540px', md: '720px', lg: '960px', xl: '1140px' },
      margin: '0 auto', 
      p: { xs: 2, sm: 3 },
      pb: { xs: 16, sm: 10 } // Increased bottom padding on mobile
    }}>
      <Typography 
        variant="h4" 
        component="h1" 
        sx={{ 
          mb: { xs: 2, sm: 4 }, 
          fontWeight: 'bold',
          fontSize: { xs: '1.5rem', sm: '2rem', md: '2.125rem' }
        }}
      >
        Crear Nuevo Examen
      </Typography>

      <ExamInfo examInfo={examInfo} onExamInfoChange={handleExamInfoChange} />

      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'flex-end', 
        mt: { xs: 1, sm: 2 }, 
        mb: { xs: 2, sm: 4 }
      }}>
        <Button
          variant="contained"
          onClick={guardarInformacionExamen}
          disabled={isLoading || !isExamInfoComplete()}
          sx={{
            bgcolor: isExamInfoSaved ? theme.palette.success.main : theme.palette.primary.main,
            '&:hover': {
              bgcolor: isExamInfoSaved ? theme.palette.success.dark : theme.palette.primary.dark,
            },
            width: { xs: '100%', sm: 'auto' }
          }}
        >
          {isLoading ? (
            <CircularProgress size={24} color="inherit" />
          ) : isExamInfoSaved ? (
            'Información guardada'
          ) : isExamInfoComplete() ? (
            'Continuar'
          ) : (
            'Debe completar la información'
          )}
        </Button>
      </Box>

      <Box sx={{ mb: { xs: 2, sm: 3 } }}>
        <Typography variant="h6" sx={{ mb: { xs: 0.5, sm: 1 }, fontSize: { xs: '1.1rem', sm: '1.25rem' } }}>
          Preguntas del Examen
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
          Total de preguntas: {preguntas.length}
        </Typography>
      </Box>

      <Stack spacing={{ xs: 2, sm: 3 }}>
        {currentQuestions.map((pregunta, index) => (
          <QuestionCard
            key={pregunta.id}
            pregunta={pregunta}
            index={indexOfFirstQuestion + index}
            onDelete={eliminarPregunta}
            onUpdate={actualizarPregunta}
            onSave={guardarPregunta}
            isSaved={preguntasGuardadas[pregunta.id]}
            ref={index === currentQuestions.length - 1 ? lastQuestionRef : null}
          />
        ))}
      </Stack>

      {preguntas.length > questionsPerPage && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <Pagination
            count={Math.ceil(preguntas.length / questionsPerPage)}
            page={currentPage}
            onChange={handleChangePage}
            color="primary"
          />
        </Box>
      )}

      <FloatingAddButton onClick={agregarPregunta} disabled={!canAddQuestion} />

      {preguntas.length > 0 && (
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: { xs: 3, sm: 4 } }}>
          <Button
            variant="contained"
            size="large"
            onClick={guardarExamen}
            disabled={isLoading}
            sx={{
              bgcolor: theme.palette.primary.main,
              '&:hover': {
                bgcolor: theme.palette.primary.dark,
              },
              width: { xs: '100%', sm: 'auto' }
            }}
          >
            {isLoading ? <CircularProgress size={24} color="inherit" /> : 'Guardar Examen'}
          </Button>
        </Box>
      )}

      <Snackbar
        open={error !== null || success !== null}
        autoHideDuration={5000}
        onClose={() => {
          setError(null);
          setSuccess(null);
        }}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => {
            setError(null);
            setSuccess(null);
          }}
          severity={error ? 'error' : 'success'}
          sx={{ width: '100%' }}
        >
          {error || success}
        </Alert>
      </Snackbar>
      <Box sx={{ 
        position: 'fixed', 
        bottom: { xs: 80, sm: 16 }, // Increased bottom position on mobile
        left: { xs: 16, sm: 16 }, 
        zIndex: 1000,
        bgcolor: 'background.paper',
        p: 1,
        borderRadius: 1,
        boxShadow: 1
      }}>
        {isSaving ? (
          <CircularProgress size={24} />
        ) : (
          <Typography variant="caption" color="text.secondary">
            {lastSaved ? `Último guardado: ${lastSaved.toLocaleTimeString()}` : 'No guardado aún'}
          </Typography>
        )}
      </Box>
    </Box>
  );
};
