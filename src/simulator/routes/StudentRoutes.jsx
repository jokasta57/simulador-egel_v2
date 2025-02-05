import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { StudentLayout } from '../layout/StudentLayout';
import { ExamQuestions, ExamResult, Exams, Profile, Results } from '../components';

export const StudentRoutes = () => {
  return (
    <StudentLayout>
      <Routes>
        <Route path="/home" element={<Exams />} />
        <Route path="/exams/:examId" element={<ExamQuestions />} />
        <Route path="/exams/:examId/result" element={<ExamResult />}/>
        <Route path="/perfil" element={<Profile />} />
        <Route path="/resultados" element={<Results />} />
        <Route path="/" element={<Navigate to="/home" replace />} />
      </Routes>
    </StudentLayout>
  );
};
