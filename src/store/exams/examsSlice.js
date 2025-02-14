import { createSlice } from "@reduxjs/toolkit";

// Acción para obtener los exámenes
export const examsSlice = createSlice({
    name: "exams",
    initialState: {
        exams: [],
        currentExam: null,
        currentQuestion: {},
        currentAttempt: {},
        isLoading: false,
        error: null,
        success: null,
        currentOrder: null,
        totalQuestions: 0,
        preguntaNueva: null,
        answeredQuestions: [],
        remainingTime: "00:00:00"
    },
    reducers: {
        // Acción para establecer el examen actual
        setCurrentExam: (state, action) => {
            state.currentExam = action.payload
            state.isLoading = false
        },
        setCurrentQuestion: (state, action) => {
            state.currentQuestion = action.payload
            state.isLoading = false
        },
        setAnsweredQuestion: (state, action) => {
            const orden = action.payload;

            if (!state.answeredQuestions) {
                state.answeredQuestions = []; // Evitar `null`
            }

            // Solo agregar si aún no está en la lista
            if (!state.answeredQuestions.includes(orden)) {
                state.answeredQuestions.push(orden);
            }
        },
        setCurrentAttempt: (state, action) => {
            state.currentAttempt = action.payload
            state.isLoading = false
        },
        updateQuestionStart: (state) => {
            state.isLoading = true;
        },
        updateQuestion: (state, action) => {
            state.currentQuestion = action.payload
            state.isLoading = false
        },
        // Acción para agregar un nueva pregunta
        addNewQuestionStart: (state) => {
            state.isLoading = true;
        },
        // Acción para agregar un nueva pregunta
        addNewQuestion: (state, action) => {
            state.currentQuestion = action.payload;
            state.isLoading = false;
        },
        updateExamStart: (state) => {
            state.isLoading = true;
        },
        updateExamSuccess: (state, action) => {
            state.isLoading = false;
            state.currentExam = action.payload;
            state.success = 'Examen actualizado exitosamente';
            const index = state.exams.findIndex(exam => exam.id_examen === action.payload.id_examen);
            if (index !== -1) {
                state.exams[index] = action.payload;
            }
        },
        updateExamFailure: (state, action) => {
            state.isLoading = false;
            state.error = action.payload;
        },



        // Acción para agregar un nuevo examen
        addExam: (state, action) => {
            state.exams.push(action.payload) // Agrega un nuevo examen al array
        },

        // Acción para cargar los exámenes (simulando una carga)
        loadExams: (state, action) => {
            state.isLoading = false;
            state.exams = action.payload // Establece la lista de exámenes
        },

        // Acción para manejar errores de carga de exámenes
        setError: (state, action) => {
            state.isLoading = false; // Ahora cambia isLoading correctamente
            state.error = action.payload;
        },

        // Acción para limpiar los errores
        clearError: (state) => {
            state.isLoading = false;
            state.error = null
        },
        // Acción para limpiar el éxito de una operación
        clearSuccess: (state) => {
            state.success = null
        },
        // Acción para mostrar el éxito de una operación
        setSuccess: (state, action) => {
            state.success = action.payload // Establece el mensaje de éxito
        },
        loadExamsStart: (state) => {
            state.isLoading = true
        },
        resetCurrentQuestion: (state) => {
            state.currentQuestion = {};
        },
        setIsLoadingFalse: (state) => {
            state.isLoading = false
        },
        setIsLoading: (state) => {
            state.isLoading = true
        },

        //uso del orden
        setCurrentOrder: (state, action) => {
            state.currentOrder = action.payload;
        },
        setTotalQuestions: (state, action) => {
            state.totalQuestions = action.payload;
        },
        addNewQuestionTemp: (state) => {
            const newOrder = state.totalQuestions + 1;
            state.preguntaNueva = {
                id_examen: state.currentExam?.id,
                contenido: "",
                imagen_url: null,
                opcion: [
                    { contenido: "", imagen_url: null },
                    { contenido: "", imagen_url: null },
                ],
                es_correcta: 0,
                orden: newOrder,
            };
            state.totalQuestions += 1;
            state.currentOrder = newOrder;
            state.currentQuestion = {};
        },
        resetPreguntaNueva: (state) => {
            state.preguntaNueva = null;
        },
        resetAnsweredQuestions: (state) => {
            state.answeredQuestions = [];
        },
        setPreguntaNueva: (state, action) => {
            state.preguntaNueva = action.payload;
        },
        resetCurrentOrder: (state) => {
            state.currentOrder = null;
        },
        resetTotalQuestions: (state) => {
            state.totalQuestions = null;
        },
        // Añadimos el reducer para setRemainingTime
        setRemainingTime: (state, action) => {
            state.remainingTime = action.payload
        },
        // Añadimos un reducer para resetear remainingTime si es necesario
        resetRemainingTime: (state) => {
            state.remainingTime = "00:00:00"
        },
    },
})

export const {
    setCurrentExam,
    clearError,
    clearSuccess,
    addExam,
    loadExams,
    setError,
    setSuccess,
    loadExamsStart,
    updateExamStart,
    updateExamSuccess,
    updateExamFailure,
    setCurrentQuestion,
    updateQuestionStart,
    resetCurrentQuestion,
    updateQuestion,
    addNewQuestionStart,
    addNewQuestion,
    setIsLoadingFalse,
    setIsLoading,
    setCurrentOrder,
    setTotalQuestions,
    addNewQuestionTemp,
    resetPreguntaNueva,
    setPreguntaNueva,
    resetCurrentOrder,
    resetTotalQuestions,
    setCurrentAttempt,
    setAnsweredQuestion,
    resetAnsweredQuestions,
    resetRemainingTime,
    setRemainingTime
} = examsSlice.actions;  
