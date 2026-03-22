import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { registrarUsuario } from '../data/usuarios';

export default function Signup() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    nombre: '', correo: '', contrasena: '', confirmar_contrasena: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.contrasena !== formData.confirmar_contrasena) {
      alert('Las contraseñas no coinciden.');
      return;
    }
    
    registrarUsuario({
      nombre: formData.nombre,
      correo: formData.correo,
      contrasena: formData.contrasena
    });
    
    alert('Cuenta creada exitosamente. Por favor, inicia sesión.');
    navigate('/login');
  };

  return (
    <div className="flex flex-col items-center justify-center py-20 px-5 min-h-[80vh] bg-gray-50">
      <div className="flex flex-col items-center p-10 bg-white rounded-2xl shadow-xl border border-gray-100 w-full max-w-md">
        <h2 className="text-3xl mb-2 text-center">Crear Cuenta</h2>
        <p className="text-sm text-gray-500 mb-8 text-center">
          Únete a nosotros y disfruta de los mejores beneficios
        </p>
        
        <form onSubmit={handleSubmit} className="flex flex-col w-full gap-5">
          <div className="flex flex-col">
            <label className="text-xs uppercase tracking-wider font-semibold text-gray-500 mb-2">Nombre Completo</label>
            <input type="text" name="nombre" value={formData.nombre} onChange={handleChange} required 
              className="w-full border border-gray-300 rounded-lg h-12 px-4 bg-gray-50 focus:bg-white focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all" />
          </div>
          
          <div className="flex flex-col">
            <label className="text-xs uppercase tracking-wider font-semibold text-gray-500 mb-2">Correo Electrónico</label>
            <input type="email" name="correo" value={formData.correo} onChange={handleChange} required 
              className="w-full border border-gray-300 rounded-lg h-12 px-4 bg-gray-50 focus:bg-white focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all" />
          </div>
          
          <div className="flex flex-col">
            <label className="text-xs uppercase tracking-wider font-semibold text-gray-500 mb-2">Contraseña</label>
            <input type="password" name="contrasena" value={formData.contrasena} onChange={handleChange} required 
              className="w-full border border-gray-300 rounded-lg h-12 px-4 bg-gray-50 focus:bg-white focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all" />
          </div>
          
          <div className="flex flex-col">
            <label className="text-xs uppercase tracking-wider font-semibold text-gray-500 mb-2">Confirmar Contraseña</label>
            <input type="password" name="confirmar_contrasena" value={formData.confirmar_contrasena} onChange={handleChange} required 
              className="w-full border border-gray-300 rounded-lg h-12 px-4 bg-gray-50 focus:bg-white focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all" />
          </div>
          
          <button type="submit" className="mt-4 bg-brand-primary hover:bg-brand-secondary text-white font-bold rounded-lg py-3 uppercase tracking-wider text-sm shadow-md hover:shadow-lg transition-all">
            Registrarse
          </button>
        </form>
        
        <div className="mt-8 border-t border-gray-100 w-full pt-6 text-center">
          <Link to="/login" className="text-sm text-gray-500 hover:text-brand-primary font-medium transition-colors">
            ¿Ya tienes una cuenta? <span className="font-bold underline">Inicia sesión aquí</span>
          </Link>
        </div>
      </div>
    </div>
  );
}