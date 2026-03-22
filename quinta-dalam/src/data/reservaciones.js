// Datos de prueba para que tengas algo que ver en tu cuenta ("Cliente Prueba")
const reservacionesIniciales = [
  { 
    id: 1, 
    usuarioId: 2, // ID del Cliente Prueba
    habitacionId: 1,
    habitacion: 'Tzintzuntzan', 
    fechaEntrada: '2024-11-15', 
    fechaSalida: '2024-11-20', 
    estado: 'Confirmada', 
    total: '$7,250' 
  },
  { 
    id: 2, 
    usuarioId: 2, 
    habitacionId: 7,
    habitacion: 'Suite Quencio', 
    fechaEntrada: '2024-12-24', 
    fechaSalida: '2024-12-28', 
    estado: 'Pendiente', 
    total: '$6,400' 
  }
];

// Obtener todas las reservaciones
export const getReservaciones = () => {
  const guardadas = localStorage.getItem('hotel_reservaciones');
  if (guardadas) return JSON.parse(guardadas);
  
  // Si es la primera vez, cargamos las de prueba
  localStorage.setItem('hotel_reservaciones', JSON.stringify(reservacionesIniciales));
  return reservacionesIniciales;
};

export const saveReservaciones = (reservaciones) => {
  localStorage.setItem('hotel_reservaciones', JSON.stringify(reservaciones));
};

export const getReservacionesUsuario = (usuarioId) => {
  const reservaciones = getReservaciones();
  return reservaciones.filter(r => r.usuarioId === usuarioId);
};