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
            dispatch(setError(error.response?.data.msg || 'Error al cargar examenes'));
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
            console.log(error);
            dispatch(setError(error.response?.data.msg || 'Error al cargar examenes'));
            throw error;
        } finally {
            // dispatch(setIsLoadingFalse()); // ✅ Asegura que isLoading siempre vuelva a false
        }
    }, [dispatch]);
    

    return {
        handlePercentage,
        handlePercentageByDate
    };
};
