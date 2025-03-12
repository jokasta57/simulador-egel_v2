import { createSlice } from "@reduxjs/toolkit";

export const authSlice = createSlice({
    name: 'auth',
    initialState: {
        user: {},
        isAuthenticated: false,
        isLoading: false,
        error: ''
    },
    reducers: {
        onChecking: (state) => {
            state.isLoading = true; // Empieza la carga
            state.error = null;
        },
        onLoginSuccess: (state, { payload }) => {
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
            state.error = '';
        },
        clearErrorMessage: (state) => {
            state.error = ''
            state.isLoading = false;
        },
        setError: (state, {payload}) => {
            state.error = payload
        },
        setUser: (state, {payload}) => {
            state.user = payload
        }
    }
})

export const { setError, onChecking, onLoginSuccess, onLoginFailure, onLogout, clearErrorMessage, setUser} = authSlice.actions