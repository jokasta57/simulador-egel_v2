# Simulador de exámenes EGEL - Frontend

Este simulador de exámenes EGEL está diseñado para ayudar a los estudiantes de la Escuela Superior de Tlahuelilpan a prepararse para su evaluación final.  
Cuenta con un sistema de administración para la creación de exámenes y la gestión de estadísticas de rendimiento.

---

## Características

### Módulo de Estudiantes
- **Realización de exámenes** con tiempo límite  
- **Consulta de resultados y estadísticas personales**  
- **Revisión de respuestas y análisis de desempeño**
- **Gestión de sus datos personales**

### 🛠 Módulo Administrativo  
- **Dashboard con estadísticas** de rendimiento de los estudiantes por examen 
- **Gestión de exámenes y preguntas** (CRUD)  
- **Creación y gestión de administradores**  
- **Reportes de desempeño global**  

---

## 🖥️ Tecnologías Utilizadas  
- **React** - Frontend  
- **Node.js & Express** - Backend con API REST  
- **MySQL** - Base de datos  
- **JWT** - Autenticación segura  
- **Cloudinary** - Almacenamiento de imágenes

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

# Configura las variables de entorno en el archivo .env
4. Configura el entorno; copia el archivo `.env.example`, renómbralo a `.env` y edítalo con tus credenciales reales:  
   ```sh
   cp .env.example .env
    ```

5. Inicia el servidor:
    ```sh
    npm run server
    ```

---

### Panel de Estudiantes  
Aquí los alumnos pueden ver sus exámenes y revisar su desempeño.  
![Panel estudiantil](https://github.com/user-attachments/assets/b7e70d91-fc0c-430b-83e8-51ab16f70c5a)

### Panel Administrativo  
El panel de administración permite gestionar preguntas, exámenes y analizar estadísticas.  
![Panel administrativo](https://github.com/user-attachments/assets/0ca2112a-a153-4a7a-9cfa-e4a3d0a90656)

---

## Configuración de la Base de Datos

La base de datos del proyecto está diseñada para gestionar los exámenes, estudiantes, resultados y administración del sistema. 

### Diagrama de la Base de Datos

A continuación se muestra el diagrama de la base de datos:

![Diagrama de la base de datos](https://github.com/user-attachments/assets/c69f6aa7-aed4-4191-9033-0bc6fefaf8ab)

### Paso 1: Crear la Base de Datos

1. **Accede a MySQL**: Si no tienes MySQL instalado, [descárgalo aquí](https://dev.mysql.com/downloads/).
   
2. **Accede a tu terminal** (o usa MySQL Workbench si prefieres una interfaz gráfica).
   
   Ejecuta el siguiente comando para acceder a MySQL:
   
   `mysql -u root -p`
   
   Luego, ingresa tu contraseña.

3. **Crear la base de datos**: Ejecuta el siguiente comando para crear la base de datos que utilizarás en el proyecto (por ejemplo, `simulador_egel_db`):
   
   `CREATE DATABASE simulador_egel_db;`
   
   Si prefieres una base de datos con otro nombre, puedes cambiar `simulador_egel_db` por el nombre que prefieras.

### Paso 2: Importar los Datos desde un Backup

Si tienes un archivo de backup con los datos de la base de datos (por ejemplo, `backup.sql`), puedes restaurarlo siguiendo estos pasos:

1. **Prepara el archivo de backup**: Asegúrate de tener el archivo `backup.sql` en el directorio desde donde ejecutarás los comandos o conoce la ruta completa del archivo.

2. **Restaurar el backup**: En la terminal, ejecuta el siguiente comando para importar los datos:
   
   `mysql -u root -p simulador_egel_db < backup.sql`
   
   - Reemplaza `root` con tu nombre de usuario de MySQL si es diferente.
   - Asegúrate de reemplazar `simulador_egel_db` con el nombre de tu base de datos si usas un nombre diferente.
   - El archivo `backup.sql` debe ser el archivo de backup que quieres importar.


## 📞 Contacto  
Para dudas o soporte interno, puedes comunicarte con el equipo de desarrollo a:  
📧 **Correo:** [jahirsampe1234@gmail.com](mailto:jahirsampe1234@gmail.com)  

