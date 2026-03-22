import { useState } from 'react';
import { Link } from 'react-router-dom';
import { getHabitaciones } from '../data/habitaciones';
import { getReservaciones } from '../data/reservaciones';
import { useEffect } from 'react';

export default function Habitaciones() {
  const [habitaciones] = useState(() => getHabitaciones());
  const [busqueda, setBusqueda] = useState(''); 
  const [fechaEntrada, setFechaEntrada] = useState('');
  const [fechaSalida, setFechaSalida] = useState('');
  const [filtrosFechas, setFiltrosFechas] = useState({ entrada: '', salida: '' });

  useEffect(() => {
      window.scrollTo(0, 0);
    }, []);

  const reservaciones = getReservaciones();

  // Calculamos la fecha de hoy para restringir los calendarios
  const fechaActual = new Date();
  const yyyy = fechaActual.getFullYear();
  const mm = String(fechaActual.getMonth() + 1).padStart(2, '0');
  const dd = String(fechaActual.getDate()).padStart(2, '0');
  const hoy = `${yyyy}-${mm}-${dd}`;

  const habitacionesFiltradas = habitaciones.filter((hab) => {
    // 1. Filtro por nombre de habitación (en vivo)
    const coincideTexto = hab.nombre.toLowerCase().includes(busqueda.toLowerCase());
    if (!coincideTexto) return false;

    // 2. Filtro por disponibilidad de fechas (se aplica al presionar Buscar)
    if (filtrosFechas.entrada && filtrosFechas.salida) {
      const inDate = new Date(filtrosFechas.entrada);
      const outDate = new Date(filtrosFechas.salida);
      
      const estaOcupada = reservaciones.some(res => {
        if (res.habitacionId !== hab.id) return false;
        if (res.estado === 'Cancelada') return false; // Las canceladas no ocupan lugar
        const resEntrada = new Date(res.fechaEntrada);
        const resSalida = new Date(res.fechaSalida);
        // Hay cruce si la entrada solicitada es menor a la salida de la reserva y la salida solicitada es mayor a la entrada de la reserva
        return inDate < resSalida && outDate > resEntrada;
      });

      if (estaOcupada) return false;
    }

    return true;
  });

  const handleBuscarFechas = (e) => {
    e.preventDefault();
    if (fechaEntrada && fechaSalida) {
      if (new Date(fechaEntrada) >= new Date(fechaSalida)) {
        return alert('La fecha de Check-out debe ser posterior a la de Check-in.');
      }
    } else if (fechaEntrada || fechaSalida) {
      return alert('Por favor, selecciona tanto el Check-in como el Check-out para buscar disponibilidad.');
    }
    setFiltrosFechas({ entrada: fechaEntrada, salida: fechaSalida });
  };

  // Función para restablecer los estados
  const handleLimpiarFiltros = () => {
    setBusqueda('');
    setFechaEntrada('');
    setFechaSalida('');
    setFiltrosFechas({ entrada: '', salida: '' });
  };

  const hayFiltrosActivos = busqueda.trim() !== '' || (filtrosFechas.entrada && filtrosFechas.salida);

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
            <input 
              type="date" 
              min={hoy}
              value={fechaEntrada}
              onChange={(e) => setFechaEntrada(e.target.value)}
              className="border-b-2 border-gray-200 p-2 focus:border-brand-primary outline-none transition-colors w-full text-gray-600 bg-transparent" 
            />
          </div>

          <div className="flex flex-col w-full md:w-auto">
            <label className="text-xs uppercase tracking-wider font-semibold text-gray-500 mb-2">Check-out</label>
            <input 
              type="date" 
              min={fechaEntrada || hoy}
              value={fechaSalida}
              onChange={(e) => setFechaSalida(e.target.value)}
              className="border-b-2 border-gray-200 p-2 focus:border-brand-primary outline-none transition-colors w-full text-gray-600 bg-transparent" 
            />
          </div>

          <button type="submit" className="bg-brand-primary hover:bg-brand-secondary text-white px-8 py-3 rounded-lg font-bold uppercase text-sm tracking-wider shadow-md hover:shadow-xl transition-all w-full md:w-auto mt-4 md:mt-0">
            Buscar
          </button>
        </form>
      </div>

      {/* Feedback de Filtros Activos */}
      {hayFiltrosActivos && (
        <div className="w-full max-w-6xl mb-8 flex flex-col sm:flex-row justify-between items-center bg-brand-primary/10 px-6 py-4 rounded-xl border border-brand-primary/20 animate-fade-in">
          <span className="text-gray-700 text-sm font-medium mb-3 sm:mb-0 text-center sm:text-left">
            Mostrando <span className="font-bold text-brand-primary">{habitacionesFiltradas.length}</span> {habitacionesFiltradas.length === 1 ? 'resultado' : 'resultados'} para tu búsqueda.
          </span>
          <button onClick={handleLimpiarFiltros} className="text-xs font-bold text-red-500 hover:text-red-700 hover:underline transition-colors uppercase tracking-widest cursor-pointer">
            Limpiar Filtros ✖
          </button>
        </div>
      )}

      {/* Mensaje de 0 resultados */}
      {habitacionesFiltradas.length === 0 && (
        <div className="w-full max-w-6xl text-center py-10 animate-fade-in">
          <h3 className="text-2xl font-bold text-gray-800 mb-3">No hay habitaciones disponibles</h3>
          <p className="text-gray-500">Prueba cambiando las fechas o el término de búsqueda.</p>
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