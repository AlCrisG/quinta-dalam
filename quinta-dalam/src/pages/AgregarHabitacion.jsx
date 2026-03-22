import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { getHabitaciones, saveHabitaciones } from '../data/habitaciones';

export default function AgregarHabitacion() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    nombre: '', precio: '', desc: '', capacidad: '', descripcionDetallada: '', servicios: 'Wifi, TV, Baño Privado'
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const habitacionesGuardadas = getHabitaciones();
    const nuevoId = habitacionesGuardadas.length > 0 ? Math.max(...habitacionesGuardadas.map(h => h.id)) + 1 : 1;

    // Convertimos el string de servicios en un Array real
    const listaServicios = formData.servicios.split(',').map(s => s.trim()).filter(s => s !== "");

    const nuevaHabitacion = {
      id: nuevoId,
      nombre: formData.nombre,
      precio: formData.precio.includes('$') ? formData.precio : `$${formData.precio}`,
      desc: formData.desc,
      descripcionDetallada: formData.descripcionDetallada || formData.desc,
      capacidad: formData.capacidad,
      servicios: listaServicios, 
      img: '/img/habitaciones/1.jpg' // Imagen por defecto
    };

    saveHabitaciones([...habitacionesGuardadas, nuevaHabitacion]);
    alert('¡Habitación agregada exitosamente!');
    navigate('/habitaciones');
  };

  return (
    <div className="flex flex-col items-center justify-center py-20 px-5 min-h-[80vh] bg-gray-50">
      <div className="flex flex-col items-center p-10 md:p-12 bg-white rounded-3xl shadow-2xl border border-gray-100 w-full max-w-2xl relative">
        <Link to="/habitaciones" className="absolute top-8 left-8 text-gray-400 hover:text-brand-primary transition-colors text-sm font-bold uppercase tracking-widest">
          ← Volver
        </Link>
        
        <h2 className="text-3xl mb-2 text-center mt-6 font-bold">Nueva Habitación</h2>
        <p className="text-sm text-gray-500 mb-8 text-center">Configura todos los detalles del nuevo espacio</p>
        
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-5 w-full">
          <div className="flex flex-col md:col-span-2">
            <label className="text-xs uppercase tracking-wider font-semibold text-gray-500 mb-2">Nombre</label>
            <input type="text" name="nombre" value={formData.nombre} onChange={handleChange} required className="w-full border border-gray-300 rounded-lg h-12 px-4 bg-gray-50 focus:bg-white focus:outline-none focus:border-brand-primary transition-all" />
          </div>
          
          <div className="flex flex-col">
            <label className="text-xs uppercase tracking-wider font-semibold text-gray-500 mb-2">Precio ($)</label>
            <input type="number" name="precio" value={formData.precio} onChange={handleChange} required className="w-full border border-gray-300 rounded-lg h-12 px-4 bg-gray-50 focus:bg-white focus:outline-none focus:border-brand-primary transition-all" />
          </div>
          
          <div className="flex flex-col">
            <label className="text-xs uppercase tracking-wider font-semibold text-gray-500 mb-2">Capacidad</label>
            <input type="text" name="capacidad" value={formData.capacidad} onChange={handleChange} required placeholder="Ej: 2 Adultos" className="w-full border border-gray-300 rounded-lg h-12 px-4 bg-gray-50 focus:bg-white focus:outline-none focus:border-brand-primary transition-all" />
          </div>

          <div className="flex flex-col md:col-span-2">
            <label className="text-xs uppercase tracking-wider font-semibold text-gray-500 mb-2">Servicios (separados por coma)</label>
            <input type="text" name="servicios" value={formData.servicios} onChange={handleChange} placeholder="Wifi, TV, Minibar..." className="w-full border border-gray-300 rounded-lg h-12 px-4 bg-gray-50 focus:bg-white focus:outline-none focus:border-brand-primary transition-all" />
          </div>
          
          <div className="flex flex-col md:col-span-2">
            <label className="text-xs uppercase tracking-wider font-semibold text-gray-500 mb-2">Descripción Corta (Lista principal)</label>
            <input type="text" name="desc" value={formData.desc} onChange={handleChange} required className="w-full border border-gray-300 rounded-lg h-12 px-4 bg-gray-50 focus:bg-white focus:outline-none focus:border-brand-primary transition-all" />
          </div>
          
          <div className="flex flex-col md:col-span-2">
            <label className="text-xs uppercase tracking-wider font-semibold text-gray-500 mb-2">Descripción Detallada (Página de detalles)</label>
            <textarea rows="3" name="descripcionDetallada" value={formData.descripcionDetallada} onChange={handleChange} required className="w-full border border-gray-300 rounded-lg p-4 bg-gray-50 focus:bg-white focus:outline-none focus:border-brand-primary transition-all resize-none"></textarea>
          </div>
          
          <button type="submit" className="md:col-span-2 mt-4 bg-brand-primary hover:bg-brand-secondary text-white font-bold rounded-lg py-4 uppercase tracking-widest text-sm shadow-lg transition-all">
            Crear Habitación
          </button>
        </form>
      </div>
    </div>
  );
}