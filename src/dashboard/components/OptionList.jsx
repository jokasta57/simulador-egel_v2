import React from 'react';
import {
  RadioGroup,
  FormControlLabel,
  Radio,
  TextField,
  IconButton,
  Box,
  Button,
  Stack,
  Tooltip,
} from '@mui/material';
import { Delete as DeleteIcon, Add as AddIcon } from '@mui/icons-material';
import {ImageUpload} from './ImageUpload';

export const OptionList = ({ opciones, respuestaCorrecta, onOptionUpdate, onCorrectAnswerChange }) => {
  const handleOptionTextChange = (index, value) => {
    onOptionUpdate(index, 'texto', value);
  };

  const handleOptionImageUpload = (index, imageData) => {
    onOptionUpdate(index, 'imagen', imageData);
  };

  const handleAddOption = () => {
    onOptionUpdate(opciones.length, 'add', { texto: '', imagen: null, es_correcta: false });
  };

  const handleDeleteOption = (index) => {
    if (opciones.length > 2) {
      onOptionUpdate(index, 'delete', null);
    }
  };

  return (
    <>
      <RadioGroup
        value={respuestaCorrecta}
        onChange={(e) => onCorrectAnswerChange(Number(e.target.value))}
      >
        <Stack spacing={2}>
          {opciones.map((opcion, index) => (
            <Box
              key={index}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                mb: 2,
              }}
            >
              <FormControlLabel
                value={index}
                control={<Radio />}
                label=""
                sx={{ margin: 0 }}
              />
              <TextField
                fullWidth
                value={opcion.texto}
                onChange={(e) => handleOptionTextChange(index, e.target.value)}
                placeholder={`Opción ${index + 1}`}
                size="small"
              />
              <ImageUpload
                currentImage={opcion.imagen}
                onImageUpload={(imageData) => handleOptionImageUpload(index, imageData)}
                label={`Imagen de la opción ${index + 1}`}
              />
              {index > 1 && (
                <Tooltip title="Eliminar opción">
                  <IconButton
                    size="small"
                    onClick={() => handleDeleteOption(index)}
                    disabled={opciones.length <= 2}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              )}
            </Box>
          ))}
        </Stack>
      </RadioGroup>
      <Button
        startIcon={<AddIcon />}
        onClick={handleAddOption}
        sx={{ mt: 1 }}
      >
        Agregar Opción
      </Button>
    </>
  );
};


