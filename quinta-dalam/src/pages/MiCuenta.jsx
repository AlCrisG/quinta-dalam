import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getCurrentUser, logoutUser, updateUser } from '../data/usuarios';
import { getReservacionesUsuario } from '../data/reservaciones';

export default function MiCuenta() {
  const navigate = useNavigate();
  
  // 1. Inicializamos el estado sincrónicamente desde el LocalStorage
  const [currentUser, setCurrentUser] = useState(() => getCurrentUser());
  const [activeTab, setActiveTab] = useState('perfil'); // 'perfil', 'reservaciones', 'pagos'
  
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
  const [reservations] = useState(() => getReservacionesUsuario(currentUser?.id));

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
    window.scrollTo(0, 0);
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

  if (!currentUser) {
    return null; // O un spinner de carga
  }

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
            {reservations.length > 0 ? (
              <div className="space-y-4">
                {reservations.map((res) => (
                  <div key={res.id} className="bg-gray-50 p-4 rounded-lg shadow-sm border border-gray-100 text-left">
                    <p className="font-bold text-brand-primary">{res.habitacion}</p>
                    <p className="text-sm text-gray-600">Entrada: {res.fechaEntrada} | Salida: {res.fechaSalida}</p>
                    <p className="text-sm text-gray-600">Estado: <span className={`font-semibold ${res.estado === 'Confirmada' ? 'text-green-600' : 'text-yellow-600'}`}>{res.estado}</span></p>
                    <p className="text-sm text-gray-600">Total: {res.total}</p>
                    <button className="mt-2 text-xs text-blue-600 hover:underline">Ver Detalles</button>
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
    </div>
  );
}
