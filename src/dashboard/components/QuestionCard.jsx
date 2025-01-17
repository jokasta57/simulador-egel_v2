import React, { forwardRef, useState, useEffect } from 'react';
import { debounce } from 'lodash';
import {
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Box,
  Alert,
  Collapse,
} from '@mui/material';
import { Delete as DeleteIcon, Save as SaveIcon } from '@mui/icons-material';
import {OptionList} from './OptionList';
import {ImageUpload} from './ImageUpload';
import { saveQuestion } from '../../actions/examActions';

export const QuestionCard = forwardRef(({ pregunta, index, onDelete, onUpdate, onSave, isSaved }, ref) => {
  const [localPregunta, setLocalPregunta] = useState(pregunta);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertSeverity, setAlertSeverity] = useState('error');

  const debouncedUpdate = React.useCallback(
    debounce((id, field, value) => {
      onUpdate(id, field, value);
    }, 300),
    [onUpdate]
  );

  React.useEffect(() => {
    return () => {
      debouncedUpdate.cancel();
    };
  }, [debouncedUpdate]);

  const handleQuestionChange = (e) => {
    const newValue = e.target.value;
    setLocalPregunta(prev => ({ ...prev, pregunta: newValue }));
    debouncedUpdate(localPregunta.id, 'pregunta', newValue);
  };

  const handleQuestionBlur = () => {
    onUpdate(localPregunta.id, 'pregunta', localPregunta.pregunta);
  };

  const validateQuestion = () => {
    const opcionesValidas = localPregunta.opciones.filter(opcion => opcion.texto.trim() !== '' || opcion.imagen);
    const opcionesUnicas = new Set(opcionesValidas.map(opcion => 
      opcion.texto.trim().toLowerCase() + (opcion.imagen ? opcion.imagen : '')
    ));

    return (
      localPregunta.pregunta.trim() !== '' &&
      opcionesValidas.length >= 2 &&
      opcionesUnicas.size === opcionesValidas.length
    );
  };

  const handleImageUpload = (imageData) => {
    setLocalPregunta(prev => ({ ...prev, imagen: imageData }));
    onUpdate(localPregunta.id, 'imagen', imageData);
  };

  const handleOptionUpdate = (opcionIndex, campo, valor) => {
    setLocalPregunta(prev => {
      let nuevasOpciones;
      if (campo === 'add') {
        nuevasOpciones = [...prev.opciones, valor];
      } else if (campo === 'delete') {
        nuevasOpciones = prev.opciones.filter((_, index) => index !== opcionIndex);
      } else {
        nuevasOpciones = prev.opciones.map((opcion, index) =>
          index === opcionIndex ? { ...opcion, [campo]: valor } : opcion
        );
      }
      onUpdate(localPregunta.id, 'opciones', nuevasOpciones);
      return { ...prev, opciones: nuevasOpciones };
    });
  };

  const handleCorrectAnswerChange = (opcionIndex) => {
    setLocalPregunta(prev => ({ ...prev, respuestaCorrecta: opcionIndex }));
    onUpdate(localPregunta.id, 'respuestaCorrecta', opcionIndex);
  };

  const handleSave = () => {
    const isValid = validateQuestion();
    if (isValid) {
      onSave(localPregunta.id);
      setAlertMessage('Pregunta guardada exitosamente');
      setAlertSeverity('success');
    } else {
      setAlertMessage('Por favor, complete la pregunta y asegúrese de tener al menos dos opciones válidas y únicas');
      setAlertSeverity('error');
    }
    setShowAlert(true);
    setTimeout(() => setShowAlert(false), 5000);
  };

  return (
    <Card ref={ref} id={`pregunta-${localPregunta.id}`}>
      <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
        <Box sx={{ 
          display: 'flex', 
          flexDirection: { xs: 'column', sm: 'row' },
          justifyContent: 'space-between', 
          alignItems: { xs: 'flex-start', sm: 'center' }, 
          mb: { xs: 2, sm: 3 } 
        }}>
          <Typography variant="h6" sx={{ mb: { xs: 1, sm: 0 } }}>
            Pregunta {index + 1}
          </Typography>
          <Button
            variant="outlined"
            color="error"
            startIcon={<DeleteIcon />}
            onClick={() => onDelete(localPregunta.id)}
            sx={{ width: { xs: '100%', sm: 'auto' } }}
          >
            Eliminar Pregunta
          </Button>
        </Box>

        <Collapse in={showAlert}>
          <Alert severity={alertSeverity} sx={{ mb: 2 }}>
            {alertMessage}
          </Alert>
        </Collapse>

        <Box sx={{ mb: 3 }}>
          <TextField
            fullWidth
            multiline
            rows={3}
            label="Texto de la Pregunta"
            value={localPregunta.pregunta}
            onChange={handleQuestionChange}
            onBlur={handleQuestionBlur}
            sx={{ mb: 2 }}
          />

          <ImageUpload
            currentImage={localPregunta.imagen}
            onImageUpload={handleImageUpload}
            label="Imagen de la pregunta"
          />
        </Box>

        <OptionList
          opciones={localPregunta.opciones}
          respuestaCorrecta={localPregunta.respuestaCorrecta}
          onOptionUpdate={handleOptionUpdate}
          onCorrectAnswerChange={handleCorrectAnswerChange}
        />

        <Box sx={{ mt: { xs: 2, sm: 3 } }}>
          <Button
            variant="contained"
            color={isSaved ? "success" : "primary"}
            startIcon={<SaveIcon />}
            onClick={handleSave}
            sx={{ width: { xs: '100%', sm: 'auto' } }}
          >
            {isSaved ? "Guardado" : "Guardar Pregunta"}
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
});

QuestionCard.displayName = 'QuestionCard';


