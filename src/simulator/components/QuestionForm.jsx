"use client"

import { useEffect, useMemo, useState } from "react"
import { Typography, RadioGroup, FormControlLabel, Radio, Paper, Box, Button, Modal } from "@mui/material"
import { useSelector, useDispatch } from "react-redux"
import { LoadingSpinner } from "./LoadingSpinner"
import { useNavigate, useParams } from "react-router-dom"
import { setCurrentQuestion } from "../../store"
import Swal from "sweetalert2"

export const QuestionForm = ({ loading, onAnswerChange, onSaveAnswer, onNextQuestion, onPreviousQuestion }) => {
  // Hooks de Redux para manejar el estado global
  const dispatch = useDispatch();
  const { currentQuestion, totalQuestions, currentOrder } = useSelector((state) => state.exams);

  // Hooks de React Router para la navegación y parámetros de URL
  const navigate = useNavigate();
  const { id } = useParams();

  // Estados locales
  const [selectedValue, setSelectedValue] = useState(""); // Opción seleccionada
  const [openQuestionModal, setOpenQuestionModal] = useState(false); // Modal de imagen de la pregunta
  const [openOptionModal, setOpenOptionModal] = useState(false); // Modal de imagen de opción
  const [selectedImage, setSelectedImage] = useState(""); // Imagen seleccionada en el modal

  // Estados para manejar zoom y desplazamiento en la imagen
  const [scale, setScale] = useState(1); // Escala de zoom
  const [position, setPosition] = useState({ x: 0, y: 0 }); // Posición de la imagen
  const [dragging, setDragging] = useState(false); // Estado de arrastre
  const [startPosition, setStartPosition] = useState({ x: 0, y: 0 }); // Posición inicial del arrastre

  // **Funciones para manejar la apertura y cierre de modales**
  const handleOpenQuestionImage = () => {
    setSelectedImage(currentQuestion.imagen_url);
    setOpenQuestionModal(true);
    setScale(1); // Reinicia el zoom al abrir la imagen
  };

  const handleOpenOptionImage = (imageUrl) => {
    setSelectedImage(imageUrl);
    setOpenOptionModal(true);
    setScale(1); // Reinicia el zoom al abrir la imagen
  };

  const handleCloseModals = () => {
    setOpenQuestionModal(false);
    setOpenOptionModal(false);
  };

  // **Manejo del zoom con la rueda del mouse**
  const handleWheel = (e) => {
    e.preventDefault();
    const newScale = e.deltaY < 0 ? scale * 1.1 : scale * 0.9;
    setScale(Math.min(Math.max(newScale, 1), 5)); // Límite de zoom entre 1x y 5x
  };

  // **Manejo del arrastre de la imagen**
  const handleMouseDown = (event) => {
    setDragging(true);
    setStartPosition({
      x: event.clientX - position.x,
      y: event.clientY - position.y
    });
  };

  const handleMouseMove = (event) => {
    if (!dragging) return;
    setPosition({
      x: event.clientX - startPosition.x,
      y: event.clientY - startPosition.y
    });
  };

  const handleMouseUp = () => {
    setDragging(false);
  };

  // **Mantiene la respuesta seleccionada en el estado global**
  useEffect(() => {
    if (currentQuestion && Array.isArray(currentQuestion.opcion)) {
      const answeredOption = currentQuestion.opcion.find(
        (option) => option.respuesta && option.respuesta.length > 0
      );
      setSelectedValue(answeredOption ? answeredOption.id_opcion.toString() : "");
    }
  }, [currentQuestion]);

  // **Muestra un spinner si la pregunta está cargando o no tiene opciones**
  if (loading || !currentQuestion || !Array.isArray(currentQuestion.opcion)) {
    return <LoadingSpinner />;
  }

  // **Manejo del cambio de selección**
  const handleRadioChange = (event) => {
    const newValue = event.target.value;
    setSelectedValue(newValue);
    onAnswerChange(newValue);
  };

  // **Finalizar examen y redirigir a la página de resultados**
  const handleFinishExam = () => {
    Swal.fire({
      title: "¿Estás seguro?",
      text: "Una vez que finalices el intento, no podrás modificar tus respuestas.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d32f2f",
      cancelButtonColor: "#6c757d",
      cancelButtonText: "Cancelar",
      confirmButtonText: "Sí, finalizar intento",
    }).then((result) => {
      if (result.isConfirmed) {
        navigate(`/student/exams/${id}/result`);
      }
    });
  };


  return (
    <>
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
            {/* Footer with action buttons */}
            <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
              <Button
                variant="contained"
                onClick={handleFinishExam}
                sx={{
                  bgcolor: "error.main",
                  color: "white",
                  "&:hover": { bgcolor: "error.dark" },
                }}
              >
                Terminar Intento
              </Button>
            </Box>
          </Box>
        </Box>
      </Paper>
    </>
  )
};
