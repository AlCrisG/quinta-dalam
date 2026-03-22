import { Link, useNavigate, useParams } from 'react-router-dom';
import { getHabitaciones, saveHabitaciones } from '../data/habitaciones';
import { getCurrentUser } from '../data/usuarios';
import { useEffect } from 'react';

export default function DetalleHabitacion() {
  const navigate = useNavigate();
  const { id } = useParams(); 

    useEffect(() => {
      window.scrollTo(0, 0);
    }, []);
  
  const habitacionesGuardadas = getHabitaciones();
  const habitacion = habitacionesGuardadas.find(hab => hab.id === parseInt(id));
  const usuarioActual = getCurrentUser();

  if (!habitacion) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] bg-gray-50">
        <h2 className="text-3xl font-bold text-red-500 mb-4">Habitación no encontrada</h2>
        <Link to="/habitaciones" className="text-brand-primary hover:underline font-semibold">Regresar a Habitaciones</Link>
      </div>
    );
  }

  const handleEliminar = () => {
    if(window.confirm(`¿Estás seguro de que deseas eliminar la habitación ${habitacion.nombre}?`)) {
      const nuevasHabitaciones = habitacionesGuardadas.filter(hab => hab.id !== habitacion.id);
      saveHabitaciones(nuevasHabitaciones);
      alert('Habitación eliminada exitosamente');
      navigate('/habitaciones');
    }
  };

  return (
    <div className="py-16 px-5 flex justify-center bg-gray-50 min-h-screen">
      <div className="w-full max-w-5xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100 flex flex-col md:flex-row">
        
        {/* Mitad de Imagen */}
        <div className="md:w-1/2 relative min-h-87.5 md:min-h-full">
          <img src={habitacion.img} alt={habitacion.nombre} className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute top-6 left-6 bg-white/90 backdrop-blur-sm px-5 py-2 rounded-full shadow-md">
            <span className="font-bold text-brand-primary text-xl">{habitacion.precio}</span>
            <span className="text-xs text-gray-500 uppercase tracking-wider font-semibold"> / noche</span>
          </div>
        </div>

        {/* Mitad de Contenido */}
        <div className="md:w-1/2 p-10 md:p-12 flex flex-col justify-between">
          <div>
            <h2 className="text-4xl font-bold mb-8">{habitacion.nombre}</h2>
            
            <div className="mb-8">
              <h4 className="text-xs uppercase tracking-widest text-gray-400 font-bold mb-3">Descripción</h4>
              <p className="text-gray-600 leading-relaxed text-sm">
                {habitacion.descripcionDetallada || habitacion.desc}
              </p>
            </div>

            <div className="mb-8">
              <h4 className="text-xs uppercase tracking-widest text-gray-400 font-bold mb-3">Capacidad</h4>
              <p className="text-gray-700 font-medium text-sm">{habitacion.capacidad}</p>
            </div>

            <div className="mb-8">
              <h4 className="text-xs uppercase tracking-widest text-gray-400 font-bold mb-4">Servicios Incluidos</h4>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-gray-600">
                {habitacion.servicios && habitacion.servicios.map((servicio, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <span className="text-brand-primary font-bold">✓</span> {servicio}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mt-10 flex flex-col gap-4">
            {/* Botón Reservar para clientes */}
            {usuarioActual?.rol !== 'admin' && (
              <Link to={usuarioActual ? "/habitaciones" : "/login"} className="bg-brand-primary hover:bg-brand-secondary text-white text-center font-bold rounded-lg py-4 uppercase tracking-widest text-sm shadow-lg hover:shadow-xl transition-all">
                Reservar Ahora
              </Link>
            )}

            {/* Botones de Admin */}
            {usuarioActual?.rol === 'admin' && (
              <div className="flex gap-4 pt-4 border-t border-gray-100">
                <Link to={`/editar_habitacion/${habitacion.id}`} className="flex-1 text-center bg-white border-2 border-yellow-500 text-yellow-600 hover:bg-yellow-500 hover:text-white font-bold rounded-lg py-3 uppercase tracking-wider text-xs transition-all">
                  Editar
                </Link>
                <button onClick={handleEliminar} className="flex-1 bg-white border-2 border-red-500 text-red-500 hover:bg-red-500 hover:text-white font-bold rounded-lg py-3 uppercase tracking-wider text-xs transition-all">
                  Eliminar
                </button>
              </div>
            )}

            <Link to="/habitaciones" className="text-center text-gray-400 hover:text-brand-primary text-xs uppercase tracking-widest font-bold mt-4 transition-colors">
              ← Volver a la lista
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}