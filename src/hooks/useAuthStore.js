import { useDispatch, useSelector } from "react-redux"
import { onChecking, onLoginFailure, onLoginSuccess, onLogout, clearErrorMessage, setError, setUser } from "../store/auth/authSlice";
import simulatorApi from "../api/simulatorApi"
import { useNavigate } from "react-router-dom";

export const useAuthStore = () => {
    const { user, isAuthenticated, isLoading, error, } = useSelector(state => state.auth)
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const startLoginAdmin = async (numero_identificacion, nip) => {
        dispatch(onChecking());

        try {
            const { data } = await simulatorApi.post('/admin/auth', { numero_identificacion, nip });
            localStorage.setItem('token', data.token);
            localStorage.setItem('token-init-date', new Date().getTime());


            const { admin } = data;

            let role = admin?.superAdmin ? 'superAdmin' : 'admin'

            dispatch(onLoginSuccess({ nombre: admin.nombre, apellido_paterno: admin.apellido_paterno, apellido_materno: admin.apellido_materno, id: admin.id_admin, token: data.token, role: role, numero_identificacion: admin.numero_identificacion, carrera: admin.carrera }));
        } catch (error) {
            let errorMessage = error.response.data.msg;
            dispatch(onLoginFailure(errorMessage || 'Error al iniciar sesión'));
            setTimeout(() => dispatch(clearErrorMessage()), 5000); // Ahora espera 5 segundos antes de limpiar
            throw errorMessage
        }
    };


    const startLoginStudent = async (numero_cuenta, nip) => {
        dispatch(onChecking());
        let errorMessage = "Credenciales incorrectas";

        try {
            const { data } = await simulatorApi.post('/students/auth', { numero_cuenta, nip });
            const { estudiante } = data;

            localStorage.setItem('token', data.token);
            localStorage.setItem('token-init-date', new Date().getTime());

            dispatch(onLoginSuccess({
                nombre: estudiante.nombre,
                numero_cuenta,
                carrera: estudiante.carrera,
                role: "student"
            }));
        } catch (error) {
            let errorMessage = error.response.data.msg;
            dispatch(onLoginFailure(errorMessage || 'Error al iniciar sesión'));
            setTimeout(() => dispatch(clearErrorMessage()), 5000); // Ahora espera 5 segundos antes de limpiar
            throw errorMessage
        }
    };


    const startRegisterStudent = async ({ nombre, apellido_paterno, email, numero_cuenta, carrera, semestre, grupo, ciclo_escolar, nip }) => {
        dispatch(onChecking());
        try {
            const { data } = await simulatorApi.post('/students', { nombre, apellido_paterno, email, numero_cuenta, carrera, semestre, grupo, ciclo_escolar, nip });
            const { estudiante } = data;
            localStorage.setItem('token', data.token);
            //Esto es para hacer calculos de lo que dqeuda del token 
            localStorage.setItem('token-init-date', new Date().getTime());


            //Se dispara la accion en redux y en store
            dispatch(onLoginSuccess({ nombre: estudiante.nombre, numero_cuenta: estudiante.numero_cuenta, carrera: estudiante.carrera, role: "student" }))
        } catch (error) {
            let errorMessage = error.response?.data?.msg || "Error desconocido";
            console.error("Error al registrar estudiante:", errorMessage);
            if (error.response?.data) {
                errorMessage = error.response.data.msg || JSON.stringify(error.response.data);
            }
            dispatch(onLoginFailure(errorMessage));
            setTimeout(() => {
                dispatch(clearErrorMessage())
            }, 10)
        }
    }
    const checkAuthToken = async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            dispatch(onLogout());
            return;
        }

        try {
            // Solo ejecuta `onChecking()` si el usuario no está autenticado
            if (!isAuthenticated) dispatch(onChecking());

            const { data } = await simulatorApi.get('users/renew');
            localStorage.setItem('token', data.token);
            localStorage.setItem('token-init-date', new Date().getTime());

            // Si los datos no han cambiado, no actualizar Redux
            if (user?.role === data.role && user?.id === data.id_admin) return;

            const commonData = {
                nombre: data.nombre,
                apellido_paterno: data.apellido_paterno,
                apellido_materno: data.apellido_materno,
                role: data.role,
                numero_identificacion: data.numero_identificacion,
                carrera: data.carrera
            };

            if (data.role === 'admin' || data.role === 'superAdmin') {
                dispatch(onLoginSuccess({ ...commonData, id: data.id, token: data.token }));
            } else if (data.role === 'student') {
                dispatch(onLoginSuccess({ ...commonData, numero_cuenta: data.numero_cuenta, carrera: data.carrera }));
            }

        } catch (error) {
            localStorage.clear();
            dispatch(onLogout());
        }
    };

    const getUserInfo = async (numero_cuenta) => {
        try {
            const { data } = await simulatorApi.get(`students/${numero_cuenta}`);

            return data.estudiante;

        } catch (error) {
            let errorMessage = error.response?.data?.msg || "Error desconocido";
            return errorMessage
        }
    }

    const startUpdatePassword = async (numero_identificacion, nip_actual, nip_nuevo) => {
        // dispatch(onChecking());    
        try {
            const { data } = await simulatorApi.put('/admin-password', { numero_identificacion, nip_actual, nip_nuevo });
            return data.msg

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

            dispatch(onLoginFailure(errorMessage || 'Error al actualizar contraseña'));
            setTimeout(() => dispatch(clearErrorMessage()), 5000); // Limpiar después de 5 segundos
            throw errorMessage;
        }
    };
    
    const updateInfoStudent = async (numero_cuenta, formData) => {
        // dispatch(onChecking());    
        try {
            await simulatorApi.put(`/students/${numero_cuenta}`, formData);
            const { data } = await simulatorApi.get(`/students/${numero_cuenta}`);

            dispatch(setUser(data.estudiante))
            
            return data.msg

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

            dispatch(onLoginFailure(errorMessage || 'Error al actualizar contraseña'));
            setTimeout(() => dispatch(clearErrorMessage()), 5000); // Limpiar después de 5 segundos
            throw errorMessage;
        }
    };

    const startLogout = () => {
        localStorage.clear();
        dispatch(onLogout());
    }

    return {
        //Propiedades
        user,
        isAuthenticated,
        isLoading,
        error,

        //Metodos
        startLoginAdmin,
        startLoginStudent,
        startRegisterStudent,
        checkAuthToken,
        startLogout,
        getUserInfo,
        startUpdatePassword,
        updateInfoStudent
    }
}