import React, { memo, useCallback } from 'react';
import {
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Box,
} from '@mui/material';
import { Delete as DeleteIcon, Save as SaveIcon } from '@mui/icons-material';
import { OptionList } from './OptionList';
import { ImageUpload } from './ImageUpload';
import { useDebounce } from '../../hooks/useDebounce';

export const QuestionCard = memo(({ pregunta, index, onDelete, onUpdate, onSave, isSaved }) => {
  const debouncedUpdate = useDebounce((field, value) => {
    onUpdate(pregunta.id, field, value);
  }, 300);

  const handleQuestionChange = useCallback((e) => {
    debouncedUpdate('pregunta', e.target.value);
  }, [debouncedUpdate]);

  const handleImageUpload = useCallback((imageData) => {
    onUpdate(pregunta.id, 'imagen', imageData);
  }, [onUpdate, pregunta.id]);

  const handleOptionUpdate = useCallback((opcionIndex, campo, valor) => {
    const nuevasOpciones = [...pregunta.opciones];
    if (campo === 'add') {
      nuevasOpciones.push(valor);
    } else if (campo === 'delete') {
      nuevasOpciones.splice(opcionIndex, 1);
    } else {
      nuevasOpciones[opcionIndex] = { ...nuevasOpciones[opcionIndex], [campo]: valor };
    }
    onUpdate(pregunta.id, 'opciones', nuevasOpciones);
  }, [onUpdate, pregunta.id, pregunta.opciones]);

  const handleCorrectAnswerChange = useCallback((opcionIndex) => {
    onUpdate(pregunta.id, 'respuestaCorrecta', opcionIndex);
  }, [onUpdate, pregunta.id]);

  const handleSave = useCallback(() => {
    onSave(pregunta.id);
  }, [onSave, pregunta.id]);

  return (
    <Card id={`pregunta-${pregunta.id}`}>
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
            onClick={() => onDelete(pregunta.id)}
            sx={{ width: { xs: '100%', sm: 'auto' } }}
          >
            Eliminar Pregunta
          </Button>
        </Box>

        <Box sx={{ mb: 3 }}>
          <TextField
            fullWidth
            multiline
            rows={3}
            label="Texto de la Pregunta"
            defaultValue={pregunta.pregunta}
            onChange={handleQuestionChange}
            sx={{ mb: 2 }}
          />

          <ImageUpload
            currentImage={pregunta.imagen}
            onImageUpload={handleImageUpload}
            label="Imagen de la pregunta"
          />
        </Box>

        <OptionList
          opciones={pregunta.opciones}
          respuestaCorrecta={pregunta.respuestaCorrecta}
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

