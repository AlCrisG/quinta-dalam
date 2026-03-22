import { useState, useEffect, useRef } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { getCurrentUser, logoutUser } from '../data/usuarios';

export default function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const usuario = getCurrentUser();
  const navRef = useRef(null);
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0, opacity: 0 });

  // Efecto para animar el indicador activo (fondo deslizante)
  useEffect(() => {
    const updateIndicator = () => {
      if (navRef.current) {
        const activeEl = navRef.current.querySelector('.active-nav-item');
        if (activeEl) {
          setIndicatorStyle({
            left: activeEl.offsetLeft,
            width: activeEl.offsetWidth,
            opacity: 1,
          });
        } else {
          setIndicatorStyle((prev) => ({ ...prev, opacity: 0 }));
        }
      }
    };

    // Timeout pequeño para asegurar que el DOM se haya renderizado antes de medir
    const timeoutId = setTimeout(updateIndicator, 50);
    window.addEventListener('resize', updateIndicator);

    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('resize', updateIndicator);
    };
  }, [location.pathname, usuario]);

  const getLinkClass = (path) => {
    const isActive = location.pathname === path;
    const baseClass = "relative z-10 px-5 h-full flex items-center text-center text-white/90 hover:text-white transition-colors duration-300 font-medium tracking-wide text-sm uppercase";
    // Si está activo añadimos un identificador, si no, un hover sutil en blanco para que no colisione con el color activo
    return isActive ? `${baseClass} active-nav-item text-white` : `${baseClass} hover:bg-white/10`;
  };

  const handleLogout = () => {
    logoutUser();
    navigate('/login');
  };

  return (
    <>
      {/* NAVBAR */}
      <header className="fixed top-0 left-0 w-full z-50 text-white flex justify-between items-center px-6 h-20 bg-brand-primary shadow-lg">
        <Link to="/" className="flex items-center gap-4 hover:opacity-90 transition-opacity">
          <img src="/img/favicon.png" alt="Logo" className="h-11.25" />
          <h1 className="text-2xl font-bold m-0 hidden md:block tracking-wide text-white">Quinta Dalam</h1>
        </Link>
        
        <nav ref={navRef} className="flex h-full items-center relative">
          {/* Indicador animado del menú activo */}
          <div
            className="absolute top-0 bottom-0 bg-brand-secondary transition-all duration-500 ease-in-out z-0"
            style={{ left: indicatorStyle.left, width: indicatorStyle.width, opacity: indicatorStyle.opacity }}
          />

          <Link to="/" className={getLinkClass("/")}>Inicio</Link>
          <Link to="/habitaciones" className={getLinkClass("/habitaciones")}>Habitaciones</Link>
          <Link to="/nosotros" className={getLinkClass("/nosotros")}>Nosotros</Link>
          
          {usuario ? (
            <>
              <Link to="/mi_cuenta" className={getLinkClass("/mi_cuenta")}>Mi Cuenta</Link>
              <div className="flex items-center h-full relative z-10">
                <button onClick={handleLogout} className="px-5 h-full flex items-center text-center text-white/90 hover:text-white transition-all duration-300 hover:bg-red-700 cursor-pointer font-bold text-sm uppercase">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 mr-2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
                  </svg>
                  <span>Salir</span>
                </button>
              </div>
            </>
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