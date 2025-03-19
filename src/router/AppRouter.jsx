import { Navigate, Route, Routes } from 'react-router-dom';
import { LoginPage } from '../auth';
import { HomePage, RegisterPage } from '../simulator';
import { PrivateRoute } from './PrivateRoute';
import NotFoundPage from '../simulator/pages/NotFoundPage';
import { DashboardRoutes } from '../dashboard/routes/DashboardRoutes';
import { useAuthStore } from '../hooks/useAuthStore';
import { useEffect } from 'react';
import { LoadingSpinner } from '../simulator/components/LoadingSpinner';
import { useSelector } from 'react-redux';
import { StudentRoutes } from '../simulator/routes/StudentRoutes';

export const AppRouter = () => {
    const { isAuthenticated, checkAuthToken, isLoading, user } = useAuthStore();

    useEffect(() => {
        checkAuthToken();
    }, []);

    if (isLoading) {
        return <LoadingSpinner />;
    }

    // Obtener el rol del usuario autenticado
    const userRole = user?.role || null;

    return (
        <Routes>
            {/* Página principal */}
            <Route path="/" element={<HomePage />} />

            {/* Página de login: Redirige según el rol si ya está autenticado */}
            <Route
                path='/login'
                element={
                    isAuthenticated ? (
                        (userRole === "admin" || userRole === 'superAdmin')
                            ? <Navigate to="/admin/dashboard" replace />
                            : <Navigate to="/student/home" replace />
                    ) : (
                        <LoginPage />
                    )
                }
            />

            {/* Rutas del Administrador */}
            <Route path="/admin/*" element={
                <PrivateRoute isAuthenticated={isAuthenticated && (userRole === 'admin' || userRole === 'superAdmin')} redirectTo="/login" userRole={"admin"}>
                    <DashboardRoutes />
                </PrivateRoute>
            } />

            {/* Rutas del Estudiante */}
            <Route path="/student/register" element={<RegisterPage />} />

            {/* Rutas del Estudiante */}
            <Route path="/student/*" element={
                <PrivateRoute isAuthenticated={isAuthenticated && userRole === 'student'} redirectTo="/login" userRole={"student"}>
                    <StudentRoutes />
                </PrivateRoute>
            } />

            {/* Ruta 404 */}
            <Route path="*" element={<NotFoundPage />} />
        </Routes>
    );
};
