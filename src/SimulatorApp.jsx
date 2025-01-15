import React from 'react'
import { SimulatorPage } from './simulator/pages/SimulatorPage'
import { AppRouter } from './router/AppRouter'
import { BrowserRouter } from 'react-router-dom'

export const SimulatorApp = () => {
  return (
    <BrowserRouter>
      <AppRouter />
    </BrowserRouter>
  )
}

