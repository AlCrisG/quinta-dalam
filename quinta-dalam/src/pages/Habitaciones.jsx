import { useState } from 'react';
import { Link } from 'react-router-dom';
import { getHabitaciones } from '../data/habitaciones';
import { getCurrentUser } from '../data/usuarios'; 
import { useEffect } from 'react';

export default function Habitaciones() {
  const [habitaciones] = useState(() => getHabitaciones());
  const [busqueda, setBusqueda] = useState(''); 
  const usuarioActual = getCurrentUser(); 

  useEffect(() => {
      window.scrollTo(0, 0);
    }, []);

  const habitacionesFiltradas = habitaciones.filter((hab) => 
    hab.nombre.toLowerCase().includes(busqueda.toLowerCase())
  );

  const handleBuscarFechas = (e) => {
    e.preventDefault();
  };

  return (
    <div className="py-16 px-5 flex flex-col items-center relative">
      <div className="text-center mb-12">
        <h2 className="text-4xl md:text-5xl font-bold mb-4">Nuestras Habitaciones</h2>
        <p className="text-gray-500 max-w-2xl mx-auto">Encuentra el espacio perfecto para tu descanso, diseñado con la máxima comodidad y elegancia.</p>
      </div>
      
      {/* Barra de Búsqueda Estilizada */}
      <div className="bg-white p-6 md:p-8 rounded-2xl shadow-lg border border-gray-100 mb-12 w-full max-w-5xl relative z-10 -mt-6">
        <form onSubmit={handleBuscarFechas} className="flex flex-wrap gap-4 items-end justify-center">
          <div className="flex flex-col w-full md:w-auto grow max-w-xs">
            <label className="text-xs uppercase tracking-wider font-semibold text-gray-500 mb-2">Habitación</label>
            <input 
              type="text" 
              placeholder="Ej. Coeneo" 
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)} 
              className="border-b-2 border-gray-200 p-2 focus:border-brand-primary outline-none transition-colors w-full text-gray-700 bg-transparent" 
            />
          </div>

          <div className="flex flex-col w-full md:w-auto">
            <label className="text-xs uppercase tracking-wider font-semibold text-gray-500 mb-2">Check-in</label>
            <input type="date" className="border-b-2 border-gray-200 p-2 focus:border-brand-primary outline-none transition-colors w-full text-gray-600 bg-transparent" />
          </div>

          <div className="flex flex-col w-full md:w-auto">
            <label className="text-xs uppercase tracking-wider font-semibold text-gray-500 mb-2">Check-out</label>
            <input type="date" className="border-b-2 border-gray-200 p-2 focus:border-brand-primary outline-none transition-colors w-full text-gray-600 bg-transparent" />
          </div>

          <button type="submit" className="bg-brand-primary hover:bg-brand-secondary text-white px-8 py-3 rounded-lg font-bold uppercase text-sm tracking-wider shadow-md hover:shadow-xl transition-all w-full md:w-auto mt-4 md:mt-0">
            Buscar
          </button>
        </form>
      </div>

      {usuarioActual?.rol === 'admin' && (
        <div className="w-full max-w-6xl flex justify-end mb-8">
          <Link to="/agregar_habitacion" className="bg-gray-800 hover:bg-black text-white font-bold py-2 px-6 rounded-lg shadow-md transition-colors text-sm uppercase tracking-wider">
            + Agregar Habitación
          </Link>
        </div>
      )}

      {/* Grid de Habitaciones */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 w-full max-w-6xl">
        {habitacionesFiltradas.map((hab) => (
          <div key={hab.id} className="bg-white rounded-2xl overflow-hidden shadow-lg border border-gray-100 hover:-translate-y-2 hover:shadow-2xl transition-all duration-300 flex flex-col group">
            <div className="overflow-hidden h-56 relative">
              <img src={hab.img} alt={hab.nombre} className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700" />
              <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full shadow-sm">
                <span className="font-bold text-brand-primary">{hab.precio}</span>
                <span className="text-xs text-gray-500 font-medium"> / noche</span>
              </div>
            </div>
            
            <div className="p-6 flex flex-col grow">
              <h3 className="text-2xl font-bold mb-3">{hab.nombre}</h3>
              <p className="text-gray-500 text-sm mb-6 grow leading-relaxed">{hab.desc}</p>
              
              <Link to={`/detalle_habitacion/${hab.id}`} className="block text-center border-2 border-brand-primary text-brand-primary hover:bg-brand-primary hover:text-white py-3 rounded-lg font-bold uppercase text-xs tracking-widest transition-colors">
                Ver Detalles
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}