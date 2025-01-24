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
} from '../../store/exams/examsSlice';

export const useExamsStore = () => {
    const dispatch = useDispatch();
    const { exams, currentExam, isLoading, error, success } = useSelector(state => state.exams);

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

    const handleClearError = useCallback(() => {
        dispatch(clearError());
    }, [dispatch]);

    const handleClearSuccess = useCallback(() => {
        dispatch(clearSuccess());
    }, [dispatch]);

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
    };
};
