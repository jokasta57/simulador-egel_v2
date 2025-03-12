import { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import adminApi from "../../api/adminApi";

export const useAdminStatsStore = () => {
    const dispatch = useDispatch();

    const handlePercentageByDate = useCallback(async (carrera) => {
        try {
            const { data } = await adminApi.get(`/admin-dashboard/porcentaje-fechas?carrera=${carrera}`);
            return data;

        } catch (error) {
            throw error;
        }
    }, [dispatch]);

    const handlePercentage = useCallback(async (carrera) => {
        try {
            const { data } = await adminApi.get(`/admin-dashboard/porcentaje-aprobados?carrera=${carrera}`);
            return data;

        } catch (error) {
            let errorMessage = error.response
            throw errorMessage;
        }
    }, [dispatch]);

    const handleDrafts = useCallback(async (carrera) => {
        try {
            const { data } = await adminApi.get(`/admin-dashboard/borradores?carrera=${carrera}`);
            return data;

        } catch (error) {
            let errorMessage = error.response?.data.msg
            throw errorMessage;
        }
    }, [dispatch]);

    const handlePerformancePerQuestion = useCallback(async (id_examen, fechaInicio, fechaFin) => {
        try {
            const { data } = await adminApi.get(`/admin-dashboard/rendimiento-preguntas/${id_examen}?fechaInicio=${fechaInicio}&fechaFin=${fechaFin}`);

            return data;

        } catch (error) {
            throw error;
        }
    }, [dispatch]);

    const handleLastExamAttempt = useCallback(async (carrera) => {
        try {
            const { data } = await adminApi.get(`/admin-dashboard/ultimo-examen-aplicado?carrera=${carrera}`);

            return data;

        } catch (error) {
            let errorMessage = error.response?.data.msg
            throw errorMessage;
        }
    }, [dispatch]);

    const handleSummaryAndGrades = useCallback(async (id_examen, fechaInicio, fechaFin) => {
        try {
            const { data } = await adminApi.get(`/admin-dashboard/calificaciones-resumen/${id_examen}?fechaInicio=${fechaInicio}&fechaFin=${fechaFin}`);

            return data;

        } catch (error) {
            throw error;
        }
    }, [dispatch]);

    return {
        handlePercentage,
        handlePercentageByDate,
        handleDrafts,
        handlePerformancePerQuestion,
        handleLastExamAttempt,
        handleSummaryAndGrades
    };
};
