import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import adminApi from "../../api/adminApi";
import {
    setCurrentExam,
    clearError,
    clearSuccess,
    loadExams,
    loadExamsStart,
    updateExamStart,
    updateExamSuccess,
    updateExamFailure,
    setError,
    setCurrentQuestion,
    updateQuestionStart,
    resetCurrentQuestion,
    updateQuestion,
    addNewQuestion,
    addNewQuestionStart,
    setIsLoadingFalse,
    setIsLoading,
    setCurrentAttempt
} from '../../store/exams/examsSlice';
import simulatorApi from '../../api/simulatorApi';

export const useExamsStore = () => {
    const dispatch = useDispatch();
    const { exams, currentExam, isLoading, error, success, currentQuestion } = useSelector(state => state.exams);

    const handleLoadExams = useCallback(async () => {
        dispatch(loadExamsStart());
        try {
            const response = await adminApi.get('/exams');
            dispatch(loadExams(response.data.examenes));
            return response.data;
        } catch (error) {
            console.log(error);
            dispatch(setError(error.response?.data.msg || 'Error al cargar examenes'));
            throw error;
        } finally {
            dispatch(setIsLoadingFalse()); // ✅ Asegura que isLoading siempre vuelva a false
        }
    }, [dispatch]);
    
    const handleNewAttempt = useCallback(async (numero_cuenta, id_examen) => {
        dispatch(setIsLoading());
        try {
            const response = await simulatorApi.post('/attempt', {numero_cuenta, id_examen}
            );
            dispatch(setCurrentAttempt(response.data.intento));
            return response.data.intento;
        } catch (error) {
            console.log(error);
            dispatch(setError(error.response?.data.msg || 'Error al cargar examenes'));
            throw error;
        } finally {
            dispatch(setIsLoadingFalse()); // ✅ Asegura que isLoading siempre vuelva a false
        }
    }, [dispatch]);

    const handleLoadExamsByCareer = useCallback(async (carrera) => {
        dispatch(loadExamsStart());
        try {
            const response = await simulatorApi.get('/exams/career', {
                params: {
                    carrera: carrera
                }
            });
            dispatch(loadExams(response.data.examenes));
            return response.data;
        } catch (error) {
            console.log(error);
            dispatch(setError(error.response?.data.msg || 'Error al cargar examenes'));
            throw error;
        } finally {
            dispatch(setIsLoadingFalse()); // ✅ Asegura que isLoading siempre vuelva a false
        }
    })

    const handleLoadExam = useCallback(async (id) => {
        dispatch(loadExamsStart());
        try {
            const response = await adminApi.get(`/exams/${id}`);
            dispatch(setCurrentExam(response.data.examen));
            return response.data.examen;
        } catch (error) {
            console.log(error);
            dispatch(setError(error.response?.data.msg || 'Error al cargar el examen'));
            throw error;
        } finally {
            dispatch(setIsLoadingFalse()); // ✅ Asegura que isLoading siempre vuelva a false
        }
    }, [dispatch]);

    const handleUpdateExam = useCallback(async (examId, examData) => {
        dispatch(updateExamStart());
        try {
            const response = await adminApi.put(`/exams/${examId}`, examData);
            dispatch(updateExamSuccess(response.data.examen));
            return response.data;
        } catch (error) {
            console.log(error);
            dispatch(updateExamFailure(error.response?.data.msg || 'Error al actualizar el examen'));
            throw error;
        } finally {
            dispatch(setIsLoadingFalse()); // ✅ Asegura que isLoading siempre vuelva a false
        }
    }, [dispatch]);

    const handleLoadQuestion = useCallback(async (examId, orden) => {
        try {
            const response = await adminApi.get(`/questions/orden`, {
                params: {
                    orden,
                    id_examen: examId
                }
            });
            if (!response.data.pregunta) {
                dispatch(setCurrentQuestion(null)); // En lugar de generar error, establecer null
                return null;
            }

            dispatch(setCurrentQuestion(response.data.pregunta))
            return response.data.pregunta;
        } catch (error) {
            console.log(error);
            dispatch(setError(error.response?.data.msg || 'Error al cargar la pregunta'));
            throw error;
        } finally {
            dispatch(setIsLoadingFalse()); // ✅ Asegura que isLoading siempre vuelva a false
        }
    }, [dispatch]);

    const handleLoadQuestionAndAnswer = useCallback(async (examId, orden, id_intento) => {
        try {
            const response = await simulatorApi.get(`/questions/answers/${id_intento}`, {
                params: {
                    orden, 
                    id_examen: examId
                }
            });
            if (!response.data.pregunta) {
                dispatch(setCurrentQuestion(null)); // En lugar de generar error, establecer null
                return null;
            }

            dispatch(setCurrentQuestion(response.data.pregunta))
            return response.data.pregunta;
        } catch (error) {
            console.log(error);
            dispatch(setError(error.response?.data.msg || 'Error al cargar la pregunta'));
            throw error;
        } finally {
            dispatch(setIsLoadingFalse()); // ✅ Asegura que isLoading siempre vuelva a false
        }
    }, [dispatch]);

    const handleLoadQuestionsByExam = useCallback(async (examId) => {
        try {
            const response = await adminApi.get(`/questions/exam/${examId}`);
            return response.data.preguntas;
        } catch (error) {
            console.log(error);
            dispatch(setError(error.response?.data.msg || 'Error al cargar las preguntas'));
            throw error;
        } finally {
            dispatch(setIsLoadingFalse()); // ✅ Asegura que isLoading siempre vuelva a false
        }
    }, [dispatch]);

    const handleUpdateQuestion = useCallback(async (updateData) => {
        dispatch(updateQuestionStart());
        try {
            const formData = new FormData();

            // Añadir el contenido de la pregunta
            formData.append("contenido", updateData.contenido);

            // Verificar si hay un archivo de imagen y añadirlo
            if (updateData.imagen_url) {
                formData.append("imagen", updateData.imagen_url);
            }

            await adminApi.put(`/questions/${updateData.id_pregunta}`, formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                }
            });

            // Filtrar opciones válidas: deben tener texto o imagen
            const opcionesValidas = updateData.opcion.filter(op =>
                (op.contenido && op.contenido.trim() !== "") || op.imagen_url // ✅ Opción válida si tiene contenido o imagen
            );

            if (opcionesValidas.length < 2) {
                throw new Error("Debe haber al menos 2 opciones válidas con texto o imagen."); // ✅ Evitar menos de 2 opciones
            }

            // Filtrar opciones existentes y nuevas
            const opcionesExistentes = updateData.opcion.filter(op => op.id_opcion); // Opciones con ID
            const opcionesNuevas = updateData.opcion.filter(op => !op.id_opcion); // Opciones sin ID

            // Procesar opciones existentes con PUT
            const updatePromises = opcionesExistentes.map(async (opcion) => {
                return adminApi.put(`/options/${opcion.id_opcion}`, opcion, {
                    headers: { "Content-Type": "application/json" },
                });
            });

            // Procesar opciones nuevas con POST
            const createPromises = opcionesNuevas.map(async (opcion) => {
                return adminApi.post(`/options`, opcion, {
                    headers: { "Content-Type": "application/json" },
                    params: {
                        id_pregunta: updateData.id_pregunta
                    }
                });
            });

            // Esperar a que todas las opciones se actualicen o creen
            await Promise.all([...updatePromises, ...createPromises]);



            const response = await adminApi.get(`/questions/id/${updateData.id_pregunta}`);
            dispatch(updateQuestion(response.data.pregunta))


            return response.data.preguntas;
        } catch (error) {
            let errorMessage = "Error al actualizar la pregunta";
            if (error.response?.data) {
                errorMessage = error.response.data.msg || JSON.stringify(error.response.data);
            }
            dispatch(setError({ message: errorMessage, type: 'error' }));
            throw error;
        } finally {
            dispatch(setIsLoadingFalse()); // ✅ Asegura que isLoading siempre vuelva a false
        }
    }, [dispatch]);

    const handleAddNewQuestion = useCallback(async (data, examId, orden) => {
        dispatch(addNewQuestionStart());
        try {
            const questionData = await adminApi.post(`/questions`, data, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
                params: {
                    id_examen: examId,
                    orden,
                }
            });

            const { pregunta } = questionData.data;

            // Mapear las opciones para procesarlas individualmente
            const newOptions = data.opcion.map(async (opcion) => {
                await adminApi.post(`/options`, opcion, {
                    headers: {
                        "Content-Type": "application/json",
                    },
                    params: {
                        id_pregunta: pregunta.id_pregunta
                    }
                });
            });

            // Esperar a que todas las opciones se actualicen
            await Promise.all(newOptions);

            const response = await adminApi.get(`/questions/orden`, {
                params: {
                    orden,
                    id_examen: examId,
                }
            });

            dispatch(addNewQuestion(response.data.pregunta));


            return response.data.preguntas;
        } catch (error) {
            console.log(error);
            dispatch(setError(error.response?.data.msg || 'Error al agregar pregunta'));
            throw error;
        } finally {
        dispatch(setIsLoadingFalse()); // ✅ Asegura que isLoading siempre vuelva a false
    }
    }, [dispatch]);

    const handleDeleteQuestion = useCallback(async (id_pregunta) => {
        dispatch(updateQuestionStart());
        try {
            const preguntaResp = await adminApi.get(`/questions/id/${id_pregunta}`);

            const {opcion} = preguntaResp.data.pregunta;

            // Mapear las opciones para procesarlas individualmente
            const deleteOptions = opcion.map(async (opcionEliminar) => {
                await adminApi.delete(`/options/${opcionEliminar.id_opcion}`);
            });

            // Esperar a que todas las opciones se actualicen
            await Promise.all(deleteOptions);

            const response = await adminApi.delete(`/questions/${id_pregunta}`);
            return response.data.preguntas;
        } catch (error) {
            console.log(error);
            dispatch(setError(error.response?.data.msg || 'Error al eliminar pregunta'));
            throw error;
        } finally {
            dispatch(setIsLoadingFalse()); // ✅ Asegura que isLoading siempre vuelva a false
        }
    }, [dispatch]);

    const handleSwitchState = useCallback(async (estado, id_examen) => {
        dispatch(updateQuestionStart());
        try {
            const response = await adminApi.put(`/exams/state/${id_examen}`, {}, {
                params: {
                    estado
                }
            });
            return response.data.examen;
        } catch (error) {
            console.log(error);
            dispatch(setError(error.response?.data.msg || 'Error al eliminar pregunta'));
            throw error;
        } finally {
            dispatch(setIsLoadingFalse()); // ✅ Asegura que isLoading siempre vuelva a false
        }
    }, [dispatch]);

    const handleSaveAnswer = useCallback(async (id_intento, id_opcion) => {
        dispatch(setIsLoading());
        try {
            const response = await simulatorApi.post(`/answers`, {id_intento, id_opcion});

            return response.data.respuesta;
        } catch (error) {
            console.log(error);
            dispatch(setError(error.response?.data.msg || 'Error al agregar pregunta'));
            throw error;
        } finally {
        dispatch(setIsLoadingFalse()); // ✅ Asegura que isLoading siempre vuelva a false
    }
    }, [dispatch]);
    
    const handleUpdateAnswer = useCallback(async (id_respuesta, id_opcion) => {
        dispatch(setIsLoading());
        try {
            const response = await simulatorApi.put(`/answers/${id_respuesta}`, {id_opcion});

            return response.data.respuesta;
        } catch (error) {
            console.log(error);
            dispatch(setError(error.response?.data.msg || 'Error al agregar pregunta'));
            throw error;
        } finally {
        dispatch(setIsLoadingFalse()); // ✅ Asegura que isLoading siempre vuelva a false
    }
    }, [dispatch]);

    const handleClearError = useCallback(() => {
        dispatch(clearError());
    }, [dispatch]);

    const handleClearSuccess = useCallback(() => {
        dispatch(clearSuccess());
    }, [dispatch]);

    const handleResetCurrentQuestion = useCallback(() => {
        dispatch(resetCurrentQuestion());
    }, [dispatch])

    return {
        exams,
        currentExam,
        isLoading,
        error,
        success,
        handleLoadExams,
        handleLoadExam,
        handleUpdateExam,
        handleClearError,
        handleClearSuccess,
        handleLoadQuestion,
        handleLoadQuestionsByExam,
        handleUpdateQuestion,
        handleResetCurrentQuestion,
        handleAddNewQuestion, 
        handleLoadExamsByCareer, 
        handleDeleteQuestion,
        handleSwitchState,
        handleNewAttempt,
        handleSaveAnswer, 
        handleLoadQuestionAndAnswer,
        handleUpdateAnswer
    };
};
