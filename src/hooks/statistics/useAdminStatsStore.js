import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import adminApi from "../../api/adminApi";

export const useAdminStatsStore = () => {
    const dispatch = useDispatch();

    const handlePercentageByDate = useCallback(async () => {
        try {
            const {data} = await adminApi.get(`/admin-dashboard/porcentaje-fechas?carrera=${"Ingeniería de Software"}`);
            return data;

        } catch (error) {
            console.log(error);
            // dispatch(setError(error.response?.data.msg || 'Error al cargar examenes'));
            throw error;
        } finally {
            // dispatch(setIsLoadingFalse()); // ✅ Asegura que isLoading siempre vuelva a false
        }
    }, [dispatch]);

    const handlePercentage = useCallback(async () => {
        try {
            const {data} = await adminApi.get(`/admin-dashboard/porcentaje-aprobados?carrera=${"Ingeniería de Software"}`);
            return data;

        } catch (error) {
            let errorMessage = error.response
            throw errorMessage;
        }
    }, [dispatch]);

    const handleDrafts = useCallback(async () => {
        try {
            const {data} = await adminApi.get(`/admin-dashboard/borradores?carrera=${"Ingeniería de Software"}`);
            return data;

        } catch (error) {
            let errorMessage = error.response?.data.msg
            throw errorMessage;
        }
    }, [dispatch]);

    //Seccion de estadisticas del panel administrativo
    
    const handlePerformancePerQuestion = useCallback(async (id_examen, fechaInicio, fechaFin ) => {
        try {
            const {data} = await adminApi.get(`/admin-dashboard/rendimiento-preguntas/${id_examen}?fechaInicio=${fechaInicio}&fechaFin=${fechaFin}`);

            return data;

        } catch (error) {
            console.log(error);
            // dispatch(setError(error.response?.data.msg || 'Error al cargar examenes'));
            throw error;
        }
    }, [dispatch]);
    
    const handleLastExamAttempt = useCallback(async () => {
        try {
            const {data} = await adminApi.get(`/admin-dashboard/ultimo-examen-aplicado?carrera=${"Ingeniería de Software"}`);

            return data;

        } catch (error) {
            let errorMessage = error.response?.data.msg
            // dispatch(setError(error.response?.data.msg || 'Error al cargar examenes'));
            throw errorMessage;
        }
    }, [dispatch]);

    const handleSummaryAndGrades = useCallback(async (id_examen,  fechaInicio, fechaFin) => {
        try {
            const {data} = await adminApi.get(`/admin-dashboard/calificaciones-resumen/${id_examen}?fechaInicio=${fechaInicio}&fechaFin=${fechaFin}`);

            return data;

        } catch (error) {
            console.log(error);
            // dispatch(setError(error.response?.data.msg || 'Error al cargar examenes'));
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
