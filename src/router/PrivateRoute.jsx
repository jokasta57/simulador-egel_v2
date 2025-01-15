import React from 'react'
import { Navigate } from 'react-router-dom'

export const PrivateRoute = ({ isAuthenticated, children, redirectTo }) => {
    return isAuthenticated //Si esta logeado
    ? children //Carga el componente asignado 
    : <Navigate to={redirectTo} /> //Si no, redirecciona al path enviado
}
