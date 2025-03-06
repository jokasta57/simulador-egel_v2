import { useDispatch } from "react-redux";
import { useCallback } from "react";
import adminApi from "../api/adminApi";


export const useAdminStore = () => {
    const dispatch = useDispatch();

    const handleAddNewAdmin = useCallback(async (admin = {}) => {
        try {
            const {data} = await adminApi.post(`/admin-managment`, admin);
            return data;

        } catch (error) {
            let errorMessage = error.response.data.msg || ''; // Si existe data.msg, se toma, si no, queda vacío

            // Verificamos si hay errores en los campos
            if (error.response.data.errors && typeof error.response.data.errors === 'object') {
                for (let field in error.response.data.errors) {
                    if (error.response.data.errors.hasOwnProperty(field)) {
                        const fieldError = error.response.data.errors[field];

                        // Si hay un mensaje en el error del campo, lo agregamos a errorMessage
                        if (fieldError && typeof fieldError === 'object' && fieldError.msg) {
                            errorMessage += ` ${fieldError.msg}`;
                        }
                    }
                }
            }
            // dispatch(setError(error.response?.data.msg || 'Error al cargar examenes'));
            throw errorMessage;
        } finally {
            // dispatch(setIsLoadingFalse()); // ✅ Asegura que isLoading siempre vuelva a false
        }
    }, [dispatch]);

    const handleUpdateAdmin = useCallback(async (id_admin, admin = {}) => {
        try {
            const {data} = await adminApi.put(`/admin-managment/${id_admin}`, admin);
            return data;

        } catch (error) {
            let errorMessage = error.response.data.msg || ''; // Si existe data.msg, se toma, si no, queda vacío

            // Verificamos si hay errores en los campos
            if (error.response.data.errors && typeof error.response.data.errors === 'object') {
                for (let field in error.response.data.errors) {
                    if (error.response.data.errors.hasOwnProperty(field)) {
                        const fieldError = error.response.data.errors[field];

                        // Si hay un mensaje en el error del campo, lo agregamos a errorMessage
                        if (fieldError && typeof fieldError === 'object' && fieldError.msg) {
                            errorMessage += ` ${fieldError.msg}`;
                        }
                    }
                }
            }
            // dispatch(setError(error.response?.data.msg || 'Error al cargar examenes'));
            throw errorMessage;
        } finally {
            // dispatch(setIsLoadingFalse()); // ✅ Asegura que isLoading siempre vuelva a false
        }
    }, [dispatch]);    
    
    const handleGetAdmins = useCallback(async () => {
        try {
            const {data} = await adminApi.get(`/admin-managment`);
            return data;

        } catch (error) {
            console.log(error);
            // dispatch(setError(error.response?.data.msg || 'Error al cargar examenes'));
            throw error;
        } finally {
            // dispatch(setIsLoadingFalse()); // ✅ Asegura que isLoading siempre vuelva a false
        }
    }, [dispatch]);    

    const handleDeleteAdmin = useCallback(async (id_admin) => {
        try {
            const {data} = await adminApi.delete(`/admin-managment/${id_admin}`);
            return data;

        } catch (error) {
            console.log(error);
            // dispatch(setError(error.response?.data.msg || 'Error al cargar examenes'));
            throw error;
        } finally {
            // dispatch(setIsLoadingFalse()); // ✅ Asegura que isLoading siempre vuelva a false
        }
    }, [dispatch]);    

    return {
        handleAddNewAdmin,
        handleGetAdmins,
        handleUpdateAdmin,
        handleDeleteAdmin
    };
};
