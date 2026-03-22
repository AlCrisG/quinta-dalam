import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { loginUser, getCurrentUser, logoutUser } from '../data/usuarios';

export default function Login() {
  const navigate = useNavigate();
  const usuarioActual = getCurrentUser(); // Verificamos si ya hay alguien logueado
  const [credenciales, setCredenciales] = useState({ correo: '', contrasena: '' });

  const handleChange = (e) => {
    setCredenciales({ ...credenciales, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const exito = loginUser(credenciales.correo, credenciales.contrasena);
    
    if (exito) {
      navigate('/habitaciones'); 
    } else {
      alert('Correo o contraseña incorrectos.');
    }
  };

  const handleLogout = () => {
    logoutUser();
    navigate('/login');
  };

  // -------------------------------------------------------------
  // VISTA 1: SI YA INICIÓ SESIÓN
  // -------------------------------------------------------------
  if (usuarioActual) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-5 min-h-[80vh] bg-gray-50">
        <div className="flex flex-col items-center p-10 bg-white rounded-2xl shadow-xl border border-gray-100 w-full max-w-md text-center">
          <h2 className="text-3xl mb-4">¡Hola, {usuarioActual.nombre}!</h2>
          <p className="text-gray-500 mb-8 text-sm">
            Ya tienes una sesión activa como <strong className="uppercase font-bold text-brand-primary">{usuarioActual.rol}</strong>.
          </p>
          
          <Link to="/habitaciones" className="bg-brand-primary hover:bg-brand-secondary text-white font-bold rounded-lg py-3 px-8 mb-4 uppercase tracking-wider text-xs shadow-md hover:shadow-lg transition-all w-full">
            Ir a Habitaciones
          </Link>
          
          {/* Aquí es donde se usa el handleLogout */}
          <button onClick={handleLogout} className="bg-white border-2 border-red-600 text-red-600 hover:bg-red-600 hover:text-white font-bold rounded-lg py-3 px-8 uppercase tracking-wider text-xs shadow-sm hover:shadow-md transition-all w-full">
            Cerrar Sesión
          </button>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // VISTA 2: FORMULARIO NORMAL
  // -------------------------------------------------------------
  return (
    <div className="flex flex-col items-center justify-center py-20 px-5 min-h-[80vh] bg-gray-50">
      <div className="flex flex-col items-center p-10 bg-white rounded-2xl shadow-xl border border-gray-100 w-full max-w-md">
        <h2 className="text-3xl mb-2 text-center">Bienvenido</h2>
        <p className="text-sm text-gray-500 mb-8 text-center">
          Ingresa tus credenciales para continuar
        </p>
        
        <form onSubmit={handleSubmit} className="flex flex-col w-full gap-5">
          <div className="flex flex-col">
            <label className="text-xs uppercase tracking-wider font-semibold text-gray-500 mb-2">Correo Electrónico</label>
            <input type="email" name="correo" value={credenciales.correo} onChange={handleChange} required 
              className="w-full border border-gray-300 rounded-lg h-12 px-4 bg-gray-50 focus:bg-white focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all" />
          </div>
          
          <div className="flex flex-col">
            <label className="text-xs uppercase tracking-wider font-semibold text-gray-500 mb-2">Contraseña</label>
            <input type="password" name="contrasena" value={credenciales.contrasena} onChange={handleChange} required 
              className="w-full border border-gray-300 rounded-lg h-12 px-4 bg-gray-50 focus:bg-white focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all" />
          </div>
          
          <button type="submit" className="mt-4 bg-brand-primary hover:bg-brand-secondary text-white font-bold rounded-lg py-3 uppercase tracking-wider text-sm shadow-md hover:shadow-lg transition-all">
            Iniciar Sesión
          </button>
        </form>
        
        <div className="mt-8 border-t border-gray-100 w-full pt-6 text-center">
          <Link to="/signup" className="text-sm text-gray-500 hover:text-brand-primary font-medium transition-colors">
            ¿Aún no tienes una cuenta? <span className="font-bold underline">Regístrate aquí</span>
          </Link>
        </div>
      </div>
    </div>
  );
}