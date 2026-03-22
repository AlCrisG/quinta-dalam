import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { getCurrentUser, logoutUser } from '../data/usuarios';

export default function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const usuario = getCurrentUser();

  const getLinkClass = (path) => {
    const baseClass = "px-5 py-7 text-center text-white/90 hover:text-white transition-all duration-300 hover:bg-brand-secondary font-medium tracking-wide text-sm uppercase";
    return location.pathname === path ? `${baseClass} bg-brand-secondary text-white` : baseClass;
  };

  const handleLogout = () => {
    logoutUser();
    navigate('/login');
  };

  return (
    <>
      {/* NAVBAR */}
      <header className="fixed top-0 left-0 w-full z-50 bg-brand-primary text-white flex justify-between items-center px-6 h-20 shadow-lg">
        <Link to="/" className="flex items-center gap-4 hover:opacity-90 transition-opacity">
          <img src="/img/favicon.png" alt="Logo" className="h-11.25" />
          <h1 className="text-2xl font-bold m-0 hidden md:block tracking-wide text-white">Quinta Dalam</h1>
        </Link>
        
        <nav className="flex h-full items-center">
          <Link to="/" className={getLinkClass("/")}>Inicio</Link>
          <Link to="/habitaciones" className={getLinkClass("/habitaciones")}>Habitaciones</Link>
          <Link to="/nosotros" className={getLinkClass("/nosotros")}>Nosotros</Link>
          
          {usuario ? (
            <div className="flex items-center h-full">
              <span className="px-4 font-medium text-yellow-400 hidden sm:block text-sm">
                Hola, {usuario.nombre}
              </span>
              <button onClick={handleLogout} className="px-5 py-7 text-center text-white/90 hover:text-white transition-all duration-300 hover:bg-red-700 cursor-pointer font-bold text-sm uppercase">
                Salir
              </button>
            </div>
          ) : (
            <Link to="/login" className={getLinkClass("/login")}>Cuenta</Link>
          )}
        </nav>
      </header>

      {/* CONTENIDO PRINCIPAL */}
      <main className="flex-1 mt-20 animate-fade-in flex flex-col">
        <Outlet />
      </main>

      {/* FOOTER */}
      <footer className="bg-brand-primary text-white pt-16 pb-8 px-8 mt-auto border-t-[6px] border-brand-secondary">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 border-b border-white/20 pb-12 mb-8">
          
          {/* Columna 1: Marca y Redes */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3 mb-2">
              <img src="/img/favicon.png" alt="Logo" className="h-10 brightness-0 invert" />
              <h2 className="text-2xl font-bold text-white m-0">Quinta Dalam</h2>
            </div>
            <p className="text-sm text-white/70 leading-relaxed mb-4">
              Tu hogar lejos de casa. Disfruta de la mejor experiencia, comodidad y elegancia en el corazón de Michoacán.
            </p>
            {/* Botones Redes Sociales */}
            <div className="flex gap-4">
              <a href="https://www.facebook.com/profile.php?id=61584681841684" target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white hover:text-brand-primary transition-all text-xl font-bold">f</a>
              <a href="https://www.instagram.com/quintadalam" target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white hover:text-brand-primary transition-all text-xl font-bold">ig</a>
              <a href="https://www.tiktok.com/@quintadalam" target='_blank' rel='noreferrer' className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white hover:text-brand-primary transition-all text-xl font-bold">tt</a>
            </div>
          </div>

          {/* Columna 2: Contacto */}
          <div className="flex flex-col gap-4">
            <h3 className="text-lg font-bold text-white uppercase tracking-widest mb-2">Contacto</h3>
            <p className="text-sm text-white/80 flex items-center gap-2">
              <span className="text-xl">📍</span> Carretera Coeneo, Quencio, Michoacán.
            </p>
            <p className="text-sm text-white/80 flex items-center gap-2">
              <span className="text-xl">✉️</span> reservas@quintadalam.com
            </p>
            <p className="text-sm text-white/80 flex items-center gap-2">
              <span className="text-xl">📞</span> +52 (000) 000 0000
            </p>
            <a href="https://wa.me/520000000000" target="_blank" rel="noreferrer" className="mt-2 inline-flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-bold transition-colors w-max">
              <span>💬</span> WhatsApp
            </a>
          </div>

          {/* Columna 3: Enlaces Legales */}
          <div className="flex flex-col gap-3">
            <h3 className="text-lg font-bold text-white uppercase tracking-widest mb-2">Legal</h3>
            <Link to="/terminos" className="text-sm text-white/70 hover:text-white transition-colors">Términos y Condiciones</Link>
            <Link to="/privacidad" className="text-sm text-white/70 hover:text-white transition-colors">Política de Privacidad</Link>
            <Link to="/cancelaciones" className="text-sm text-white/70 hover:text-white transition-colors">Política de Cancelación</Link>
            <Link to="/faq" className="text-sm text-white/70 hover:text-white transition-colors">Preguntas Frecuentes</Link>
          </div>

          {/* Columna 4: W3C Validations */}
          <div className="flex flex-col gap-4">
            <h3 className="text-lg font-bold text-white uppercase tracking-widest mb-2">Certificaciones</h3>
            <p className="text-sm text-white/70 mb-2">Código validado y optimizado por los estándares internacionales.</p>
            <div className="flex flex-col gap-3">
              <a href="https://jigsaw.w3.org/css-validator/check/referer" target="_blank" rel="noreferrer">
                <img style={{ border: 0, width: '88px', height: '31px' }} src="https://jigsaw.w3.org/css-validator/images/vcss" alt="¡CSS Válido!" className="hover:opacity-80 transition-opacity rounded" />
              </a>
              <a href="https://validator.w3.org/#uri=referer" target="_blank" rel="noreferrer">
                <img style={{ border: 0, width: '88px', height: '31px' }} src="https://www.w3.org/Icons/valid-html401" alt="¡HTML Válido!" className="hover:opacity-80 transition-opacity rounded" />
              </a>
            </div>
          </div>

        </div>

        {/* Copyright */}
        <div className="text-center">
          <p className="text-sm font-medium tracking-wide text-white/60">
            © 2026 Hotel Quinta Dalam. Todos los derechos reservados.
          </p>
        </div>
      </footer>
    </>
  );
}