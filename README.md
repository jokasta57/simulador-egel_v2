# Simulador de exámenes EGEL - Frontend

Este simulador de exámenes EGEL está diseñado para ayudar a los estudiantes de la Escuela Superior de Tlahuelilpan a prepararse para su evaluación final.  
Cuenta con un sistema de administración para la creación de exámenes y la gestión de estadísticas de rendimiento.

---

## 🖥️ Tecnologías Utilizadas  
- **React** - Frontend  
- **Node.js & Express** - Backend con API REST  
- **MySQL** - Base de datos  
- **JWT** - Autenticación segura  
- **Cloudinary** - Almacenamiento de imágenes

## 🚀 Getting Started

Sigue estos pasos para configurar y ejecutar el simulador de exámenes EGEL en tu máquina local.

### Requisitos

Antes de comenzar, asegúrate de tener instalados los siguientes programas:

> [!IMPORTANT]
> Vas a necesitar:
> - [Node.js 18+ (recomendado 20 LTS)](https://nodejs.org/en/).
> - [MySQL](https://dev.mysql.com/downloads/).

---

## Instalación Backend

1. Clona el repositorio del backend:
    ```sh
   git clone https://github.com/JahirSamperio/simulador-egel-backend.git
    ```

2. Accede a la carpeta del proyecto
   ```sh
    cd simulador-egel-backend
    ```

3. Instala las dependencias: 
    ```sh
    npm install
    ```

4. Configura el entorno; copia el archivo `.env.example`, renómbralo a `.env` y edítalo con tus credenciales reales:  
   ```sh
   cp .env.example .env
    ```

5. Inicia el servidor:
    ```sh
    npm run server
    ```

---

## Instalación Frontend
1. Clona el repositorio:  
   ```sh
   git clone https://github.com/JahirSamperio/simulador-egel.git
   ```

2. Accede a la carpeta del proyecto
   ```sh
    cd simulador-egel
    ```

3. Instala las dependencias:
    ```sh
    npm install
    ```

4. Configura las variables de entorno en un archivo .env:
    VITE_API_URL=http://localhost:8080

5. Inicia el servidor de desarrollo:
    ```sh
    npm run dev
    ```

---

## 👨‍💻 Uso de la Aplicación

### Panel de Estudiantes  
Aquí los alumnos pueden ver sus exámenes y revisar su desempeño.  
![Panel estudiantil](https://github.com/user-attachments/assets/b33e3769-672a-4394-9fc6-aafdf8e7d3e3)

### Panel Administrativo  
El panel de administración permite gestionar preguntas, exámenes y analizar estadísticas.  
![Panel administrativo](https://github.com/user-attachments/assets/e452a39e-4766-4f20-8003-c5caf4ae8043)

### 🔄 Flujo de Uso  

El siguiente diagrama muestra el flujo principal de la aplicación:  
![Diagrama de flujo](https://github.com/user-attachments/assets/aa82436d-1e33-4952-861d-99d055407a82)

---


## 🗄️ Configuración de la Base de Datos  

El sistema utiliza **MySQL** para gestionar la información de los administradores, estudiantes, exámenes y sus respuestas.  

### 📌 Estructura de la Base de Datos  

La base de datos está compuesta por las siguientes tablas principales:  

#### 👤 **Usuarios**  
- **admin** → Almacena los datos de los administradores que gestionan los exámenes.  
- **estudiante** → Guarda la información de los alumnos registrados en el sistema.  

#### 📄 **Exámenes y Preguntas**  
- **examen** → Contiene la información de los exámenes creados por los administradores.  
- **pregunta** → Almacena las preguntas de cada examen.  
- **opcion** → Guarda las opciones de respuesta para cada pregunta.  

#### 📝 **Intentos y Respuestas**  
- **intento_examen** → Registra cada intento realizado por un estudiante en un examen.  
- **respuesta** → Almacena las respuestas seleccionadas por el estudiante en un intento.  

---

### Diagrama de la Base de Datos

A continuación se muestra el diagrama de la base de datos:

![Diagrama de la base de datos](https://github.com/user-attachments/assets/c69f6aa7-aed4-4191-9033-0bc6fefaf8ab)

### Importar la Base de Datos

La estructura de la base de datos está definida en el archivo SQL dentro de la carpeta `sql` del repositorio.

📄 [`/sql/estructura_egel.sql`](https://github.com/JahirSamperio/simulador-egel/blob/master/sql/estructura_egel.sql)

Para crear la base de datos en MySQL, simplemente ejecuta el archivo con el siguiente comando:

    ```sh
    mysql -u tu_usuario -p tu_basededatos < sql/estructura.sql
    ```

## 📞 Contacto  
Para dudas o soporte interno, puedes comunicarte con el equipo de desarrollo a:  
📧 **Correo:** [jahirsampe1234@gmail.com](mailto:jahirsampe1234@gmail.com)  

