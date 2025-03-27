# 🏗 Arquitectura del Proyecto

Este documento describe la estructura de carpetas y la organización del código en este proyecto React.

## 📂 Estructura de directorios
La aplicación sigue una arquitectura modular, separando componentes, páginas, estilos y utilidades.

simulador-egel/
├── public/               # Archivos públicos (garza.png)
├── src/                  # Código fuente
│   ├── api/              # Configuración de Axios para peticiones API
│   ├── auth/             # Componente de inicio de sesión
│   ├── context/          # Context API (gestión de estado global para el layout)
│   ├── dashboard/        # Panel del administrador
│   │   ├── components/   # Componentes reutilizables que conforman la interfaz del Panel del Administrador
│   │   ├── layout/       # Estructura y diseño general del Panel de Administración
│   │   ├── routes/       # Gestión de rutas dentro del Panel de Administración
│   ├── helpers/          # Devuelve todas las variables de entorno disponibles a través de import.meta.env
│   ├── hooks/            # Custom Hooks para lógica reutilizable y peticiones al backend
│   ├── router/           # Gestión de rutas general del sitio
│   ├── simulator/        # Panel del estudiante
│   │   ├── components/   # Componentes reutilizables que conforman la interfaz del Panel del estudiante
│   │   ├── helpers/      # Validador del formulario del registro de estudiante
│   │   ├── layout/       # Estructura y diseño general del Panel del estudiante
│   │   ├── pages/        # Páginas principales
│   │   ├── routes/       # Gestión de rutas dentro del Panel del estudiante
│   ├── store/            # Almacén de datos globales en Redux(ej. estado de la aplicación o configuración de la app)
│   ├── theme/            # Funciones de utilidad y configuraciones relacionadas con el tema de la aplicación (colores, tipografía, etc.)
│   ├── SimulatorApp.js   # Componente principal de la aplicación
│   └── main.jsx          # Punto de entrada de la aplicación
├── .env                  # Archivo para variables de entorno, contiene la URL para peticiones
├── .gitignore            # Archivos y carpetas a ignorar en Git
├── package.json          # Dependencias y configuración del proyecto
└── README.md             # Documentación principal del proyecto

---

## 📌 **Explicación de cada directorio**

### 📂 `public/`
Contiene archivos públicos como `index.html`, imágenes y otros recursos estáticos (por ejemplo, `garza.png`).

### 📂 `src/`
Carpeta principal con el código fuente del proyecto. Aquí se organiza el proyecto en módulos para el **Panel del Administrador** y el **Panel del Estudiante**.

- **`api/`** → Configuración de **Axios** para realizar peticiones a la API. Centraliza las configuraciones de las llamadas a los servicios externos y añade los interceptores.
- **`auth/`** → Contiene el componente de **inicio de sesión** y funciones relacionadas con la autenticación de usuarios.
- **`context/`** → Implementación de **Context API** para manejar el estado global de la aplicación, como el estado del layout.
- **`dashboard/`** → Panel del **Administrador**, incluye:
  - **`components/`** → Componentes reutilizables específicos para la interfaz del administrador.
  - **`layout/`** → Estructura y diseño general del Panel de Administración.
  - **`routes/`** → Rutas que gestionan las vistas dentro del Panel de Administración.
- **`helpers/`** → Contiene funciones auxiliares como el acceso a las variables de entorno disponibles mediante `import.meta.env`.
- **`hooks/`** → Custom Hooks que encapsulan lógica reutilizable para interactuar con el backend y otros procesos.
- **`router/`** → Gestiona las rutas generales del sitio, incluyendo la configuración de `React Router`.
- **`simulator/`** → Panel del **Estudiante**, incluye:
  - **`components/`** → Componentes reutilizables específicos para la interfaz del estudiante.
  - **`helpers/`** → Funciones de validación de formularios y otras utilidades para el estudiante.
  - **`layout/`** → Estructura y diseño general del Panel del Estudiante.
  - **`pages/`** → Páginas principales del panel del estudiante, como el formulario de registro o la vista de exámenes.
  - **`routes/`** → Rutas que gestionan las vistas dentro del Panel del Estudiante.
- **`store/`** → Almacén de datos globales usando **Redux** para gestionar el estado de la aplicación.
- **`theme/`** → Configuraciones de estilo, incluyendo temas como colores, tipografía y demás opciones visuales globales.
- **`SimulatorApp.js`** → Componente principal que conecta todo y renderiza la aplicación.
- **`main.jsx`** → Punto de entrada de la aplicación, donde se monta el componente `SimulatorApp` en el DOM.

---

**Dependencias principales:**
- `react-router-dom`
- `@reduxjs/toolkit`
- `@mui/material`
- `axios`
- `react-redux`
---

## 🏗 **Flujo de la Aplicación**

1. **Punto de entrada (`main.jsx`)**:
    - Se monta la aplicación en el DOM, renderizando el componente `SimulatorApp`, que es el componente raíz de la aplicación.
    - En este punto, la aplicación pasa por el `StrictMode` para mejorar la detección de errores durante el desarrollo.
    
    ```jsx
    import { StrictMode } from 'react';
    import { createRoot } from 'react-dom/client';
    import { SimulatorApp } from './SimulatorApp.jsx';

    createRoot(document.getElementById('root')).render(
      <StrictMode>
        <SimulatorApp />
      </StrictMode>
    );
    ```

2. **`SimulatorApp`**:
    - Este componente es el punto de entrada principal de la aplicación y se encarga de envolver todo en los proveedores necesarios como `Provider` para Redux, `AppTheme` para los estilos, y `BrowserRouter` para el enrutamiento.
    
    ```jsx
    import React from 'react';
    import { AppRouter } from './router/AppRouter';
    import { BrowserRouter } from 'react-router-dom';
    import { AppTheme } from './theme/AppTheme';
    import { Provider } from 'react-redux';
    import { store } from './store';

    export const SimulatorApp = () => {
      return (
        <Provider store={store}>
          <AppTheme>
            <BrowserRouter>
              <AppRouter />
            </BrowserRouter>
          </AppTheme>
        </Provider>
      );
    };
    ```

3. **`AppTheme`**:
    - El componente `AppTheme` se encarga de envolver la aplicación con el `ThemeProvider` de Material UI y aplicar los estilos base utilizando `CssBaseline`.

    ```jsx
    import React from 'react';
    import { ThemeProvider } from '@emotion/react';
    import { CssBaseline } from '@mui/material';
    import { theme } from './theme';

    export const AppTheme = ({ children }) => {
      return (
        <ThemeProvider theme={theme}>
          <CssBaseline />
          {children}
        </ThemeProvider>
      );
    };
    ```

4. **Enrutamiento (`AppRouter`)**:
    - Dentro de `SimulatorApp`, se utiliza `BrowserRouter` para gestionar las rutas y `AppRouter` para definir las rutas específicas de la aplicación.

    ```jsx
        import { Navigate, Route, Routes } from 'react-router-dom';
        import { LoginPage } from '../auth';
        import { HomePage, RegisterPage } from '../simulator';
        import { PrivateRoute } from './PrivateRoute';
        import NotFoundPage from '../simulator/pages/NotFoundPage';
        import { DashboardRoutes } from '../dashboard/routes/DashboardRoutes';
        import { useAuthStore } from '../hooks/useAuthStore';
        import { useEffect } from 'react';
        import { LoadingSpinner } from '../simulator/components/LoadingSpinner';
        import { useSelector } from 'react-redux';
        import { StudentRoutes } from '../simulator/routes/StudentRoutes';

        export const AppRouter = () => {
        const { isAuthenticated, checkAuthToken, isLoading, user } = useAuthStore();

        useEffect(() => {
            checkAuthToken();
        }, []);

        if (isLoading) {
            return <LoadingSpinner />;
        }

        // Obtener el rol del usuario autenticado
        const userRole = user?.role || null;

        return (
            <Routes>
            {/* Página principal */}
            <Route path="/" element={<HomePage />} />

            {/* Página de login: Redirige según el rol si ya está autenticado */}
            <Route
                path='/login'
                element={
                isAuthenticated ? (
                    (userRole === "admin" || userRole === 'superAdmin')
                    ? <Navigate to="/admin/dashboard" replace />
                    : <Navigate to="/student/home" replace />
                ) : (
                    <LoginPage />
                )
                }
            />

            {/* Rutas del Administrador */}
            <Route path="/admin/*" element={
                <PrivateRoute isAuthenticated={isAuthenticated && (userRole === 'admin' || userRole === 'superAdmin')} redirectTo="/login" userRole={"admin"}>
                <DashboardRoutes />
                </PrivateRoute>
            } />

            {/* Rutas del Estudiante */}
            <Route path="/student/register" element={<RegisterPage />} />

            <Route path="/student/*" element={
                <PrivateRoute isAuthenticated={isAuthenticated && userRole === 'student'} redirectTo="/login" userRole={"student"}>
                <StudentRoutes />
                </PrivateRoute>
            } />

            {/* Ruta 404 */}
            <Route path="*" element={<NotFoundPage />} />
            </Routes>
        );
        };
    ```

5. **Gestión del Estado (`Provider` y Redux)**:
    - La aplicación usa Redux para gestionar el estado global, envolviendo toda la aplicación con el componente `Provider` y pasando el `store` para que todos los componentes puedan acceder al estado.

    ```jsx
        import { Provider } from 'react-redux';
        import { store } from './store';

        export const SimulatorApp = () => {
        return (
            <Provider store={store}>
            <AppTheme>
                <BrowserRouter>
                <AppRouter />
                </BrowserRouter>
            </AppTheme>
            </Provider>
        );
        };
    ```
6. **Configuración de Redux en el `Store`:**:
    - Se utiliza `configureStore` de Redux Toolkit para configurar el estado global de la aplicación. Los slices gestionan diferentes partes del estado, como la autenticación del usuario, la creación de exámenes y los exámenes disponibles.
    ```javascript
        import { configureStore } from '@reduxjs/toolkit';
        import { authSlice, createExamSlice, examsSlice } from './';

        export const store = configureStore({
        reducer: {
            auth: authSlice.reducer,
            createExam: createExamSlice.reducer,
            exams: examsSlice.reducer,
        },
        });
    ```

7. **Diagrama de flujo del Simulador EGEL**
    ![Descripción del diagrama](https://github.com/user-attachments/assets/aa82436d-1e33-4952-861d-99d055407a82)
--- 
