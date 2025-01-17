import { configureStore } from '@reduxjs/toolkit'
import { authSlice, createExamSlice,  } from './'

export const store = configureStore({
  reducer: {
    auth: authSlice.reducer,
    createExam: createExamSlice.reducer
  },
})