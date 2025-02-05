import React from 'react'
import { Navigate } from 'react-router-dom'

export const PrivateRoute = ({ isAuthenticated, children, redirectTo, userRole }) => {

    return isAuthenticated //Si esta logeado
    ? children //Carga el componente asignado 
    : <Navigate 
        to={redirectTo} 
        state={{ role: userRole }}
        replace
        /> //Si no, redirecciona al path enviado
}