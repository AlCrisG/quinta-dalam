# Hotel Quinta Dalam

Bienvenido al repositorio del proyecto **Hotel Quinta Dalam**, una aplicación web interactiva desarrollada para la visualización y gestión de un hotel inspirado en la riqueza cultural y los paisajes de Michoacán.

## Características Principales

- **Catálogo de Habitaciones**: Exploración de habitaciones temáticas (como Tzintzuntzan, Paracho, Yunuén, etc.) con sus precios, descripciones detalladas, capacidad y servicios.
- **Gestión Administrativa**: Panel para crear y agregar nuevas habitaciones dinámicamente (`AgregarHabitacion.jsx`).
- **Sistema de Usuarios**: Simulación de registro y autenticación (Login/Logout) con diferentes roles (Administrador y Cliente).
- **Persistencia Local**: Almacenamiento en tiempo real de habitaciones, usuarios y sesiones activas en el navegador mediante `localStorage`.
- **Diseño Responsivo y Moderno**: Interfaces limpias, amigables y adaptables a dispositivos móviles.

## Tecnologías Utilizadas

- **Frontend**: React (usando Hooks como `useState`).
- **Enrutamiento**: React Router DOM para la navegación entre vistas (SPA).
- **Estilos**: Tailwind CSS para el maquetado rápido y diseño responsivo.
- **Almacenamiento**: `localStorage` nativo del navegador para simular una base de datos.

## Instalación y Uso Local

Sigue estos pasos para correr el proyecto en tu máquina local:

1. **Clonar el repositorio**:
   ```bash
   git clone <URL-DEL-REPOSITORIO>
   ```
2. **Navegar al directorio del proyecto**:
   ```bash
   cd quinta-dalam
   ```
3. **Instalar las dependencias**:
   ```bash
   npm install
   ```
4. **Iniciar el servidor de desarrollo**:
   ```bash
   npm run dev
   # o si usas Create React App: npm start
   ```

## 📂 Estructura Destacada

- `src/data/`: Lógica de simulación de base de datos (`habitaciones.js`, `usuarios.js`).
- `src/pages/`: Componentes que actúan como vistas principales (p. ej. `Nosotros.jsx`, `AgregarHabitacion.jsx`).