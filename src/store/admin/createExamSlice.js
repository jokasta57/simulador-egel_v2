import { createSlice } from "@reduxjs/toolkit";

export const createExamSlice = createSlice({
    name: 'createExam',
    initialState: {
        newExamInfo: {
            id_examen: '',
            nombre: '',
            duracion: '',
            carrera: '',
            periodo: '',
            isSaved: false,
        },
        isLoading: false,
        error: null,
        success: null,
        lastSaved: null,
    },
    reducers: {
        onUpdateExamInfo: (state, action) => {
            state.newExamInfo = { ...state.examInfo, ...action.payload, isSaved: false };
        },
        clearError: (state) => {
            state.error = null;
        },
        clearSuccess: (state) => {
            state.success = null;
        },
        saveExamInfoStart: (state) => {
            state.isLoading = true;
        },
        saveExamInfoSuccess: (state, action) => {
            state.isLoading = false;
            state.newExamInfo = { ...action.payload, isSaved: true };
            state.success = 'Información del examen guardada exitosamente';
            state.lastSaved = new Date().toISOString();
        },
        saveExamInfoFailure: (state, action) => {
            state.isLoading = false;
            state.error = action.payload || 'Error al guardar la información del examen';
        },
        resetNewExamInfo: (state) => {
            state.newExamInfo = {};
        },
    },
});

export const { onUpdateExamInfo, clearError, clearSuccess, saveExamInfoStart, saveExamInfoSuccess, saveExamInfoFailure, resetNewExamInfo } = createExamSlice.actions;  
