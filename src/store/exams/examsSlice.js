import { createSlice } from "@reduxjs/toolkit";

// Acción para obtener los exámenes
export const examsSlice = createSlice({
    name: "exams",
    initialState: {
        exams: [],
        currentExam: null,
        isLoading: false,
        error: null,
        success: null,
        currentQuestion: {},
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
        updateQuestionStart: (state) => {
            state.isLoading = true;
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

        // Acción para limpiar los errores
        clearError: (state) => {
            state.error = null
        },

        // Acción para limpiar el éxito de una operación
        clearSuccess: (state) => {
            state.success = null
        },

        // Acción para agregar un nuevo examen
        addExam: (state, action) => {
            state.exams.push(action.payload) // Agrega un nuevo examen al array
        },

        // Acción para cargar los exámenes (simulando una carga)
        loadExams: (state, action) => {
            state.isLoading = false
            state.exams = action.payload // Establece la lista de exámenes
        },

        // Acción para manejar errores de carga de exámenes
        setError: (state, action) => {
            state.error = action.payload // Establece el mensaje de error
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
        }
    },
})

export const { setCurrentExam, clearError, clearSuccess, addExam, loadExams, setError, setSuccess, loadExamsStart, updateExamStart, updateExamSuccess, updateExamFailure, setCurrentQuestion, updateQuestionStart, resetCurrentQuestion } = examsSlice.actions;  
