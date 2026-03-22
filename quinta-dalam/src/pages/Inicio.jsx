export default function Inicio() {
  return (
    <div className="flex flex-col items-center pb-16">
      {/* Carrusel */}
      <div className="carrusel">
        <ul>
          <li><img src="/img/carrusel/1.jpg" alt="Imagen 1" /></li>
          <li><img src="/img/carrusel/2.jpg" alt="Imagen 2" /></li>
          <li><img src="/img/carrusel/3.jpg" alt="Imagen 3" /></li>
          <li><img src="/img/carrusel/4.jpg" alt="Imagen 4" /></li>
        </ul>
        <div className="texto-carrusel px-4">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">Bienvenido a Hotel Quinta Dalam</h2>
          <p className="text-lg text-center max-w-2xl">
            Disfruta de una experiencia inolvidable con las mejores comodidades y servicios de lujo en un entorno exclusivo.
          </p>
          <a href="/habitaciones" className="hover:scale-105 transition-transform">Conoce nuestras habitaciones</a>
        </div>
        <div className="flechas-bajar">
          <span></span><span></span><span></span>
        </div>
      </div>

      <div className="w-full max-w-6xl px-5 flex flex-col md:flex-row gap-8 mt-16">
        {/* Tarjeta Ubicación */}
        <div className="flex-1 flex flex-col items-center p-8 bg-white rounded-2xl shadow-xl border-t-4 border-t-brand-primary border-x border-b border-gray-100 transition-transform hover:-translate-y-1 duration-300">
          <h2 className="text-3xl mb-3">Ubicación</h2>
          <p className="text-center text-gray-600 mb-6">Carretera Coeneo, Quencio, Michoacán.</p>
          <iframe 
            className="w-full h-75 border-none rounded-xl bg-gray-100"
            src="https://www.google.com/maps/embed?pb=!1m13!1m11!1m3!1d657.756218177365!2d-101.5889461713184!3d19.84700190326442!2m2!1f0!2f0!3m2!1i1024!2i768!4f13.1!5e1!3m2!1ses-419!2smx!4v1772389921702!5m2!1ses-419!2smx" 
            allowFullScreen="" loading="lazy" referrerPolicy="no-referrer-when-downgrade">
          </iframe>
        </div>

        {/* Tarjeta Contacto */}
        <div className="flex-1 flex flex-col items-center p-8 bg-white rounded-2xl shadow-xl border-t-4 border-t-brand-primary border-x border-b border-gray-100 transition-transform hover:-translate-y-1 duration-300">
          <h2 className="text-3xl mb-6">Contacto</h2>
          <form className="flex flex-col w-full max-w-md gap-4">
            <div className="flex flex-col">
              <label className="text-sm font-semibold text-gray-600 mb-1">Nombre</label>
              <input type="text" className="w-full border border-gray-300 rounded-lg h-12 px-4 bg-gray-50 focus:bg-white focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all" required />
            </div>
            
            <div className="flex flex-col">
              <label className="text-sm font-semibold text-gray-600 mb-1">Correo Electrónico</label>
              <input type="email" className="w-full border border-gray-300 rounded-lg h-12 px-4 bg-gray-50 focus:bg-white focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all" required />
            </div>
            
            <div className="flex flex-col">
              <label className="text-sm font-semibold text-gray-600 mb-1">Mensaje</label>
              <textarea rows="4" className="w-full border border-gray-300 rounded-lg p-4 bg-gray-50 focus:bg-white focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all resize-none" required></textarea>
            </div>
            
            <button type="submit" className="mt-4 bg-brand-primary hover:bg-brand-secondary text-white font-bold rounded-lg py-3 uppercase tracking-wider text-sm shadow-md hover:shadow-lg transition-all">
              Enviar Mensaje
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}