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
    addNewQuestion
} from '../../store/exams/examsSlice';

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
            dispatch(setError(error.response?.data || 'Error al cargar examenes'));
            throw error;
        }
    }, [dispatch]);

    const handleLoadExam = useCallback(async (id) => {
        dispatch(loadExamsStart());
        try {
            const response = await adminApi.get(`/exams/${id}`);
            dispatch(setCurrentExam(response.data.examen));
            return response.data.examen;
        } catch (error) {
            console.log(error);
            dispatch(setError(error.response?.data || 'Error al cargar el examen'));
            throw error;
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
            dispatch(updateExamFailure(error.response?.data || 'Error al actualizar el examen'));
            throw error;
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
            dispatch(setCurrentQuestion(response.data.pregunta))
            return response.data.pregunta;
        } catch (error) {
            console.log(error);
            dispatch(setError(error.response?.data || 'Error al cargar la pregunta'));
            throw error;
        }
    }, [dispatch]);

    const handleLoadQuestionsByExam = useCallback(async (examId) => {
        try {
            const response = await adminApi.get(`/questions/exam/${examId}`);
            return response.data.preguntas;
        } catch (error) {
            console.log(error);
            dispatch(setError(error.response?.data || 'Error al cargar las preguntas'));
            throw error;
        }
    }, [dispatch]);

    const handleUpdateQuestion = useCallback(async (updateData) => {
        console.log(updateData);
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
            console.log(error);
            dispatch(setError(error.response?.data || 'Error al cargar las preguntas'));
            throw error;
        }
    }, [dispatch]);

    const handleAddNewQuestion = useCallback(async (data, examId, orden) => {
        dispatch(addNewQuestion());
        try {
            await adminApi.post(`/questions`, data, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
                params: {
                    id_examen: examId,
                    orden,
                }
            });

            // Mapear las opciones para procesarlas individualmente
            const newOptions = data.opcion.map(async (opcion) => {
                await adminApi.post(`/options`, opcion, {
                    headers: {
                        "Content-Type": "application/json",
                    },
                    params: {
                        // id_pregunta: examId
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
            dispatch(addNewQuestion(response.data.pregunta))


            return response.data.preguntas;
        } catch (error) {
            console.log(error);
            dispatch(setError(error.response?.data || 'Error al cargar las preguntas'));
            throw error;
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
        handleResetCurrentQuestion
    };
};
