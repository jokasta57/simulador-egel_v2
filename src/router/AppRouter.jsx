import { Navigate, Route, Routes } from 'react-router-dom'
import { LoginPage } from '../auth'
import { ExamPage, ExamResultPage, HomePage, RegisterPage, SimulatorPage } from '../simulator'
import { DashboardLayout } from '../dashboard'
import { PrivateRoute } from './PrivateRoute'
import NotFoundPage from '../simulator/pages/NotFoundPage'
import { DashboardRoutes } from '../dashboard/routes/DashboardRoutes'

export const AppRouter = () => {
    const isAuthenticated = true
    const isStudentRegistered = false
    const isExamFinished = false

    return (
        <Routes>
            {/* Rutas comunes */}
            <Route path='/' element={<HomePage/>} />

            {/* Rutas del administrador */}
            <Route path='/login' element={<LoginPage/>}/> 
            <Route path ='/admin/*' element={
                // Ruta privada para DashboardPage
                <PrivateRoute 
                    isAuthenticated={isAuthenticated}
                    redirectTo='/login'
                >
                    <DashboardRoutes/>
                </PrivateRoute>
            }/>

            {/* Ruta para estudiantes */}
            <Route path='/student/register' element={<RegisterPage/>}/>
            {/* Ruta para acceder a todos los examenes disponibles */}
            <Route path='/exams' element={
                isStudentRegistered ? <SimulatorPage /> : <Navigate to="/student/register" />
            } />
            {/* Ruta para acceder al examen seleccionado */}
            <Route path='/exams/:examId' element={
                isStudentRegistered ? <ExamPage /> : <Navigate to="/student/register" />
            } />
            {/* Ruta para acceder al resultado final del examen */}
            <Route path='/exams/:examId/result' element={
                isExamFinished && isStudentRegistered ? <ExamResultPage /> : <Navigate to="/exams/:examId" />
            } />

            {/* Ruta para manejo de error 404 */}
            <Route path="*" element={<NotFoundPage />} />
        </Routes>
    )
}
