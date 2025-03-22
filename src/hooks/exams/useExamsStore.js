import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import adminApi from "../../api/adminApi";
import {
    setCurrentExam,
    clearError,
    clearSuccess,
    setSuccess,
    loadExams,
    loadExamsStart,
    updateExamStart,
    updateExamSuccess,
    updateExamFailure,
    setError,
    setCurrentQuestion,
    updateQuestionStart,
    resetCurrentQuestion,
    updateQuestion,
    addNewQuestion,
    addNewQuestionStart,
    setIsLoadingFalse,
    setIsLoading,
    setCurrentAttempt,
    resetExams
} from '../../store/exams/examsSlice';
import simulatorApi from '../../api/simulatorApi';

export const useExamsStore = () => {
    const dispatch = useDispatch();
    const { exams, currentExam, isLoading, error, success, currentQuestion } = useSelector(state => state.exams);

    const handleLoadExams = useCallback(async (carrera) => {
        dispatch(loadExamsStart());
        try {
            const response = await adminApi.get(`/exams?carrera=${carrera}`);
            dispatch(loadExams(response.data.examenes));
            return response.data;
        } catch (err) {
            let errorMessage = err.response?.data.msg || 'Error al cargar examenes'
            dispatch(setError(err.response?.data.msg || 'Error al cargar examenes'));
            throw errorMessage;
        } finally {
            dispatch(setIsLoadingFalse()); // ✅ Asegura que isLoading siempre vuelva a false
        }
    }, [dispatch]);

    const handleNewAttempt = useCallback(async (numero_cuenta, id_examen) => {
        dispatch(setIsLoading());
        try {
            const response = await simulatorApi.post('/attempt', { numero_cuenta, id_examen });
            dispatch(setCurrentAttempt(response.data.intento));
            return response.data.intento;
        } catch (error) {
            dispatch(setError(error.response?.data.msg || 'Error al cargar examenes'));
            throw error;
        } finally {
            dispatch(setIsLoadingFalse()); // ✅ Asegura que isLoading siempre vuelva a false
        }
    }, [dispatch]);

    const handleLoadExamsByCareer = useCallback(async (carrera) => {
        dispatch(loadExamsStart());
        try {
            const response = await simulatorApi.get('/exams/career', {
                params: {
                    carrera: carrera
                }
            });
            dispatch(loadExams(response.data.examenes));
            return response.data;
        } catch (error) {
            dispatch(setError(error.response?.data.msg || 'Error al cargar examenes'));
            throw error;
        } finally {
            dispatch(setIsLoadingFalse()); // ✅ Asegura que isLoading siempre vuelva a false
        }
    })

    const handleLoadExam = useCallback(async (id) => {
        dispatch(loadExamsStart());
        try {
            const response = await adminApi.get(`/exams/${id}`);
            dispatch(setCurrentExam(response.data.examen));
            return response.data.examen;
        } catch (error) {
            dispatch(setError(error.response?.data.msg || 'Error al cargar el examen'));
            throw error;
        } finally {
            dispatch(setIsLoadingFalse()); // ✅ Asegura que isLoading siempre vuelva a false
        }
    }, [dispatch]);

    const handleUpdateExam = useCallback(async (examId, examData) => {
        dispatch(updateExamStart());
        try {
            const response = await adminApi.put(`/exams/${examId}`, examData);
            dispatch(updateExamSuccess(response.data.examen));
            return response.data;
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
            dispatch(updateExamFailure(errorMessage || 'Error al actualizar el examen'));
            throw error.response;
        } finally {
            dispatch(setIsLoadingFalse()); // ✅ Asegura que isLoading siempre vuelva a false
        }
    }, [dispatch]);

    const handleLoadQuestion = useCallback(async (examId, orden) => {
        try {
            const response = await adminApi.get(`/questions/orden`, {
                params: {
                    orden,
                    id_examen: examId
                }
            });
            if (!response.data.pregunta) {
                dispatch(setCurrentQuestion(null)); // En lugar de generar error, establecer null
                return null;
            }

            dispatch(setCurrentQuestion(response.data.pregunta))
            return response.data.pregunta;
        } catch (error) {
            dispatch(setError(error.response?.data.msg || 'Error al cargar la pregunta'));
            throw error;
        } finally {
            dispatch(setIsLoadingFalse()); // ✅ Asegura que isLoading siempre vuelva a false
        }
    }, [dispatch]);

    const handleLoadQuestionAndAnswer = useCallback(async (examId, orden, id_intento) => {
        try {
            const response = await simulatorApi.get(`/questions/answers/${id_intento}`, {
                params: {
                    orden,
                    id_examen: examId
                }
            });
            if (!response.data.pregunta) {
                dispatch(setCurrentQuestion(null)); // En lugar de generar error, establecer null
                return null;
            }

            dispatch(setCurrentQuestion(response.data.pregunta))
            return response.data.pregunta;
        } catch (error) {
            dispatch(setError(error.response?.data.msg || 'Error al cargar la pregunta'));
            throw error;
        } finally {
            dispatch(setIsLoadingFalse()); // ✅ Asegura que isLoading siempre vuelva a false
        }
    }, [dispatch]);

    const handleLoadQuestionsByExam = useCallback(async (examId) => {
        try {
            const response = await adminApi.get(`/questions/exam/${examId}`);
            return response.data.preguntas;
        } catch (error) {
            dispatch(setError(error.response?.data.msg || 'Error al cargar las preguntas'));
            throw error;
        } finally {
            dispatch(setIsLoadingFalse()); // ✅ Asegura que isLoading siempre vuelva a false
        }
    }, [dispatch]);

    const handleUpdateQuestion = useCallback(async (updateData) => {
        dispatch(updateQuestionStart());
        let backupOpciones = []; // Almacena el estado original de las opciones

        try {
            // Filtrar opciones válidas
            const opcionesValidas = updateData.opcion.filter(op =>
                (op.contenido && op.contenido.trim() !== "") || op.imagen_url
            );

            // if (opcionesValidas.length < 2) {
            //     throw new Error("Debe haber al menos 2 opciones válidas con texto o imagen.");
            // }

            // Separar opciones nuevas y existentes
            const opcionesExistentes = updateData.opcion.filter(op => op.id_opcion);
            const opcionesNuevas = updateData.opcion.filter(op => !op.id_opcion);

            // 1️⃣ **Guardar copia de seguridad de las opciones existentes**
            const opcionesBackupPromises = opcionesExistentes.map(async (opcion) => {
                const response = await adminApi.get(`/options/${opcion.id_opcion}`);
                return response.data.opcion; // Guardamos la opción original
            });

            backupOpciones = await Promise.all(opcionesBackupPromises);

            // 2️⃣ **Actualizar opciones existentes con PUT**
            const updatePromises = opcionesExistentes.map(async (opcion) => {
                const formData = new FormData();
                formData.append("contenido", opcion.contenido);
                formData.append("es_correcta", opcion.es_correcta);

                if (opcion.imagen instanceof File) {
                    formData.append("imagen", opcion.imagen);
                } else if (opcion.imagen_url instanceof File) {
                    formData.append("imagen", opcion.imagen_url);
                } else if (typeof opcion.imagen_url === "string") {
                    formData.append("imagen_url", opcion.imagen_url);
                }


                return adminApi.put(`/options/${opcion.id_opcion}`, formData, {
                    headers: { "Content-Type": "multipart/form-data" },
                });
            });

            // 3️⃣ **Crear opciones nuevas con POST**
            const createPromises = opcionesNuevas.map(async (opcion) => {
                const formData = new FormData();
                formData.append("contenido", opcion.contenido);
                formData.append("es_correcta", opcion.es_correcta);

                if (opcion.imagen instanceof File) {
                    formData.append("imagen", opcion.imagen);
                } else if (opcion.imagen_url instanceof File) {
                    formData.append("imagen", opcion.imagen_url);
                } else if (typeof opcion.imagen_url === "string") {
                    formData.append("imagen_url", opcion.imagen_url);
                }

                return adminApi.post(`/options`, formData, {
                    headers: { "Content-Type": "multipart/form-data" },
                    params: { id_pregunta: updateData.id_pregunta }
                });
            });

            // Esperar que TODAS las opciones se procesen antes de actualizar la pregunta
            await Promise.all([...updatePromises, ...createPromises]);

            // 4️⃣ **Actualizar la pregunta**
            const formData = new FormData();
            formData.append("contenido", updateData.contenido);

            if (updateData.imagen instanceof File) {
                formData.append("imagen", updateData.imagen);
            } else if (updateData.imagen_url instanceof File) {
                formData.append("imagen", updateData.imagen_url);
            }

            await adminApi.put(`/questions/${updateData.id_pregunta}`, formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            // 5️⃣ **Obtener la pregunta actualizada**
            const response = await adminApi.get(`/questions/id/${updateData.id_pregunta}`);
            dispatch(updateQuestion(response.data.pregunta));

            return response.data;
        } catch (error) {
            let errorMessage = error?.response?.data?.msg || "Error al actualizar la pregunta";

            if (error.response?.data?.errors) {
                errorMessage = Object.values(error.response.data.errors)
                    .map(err => (typeof err.msg === "string" ? err.msg : JSON.stringify(err)))
                    .join(", ");
            }

            // **🔄 Rollback de las opciones si la pregunta falla**
            if (backupOpciones.length > 0) {
                try {
                    const rollbackPromises = backupOpciones.map(async (opcionOriginal) => {
                        const formData = new FormData();
                        formData.append("contenido", opcionOriginal.contenido);
                        formData.append("es_correcta", opcionOriginal.es_correcta);

                        if (opcionOriginal.imagen_url) {
                            formData.append("imagen_url", opcionOriginal.imagen_url);
                        }

                        return adminApi.put(`/options/${opcionOriginal.id_opcion}`, formData, {
                            headers: { "Content-Type": "multipart/form-data" },
                        });
                    });

                    await Promise.all(rollbackPromises);

                } catch (rollbackError) {
                    errorMessage += " No se pudieron restaurar algunas opciones.";
                }
            }

            throw errorMessage;
        } finally {
            dispatch(setIsLoadingFalse());
        }
    }, [dispatch]);


    const handleAddNewQuestion = useCallback(async (data, examId, orden) => {
        dispatch(addNewQuestionStart());
        let createdQuestion = null; // Guardará la pregunta creada para rollback

        try {
            // Crear FormData para la pregunta
            const formData = new FormData();
            formData.append("contenido", data.contenido);

            if (data.imagen instanceof File) {
                formData.append("imagen", data.imagen);
            }

            // 1️⃣ **Crear la pregunta**
            const questionResponse = await adminApi.post(`/questions`, formData, {
                headers: { "Content-Type": "multipart/form-data" },
                params: { id_examen: examId, orden },
            });

            createdQuestion = questionResponse.data.pregunta; // Guardamos la pregunta creada

            const opcionesValidas = data.opcion.filter(op =>
                (op.contenido && op.contenido.trim() !== "") || op.imagen_url
            );

            if (opcionesValidas.length < 2) {
                throw new Error("Debe haber al menos 2 opciones válidas con texto o imagen.");
            }

            // 2️⃣ **Crear opciones**
            const newOptionsPromises = opcionesValidas.map(async (opcion) => {
                const optionFormData = new FormData();
                optionFormData.append("contenido", opcion.contenido ?? '');
                optionFormData.append("es_correcta", opcion.es_correcta);

                if (opcion.imagen_url instanceof File) {
                    optionFormData.append("imagen", opcion.imagen_url);
                }

                return adminApi.post(`/options`, optionFormData, {
                    headers: { "Content-Type": "multipart/form-data" },
                    params: { id_pregunta: createdQuestion.id_pregunta },
                });
            });

            await Promise.all(newOptionsPromises); // Esperar la creación de todas las opciones

            // 3️⃣ **Obtener la pregunta con opciones actualizadas**
            const response = await adminApi.get(`/questions/orden`, {
                params: { orden, id_examen: examId },
            });

            dispatch(addNewQuestion(response.data.pregunta));
            return response.data.preguntas;

        } catch (error) {
            let errorMessage = error.response?.data?.msg || error.message || "Error al agregar pregunta";

            // **🔄 Rollback: Si falló la creación de opciones, eliminar la pregunta**
            if (createdQuestion) {
                try {
                    await adminApi.delete(`/questions/${createdQuestion.id_pregunta}`);
                    errorMessage += " (Rollback: Hubo un problema y la pregunta no se guardó)";
                } catch (rollbackError) {
                    errorMessage += " (Hubo un problema y la pregunta no se guardó por completo)";
                }
            }

            dispatch(setError(errorMessage));
            throw errorMessage;

        } finally {
            dispatch(setIsLoadingFalse());
        }
    }, [dispatch]);



    const handleDeleteQuestion = useCallback(async (id_pregunta) => {
        dispatch(updateQuestionStart());
        try {
            const preguntaResp = await adminApi.get(`/questions/id/${id_pregunta}`);

            const { opcion } = preguntaResp.data.pregunta;

            // Mapear las opciones para procesarlas individualmente
            const deleteOptions = opcion.map(async (opcionEliminar) => {
                await adminApi.delete(`/options/${opcionEliminar.id_opcion}`);
            });

            // Esperar a que todas las opciones se actualicen
            await Promise.all(deleteOptions);

            const response = await adminApi.delete(`/questions/${id_pregunta}`);
            return response.data.preguntas;
        } catch (error) {
            dispatch(setError(error.response?.data.msg || 'Error al eliminar pregunta'));
            throw error;
        } finally {
            dispatch(setIsLoadingFalse()); // ✅ Asegura que isLoading siempre vuelva a false
        }
    }, [dispatch]);

    const handleDeleteOption = useCallback(async (id_opcion, id_pregunta) => {
        dispatch(updateQuestionStart());
        try {
            await adminApi.delete(`/options/${id_opcion}`);

            const response = await adminApi.get(`/questions/id/${id_pregunta}`);

            dispatch(updateQuestion(response.data.pregunta))
            dispatch(setSuccess('Opción eliminada correctamente'))

            return response.data.pregunta;
        } catch (error) {
            dispatch(setError(error.response?.data.msg || 'Error al eliminar opcion'));
            throw error;
        } finally {
            dispatch(setIsLoadingFalse()); // ✅ Asegura que isLoading siempre vuelva a false
        }
    }, [dispatch]);

    const handleDeleteOptionImage = useCallback(async (id_opcion, id_pregunta) => {
        dispatch(updateQuestionStart());
        try {
            await adminApi.put(`/options/imagen/${id_opcion}`);

            const response = await adminApi.get(`/questions/id/${id_pregunta}`);

            // dispatch(updateQuestion(response.data.pregunta))
            dispatch(setSuccess('Imagen eliminada correctamente'))

            return response.data.pregunta;
        } catch (error) {
            dispatch(setError(error.response?.data.msg || 'Error al eliminar imagen'));
            throw error;
        } finally {
            dispatch(setIsLoadingFalse()); // ✅ Asegura que isLoading siempre vuelva a false
        }
    }, [dispatch]);

    const handleDeleteQuestionImage = useCallback(async (id_pregunta) => {
        dispatch(updateQuestionStart());
        try {
            await adminApi.put(`/questions/imagen/${id_pregunta}`);

            const response = await adminApi.get(`/questions/id/${id_pregunta}`);

            dispatch(updateQuestion(response.data.pregunta))
            dispatch(setSuccess('Imagen eliminada correctamente'))

            return response.data.pregunta;
        } catch (error) {
            dispatch(setError(error.response?.data.msg || 'Error al eliminar imagen'));
            throw error;
        } finally {
            dispatch(setIsLoadingFalse()); // ✅ Asegura que isLoading siempre vuelva a false
        }
    }, [dispatch]);

    const handleSwitchState = useCallback(async (estado, id_examen) => {
        dispatch(updateQuestionStart());
        try {
            const response = await adminApi.put(`/exams/state/${id_examen}`, {}, {
                params: {
                    estado
                }
            });
            return response.data.examen;
        } catch (error) {
            let errorMessage = error.response?.data.msg || 'Error en el cambio de estado'
            dispatch(setError(error.response?.data.msg || 'Error al eliminar pregunta'));
            throw errorMessage;
        } finally {
            dispatch(setIsLoadingFalse()); // ✅ Asegura que isLoading siempre vuelva a false
        }
    }, [dispatch]);

    const handleSaveAnswer = useCallback(async (id_intento, id_opcion) => {
        dispatch(setIsLoading());
        try {
            const response = await simulatorApi.post(`/answers`, { id_intento, id_opcion });

            return response.data.respuesta;
        } catch (error) {
            dispatch(setError(error.response?.data.msg || 'Error al agregar pregunta'));
            throw error;
        } finally {
            dispatch(setIsLoadingFalse()); // ✅ Asegura que isLoading siempre vuelva a false
        }
    }, [dispatch]);

    const handleUpdateAnswer = useCallback(async (id_respuesta, id_opcion) => {
        dispatch(setIsLoading());
        try {
            const response = await simulatorApi.put(`/answers/${id_respuesta}`, { id_opcion });

            return response.data.respuesta;
        } catch (error) {
            dispatch(setError(error.response?.data.msg || 'Error al agregar pregunta'));
            throw error;
        } finally {
            dispatch(setIsLoadingFalse()); // ✅ Asegura que isLoading siempre vuelva a false
        }
    }, [dispatch]);

    //Obteiene el resultado del examen
    const handleGetResultsAttempt = useCallback(async (id_intento) => {
        dispatch(setIsLoading());
        try {
            const response = await simulatorApi.get(`/results/calificacion-intento/${id_intento}`);

            return response.data;

        } catch (error) {
            dispatch(setError(error.response?.data.msg || 'Error al cargar el resultado'));
            throw error;
        } finally {
            dispatch(setIsLoadingFalse()); // ✅ Asegura que isLoading siempre vuelva a false
        }
    }, [dispatch]);

    const handleReviewAttempt = useCallback(async (id_intento, page, limit) => {
        dispatch(setIsLoading());
        try {
            const response = await simulatorApi.get(`/results/revision/${id_intento}?page=${page}&limit=${limit}`);

            return response.data;

        } catch (error) {
            dispatch(setError(error.response?.data.msg || 'Error al cargar la revision'));
            throw error;
        } finally {
            dispatch(setIsLoadingFalse()); // ✅ Asegura que isLoading siempre vuelva a false
        }
    }, [dispatch]);

    const handlePanelQuestions = useCallback(async (id_intento) => {
        dispatch(setIsLoading());
        try {
            const response = await simulatorApi.get(`/results/preguntas-panel/${id_intento}`);

            return response.data;

        } catch (error) {
            dispatch(setError(error.response?.data.msg || 'Error al cargar la revision'));
            throw error;
        } finally {
            dispatch(setIsLoadingFalse()); // ✅ Asegura que isLoading siempre vuelva a false
        }
    }, [dispatch]);

    const handleClearError = useCallback(() => {
        dispatch(clearError());
    }, [dispatch]);

    const handleClearSuccess = useCallback(() => {
        dispatch(clearSuccess());
    }, [dispatch]);

    const handleResetCurrentQuestion = useCallback(() => {
        dispatch(resetCurrentQuestion());
    }, [dispatch])

    return {
        // Estados principales
        exams, currentExam, isLoading, error, success,

        // Manejo de errores y estado
        setError, clearError, resetExams, handleClearError, handleClearSuccess,

        // Gestión de exámenes
        handleLoadExams, handleLoadExamsByCareer, handleLoadExam, handleUpdateExam, handleSwitchState,

        // Gestión de preguntas
        handleLoadQuestion, handleLoadQuestionsByExam, handleUpdateQuestion,
        handleResetCurrentQuestion, handleAddNewQuestion, handleDeleteQuestion, handlePanelQuestions,

        // Gestión de respuestas e intentos
        handleNewAttempt, handleSaveAnswer, handleLoadQuestionAndAnswer,
        handleUpdateAnswer, handleGetResultsAttempt, handleReviewAttempt,

        // Eliminación de opciones e imágenes
        handleDeleteOption, handleDeleteOptionImage, handleDeleteQuestionImage
    };

};
