import { BrowserRouter, Routes, Route } from 'react-router-dom';

// Importación del Layout (Navbar y Footer)
import Layout from './components/Layout';

// Importación de Páginas
import Inicio from './pages/Inicio';
import Habitaciones from './pages/Habitaciones';
import Nosotros from './pages/Nosotros';
import Login from './pages/Login';
import Signup from './pages/Signup';
import DetalleHabitacion from './pages/DetalleHabitacion';
import AgregarHabitacion from './pages/AgregarHabitacion';
import EditarHabitacion from './pages/EditarHabitacion';
import MiCuenta from './pages/MiCuenta';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* El Layout envuelve a todas las rutas para mostrar siempre el Navbar y Footer */}
        <Route path="/" element={<Layout />}>
          
          {/* Rutas principales */}
          <Route index element={<Inicio />} />
          <Route path="habitaciones" element={<Habitaciones />} />
          <Route path="nosotros" element={<Nosotros />} />
          <Route path="login" element={<Login />} />
          <Route path="signup" element={<Signup />} />
          
          {/* Rutas dinámicas y de administración */}
          <Route path="detalle_habitacion/:id" element={<DetalleHabitacion />} />
          <Route path="agregar_habitacion" element={<AgregarHabitacion />} />
          <Route path="editar_habitacion/:id" element={<EditarHabitacion />} />
          <Route path="mi_cuenta" element={<MiCuenta />} />
          
        </Route>
      </Routes>
    </BrowserRouter>
  );
}