import { useDispatch, useSelector } from "react-redux"
import { onChecking, onLoginFailure, onLoginSuccess, onLogout,clearErrorMessage } from "../store";
import simulatorApi from "../api/simulatorApi"
import { useNavigate } from "react-router-dom";

export const useAuthStore = () => {
    const {user,isAuthenticated, isLoading, error,  } = useSelector( state => state.auth )
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const startLoginAdmin = async(numero_identificacion, nip) => {
        // console.log({numero_cuenta, nip});
        dispatch(onChecking());

        try {
            //Disparar accion al backend
            const {data} = await simulatorApi.post('/admin/auth', {numero_identificacion, nip});
            localStorage.setItem('token', data.token);
            //Esto es para hacer calculos de lo que dqeuda del token 
            localStorage.setItem('token-init-date', new Date().getTime());
            //Accedemos al objeto admin
            const {admin} = data;
            //Se dispara la accion en redux y en store
            dispatch(onLoginSuccess({nombre: admin.nombre, id: admin.id_admin, token: admin.token, role: "admin"}))
        } catch (error) {
            console.log(error);
            if (error.response?.data) {
                errorMessage = error.response.data.msg || JSON.stringify(error.response.data);
            }
            dispatch(onLoginFailure('Credenciales incorrectas'));
            dispatch(onLogout());
            setTimeout(() => {
                dispatch(clearErrorMessage())
            }, 10)
        }
    }

    const startLoginStudent = async(numero_cuenta, nip) => {
        // console.log({numero_cuenta, nip});
        dispatch(onChecking());

        try {
            //Disparar accion al backend
            const {data} = await simulatorApi.post('/students/auth', {numero_cuenta, nip});

            const {estudiante} = data;

            localStorage.setItem('token', data.token);
            //Esto es para hacer calculos de lo que dqeuda del token 
            localStorage.setItem('token-init-date', new Date().getTime());
            //Se dispara la accion en redux y en store
            console.log(estudiante);
            dispatch(onLoginSuccess({nombre: estudiante.nombre, numero_cuenta: estudiante.numero_cuenta, carrera: estudiante.carrera, role: "student"}))
        } catch (error) {
            dispatch(onLoginFailure('Credenciales incorrectas'));
            dispatch(onLogout());
            if (error.response?.data) {
                errorMessage = error.response.data.msg || JSON.stringify(error.response.data);
            }
            setTimeout(() => {
                dispatch(clearErrorMessage())
            }, 10)
        }
    }

    const startRegisterStudent = async({nombre, apellido_paterno, email, numero_cuenta, carrera, semestre, grupo, ciclo_escolar,nip}) => {
        dispatch(onChecking());
        try {
            const {data} = await simulatorApi.post('/students', {nombre, apellido_paterno, email, numero_cuenta, carrera, semestre, grupo, ciclo_escolar,nip});
            const {estudiante} = data;
            localStorage.setItem('token', data.token);
            //Esto es para hacer calculos de lo que dqeuda del token 
            localStorage.setItem('token-init-date', new Date().getTime());


            //Se dispara la accion en redux y en store
            dispatch(onLoginSuccess({nombre: estudiante.nombre, numero_cuenta: estudiante.numero_cuenta, carrera: estudiante.carrera, role: "student" }))
        } catch (error) {
            const errorMessage = error.response?.data?.msg || "Error desconocido";
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
    const checkAuthToken = async() => {
        dispatch(onChecking());
        const token = localStorage.getItem('token');
        if( !token ) return dispatch(onLogout());

        //Revalida el token y lo setea
        try {
            const {data} = await simulatorApi.get('users/renew');
            localStorage.setItem('token', data.token)
            localStorage.setItem('token-init-date', new Date().getTime());
            //Dependiendo el rol del usuario, es el guardado en redux
            if(data.role === 'admin'){
                dispatch(onLoginSuccess({nombre: data.nombre, id: data.id_admin, token: data.token, role: data.role}))
            } else if(data.role === 'student'){
                dispatch(onLoginSuccess({nombre: data.nombre, numero_cuenta: data.numero_cuenta, carrera: data.carrera, role: data.role}))
            }
            
        } catch (error) {
            localStorage.clear();
            dispatch(onLogout());
        }
    }
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
        startLogout

    }
}