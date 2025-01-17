import { createSlice } from "@reduxjs/toolkit";

export const authSlice = createSlice({
    name: 'auth',
    initialState: {
        user: {},
        isAuthenticated: false,
        isLoading: false,
        error: undefined
    },
    reducers: {
        onChecking: (state) => {
            state.isLoading = true; // Empieza la carga
            state.error = null;
        },
        onLoginSuccess: (state, { payload }) => {
            console.log(payload);
            state.user = payload;
            state.isAuthenticated = true;
            state.isLoading = false;
            state.error = null;
        },
        onLoginFailure: (state, { payload }) => {
            state.isLoading = false;
            state.error = payload
        },
        onLogout: (state) => {
            state.user = {};
            state.isAuthenticated = false;
            state.isLoading = false;
            state.error = undefined;
        },
        clearErrorMessage: (state) => {
            state.error = undefined
        }
    }
})

export const { onChecking, onLoginSuccess, onLoginFailure, onLogout, clearErrorMessage} = authSlice.actions