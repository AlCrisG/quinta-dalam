import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useParams, useLocation } from 'react-router-dom';
import { getHabitaciones } from '../data/habitaciones';
import { getCurrentUser } from '../data/usuarios';
import { getReservaciones, saveReservaciones } from '../data/reservaciones';

export default function DetalleHabitacion() {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams(); 
  const [isVisible, setIsVisible] = useState(false);
  const [fechaEntrada, setFechaEntrada] = useState('');
  const [fechaSalida, setFechaSalida] = useState('');
  const [metodoPago, setMetodoPago] = useState('');
  const [noches, setNoches] = useState(0);
  const [totalEstimado, setTotalEstimado] = useState(0);
  const hasAutoBooked = useRef(false);

  useEffect(() => {
    // Activamos la animación de entrada después de montar el componente
    const timer = setTimeout(() => setIsVisible(true), 50);

    // Interceptamos la auto-reservación cuando el usuario regrese del login
    if (usuarioActual && location.state?.autoBook && !hasAutoBooked.current) {
      hasAutoBooked.current = true;
      const { fechaEntrada: inDate, fechaSalida: outDate, metodoPago: method } = location.state;
      setFechaEntrada(inDate);
      setFechaSalida(outDate);
      setMetodoPago(method);
      setTimeout(() => procesarReserva(inDate, outDate, method), 100);
    }

    return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Dependencias vacías para asegurar que solo ocurra en la carga inicial
  
  const habitacionesGuardadas = getHabitaciones();
  const habitacion = habitacionesGuardadas.find(hab => hab.id === parseInt(id));
  const usuarioActual = getCurrentUser();

  // Efecto para calcular dinámicamente las noches y el total estimado
  useEffect(() => {
    if (fechaEntrada && fechaSalida && habitacion) {
      const inDate = new Date(fechaEntrada);
      const outDate = new Date(fechaSalida);
      if (outDate > inDate) {
        const diffDays = Math.ceil((outDate - inDate) / (1000 * 60 * 60 * 24));
        setNoches(diffDays);
        const precioNum = Number(habitacion.precio.replace(/[^0-9.-]+/g, ""));
        setTotalEstimado(diffDays * precioNum);
        return;
      }
    }
    setNoches(0);
    setTotalEstimado(0);
  }, [fechaEntrada, fechaSalida, habitacion]);

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

  const procesarReserva = (inStr, outStr, methodStr) => {
    const handleFailure = (msg) => {
      alert(msg);
      navigate(location.pathname, { replace: true, state: {} }); // Limpiamos rastro si falla
    };

    if (!inStr || !outStr) return handleFailure('Por favor selecciona tus fechas de Check-in y Check-out.');
    if (!methodStr) return handleFailure('Por favor selecciona un método de pago.');
    
    const entrada = new Date(inStr);
    const salida = new Date(outStr);
    
    if (entrada >= salida) return handleFailure('La fecha de Check-out debe ser posterior a la de Check-in.');
    if (entrada < new Date(hoy)) return handleFailure('No puedes reservar en fechas que ya pasaron.');

    const reservaciones = getReservaciones();
    
    // Validar disponibilidad buscando choques de fechas
    const estaOcupada = reservaciones.some(res => {
      if (res.habitacionId !== habitacion.id) return false;
      if (res.estado === 'Cancelada') return false; 
      const resEntrada = new Date(res.fechaEntrada);
      const resSalida = new Date(res.fechaSalida);
      return entrada < resSalida && salida > resEntrada;
    });

    if (estaOcupada) return handleFailure('Lo sentimos, la habitación ya está ocupada en esas fechas. Por favor, elige otras.');

    // Cálculo del total para guardarlo en la base de datos
    const diffDays = Math.ceil((salida - entrada) / (1000 * 60 * 60 * 24));
    const precioNum = Number(habitacion.precio.replace(/[^0-9.-]+/g, ""));
    const totalFinal = diffDays * precioNum;

    const nuevaReserva = {
      id: reservaciones.length > 0 ? Math.max(...reservaciones.map(r => r.id)) + 1 : 1,
      usuarioId: usuarioActual.id,
      habitacionId: habitacion.id,
      habitacion: habitacion.nombre,
      fechaEntrada: inStr,
      fechaSalida: outStr,
      estado: 'Confirmada',
      metodoPago: methodStr,
      total: `$${totalFinal.toLocaleString('en-US')}` 
    };

    saveReservaciones([...reservaciones, nuevaReserva]);
    alert('¡Tu reserva ha sido confirmada exitosamente!');
    navigate('/mi_cuenta', { replace: true, state: { activeTab: 'reservaciones' } });
  };

  const handleReservar = () => {
    if (!fechaEntrada || !fechaSalida) {
      return alert('Por favor selecciona tus fechas de Check-in y Check-out.');
    }
    if (!metodoPago) {
      return alert('Por favor selecciona un método de pago.');
    }
    // Si no está iniciada la sesión, lo mandamos al login guardando su intención de reserva en memoria
    if (!usuarioActual) {
      navigate('/login', { 
        state: { 
          from: `/detalle_habitacion/${id}`, 
          fechaEntrada, 
          fechaSalida, 
          metodoPago,
          autoBook: true 
        } 
      });
      return;
    }
    procesarReserva(fechaEntrada, fechaSalida, metodoPago);
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

                <div className="flex flex-col">
                  <label className="text-xs font-semibold text-gray-500 mb-1">Método de Pago</label>
                  <select value={metodoPago} onChange={(e) => setMetodoPago(e.target.value)} className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:outline-none focus:border-brand-primary bg-white transition-colors">
                    <option value="">Selecciona un método</option>
                    <option value="Tarjeta de Crédito/Débito">Tarjeta de Crédito/Débito</option>
                    <option value="PayPal">PayPal</option>
                    <option value="Transferencia Bancaria">Transferencia Bancaria</option>
                    <option value="Efectivo en Recepción">Efectivo en Recepción</option>
                  </select>
                </div>

                {noches > 0 && (
                  <div className="flex justify-between items-center bg-brand-primary/10 p-3 rounded-lg border border-brand-primary/20">
                    <span className="text-sm text-gray-700">Total por {noches} {noches === 1 ? 'noche' : 'noches'}:</span>
                    <span className="font-bold text-brand-primary text-lg">${totalEstimado.toLocaleString('en-US')}</span>
                  </div>
                )}

                <button onClick={handleReservar} className="bg-brand-primary hover:bg-brand-secondary text-white text-center font-bold rounded-lg py-4 uppercase tracking-widest text-sm shadow-lg hover:shadow-xl transition-all mt-2">
                  Confirmar Reserva
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