// Usuarios por defecto (1 Admin, 1 Cliente)
const usuariosIniciales = [
  { id: 1, nombre: 'Administrador', correo: 'admin@hotel.com', contrasena: 'admin123', rol: 'admin' },
  { id: 2, nombre: 'Cliente Prueba', correo: 'cliente@hotel.com', contrasena: 'cliente123', rol: 'cliente' }
];

// Obtener todos los usuarios registrados
export const getUsuarios = () => {
  const guardados = localStorage.getItem('hotel_usuarios');
  if (guardados) return JSON.parse(guardados);
  localStorage.setItem('hotel_usuarios', JSON.stringify(usuariosIniciales));
  return usuariosIniciales;
};

// Registrar un nuevo usuario (por defecto será cliente)
export const registrarUsuario = (nuevoUsuario) => {
  const usuarios = getUsuarios();
  const id = usuarios.length > 0 ? Math.max(...usuarios.map(u => u.id)) + 1 : 1;
  const usuarioConId = { ...nuevoUsuario, id, rol: 'cliente' }; // Siempre se registran como clientes
  usuarios.push(usuarioConId);
  localStorage.setItem('hotel_usuarios', JSON.stringify(usuarios));
};

// Iniciar sesión
export const loginUser = (correo, contrasena) => {
  const usuarios = getUsuarios();
  const usuarioValido = usuarios.find(u => u.correo === correo && u.contrasena === contrasena);
  
  if (usuarioValido) {
    localStorage.setItem('hotel_sesion', JSON.stringify(usuarioValido)); // Guardamos quién inició sesión
    return true;
  }
  return false;
};

// Obtener el usuario que tiene la sesión iniciada
export const getCurrentUser = () => {
  const sesion = localStorage.getItem('hotel_sesion');
  return sesion ? JSON.parse(sesion) : null;
};

// Cerrar sesión
export const logoutUser = () => {
  localStorage.removeItem('hotel_sesion');
};

// Actualizar información de un usuario
export const updateUser = (updatedUser) => {
  const usuarios = getUsuarios();
  const index = usuarios.findIndex(u => u.id === updatedUser.id);
  
  if (index !== -1) {
    usuarios[index] = updatedUser;
    localStorage.setItem('hotel_usuarios', JSON.stringify(usuarios));
    
    // Si el usuario actualizado es el que tiene la sesión iniciada, también actualizamos la sesión
    const currentUser = getCurrentUser();
    if (currentUser && currentUser.id === updatedUser.id) {
      localStorage.setItem('hotel_sesion', JSON.stringify(updatedUser));
    }
    return true;
  }
  return false;
};

// Guardar todos los usuarios (útil para el CRUD del panel de administración)
export const saveUsuarios = (usuarios) => {
  localStorage.setItem('hotel_usuarios', JSON.stringify(usuarios));
};