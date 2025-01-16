import { ThemeProvider } from '@emotion/react'
import { CssBaseline } from '@mui/material'
import React from 'react'
import {theme} from './'

export const AppTheme = ({children}) => {
    return (
        <ThemeProvider theme={theme}>
            {/* CssBaseline kickstart an elegant, consistent, and simple baseline to build upon. */}
            <CssBaseline />
            {children}
        </ThemeProvider>
    )
}