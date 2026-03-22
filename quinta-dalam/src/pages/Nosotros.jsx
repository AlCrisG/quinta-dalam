export default function Nosotros() {
  const tarjetas = [
    { titulo: 'Misión', img: '/img/mision.png', texto: 'Ofrecer a nuestros huéspedes una estancia inolvidable mediante un servicio de excelencia, instalaciones confortables y un ambiente cálido, superando sus expectativas y convirtiéndonos en su hogar lejos de casa.' },
    { titulo: 'Visión', img: '/img/vision.png', texto: 'Ser el referente hotelero de la región, reconocidos por nuestra calidad humana, innovación en servicios y compromiso con el desarrollo sostenible y la satisfacción total de nuestros clientes.' },
    { titulo: 'Valores', img: '/img/valores.png', texto: 'Honestidad, Respeto, Compromiso, Calidad y Pasión por el servicio. Nos esforzamos por actuar con integridad, valorar a cada persona, cumplir nuestras promesas y buscar la mejora continua en todo lo que hacemos.' }
  ];

  return (
    <div className="py-16 px-5 flex flex-col items-center bg-gray-50 min-h-screen">
      <div className="text-center mb-16">
        <h2 className="text-4xl md:text-5xl font-bold mb-4">Nuestra Esencia</h2>
        <p className="text-gray-500 max-w-2xl mx-auto">Conoce los pilares que hacen de Hotel Quinta Dalam un lugar excepcional para tu descanso.</p>
      </div>

      <div className="flex flex-col md:flex-row flex-wrap justify-center gap-10 w-full max-w-6xl">
        {tarjetas.map((item, index) => (
          <div key={index} className="flex-1 min-w-75 flex flex-col items-center text-center p-10 bg-white rounded-2xl shadow-lg border border-gray-100 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300">
            <img src={item.img} alt={item.titulo} className="h-20 mb-8 object-contain opacity-90" />
            <h3 className="text-2xl mb-4 font-bold">{item.titulo}</h3>
            <p className="text-gray-600 leading-relaxed text-sm">{item.texto}</p>
          </div>
        ))}
      </div>
    </div>
  );
}