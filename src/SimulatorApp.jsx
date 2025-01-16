import React from 'react'
import { SimulatorPage } from './simulator/pages/SimulatorPage'
import { AppRouter } from './router/AppRouter'
import { BrowserRouter } from 'react-router-dom'
import { AppTheme } from './theme/AppTheme'

export const SimulatorApp = () => {
  return (
    <AppTheme>
      <BrowserRouter>
        <AppRouter />
      </BrowserRouter>
    </AppTheme>
  )
}

