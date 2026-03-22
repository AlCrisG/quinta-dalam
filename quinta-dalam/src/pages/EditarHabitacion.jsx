import { useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { getHabitaciones, saveHabitaciones } from '../data/habitaciones';
import { useEffect } from 'react';

export default function EditarHabitacion() {
  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  
  // 1. Buscamos la habitación directamente para inicializar el estado
  // Esto evita el uso de useEffect y el error de "cascading renders"
  const [formData, setFormData] = useState(() => {
    const habitacionesGuardadas = getHabitaciones();
    const encontrada = habitacionesGuardadas.find(hab => hab.id === parseInt(id));
    
    if (encontrada) {
      const precioLimpio = String(encontrada.precio || '').replace('$', '').replace(/,/g, '');
      return {
        nombre: encontrada.nombre || '',
        precio: precioLimpio,
        desc: encontrada.desc || '',
        capacidad: encontrada.capacidad || '',
        descripcionDetallada: encontrada.descripcionDetallada || encontrada.desc || '',
        servicios: encontrada.servicios ? encontrada.servicios.join(', ') : ''
      };
    }
    // Estado inicial por defecto si no se encuentra
    return { nombre: '', precio: '', desc: '', capacidad: '', descripcionDetallada: '', servicios: '' };
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const habitacionesGuardadas = getHabitaciones();
    
    const listaServicios = formData.servicios.split(',')
      .map(s => s.trim())
      .filter(s => s !== "");

    const actualizadas = habitacionesGuardadas.map(hab => {
      if (hab.id === parseInt(id)) {
        return {
          ...hab,
          nombre: formData.nombre,
          precio: `$${Number(formData.precio).toLocaleString('en-US')}`,
          desc: formData.desc,
          descripcionDetallada: formData.descripcionDetallada,
          capacidad: formData.capacidad,
          servicios: listaServicios
        };
      }
      return hab;
    });

    saveHabitaciones(actualizadas);
    alert('Habitación actualizada con éxito');
    navigate('/admin', { state: { activeTab: 'habitaciones' } });
  };

  return (
    <div className="flex flex-col items-center justify-center py-20 px-5 min-h-[80vh] bg-gray-50">
      <div className="flex flex-col items-center p-10 md:p-12 bg-white rounded-3xl shadow-2xl border border-gray-100 w-full max-w-2xl relative">
        <Link to="/admin" state={{ activeTab: 'habitaciones' }} className="absolute top-8 left-8 text-gray-400 hover:text-brand-primary transition-colors text-sm font-bold uppercase tracking-widest">
          ← Cancelar
        </Link>

        <h2 className="text-3xl mb-2 text-center mt-6 font-bold text-gray-800">Editar Habitación</h2>
        <p className="text-sm text-gray-500 mb-8 text-center">Modifica los detalles del alojamiento</p>
        
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
            <input type="text" name="capacidad" value={formData.capacidad} onChange={handleChange} required className="w-full border border-gray-300 rounded-lg h-12 px-4 bg-gray-50 focus:bg-white focus:outline-none focus:border-brand-primary transition-all" />
          </div>

          <div className="flex flex-col md:col-span-2">
            <label className="text-xs uppercase tracking-wider font-semibold text-gray-500 mb-2">Servicios (separados por coma)</label>
            <input type="text" name="servicios" value={formData.servicios} onChange={handleChange} placeholder="Wifi, TV, Minibar..." className="w-full border border-gray-300 rounded-lg h-12 px-4 bg-gray-50 focus:bg-white focus:outline-none focus:border-brand-primary transition-all" />
          </div>
          
          <div className="flex flex-col md:col-span-2">
            <label className="text-xs uppercase tracking-wider font-semibold text-gray-500 mb-2">Descripción Corta</label>
            <input type="text" name="desc" value={formData.desc} onChange={handleChange} required className="w-full border border-gray-300 rounded-lg h-12 px-4 bg-gray-50 focus:bg-white focus:outline-none focus:border-brand-primary transition-all" />
          </div>
          
          <div className="flex flex-col md:col-span-2">
            <label className="text-xs uppercase tracking-wider font-semibold text-gray-500 mb-2">Descripción Detallada</label>
            <textarea rows="4" name="descripcionDetallada" value={formData.descripcionDetallada} onChange={handleChange} required className="w-full border border-gray-300 rounded-lg p-4 bg-gray-50 focus:bg-white focus:outline-none focus:border-brand-primary transition-all resize-none"></textarea>
          </div>
          
          <button type="submit" className="md:col-span-2 mt-4 bg-yellow-500 hover:bg-yellow-600 text-white font-bold rounded-lg py-4 uppercase tracking-widest text-sm shadow-lg transition-all">
            Guardar Cambios
          </button>
        </form>
      </div>
    </div>
  );
}