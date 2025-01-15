import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { SimulatorApp } from './SimulatorApp.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <SimulatorApp />
  </StrictMode>,
)
