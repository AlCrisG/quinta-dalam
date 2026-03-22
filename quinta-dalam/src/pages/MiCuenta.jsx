import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { getCurrentUser, logoutUser, updateUser } from '../data/usuarios';
import { getReservacionesUsuario, getReservaciones, saveReservaciones } from '../data/reservaciones';

export default function MiCuenta() {
  const navigate = useNavigate();
  const location = useLocation();
  
  // 1. Inicializamos el estado sincrónicamente desde el LocalStorage
  const [currentUser, setCurrentUser] = useState(() => getCurrentUser());
  const [activeTab, setActiveTab] = useState(location.state?.activeTab || 'perfil'); // 'perfil', 'reservaciones', 'pagos'
  
  const tabsRef = useRef(null);
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 });
  
  // 2. Inicializamos el formulario basándonos en el usuario (si existe)
  const [formData, setFormData] = useState(() => ({
    nombre: currentUser?.nombre || '',
    correo: currentUser?.correo || '',
    contrasenaActual: '',
    nuevaContrasena: '',
    confirmarNuevaContrasena: '',
  }));
  
  const [message, setMessage] = useState('');

  // 3. Sistema de reservaciones reales vinculado al LocalStorage
  const [reservations, setReservations] = useState(() => getReservacionesUsuario(currentUser?.id));

  // Estado para la ventana modal de detalles de reservación
  const [selectedReserva, setSelectedReserva] = useState(null);

  const paymentMethods = [
    { id: 1, tipo: 'Tarjeta de Crédito', ultimosDigitos: '**** **** **** 1234', vencimiento: '12/26' },
    { id: 2, tipo: 'PayPal', email: 'usuario@example.com' },
  ];

  // 4. Animación del indicador de la pestaña activa
  useEffect(() => {
    const updateIndicator = () => {
      if (tabsRef.current) {
        const activeBtn = tabsRef.current.querySelector('.active-tab');
        if (activeBtn) {
          setIndicatorStyle({
            left: activeBtn.offsetLeft,
            width: activeBtn.offsetWidth,
          });
        }
      }
    };

    const timeoutId = setTimeout(updateIndicator, 50);
    window.addEventListener('resize', updateIndicator);

    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('resize', updateIndicator);
    };
  }, [activeTab]);

  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
    }
  }, [currentUser, navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleUpdateProfile = (e) => {
    e.preventDefault();
    setMessage('');

    if (!currentUser) return;

    let updatedUser = { ...currentUser, nombre: formData.nombre, correo: formData.correo };
    let passwordChanged = false;

    // Manejar cambio de contraseña
    if (formData.contrasenaActual || formData.nuevaContrasena || formData.confirmarNuevaContrasena) {
      if (formData.contrasenaActual !== currentUser.contrasena) {
        setMessage('La contraseña actual es incorrecta.');
        return;
      }
      if (formData.nuevaContrasena !== formData.confirmarNuevaContrasena) {
        setMessage('La nueva contraseña y su confirmación no coinciden.');
        return;
      }
      if (formData.nuevaContrasena.length < 6) { // Validación básica
        setMessage('La nueva contraseña debe tener al menos 6 caracteres.');
        return;
      }
      updatedUser.contrasena = formData.nuevaContrasena;
      passwordChanged = true;
    }

    const success = updateUser(updatedUser);
    if (success) {
      setCurrentUser(updatedUser); // Actualizar estado local
      setMessage('¡Perfil actualizado exitosamente!');
      // Limpiar campos de contraseña después de una actualización exitosa
      setFormData(prev => ({
        ...prev,
        contrasenaActual: '',
        nuevaContrasena: '',
        confirmarNuevaContrasena: '',
      }));
      if (passwordChanged) {
        alert('Tu contraseña ha sido cambiada. Por seguridad, te recomendamos iniciar sesión nuevamente.');
        logoutUser();
        navigate('/login');
      }
    } else {
      setMessage('Error al actualizar el perfil.');
    }
  };

  const handleLogout = () => {
    logoutUser();
    navigate('/login');
  };

  const handleCancelarReserva = (id) => {
    if (!window.confirm('¿Estás seguro de que deseas cancelar esta reservación?')) return;

    const allReservations = getReservaciones();
    const resIndex = allReservations.findIndex(r => r.id === id);
    if (resIndex === -1) return;

    const res = allReservations[resIndex];
    const hoy = new Date();
    const entrada = new Date(`${res.fechaEntrada}T15:00:00`); // Consideramos la hora de check-in a las 3 PM
    const diffHours = (entrada - hoy) / (1000 * 60 * 60);

    if (diffHours < 0) {
      return alert('No puedes cancelar una reservación que ya ha comenzado.');
    }

    let porcentajePenalizacion = 0;
    if (diffHours < 24) {
      const confirmarTarde = window.confirm('Estás cancelando con menos de 24 horas de anticipación. Se te aplicará una penalización del 10%. ¿Deseas continuar?');
      if (!confirmarTarde) return;
      porcentajePenalizacion = 0.10;
    }

    const totalNum = Number(res.total.replace(/[^0-9.-]+/g, ""));
    const penalizacion = totalNum * porcentajePenalizacion;
    const montoReembolso = totalNum - penalizacion;

    // Cambiamos estado y le añadimos un objeto "reembolso"
    allReservations[resIndex] = {
      ...res,
      estado: 'Cancelada',
      reembolso: { estado: 'Pendiente', monto: `$${montoReembolso.toLocaleString('en-US')}`, penalizacion: `$${penalizacion.toLocaleString('en-US')}` }
    };

    saveReservaciones(allReservations);
    setReservations(getReservacionesUsuario(currentUser.id)); // Recargamos el estado visual
    alert('Reservación cancelada exitosamente. Tu reembolso está en proceso.');
  };

  if (!currentUser) {
    return null; // O un spinner de carga
  }

  const haIniciado = (fecha) => {
    const hoy = new Date();
    const entrada = new Date(`${fecha}T15:00:00`); // La reserva inicia a las 3 PM
    return hoy >= entrada;
  };

  return (
    <div className="flex flex-col items-center py-20 px-5 min-h-[80vh] bg-gray-50">
      <div className="flex flex-col items-center p-10 bg-white rounded-2xl shadow-xl border border-gray-100 w-full max-w-3xl text-center">
        <h2 className="text-3xl mb-4 font-bold text-brand-primary">Mi Cuenta</h2>
        <p className="text-gray-600 mb-8 text-sm">
          Bienvenido, {currentUser.nombre}. Aquí puedes gestionar tu información y reservas.
        </p>

        {/* Navegación por pestañas */}
        <div ref={tabsRef} className="flex justify-center border-b border-gray-200 w-full mb-8 relative">
          <div
            className="absolute -bottom-px h-0.5 bg-brand-primary transition-all duration-500 ease-in-out z-10"
            style={{ left: indicatorStyle.left, width: indicatorStyle.width }}
          />
          <button
            onClick={() => setActiveTab('perfil')}
            className={`py-3 px-6 text-sm font-medium rounded-t-lg transition-all duration-300 ${activeTab === 'perfil' ? 'text-brand-primary active-tab' : 'text-gray-500 hover:text-brand-primary hover:bg-brand-primary/5'}`}
          >
            Mi Perfil
          </button>
          <button
            onClick={() => setActiveTab('reservaciones')}
            className={`py-3 px-6 text-sm font-medium rounded-t-lg transition-all duration-300 ${activeTab === 'reservaciones' ? 'text-brand-primary active-tab' : 'text-gray-500 hover:text-brand-primary hover:bg-brand-primary/5'}`}
          >
            Mis Reservaciones
          </button>
          <button
            onClick={() => setActiveTab('pagos')}
            className={`py-3 px-6 text-sm font-medium rounded-t-lg transition-all duration-300 ${activeTab === 'pagos' ? 'text-brand-primary active-tab' : 'text-gray-500 hover:text-brand-primary hover:bg-brand-primary/5'}`}
          >
            Métodos de Pago
          </button>
        </div>

        {message && (
          <div className={`p-3 mb-4 rounded-lg text-sm w-full max-w-md ${message.includes('Error') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
            {message}
          </div>
        )}

        {/* Contenido basado en la pestaña activa */}
        {activeTab === 'perfil' && (
          <div className="w-full max-w-md">
            <h3 className="text-xl font-bold mb-6 text-left">Editar Información Personal</h3>
            <form onSubmit={handleUpdateProfile} className="flex flex-col gap-5">
              <div className="flex flex-col text-left">
                <label className="text-xs uppercase tracking-wider font-semibold text-gray-500 mb-2">Nombre</label>
                <input
                  type="text"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleChange}
                  required
                  className="w-full border border-gray-300 rounded-lg h-12 px-4 bg-gray-50 focus:bg-white focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all"
                />
              </div>
              <div className="flex flex-col text-left">
                <label className="text-xs uppercase tracking-wider font-semibold text-gray-500 mb-2">Correo Electrónico</label>
                <input
                  type="email"
                  name="correo"
                  value={formData.correo}
                  onChange={handleChange}
                  required
                  className="w-full border border-gray-300 rounded-lg h-12 px-4 bg-gray-50 focus:bg-white focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all"
                />
              </div>

              <h4 className="text-md font-bold mt-4 mb-2 text-left">Cambiar Contraseña (opcional)</h4>
              <div className="flex flex-col text-left">
                <label className="text-xs uppercase tracking-wider font-semibold text-gray-500 mb-2">Contraseña Actual</label>
                <input
                  type="password"
                  name="contrasenaActual"
                  value={formData.contrasenaActual}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg h-12 px-4 bg-gray-50 focus:bg-white focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all"
                />
              </div>
              <div className="flex flex-col text-left">
                <label className="text-xs uppercase tracking-wider font-semibold text-gray-500 mb-2">Nueva Contraseña</label>
                <input
                  type="password"
                  name="nuevaContrasena"
                  value={formData.nuevaContrasena}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg h-12 px-4 bg-gray-50 focus:bg-white focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all"
                />
              </div>
              <div className="flex flex-col text-left">
                <label className="text-xs uppercase tracking-wider font-semibold text-gray-500 mb-2">Confirmar Nueva Contraseña</label>
                <input
                  type="password"
                  name="confirmarNuevaContrasena"
                  value={formData.confirmarNuevaContrasena}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg h-12 px-4 bg-gray-50 focus:bg-white focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all"
                />
              </div>

              <button type="submit" className="mt-4 bg-brand-primary hover:bg-brand-secondary text-white font-bold rounded-lg py-3 uppercase tracking-wider text-sm shadow-md hover:shadow-lg transition-all">
                Guardar Cambios
              </button>
            </form>
          </div>
        )}

        {activeTab === 'reservaciones' && (
          <div className="w-full max-w-xl">
            <h3 className="text-xl font-bold mb-6 text-left">Mis Reservaciones</h3>
            
            <div className="bg-brand-primary/5 border border-brand-primary/20 text-gray-700 p-4 rounded-lg text-sm mb-6 flex gap-3 text-left animate-fade-in">
              <span className="text-xl">ℹ️</span>
              <p>
                <strong>Política de Cancelación:</strong> La hora de check-in es a las 3:00 PM. Cancela antes de las <strong>3:00 PM del día anterior</strong> a tu llegada para recibir un <strong>reembolso total</strong>. Si cancelas después de este límite, se aplicará un <strong>cargo del 10%</strong>.
              </p>
            </div>

            {reservations.length > 0 ? (
              <div className="space-y-4">
                {reservations.map((res) => (
                  <div key={res.id} className="bg-gray-50 p-4 rounded-lg shadow-sm border border-gray-100 text-left">
                    <p className="font-bold text-brand-primary">{res.habitacion}</p>
                    <p className="text-sm text-gray-600">Entrada: {res.fechaEntrada} | Salida: {res.fechaSalida}</p>
                    <p className="text-sm text-gray-600">Estado: <span className={`font-semibold ${res.estado === 'Confirmada' ? 'text-green-600' : res.estado === 'Cancelada' ? 'text-red-600' : 'text-yellow-600'}`}>{res.estado}</span></p>
                    <p className="text-sm text-gray-600">Total: <span className="font-bold">{res.total}</span> {res.metodoPago && `(Vía ${res.metodoPago})`}</p>
                    
                    <div className="mt-3 flex gap-4">
                      <button onClick={() => setSelectedReserva(res)} className="text-xs font-bold text-brand-primary hover:text-brand-secondary hover:underline uppercase tracking-wider">Ver Detalles</button>
                      {res.estado === 'Confirmada' && !haIniciado(res.fechaEntrada) && (
                        <button onClick={() => handleCancelarReserva(res.id)} className="text-xs font-bold text-red-600 hover:underline uppercase tracking-wider">Cancelar Reserva</button>
                      )}
                    </div>
                    
                    {res.estado === 'Cancelada' && res.reembolso && (
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <p className="text-xs text-gray-600">
                          <span className="font-bold">Reembolso:</span> <span className={res.reembolso.estado === 'Aprobado' ? 'text-green-600 font-bold' : 'text-orange-500 font-bold'}>{res.reembolso.estado}</span> ({res.reembolso.monto})
                        </p>
                        {res.reembolso.penalizacion !== '$0' && <p className="text-xs text-red-500">Penalización aplicada: {res.reembolso.penalizacion}</p>}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No tienes reservaciones activas.</p>
            )}
          </div>
        )}

        {activeTab === 'pagos' && (
          <div className="w-full max-w-xl">
            <h3 className="text-xl font-bold mb-6 text-left">Métodos de Pago</h3>
            {paymentMethods.length > 0 ? (
              <div className="space-y-4">
                {paymentMethods.map((pm) => (
                  <div key={pm.id} className="bg-gray-50 p-4 rounded-lg shadow-sm border border-gray-100 text-left">
                    <p className="font-bold text-brand-primary">{pm.tipo}</p>
                    {pm.ultimosDigitos && <p className="text-sm text-gray-600">Número: {pm.ultimosDigitos}</p>}
                    {pm.vencimiento && <p className="text-sm text-gray-600">Vencimiento: {pm.vencimiento}</p>}
                    {pm.email && <p className="text-sm text-gray-600">Email: {pm.email}</p>}
                    <button className="mt-2 text-xs text-red-600 hover:underline">Eliminar</button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No tienes métodos de pago guardados.</p>
            )}
            <button className="mt-6 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg py-3 px-6 uppercase tracking-wider text-xs shadow-md hover:shadow-lg transition-all">
              Agregar Método de Pago
            </button>
          </div>
        )}

        <button onClick={handleLogout} className="mt-10 bg-white border-2 border-red-600 text-red-600 hover:bg-red-600 hover:text-white font-bold rounded-lg py-3 px-8 uppercase tracking-wider text-xs shadow-sm hover:shadow-md transition-all w-full max-w-md">
          Cerrar Sesión
        </button>
      </div>

      {/* MODAL DETALLES DE RESERVACIÓN */}
      {selectedReserva && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 md:p-8 relative">
            <button 
              onClick={() => setSelectedReserva(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-800 text-2xl font-bold cursor-pointer transition-colors"
            >
              &times;
            </button>
            
            <h3 className="text-2xl font-bold text-brand-primary mb-1 text-center md:text-left">Detalles de la Reserva</h3>
            <p className="text-sm text-gray-500 mb-6 border-b border-gray-100 pb-4 text-center md:text-left">ID: #{selectedReserva.id}</p>
            
            <div className="space-y-4 text-left mb-8">
              <div className="flex justify-between items-center"><span className="font-semibold text-gray-500 text-sm">Habitación:</span> <span className="text-gray-800 font-bold">{selectedReserva.habitacion}</span></div>
              <div className="flex justify-between items-center"><span className="font-semibold text-gray-500 text-sm">Check-in:</span> <span className="text-gray-800">{selectedReserva.fechaEntrada}</span></div>
              <div className="flex justify-between items-center"><span className="font-semibold text-gray-500 text-sm">Check-out:</span> <span className="text-gray-800">{selectedReserva.fechaSalida}</span></div>
              <div className="flex justify-between items-center">
                <span className="font-semibold text-gray-500 text-sm">Estado:</span> 
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${selectedReserva.estado === 'Confirmada' ? 'bg-green-100 text-green-700' : selectedReserva.estado === 'Cancelada' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
                  {selectedReserva.estado}
                </span>
              </div>
              <div className="flex justify-between items-center"><span className="font-semibold text-gray-500 text-sm">Método de Pago:</span> <span className="text-gray-800">{selectedReserva.metodoPago}</span></div>
              <div className="flex justify-between items-center bg-gray-50 p-3 rounded-lg border border-gray-200 mt-2">
                <span className="font-bold text-gray-700">Total Pagado:</span> <span className="text-brand-primary font-bold text-lg">{selectedReserva.total}</span>
              </div>
            </div>

            {selectedReserva.estado === 'Cancelada' && selectedReserva.reembolso && (
              <div className="bg-red-50 p-4 rounded-lg mb-8 border border-red-100 text-sm">
                <h4 className="font-bold text-red-700 mb-3 border-b border-red-200 pb-2">Información de Cancelación</h4>
                <div className="flex justify-between mb-2"><span className="text-red-600">Penalización aplicada:</span> <span className="font-semibold text-red-800">{selectedReserva.reembolso.penalizacion}</span></div>
                <div className="flex justify-between mb-2"><span className="text-red-600">Monto a Reembolsar:</span> <span className="font-semibold text-red-800">{selectedReserva.reembolso.monto}</span></div>
                <div className="flex justify-between mt-3 pt-2 border-t border-red-100"><span className="font-bold text-red-700">Estado del Reembolso:</span> <span className={`font-bold ${selectedReserva.reembolso.estado === 'Aprobado' ? 'text-green-600' : 'text-orange-500'}`}>{selectedReserva.reembolso.estado}</span></div>
              </div>
            )}
            
            <div className="flex justify-center">
              <button 
                onClick={() => setSelectedReserva(null)}
                className="bg-brand-primary hover:bg-brand-secondary text-white font-bold py-3 px-8 rounded-lg uppercase tracking-wider text-xs shadow-md transition-all w-full"
              >
                Cerrar Detalles
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
