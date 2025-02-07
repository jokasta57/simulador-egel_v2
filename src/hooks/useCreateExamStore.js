import { useCallback, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import adminApi from "../api/adminApi"
import { onUpdateExamInfo, saveExamInfoStart, saveExamInfoSuccess, saveExamInfoFailure, clearError, clearSuccess } from '../store/admin/createExamSlice';

export const useCreateExamStore = () => {
    const dispatch = useDispatch();
    const { examInfo, isLoading, error, success, lastSaved } = useSelector(state => state.createExam);

    const saveTimeoutRef = useRef(null);

    const handleExamInfoChange = useCallback((newExamInfo) => {
        dispatch(onUpdateExamInfo(newExamInfo));

        if (saveTimeoutRef.current) {
            clearTimeout(saveTimeoutRef.current);
        }

        saveTimeoutRef.current = setTimeout(() => {
            console.log('ExamInfo changes ready to be saved');
        }, 2000);
    }, [dispatch]);

    const handleSaveExamInfo = useCallback(async (nombre, duracion, carrera, periodo, area) => {
        dispatch(saveExamInfoStart());

        try {
            const response = await adminApi.post('/exams', {nombre, duracion, carrera, periodo, area});
            dispatch(saveExamInfoSuccess(response.data.examen));

            return response.data.examen;
        } catch (err) {
            console.log(err);
            dispatch(saveExamInfoFailure(err.response?.data || 'Error al guardar la información del examen'));
            throw err;
        }
    }, [dispatch]);

    const handleClearError = useCallback(() => {
        dispatch(clearError());
    }, [dispatch]);

    const handleClearSuccess = useCallback(() => {
        dispatch(clearSuccess());
    }, [dispatch]);

    return {
        examInfo,
        isLoading,
        error,
        success,
        lastSaved,
        handleExamInfoChange,
        handleSaveExamInfo,
        handleClearError,
        handleClearSuccess,
    };
};
