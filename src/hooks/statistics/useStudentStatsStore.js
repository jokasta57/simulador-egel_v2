import { useDispatch, useSelector } from "react-redux"
import { useNavigate } from "react-router-dom";
import simulatorApi from "../../api/simulatorApi";

export const useStudentStatsStore = () => {
    const dispatch = useDispatch();

    const handleStudentResults = async (numero_cuenta) => {
        try {
            //Disparar accion al backend
            const { data } = await simulatorApi.get(`/results/mis-resultados/${numero_cuenta}`);

            return data;

        } catch (error) {
            console.log(error);
            let errorMessage = 'Error al cargar resultados';
            if (error.response?.data) {
                errorMessage = error.response.data.msg || JSON.stringify(error.response.data);
            }

            return {
                errorMessage
            }
        }
    }


    return {
        //Metodos
        handleStudentResults
    }
}