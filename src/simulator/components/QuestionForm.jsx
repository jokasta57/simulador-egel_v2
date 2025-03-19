"use client"

import { useEffect, useMemo, useState } from "react"
import { Typography, RadioGroup, FormControlLabel, Radio, Paper, Box, Button, Modal } from "@mui/material"
import { useSelector, useDispatch } from "react-redux"
import { LoadingSpinner } from "./LoadingSpinner"
import { useNavigate, useParams } from "react-router-dom"
import { setCurrentQuestion } from "../../store"

export const QuestionForm = ({ loading, onAnswerChange, onSaveAnswer, onNextQuestion, onPreviousQuestion }) => {
  const dispatch = useDispatch();
  const { currentQuestion, totalQuestions, currentOrder } = useSelector((state) => state.exams);
  const navigate = useNavigate();
  const { id } = useParams();

  const [selectedValue, setSelectedValue] = useState("");
  const [openQuestionModal, setOpenQuestionModal] = useState(false);
  const [openOptionModal, setOpenOptionModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState("");
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const [startPosition, setStartPosition] = useState({ x: 0, y: 0 });

  const handleOpenQuestionImage = () => {
    setSelectedImage(currentQuestion.imagen_url);
    setOpenQuestionModal(true);
    setScale(1);
  };

  const handleOpenOptionImage = (imageUrl) => {
    setSelectedImage(imageUrl);
    setOpenOptionModal(true);
    setScale(1);
  };

  const handleCloseModals = () => {
    setOpenQuestionModal(false);
    setOpenOptionModal(false);
  };

  const handleWheel = (e) => {
    e.preventDefault();
    const newScale = e.deltaY < 0 ? scale * 1.1 : scale * 0.9;
    setScale(Math.min(Math.max(newScale, 1), 5)); // Límite entre 1x y 5x
  };

  const handleMouseDown = (event) => {
    setDragging(true);
    setStartPosition({ x: event.clientX - position.x, y: event.clientY - position.y });
  };

  const handleMouseMove = (event) => {
    if (!dragging) return;
    setPosition({ x: event.clientX - startPosition.x, y: event.clientY - startPosition.y });
  };

  const handleMouseUp = () => {
    setDragging(false);
  };

  // **Mantiene la respuesta seleccionada en el estado global**
  useEffect(() => {
    if (currentQuestion && Array.isArray(currentQuestion.opcion)) {
      const answeredOption = currentQuestion.opcion.find(option => option.respuesta && option.respuesta.length > 0);
      setSelectedValue(answeredOption ? answeredOption.id_opcion.toString() : "");
    }
  }, [currentQuestion]);

  if (loading || !currentQuestion || !Array.isArray(currentQuestion.opcion)) {
    return <LoadingSpinner />;
  }

  // **Manejo del cambio de selección**
  const handleRadioChange = (event) => {
    const newValue = event.target.value;
    setSelectedValue(newValue);
    onAnswerChange(newValue);
  };

  const handleFinishExam = () => {
    navigate(`/student/exams/${id}/result`);
  };

  return (
    <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
      {/* Header with question number and navigation buttons */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
        <Typography variant="h6" sx={{ color: "text.primary", fontWeight: "bold" }}>
          {`Pregunta ${currentQuestion.orden}`}
        </Typography>

        <Box sx={{ display: "flex", gap: 1 }}>
          <Button
            variant="contained"
            onClick={onPreviousQuestion}
            disabled={currentOrder === 1}
            sx={{
              bgcolor: "grey.300",
              color: "text.primary",
              "&:hover": { bgcolor: "grey.400" },
              "&:disabled": { bgcolor: "grey.200", color: "text.disabled" },
            }}
          >
            Pregunta Anterior
          </Button>

          <Button
            variant="contained"
            onClick={totalQuestions === currentOrder ? handleFinishExam : onNextQuestion}
            disabled={totalQuestions === currentOrder}
            sx={{
              bgcolor: "#e23d28",
              color: "white",
              "&:hover": { bgcolor: "#c62828" },
            }}
          >
            Siguiente Pregunta
          </Button>
        </Box>
      </Box>

      {/* Two-column layout */}
      <Box sx={{ display: "flex", flexDirection: { xs: "column", md: "row" }, gap: 3, mb: 3 }}>
        {/* Left column: Question content */}
        <Box sx={{ width: { xs: "100%", md: "50%" } }}>
          <Box
            sx={{
              maxHeight: "400px",
              overflowY: "auto",
              pr: 2,
              "&::-webkit-scrollbar": {
                width: "8px",
              },
              "&::-webkit-scrollbar-thumb": {
                backgroundColor: "rgba(0,0,0,0.2)",
                borderRadius: "4px",
              },
            }}
          >
            <Typography variant="subtitle1" sx={{ color: "text.primary", fontWeight: 350, mb: 2, whiteSpace: "pre-line" }}>
              {currentQuestion.contenido}
            </Typography>


            {currentQuestion.imagen_url && (
              <img
                src={currentQuestion.imagen_url || "/placeholder.svg"}
                alt="Imagen de la Pregunta"
                style={{
                  width: "100%",
                  maxWidth: "450px",
                  maxHeight: "300px",
                  objectFit: "contain",
                  marginTop: "8px",
                  cursor: "pointer",
                }}
                onClick={handleOpenQuestionImage}
              />
            )}

            {/* Modal de la pregunta */}
            <Modal open={openQuestionModal} onClose={handleCloseModals}>
              <Box
                sx={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                  bgcolor: "white",
                  boxShadow: 24,
                  p: 2,
                  maxWidth: "95vw",
                  maxHeight: "95vh",
                  overflow: "hidden",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
                onWheel={(event) => {
                  setScale((prevScale) => Math.min(Math.max(prevScale + event.deltaY * -0.001, 1), 3));
                }}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
              >
                <img
                  src={selectedImage}
                  alt="Imagen ampliada"
                  style={{
                    transform: `scale(${scale})`,
                    transition: "transform 0.1s ease",
                    maxWidth: "100%",
                    maxHeight: "80vh",
                    objectFit: "contain",
                    width: "auto", // No limitar el ancho
                    height: "auto", // Mantener proporciones
                    // objectFit: "contain", // Evitar recortes
                  }}
                />
              </Box>
            </Modal>

          </Box>
        </Box>

        {/* Right column: Answer options */}
        <Box sx={{ width: { xs: "100%", md: "50%" } }}>
          <Box
            sx={{
              maxHeight: "400px",
              overflowY: "auto",
              "&::-webkit-scrollbar": {
                width: "8px",
              },
              "&::-webkit-scrollbar-thumb": {
                backgroundColor: "rgba(0,0,0,0.2)",
                borderRadius: "4px",
              },
            }}
          >
            <RadioGroup value={selectedValue} onChange={handleRadioChange}>
              {currentQuestion.opcion.map((option) => (
                <Box
                  key={option.id_opcion}
                  display="flex"
                  alignItems="center"
                  mb={2}  // Aumentar margen entre opciones
                >
                  <FormControlLabel
                    value={option.id_opcion.toString()}
                    control={<Radio />}
                    label=""
                    sx={{ marginRight: "8px" }}
                  />
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2, flexWrap: "wrap" }}>
                    <Typography
                      variant="subtitle1"
                      sx={{ fontWeight: 350, fontSize: "1rem", lineHeight: 1.4, wordBreak: "break-word" }}
                    >
                      {option.contenido}
                    </Typography>
                    {option.imagen_url && (
                      <img
                        src={option.imagen_url || "/placeholder.svg"}
                        alt={`Opción ${option.id_opcion}`}
                        style={{
                          width: "200px",
                          height: "200px",
                          objectFit: "contain",
                          marginRight: "16px",
                          cursor: "pointer",
                        }}
                        onClick={() => handleOpenOptionImage(option.imagen_url)}
                      />
                    )}
                  </Box>
                </Box>
              ))}
              {/* Modal de opciones */}
              <Modal open={openOptionModal} onClose={handleCloseModals}>
                <Box
                  sx={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    bgcolor: "white",
                    boxShadow: 24,
                    p: 2,
                    maxWidth: "90vw",
                    maxHeight: "90vh",
                    overflow: "hidden",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                  onWheel={(event) => {
                    setScale((prevScale) => Math.min(Math.max(prevScale + event.deltaY * -0.001, 1), 3));
                  }}
                >
                  <img
                    src={selectedImage}
                    alt="Imagen ampliada"
                    style={{
                      transform: `scale(${scale})`,
                      transition: "transform 0.1s ease",
                      maxWidth: "100%",
                      maxHeight: "80vh",
                      objectFit: "contain",
                    }}
                  />
                </Box>
              </Modal>
            </RadioGroup>


          </Box>
        </Box>
      </Box>

      {/* Footer with action buttons */}
      <Box sx={{ mt: 3, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Button
          variant="contained"
          onClick={onSaveAnswer}
          disabled={!selectedValue}
          sx={{
            bgcolor: "grey.300",
            color: "text.primary",
            "&:hover": { bgcolor: "grey.400" },
            "&:disabled": { bgcolor: "grey.200", color: "text.disabled" },
          }}
        >
          Guardar Respuesta
        </Button>

        <Button
          variant="contained"
          onClick={handleFinishExam}
          sx={{
            bgcolor: "#d32f2f",
            color: "white",
            "&:hover": { bgcolor: "#b71c1c" },
          }}
        >
          Terminar Intento
        </Button>
      </Box>
    </Paper>
  )
};
