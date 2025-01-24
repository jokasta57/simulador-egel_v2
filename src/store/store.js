import { configureStore } from '@reduxjs/toolkit'
import { authSlice, createExamSlice, examsSlice,  } from './'

export const store = configureStore({
  reducer: {
    auth: authSlice.reducer,
    createExam: createExamSlice.reducer,
    exams: examsSlice.reducer,
  },
})