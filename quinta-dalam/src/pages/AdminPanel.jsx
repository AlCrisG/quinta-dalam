import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { getCurrentUser, getUsuarios, saveUsuarios } from '../data/usuarios';
import { getHabitaciones, saveHabitaciones } from '../data/habitaciones';
import { getReservaciones, saveReservaciones } from '../data/reservaciones';

export default function AdminPanel() {
  const navigate = useNavigate();
  const location = useLocation();
  const currentUser = getCurrentUser();

  const [activeTab, setActiveTab] = useState(location.state?.activeTab || 'reservaciones'); // 'reservaciones', 'habitaciones', 'usuarios'
  
  // Estados de los datos
  const [reservaciones, setReservaciones] = useState(() => currentUser?.rol === 'admin' ? getReservaciones() : []);
  const [habitaciones, setHabitaciones] = useState(() => currentUser?.rol === 'admin' ? getHabitaciones() : []);
  const [usuarios, setUsuarios] = useState(() => currentUser?.rol === 'admin' ? getUsuarios() : []);

  // Estados para nueva reservación (hecha por el admin)
  const [nuevaReserva, setNuevaReserva] = useState({ usuarioId: '', habitacionId: '', fechaEntrada: '', fechaSalida: '', metodoPago: '' });
  
  // Estado para editar reservación existente
  const [editResId, setEditResId] = useState(null);
  const [editResData, setEditResData] = useState({});

  // Estado para editar usuario existente
  const [editUserId, setEditUserId] = useState(null);
  const [editUserData, setEditUserData] = useState({ nombre: '' });

  // Obtener fecha actual para validaciones de calendario
  const fechaActual = new Date();
  const hoy = fechaActual.toISOString().split('T')[0];

  useEffect(() => {
    window.scrollTo(0, 0);
    if (!currentUser || currentUser.rol !== 'admin') {
      navigate('/'); // Redirige si no es admin
    }
  }, [currentUser, navigate]);

  if (!currentUser || currentUser.rol !== 'admin') return null;

  // --- FUNCIONES CRUD RESERVACIONES ---
  const handleCrearReservacionAdmin = (e) => {
    e.preventDefault();
    if (!nuevaReserva.usuarioId || !nuevaReserva.habitacionId || !nuevaReserva.fechaEntrada || !nuevaReserva.fechaSalida || !nuevaReserva.metodoPago) {
      return alert('Completa todos los campos de la reservación');
    }

    const entrada = new Date(nuevaReserva.fechaEntrada);
    const salida = new Date(nuevaReserva.fechaSalida);
    if (entrada >= salida) return alert('La fecha de salida debe ser posterior a la de entrada.');
    
    // Validar disponibilidad
    const estaOcupada = reservaciones.some(res => {
      if (res.habitacionId !== parseInt(nuevaReserva.habitacionId)) return false;
      if (res.estado === 'Cancelada') return false; // Ignorar canceladas
      const resEntrada = new Date(res.fechaEntrada);
      const resSalida = new Date(res.fechaSalida);
      return entrada < resSalida && salida > resEntrada;
    });

    if (estaOcupada) return alert('La habitación seleccionada está ocupada en esas fechas.');

    const habitacionSeleccionada = habitaciones.find(h => h.id === parseInt(nuevaReserva.habitacionId));
    const usuarioSeleccionado = usuarios.find(u => u.id === parseInt(nuevaReserva.usuarioId));
    const nuevoId = reservaciones.length > 0 ? Math.max(...reservaciones.map(r => r.id)) + 1 : 1;

    // Calcular el precio real según las noches
    const diffDays = Math.ceil((salida - entrada) / (1000 * 60 * 60 * 24));
    const precioNum = Number(habitacionSeleccionada.precio.replace(/[^0-9.-]+/g, ""));
    const totalFinal = `$${(diffDays * precioNum).toLocaleString('en-US')}`;

    const reservaGenerada = {
      id: nuevoId,
      usuarioId: usuarioSeleccionado.id,
      habitacionId: habitacionSeleccionada.id,
      habitacion: habitacionSeleccionada.nombre,
      fechaEntrada: nuevaReserva.fechaEntrada,
      fechaSalida: nuevaReserva.fechaSalida,
      metodoPago: nuevaReserva.metodoPago,
      estado: 'Confirmada',
      total: totalFinal
    };

    const actualizadas = [...reservaciones, reservaGenerada];
    setReservaciones(actualizadas);
    saveReservaciones(actualizadas);
    alert('Reservación creada con éxito.');
    setNuevaReserva({ usuarioId: '', habitacionId: '', fechaEntrada: '', fechaSalida: '', metodoPago: '' });
  };

  const iniciarEdicionReserva = (res) => {
    setEditResId(res.id);
    setEditResData({ fechaEntrada: res.fechaEntrada, fechaSalida: res.fechaSalida, estado: res.estado });
  };

  const guardarEdicionReserva = (id) => {
    const entrada = new Date(editResData.fechaEntrada);
    const salida = new Date(editResData.fechaSalida);
    
    if (entrada >= salida) return alert('La fecha de salida debe ser posterior a la de entrada.');

    const actualizadas = reservaciones.map(r => {
      if (r.id === id) {
        const habitacion = habitaciones.find(h => h.id === r.habitacionId);
        const diffDays = Math.ceil((salida - entrada) / (1000 * 60 * 60 * 24));
        const precioNum = Number(habitacion.precio.replace(/[^0-9.-]+/g, ""));
        const totalFinal = `$${(diffDays * precioNum).toLocaleString('en-US')}`;
        
        return { ...r, ...editResData, total: totalFinal };
      }
      return r;
    });

    setReservaciones(actualizadas);
    saveReservaciones(actualizadas);
    setEditResId(null);
    alert('Reservación actualizada.');
  };

  const eliminarReserva = (id) => {
    if (window.confirm('¿Seguro que deseas eliminar esta reservación?')) {
      const actualizadas = reservaciones.filter(r => r.id !== id);
      setReservaciones(actualizadas);
      saveReservaciones(actualizadas);
    }
  };

  // --- FUNCIONES CRUD HABITACIONES ---
  const eliminarHabitacion = (id) => {
    if (window.confirm('¿Seguro que deseas eliminar esta habitación?')) {
      const actualizadas = habitaciones.filter(h => h.id !== id);
      setHabitaciones(actualizadas);
      saveHabitaciones(actualizadas);
    }
  };

  // --- FUNCIONES CRUD USUARIOS ---
  const eliminarUsuario = (id) => {
    if (id === currentUser.id) return alert('No puedes eliminar tu propio usuario en sesión.');
    if (window.confirm('¿Seguro que deseas eliminar este usuario? Sus reservas podrían quedar huérfanas.')) {
      const actualizados = usuarios.filter(u => u.id !== id);
      setUsuarios(actualizados);
      saveUsuarios(actualizados);
    }
  };

  const cambiarRolUsuario = (id, nuevoRol) => {
    if (id === currentUser.id) return alert('No puedes cambiar tu propio rol.');
    const actualizados = usuarios.map(u => u.id === id ? { ...u, rol: nuevoRol } : u);
    setUsuarios(actualizados);
    saveUsuarios(actualizados);
  };

  const iniciarEdicionUsuario = (user) => {
    setEditUserId(user.id);
    setEditUserData({ nombre: user.nombre });
  };

  const guardarEdicionUsuario = (id) => {
    if (!editUserData.nombre.trim()) return alert('El nombre no puede estar vacío.');
    const actualizados = usuarios.map(u => u.id === id ? { ...u, nombre: editUserData.nombre } : u);
    setUsuarios(actualizados);
    saveUsuarios(actualizados);
    setEditUserId(null);
    alert('Usuario actualizado exitosamente.');
  };

  return (
    <div className="py-20 px-5 bg-gray-50 min-h-[80vh] flex flex-col items-center">
      <div className="w-full max-w-6xl">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold text-gray-800">Panel de Administración</h2>
          <span className="bg-brand-primary text-white text-xs px-3 py-1 rounded-full uppercase tracking-wider font-bold">Modo Admin</span>
        </div>

        {/* Navegación por pestañas */}
        <div className="flex gap-2 mb-8 border-b border-gray-200">
          {['reservaciones', 'habitaciones', 'usuarios'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-3 px-6 text-sm font-bold uppercase tracking-wider rounded-t-lg transition-colors ${activeTab === tab ? 'bg-white border-t-2 border-brand-primary border-x text-brand-primary' : 'text-gray-500 hover:bg-gray-100'}`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* PESTAÑA RESERVACIONES */}
        {activeTab === 'reservaciones' && (
          <div className="space-y-8 animate-fade-in">
            {/* Formulario Crear Reservación */}
            <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-100">
              <h3 className="text-lg font-bold mb-4 text-gray-700">Nueva Reservación Manual</h3>
              <form onSubmit={handleCrearReservacionAdmin} className="flex flex-wrap gap-4 items-end">
                <div className="flex flex-col flex-1 min-w-50">
                  <label className="text-xs uppercase font-semibold text-gray-500 mb-1">Usuario</label>
                  <select value={nuevaReserva.usuarioId} onChange={(e) => setNuevaReserva({...nuevaReserva, usuarioId: e.target.value})} className="border border-gray-300 rounded-lg p-2 text-sm focus:border-brand-primary outline-none bg-white">
                    <option value="">Selecciona Cliente</option>
                    {usuarios.map(u => <option key={u.id} value={u.id}>{u.nombre} ({u.correo})</option>)}
                  </select>
                </div>
                <div className="flex flex-col flex-1 min-w-50">
                  <label className="text-xs uppercase font-semibold text-gray-500 mb-1">Habitación</label>
                  <select value={nuevaReserva.habitacionId} onChange={(e) => setNuevaReserva({...nuevaReserva, habitacionId: e.target.value})} className="border border-gray-300 rounded-lg p-2 text-sm focus:border-brand-primary outline-none bg-white">
                    <option value="">Selecciona Habitación</option>
                    {habitaciones.map(h => <option key={h.id} value={h.id}>{h.nombre} - {h.precio}</option>)}
                  </select>
                </div>
                <div className="flex flex-col">
                  <label className="text-xs uppercase font-semibold text-gray-500 mb-1">Check-in</label>
                  <input type="date" min={hoy} value={nuevaReserva.fechaEntrada} onChange={(e) => setNuevaReserva({...nuevaReserva, fechaEntrada: e.target.value})} className="border border-gray-300 rounded-lg p-2 text-sm outline-none bg-white" />
                </div>
                <div className="flex flex-col">
                  <label className="text-xs uppercase font-semibold text-gray-500 mb-1">Check-out</label>
                  <input type="date" min={nuevaReserva.fechaEntrada || hoy} value={nuevaReserva.fechaSalida} onChange={(e) => setNuevaReserva({...nuevaReserva, fechaSalida: e.target.value})} className="border border-gray-300 rounded-lg p-2 text-sm outline-none bg-white" />
                </div>
                <div className="flex flex-col">
                  <label className="text-xs uppercase font-semibold text-gray-500 mb-1">Método Pago</label>
                  <select value={nuevaReserva.metodoPago} onChange={(e) => setNuevaReserva({...nuevaReserva, metodoPago: e.target.value})} className="border border-gray-300 rounded-lg p-2 text-sm focus:border-brand-primary outline-none bg-white">
                    <option value="">Seleccionar</option>
                    <option value="Tarjeta de Crédito/Débito">Tarjeta</option>
                    <option value="PayPal">PayPal</option>
                    <option value="Transferencia Bancaria">Transferencia</option>
                    <option value="Efectivo en Recepción">Efectivo</option>
                  </select>
                </div>
                <button type="submit" className="bg-brand-primary hover:bg-brand-secondary text-white font-bold rounded-lg py-2 px-6 shadow-md transition-all h-9.5 text-sm">Crear</button>
              </form>
            </div>

            {/* Tabla Reservaciones */}
            <div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-100 text-gray-500 text-xs uppercase tracking-wider">
                    <th className="p-4">ID / Cliente</th>
                    <th className="p-4">Habitación</th>
                    <th className="p-4">Fechas</th>
                    <th className="p-4">Estado</th>
                    <th className="p-4">Total</th>
                    <th className="p-4 text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody className="text-sm divide-y divide-gray-100">
                  {reservaciones.map(res => (
                    <tr key={res.id} className="hover:bg-gray-50 transition-colors">
                      <td className="p-4 font-medium text-gray-800">#{res.id} <br/><span className="text-xs font-normal text-gray-500">ID Usuario: {res.usuarioId}</span></td>
                      <td className="p-4">{res.habitacion}</td>
                      
                      {editResId === res.id ? (
                        <td className="p-4 flex flex-col gap-2">
                          <input type="date" value={editResData.fechaEntrada} onChange={(e) => setEditResData({...editResData, fechaEntrada: e.target.value})} className="border border-gray-300 rounded p-1 text-xs" />
                          <input type="date" value={editResData.fechaSalida} onChange={(e) => setEditResData({...editResData, fechaSalida: e.target.value})} className="border border-gray-300 rounded p-1 text-xs" />
                        </td>
                      ) : (
                        <td className="p-4 text-gray-600">{res.fechaEntrada} <br/> {res.fechaSalida}</td>
                      )}

                      {editResId === res.id ? (
                        <td className="p-4">
                          <select value={editResData.estado} onChange={(e) => setEditResData({...editResData, estado: e.target.value})} className="border border-gray-300 rounded p-1 text-xs bg-white">
                            <option value="Confirmada">Confirmada</option>
                            <option value="Pendiente">Pendiente</option>
                            <option value="Cancelada">Cancelada</option>
                          </select>
                        </td>
                      ) : (
                        <td className="p-4">
                          <span className={`px-2 py-1 text-xs font-bold rounded-full ${res.estado === 'Confirmada' ? 'bg-green-100 text-green-700' : res.estado === 'Cancelada' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
                            {res.estado}
                          </span>
                        </td>
                      )}

                      <td className="p-4">{res.total}</td>
                      <td className="p-4 text-center space-x-2">
                        {editResId === res.id ? (
                          <button onClick={() => guardarEdicionReserva(res.id)} className="text-green-600 font-bold hover:underline">Guardar</button>
                        ) : (
                          <button onClick={() => iniciarEdicionReserva(res)} className="text-blue-600 font-bold hover:underline">Editar</button>
                        )}
                        <button onClick={() => eliminarReserva(res.id)} className="text-red-600 font-bold hover:underline">Borrar</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* PESTAÑA HABITACIONES */}
        {activeTab === 'habitaciones' && (
          <div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden animate-fade-in">
            <div className="p-4 border-b border-gray-100 bg-gray-50 flex justify-end">
              <Link to="/agregar_habitacion" className="bg-gray-800 hover:bg-black text-white text-xs font-bold py-2 px-4 rounded shadow transition-colors uppercase tracking-wider">
                + Nueva Habitación
              </Link>
            </div>
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-100 text-gray-500 text-xs uppercase tracking-wider">
                  <th className="p-4">Img / Nombre</th>
                  <th className="p-4">Precio</th>
                  <th className="p-4">Capacidad</th>
                  <th className="p-4 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="text-sm divide-y divide-gray-100">
                {habitaciones.map(hab => (
                  <tr key={hab.id} className="hover:bg-gray-50 transition-colors">
                    <td className="p-4 flex items-center gap-4">
                      <img src={hab.img} alt={hab.nombre} className="w-12 h-12 rounded object-cover" />
                      <span className="font-bold text-gray-800">{hab.nombre}</span>
                    </td>
                    <td className="p-4 font-medium">{hab.precio}</td>
                    <td className="p-4 text-gray-500">{hab.capacidad}</td>
                    <td className="p-4 text-center space-x-4">
                      <Link to={`/editar_habitacion/${hab.id}`} className="text-blue-600 font-bold hover:underline">Editar</Link>
                      <button onClick={() => eliminarHabitacion(hab.id)} className="text-red-600 font-bold hover:underline">Eliminar</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* PESTAÑA USUARIOS */}
        {activeTab === 'usuarios' && (
          <div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-x-auto animate-fade-in">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-100 text-gray-500 text-xs uppercase tracking-wider">
                  <th className="p-4">ID</th>
                  <th className="p-4">Nombre / Correo</th>
                  <th className="p-4">Rol</th>
                  <th className="p-4 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="text-sm divide-y divide-gray-100">
                {usuarios.map(user => (
                  <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                    <td className="p-4 font-medium text-gray-500">#{user.id}</td>
                    <td className="p-4">
                      {editUserId === user.id ? (
                        <div className="flex flex-col gap-1">
                          <input 
                            type="text" 
                            value={editUserData.nombre} 
                            onChange={(e) => setEditUserData({...editUserData, nombre: e.target.value})} 
                            className="border border-gray-300 rounded p-1 text-xs w-full max-w-50" 
                          />
                          <span className="text-gray-500 text-xs">{user.correo}</span>
                        </div>
                      ) : (
                        <><span className="font-bold text-gray-800">{user.nombre}</span> <br/><span className="text-gray-500 text-xs">{user.correo}</span></>
                      )}
                    </td>
                    <td className="p-4">
                      <select 
                        value={user.rol} 
                        onChange={(e) => cambiarRolUsuario(user.id, e.target.value)}
                        className={`border rounded p-1 text-xs font-bold ${user.rol === 'admin' ? 'bg-purple-100 text-purple-700 border-purple-200' : 'bg-gray-100 text-gray-700 border-gray-200'}`}
                      >
                        <option value="cliente">Cliente</option>
                        <option value="admin">Administrador</option>
                      </select>
                    </td>
                    <td className="p-4 text-center space-x-2">
                      {editUserId === user.id ? (
                        <button onClick={() => guardarEdicionUsuario(user.id)} className="text-green-600 font-bold hover:underline">Guardar</button>
                      ) : (
                        <button onClick={() => iniciarEdicionUsuario(user)} className="text-blue-600 font-bold hover:underline">Editar</button>
                      )}
                      <button onClick={() => eliminarUsuario(user.id)} className="text-red-600 font-bold hover:underline" disabled={user.id === currentUser.id}>
                        {user.id === currentUser.id ? 'Tú (Activo)' : 'Eliminar'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

      </div>
    </div>
  );
}