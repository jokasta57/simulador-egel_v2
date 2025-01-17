import axios from "axios";
import { getEnvVariables } from "../helpers/getEnvVariables";

const { VITE_API_URL } = getEnvVariables();

const simulatorApi = axios.create({
    baseURL: VITE_API_URL
})

//TODO: configurar interceptores
simulatorApi.interceptors.request.use( config => {

    //Revisa que el token siga valido
    //Envia el token en cada peticion mientras sea valido
    config.headers = {
        ...config.headers,
        'x-token': localStorage.getItem("token")
    }

    return config
})

export default simulatorApi;