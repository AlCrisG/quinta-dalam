import { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { getHabitaciones, saveHabitaciones } from '../data/habitaciones';
import { getCurrentUser } from '../data/usuarios';
import { getReservaciones, saveReservaciones } from '../data/reservaciones';

export default function DetalleHabitacion() {
  const navigate = useNavigate();
  const { id } = useParams(); 
  const [isVisible, setIsVisible] = useState(false);
  const [fechaEntrada, setFechaEntrada] = useState('');
  const [fechaSalida, setFechaSalida] = useState('');

  useEffect(() => {
    window.scrollTo(0, 0);
    
    // Activamos la animación de entrada después de montar el componente
    const timer = setTimeout(() => setIsVisible(true), 50);
    return () => clearTimeout(timer);
  }, []);
  
  const habitacionesGuardadas = getHabitaciones();
  const habitacion = habitacionesGuardadas.find(hab => hab.id === parseInt(id));
  const usuarioActual = getCurrentUser();

  // Obtenemos la fecha de hoy en formato YYYY-MM-DD para limitar los calendarios
  const fechaActual = new Date();
  const yyyy = fechaActual.getFullYear();
  const mm = String(fechaActual.getMonth() + 1).padStart(2, '0');
  const dd = String(fechaActual.getDate()).padStart(2, '0');
  const hoy = `${yyyy}-${mm}-${dd}`;

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

  const handleReservar = () => {
    // Si no está iniciada la sesión, lo mandamos al login
    if (!usuarioActual) {
      navigate('/login');
      return;
    }
    if (!fechaEntrada || !fechaSalida) {
      alert('Por favor selecciona tus fechas de Check-in y Check-out.');
      return;
    }
    
    const entrada = new Date(fechaEntrada);
    const salida = new Date(fechaSalida);
    
    if (entrada >= salida) {
      alert('La fecha de Check-out debe ser posterior a la de Check-in.');
      return;
    }
    
    // Validar por seguridad que no reserve en el pasado
    const fechaHoyObj = new Date(hoy);
    if (entrada < fechaHoyObj) {
      alert('No puedes reservar en fechas que ya pasaron.');
      return;
    }

    const reservaciones = getReservaciones();
    
    // Validar disponibilidad buscando choques de fechas
    const estaOcupada = reservaciones.some(res => {
      if (res.habitacionId !== habitacion.id) return false;
      const resEntrada = new Date(res.fechaEntrada);
      const resSalida = new Date(res.fechaSalida);
      return entrada < resSalida && salida > resEntrada;
    });

    if (estaOcupada) {
      alert('Lo sentimos, la habitación ya está ocupada en esas fechas. Por favor, elige otras.');
      return;
    }

    const nuevaReserva = {
      id: reservaciones.length > 0 ? Math.max(...reservaciones.map(r => r.id)) + 1 : 1,
      usuarioId: usuarioActual.id,
      habitacionId: habitacion.id,
      habitacion: habitacion.nombre,
      fechaEntrada,
      fechaSalida,
      estado: 'Confirmada',
      total: habitacion.precio 
    };

    saveReservaciones([...reservaciones, nuevaReserva]);
    alert('¡Tu reserva ha sido confirmada exitosamente!');
    navigate('/mi_cuenta');
  };

  return (
    <div className={`py-16 px-5 flex justify-center bg-gray-50 min-h-screen transition-all duration-700 ease-out transform ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
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
              <div className="flex flex-col gap-4 bg-gray-50 p-6 rounded-2xl border border-gray-200 shadow-inner">
                <h4 className="text-sm uppercase tracking-widest font-bold text-gray-500">Reserva tu estancia</h4>
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1 flex flex-col">
                    <label className="text-xs font-semibold text-gray-500 mb-1">Check-in</label>
                    <input type="date" min={hoy} value={fechaEntrada} onChange={(e) => setFechaEntrada(e.target.value)} className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:outline-none focus:border-brand-primary bg-white transition-colors" />
                  </div>
                  <div className="flex-1 flex flex-col">
                    <label className="text-xs font-semibold text-gray-500 mb-1">Check-out</label>
                    <input type="date" min={fechaEntrada || hoy} value={fechaSalida} onChange={(e) => setFechaSalida(e.target.value)} className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:outline-none focus:border-brand-primary bg-white transition-colors" />
                  </div>
                </div>
                <button onClick={handleReservar} className="mt-2 bg-brand-primary hover:bg-brand-secondary text-white text-center font-bold rounded-lg py-4 uppercase tracking-widest text-sm shadow-lg hover:shadow-xl transition-all">
                  Confirmar Reserva
                </button>
              </div>
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