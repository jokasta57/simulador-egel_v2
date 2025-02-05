import React from 'react'
import { AppRouter } from './router/AppRouter'
import { BrowserRouter } from 'react-router-dom'
import { AppTheme } from './theme/AppTheme'
import { Provider } from 'react-redux'
import { store } from './store'

export const SimulatorApp = () => {
  return (
    <Provider store={store}>

    <AppTheme>
      <BrowserRouter>
        <AppRouter />
      </BrowserRouter>
    </AppTheme>
    </Provider>
  )
}

