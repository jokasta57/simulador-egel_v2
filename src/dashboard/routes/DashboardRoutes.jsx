import React from 'react'
import {Routes, Route, Navigate } from 'react-router-dom';

import { CreateExam, Dashboard, ExamList, ExamEdit } from '../components'
import { DashboardLayout } from '../layout/dashboardLayout'
export const DashboardRoutes = () => {
    return (
        <DashboardLayout>
            <Routes>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/examenes" element={<ExamList />} />
                <Route path="/crear-examen" element={<CreateExam />} />
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="/exams/:id/edit" element={<ExamEdit />} />
            </Routes>
        </DashboardLayout>
    )
}
