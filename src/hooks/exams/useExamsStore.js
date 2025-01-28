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
        dispatch(updateQuestionStart());
        try {
            await adminApi.put(`/questions/${updateData.id_pregunta}`, updateData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                }
            });

            // Mapear las opciones para procesarlas individualmente
            const optionUpdates = updateData.opcion.map(async (opcion) => {
                await adminApi.put(`/options/${opcion.id_opcion}`, opcion, {
                    headers: {
                        "Content-Type": "application/json",
                    },
                });
            });
            
            // Esperar a que todas las opciones se actualicen
            await Promise.all(optionUpdates);

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
