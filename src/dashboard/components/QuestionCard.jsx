import React, { memo, useCallback, useState, useEffect } from "react"
import { Card, CardContent, Typography, TextField, Button, Box } from "@mui/material"
import { Delete as DeleteIcon, Save as SaveIcon } from "@mui/icons-material"
import { OptionList } from "./OptionList"
import { ImageUpload } from "./ImageUpload"
import { useSelector } from "react-redux"
import { useExamsStore } from "../../hooks/exams/useExamsStore"

export const QuestionCard = memo(({ index, onDelete, isSaved }) => {
  const { currentQuestion } = useSelector((state) => state.exams)
  const { handleUpdateQuestion, handleSaveQuestion, handleResetCurrentQuestion } = useExamsStore()
  const [localQuestion, setLocalQuestion] = useState(currentQuestion || {})

  useEffect(() => {
    if (currentQuestion) {
      setLocalQuestion(currentQuestion)
    }
  }, [currentQuestion])

  useEffect(() => {
    return () => {
      handleResetCurrentQuestion();
    }
  }, [handleResetCurrentQuestion])


  const handleQuestionChange = useCallback((e) => {
    const newContent = e.target.value
    setLocalQuestion((prev) => ({ ...prev, contenido: newContent }))
  }, [])

  const handleImageUpload = useCallback((imageData) => {
    setLocalQuestion((prev) => ({ ...prev, imagen_url: imageData }))
  }, [])

  const handleOptionUpdate = useCallback((opcionIndex, campo, valor) => {
    setLocalQuestion((prev) => {
      const nuevasOpciones = [...(prev.opcion || [])]
      if (campo === "add") {
        nuevasOpciones.push(valor)
      } else if (campo === "delete") {
        nuevasOpciones.splice(opcionIndex, 1)
      } else if (campo === "update_all") {
        return { ...prev, opcion: valor }
      } else {
        nuevasOpciones[opcionIndex] = { ...nuevasOpciones[opcionIndex], [campo]: valor }
      }
      return { ...prev, opcion: nuevasOpciones }
    })
  }, [])

  const handleCorrectAnswerChange = useCallback((opcionIndex) => {
    setLocalQuestion((prev) => ({ ...prev, es_correcta: opcionIndex }))
  }, [])

  const handleSave = useCallback(async () => {
    try {
      await handleUpdateQuestion(localQuestion)
      await handleSaveQuestion()
      // Aquí puedes manejar el éxito del guardado, por ejemplo, mostrando un mensaje
    } catch (error) {
      // Aquí puedes manejar el error, por ejemplo, mostrando un mensaje de error
    }
  }, [localQuestion, handleUpdateQuestion, handleSaveQuestion])

  if (!localQuestion) {
    return null
  }

  return (
    <Card id={`pregunta-${localQuestion.id_pregunta}`}>
      <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            justifyContent: "space-between",
            alignItems: { xs: "flex-start", sm: "center" },
            mb: { xs: 2, sm: 3 },
          }}
        >
          <Typography variant="h6" sx={{ mb: { xs: 1, sm: 0 } }}>
            Pregunta {localQuestion.orden || index + 1}
          </Typography>
          <Button
            variant="outlined"
            color="error"
            startIcon={<DeleteIcon />}
            onClick={() => onDelete(localQuestion.id_pregunta)}
            sx={{ width: { xs: "100%", sm: "auto" } }}
          >
            Eliminar Pregunta
          </Button>
        </Box>

        <Box sx={{ mb: 3 }}>
          <TextField
            fullWidth
            multiline
            rows={3}
            label=""
            value={localQuestion.contenido || ""}
            onChange={handleQuestionChange}
            sx={{ mb: 2 }}
          />

          <ImageUpload
            currentImage={localQuestion.imagen_url}
            onImageUpload={handleImageUpload}
            label="Imagen de la pregunta"
          />
        </Box>

        <OptionList
          opciones={localQuestion.opcion}
          respuestaCorrecta={localQuestion.es_correcta}
          onOptionUpdate={handleOptionUpdate}
          onCorrectAnswerChange={handleCorrectAnswerChange}
        />

        <Box sx={{ mt: { xs: 2, sm: 3 } }}>
          <Button
            variant="contained"
            color={isSaved ? "success" : "primary"}
            startIcon={<SaveIcon />}
            onClick={handleSave}
            sx={{ width: { xs: "100%", sm: "auto" } }}
          >
            {isSaved ? "Guardado" : "Guardar Pregunta"}
          </Button>
        </Box>
      </CardContent>
    </Card>
  )
})

QuestionCard.displayName = "QuestionCard"

