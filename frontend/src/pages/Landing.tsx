import { Shield, Camera, Cpu, Wifi, Target, Clock, ChevronRight, ChevronDown, Play, Zap, Eye, Radio, BookOpen, Crosshair, Users, Cog, CheckCircle, FileText } from 'lucide-react';
import { useState, useEffect } from 'react';

export function Landing() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const totalSlides = 8;

  useEffect(() => {
    const handleScroll = () => {
      const container = document.getElementById('slide-container');
      if (container) {
        const slideIndex = Math.round(container.scrollTop / window.innerHeight);
        setCurrentSlide(slideIndex);
      }
    };

    const container = document.getElementById('slide-container');
    container?.addEventListener('scroll', handleScroll);
    return () => container?.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSlide = (index: number) => {
    const container = document.getElementById('slide-container');
    container?.scrollTo({ top: index * window.innerHeight, behavior: 'smooth' });
  };

  return (
    <div className="relative">
      {/* Navigation Dots */}
      <div className="fixed right-6 top-1/2 -translate-y-1/2 z-50 flex flex-col gap-3">
        {Array.from({ length: totalSlides }).map((_, idx) => (
          <button
            key={idx}
            onClick={() => scrollToSlide(idx)}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              currentSlide === idx 
                ? 'bg-cyan-400 scale-125' 
                : 'bg-white/30 hover:bg-white/50'
            }`}
            aria-label={`Ir a diapositiva ${idx + 1}`}
          />
        ))}
      </div>

      {/* Slide Counter */}
      <div className="fixed bottom-6 right-6 z-50 bg-black/50 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-mono">
        <span className="text-cyan-400">{String(currentSlide + 1).padStart(2, '0')}</span>
        <span className="text-white/50"> / {String(totalSlides).padStart(2, '0')}</span>
      </div>

      {/* Slides Container */}
      <div 
        id="slide-container"
        className="h-screen overflow-y-scroll snap-y snap-mandatory scroll-smooth"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {/* Slide 1: Hero */}
        <section className="h-screen snap-start snap-always relative overflow-hidden bg-gradient-to-br from-[#0a1628] via-[#132a4a] to-[#1e3a5f] text-white flex items-center">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiMyMDQ1NmMiIGZpbGwtb3BhY2l0eT0iMC4xIj48Y2lyY2xlIGN4PSIzMCIgY3k9IjMwIiByPSIyIi8+PC9nPjwvZz48L3N2Zz4=')] opacity-50"></div>
          
          {/* Fixed Nav */}
          <nav className="absolute top-0 left-0 right-0 z-10 max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-xl flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
                Dibujito AI
              </span>
            </div>
            <a 
              href="/"
              className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-full font-semibold hover:from-blue-500 hover:to-cyan-400 transition-all hover:shadow-lg hover:shadow-blue-500/25"
            >
              Ir al Dashboard →
            </a>
          </nav>

          <div className="relative z-10 max-w-7xl mx-auto px-6 w-full">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-full text-blue-300 text-sm mb-6">
                  <Zap className="w-4 h-4" />
                  Sistema de Seguridad Inteligente
                </div>
                <h1 className="text-5xl lg:text-6xl font-bold leading-tight mb-6">
                  Detección de Armas en{' '}
                  <span className="bg-gradient-to-r from-blue-400 via-cyan-300 to-blue-400 bg-clip-text text-transparent">
                    Tiempo Real
                  </span>
                </h1>
                <p className="text-xl text-blue-200/80 mb-8 leading-relaxed">
                  Sistema avanzado de vigilancia que detecta armas de fuego automáticamente 
                  y rastrea objetivos mediante servomotores controlados por inteligencia artificial.
                </p>
                <div className="flex flex-wrap gap-4">
                  <a 
                    href="/"
                    className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-xl font-semibold text-lg hover:from-blue-500 hover:to-cyan-400 transition-all hover:shadow-xl hover:shadow-blue-500/25"
                  >
                    <Play className="w-5 h-5" />
                    Ver Dashboard
                  </a>
                  <button 
                    onClick={() => scrollToSlide(1)}
                    className="inline-flex items-center gap-2 px-8 py-4 bg-white/5 border border-white/10 rounded-xl font-semibold text-lg hover:bg-white/10 transition-all group"
                  >
                    Conocer más
                    <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
              
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-3xl blur-3xl"></div>
                <div className="relative bg-gradient-to-br from-blue-900/50 to-cyan-900/50 border border-blue-500/20 rounded-3xl p-8 backdrop-blur-sm">
                  <div className="aspect-video rounded-2xl flex items-center justify-center mb-6 overflow-hidden relative">
                    {/* GIF de fondo */}
                    <img 
                      src="/src/gifs/incident_1764379635460.gif" 
                      alt="Detección en tiempo real"
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                    <div className="absolute top-3 right-3 z-10 bg-black/50 px-3 py-1.5 rounded-lg backdrop-blur-sm flex items-center gap-2">
                      <Target className="w-4 h-4 text-red-400 animate-pulse" />
                      <span className="text-red-400 font-semibold text-xs">DETECCIÓN ACTIVA</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-black/30 rounded-xl">
                      <div className="text-3xl font-bold text-cyan-400">0.6s</div>
                      <div className="text-sm text-blue-300">Latencia</div>
                    </div>
                    <div className="text-center p-4 bg-black/30 rounded-xl">
                      <div className="text-3xl font-bold text-green-400">75%</div>
                      <div className="text-sm text-blue-300">Precisión</div>
                    </div>
                    <div className="text-center p-4 bg-black/30 rounded-xl">
                      <div className="text-3xl font-bold text-blue-400">24/7</div>
                      <div className="text-sm text-blue-300">Monitoreo</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Scroll indicator */}
          <button 
            onClick={() => scrollToSlide(1)}
            className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce text-white/50 hover:text-white transition-colors"
          >
            <ChevronDown className="w-8 h-8" />
          </button>
        </section>

        {/* Slide 2: Introducción + Problemática */}
        <section className="h-screen snap-start snap-always relative bg-gradient-to-br from-[#0a1628] via-[#132a4a] to-[#1e3a5f] text-white flex items-center">
          <div className="max-w-6xl mx-auto px-6 w-full">
            <h2 className="text-5xl font-bold mb-8 text-center">2. Introducción</h2>
            <div className="grid lg:grid-cols-2 gap-8 items-center">
              {/* Gráfica de Homicidios */}
              <div className="space-y-4">
                <h3 className="text-2xl font-bold text-cyan-400 mb-2">Homicidios en Perú (2017-2024)</h3>
                <div className="p-5 bg-black/30 rounded-2xl border border-blue-600/30">
                  <div className="flex items-end justify-between gap-2" style={{ height: '200px' }}>
                    {[
                      { year: '2017', value: 671, height: 60, color: 'cyan' },
                      { year: '2018', value: 911, height: 82, color: 'cyan' },
                      { year: '2019', value: 1070, height: 96, color: 'cyan' },
                      { year: '2020', value: 1002, height: 90, color: 'cyan' },
                      { year: '2021', value: 1317, height: 118, color: 'orange' },
                      { year: '2022', value: 1516, height: 136, color: 'orange' },
                      { year: '2023', value: 1495, height: 134, color: 'orange' },
                      { year: '2024', value: 2011, height: 180, color: 'red' },
                    ].map((item, idx) => (
                      <div key={idx} className="flex flex-col items-center flex-1">
                        <div className="text-[10px] text-blue-200/80 mb-1 font-medium">{item.value.toLocaleString()}</div>
                        <div 
                          className="w-full rounded-t transition-all duration-300 hover:opacity-80"
                          style={{ 
                            height: `${item.height}px`,
                            background: item.color === 'red' 
                              ? 'linear-gradient(to top, #dc2626, #ef4444)' 
                              : item.color === 'orange' 
                                ? 'linear-gradient(to top, #ea580c, #f97316)' 
                                : 'linear-gradient(to top, #0891b2, #22d3ee)',
                            minWidth: '28px'
                          }}
                        />
                        <div className="text-[10px] text-blue-300 mt-2 font-semibold">{item.year}</div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 pt-3 border-t border-blue-500/20 flex items-center justify-between">
                    <div className="flex items-center gap-3 text-xs">
                      <div className="flex items-center gap-1">
                        <div className="w-3 h-3 rounded" style={{ background: 'linear-gradient(to top, #0891b2, #22d3ee)' }}></div>
                        <span className="text-blue-200/70">Normal</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-3 h-3 rounded" style={{ background: 'linear-gradient(to top, #ea580c, #f97316)' }}></div>
                        <span className="text-blue-200/70">Alerta</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-3 h-3 rounded" style={{ background: 'linear-gradient(to top, #dc2626, #ef4444)' }}></div>
                        <span className="text-blue-200/70">Crítico</span>
                      </div>
                    </div>
                    <span className="text-red-400 font-semibold text-xs">+200%</span>
                  </div>
                </div>
              </div>

              {/* Contexto */}
              <div className="space-y-5">
                <p className="text-xl text-blue-200/90 leading-relaxed">
                  Perú enfrenta una <span className="text-red-400 font-semibold">crisis de seguridad</span> sin precedentes. Los homicidios han aumentado de manera alarmante en los últimos años.
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-red-500/20 border border-red-500/40 rounded-xl text-center">
                    <div className="text-4xl font-bold text-red-400">+299%</div>
                    <div className="text-sm text-blue-200/70">Aumento homicidios<br/>2017-2024</div>
                  </div>
                  <div className="p-4 bg-orange-500/20 border border-orange-500/40 rounded-xl text-center">
                    <div className="text-4xl font-bold text-orange-400">+344%</div>
                    <div className="text-sm text-blue-200/70">Extorsiones<br/>2021-2022</div>
                  </div>
                </div>
                <p className="text-blue-200/70 leading-relaxed p-4 bg-blue-900/20 rounded-xl border border-blue-500/20">
                  <span className="text-yellow-400 font-semibold">Fuente:</span> Statista 2025. Las cifras evidencian la necesidad urgente de soluciones tecnológicas para la seguridad ciudadana.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Slide 3: Problemática Detallada */}
        <section className="h-screen snap-start snap-always relative bg-gradient-to-br from-[#0a1628] via-[#132a4a] to-[#1e3a5f] text-white flex items-center">
          <div className="max-w-7xl mx-auto px-6 w-full">
            <h2 className="text-5xl font-bold mb-12 text-center">3. Problemática</h2>
            <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
              <div className="p-6 bg-red-500/10 border border-red-500/30 rounded-2xl hover:scale-105 transition-transform">
                <h4 className="font-bold text-xl text-red-400 mb-3">Seguridad Pasiva vs. Activa</h4>
                <p className="text-blue-200/70">Las cámaras convencionales solo sirven como evidencia forense después del crimen. No evitan el asalto en el momento crítico.</p>
              </div>
              <div className="p-6 bg-orange-500/10 border border-orange-500/30 rounded-2xl hover:scale-105 transition-transform">
                <h4 className="font-bold text-xl text-orange-400 mb-3">Tiempo de Respuesta</h4>
                <p className="text-blue-200/70">Un asalto dura menos de 2 minutos. El tiempo de llegada policial supera ampliamente este margen, dejando a la víctima indefensa.</p>
              </div>
              <div className="p-6 bg-yellow-500/10 border border-yellow-500/30 rounded-2xl hover:scale-105 transition-transform">
                <h4 className="font-bold text-xl text-yellow-400 mb-3">Factor Humano</h4>
                <p className="text-blue-200/70">Los guardias están expuestos a fatiga, distracciones o intimidación. Un sistema automatizado opera 24/7 sin estas vulnerabilidades.</p>
              </div>
              <div className="p-6 bg-purple-500/10 border border-purple-500/30 rounded-2xl hover:scale-105 transition-transform">
                <h4 className="font-bold text-xl text-purple-400 mb-3">Costo de la Inseguridad</h4>
                <p className="text-blue-200/70">Para las PYMES, contratar seguridad privada armada es insostenible. Se requiere una solución tecnológica escalable y de menor costo.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Slide 4: Solución Propuesta */}
        <section className="h-screen snap-start snap-always relative bg-gradient-to-br from-[#0a1628] via-[#132a4a] to-[#1e3a5f] text-white flex items-center">
          <div className="max-w-7xl mx-auto px-6 w-full">
            <div className="text-center mb-10">
              <h2 className="text-5xl font-bold mb-4">4. Solución Propuesta</h2>
              <p className="text-xl text-blue-300">Torreta Inteligente con IA</p>
            </div>

            <div className="grid lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
              <div className="p-6 bg-gradient-to-br from-cyan-900/40 to-blue-900/40 border border-cyan-500/30 rounded-2xl">
                <div className="flex items-center gap-3 mb-4">
                  <Shield className="w-10 h-10 text-cyan-400" />
                  <h3 className="text-2xl font-bold text-cyan-400">Sistema Activo de Seguridad</h3>
                </div>
                <p className="text-blue-200/80 leading-relaxed mb-4">
                  Una torreta inteligente que detecta armas de fuego en tiempo real usando <span className="text-cyan-400 font-semibold">YOLOv8</span> y responde automáticamente con un mecanismo disuasivo no letal.
                </p>
                <ul className="space-y-2 text-blue-200/70">
                  <li className="flex items-center gap-2">
                    <ChevronRight className="w-4 h-4 text-cyan-400" />
                    Detección automática 24/7
                  </li>
                  <li className="flex items-center gap-2">
                    <ChevronRight className="w-4 h-4 text-cyan-400" />
                    Respuesta en menos de 1 segundo
                  </li>
                  <li className="flex items-center gap-2">
                    <ChevronRight className="w-4 h-4 text-cyan-400" />
                    Seguimiento activo del objetivo
                  </li>
                </ul>
              </div>

              <div className="p-6 bg-gradient-to-br from-green-900/40 to-emerald-900/40 border border-green-500/30 rounded-2xl">
                <div className="flex items-center gap-3 mb-4">
                  <Zap className="w-10 h-10 text-green-400" />
                  <h3 className="text-2xl font-bold text-green-400">Arquitectura IoT</h3>
                </div>
                <p className="text-blue-200/80 leading-relaxed mb-4">
                  Comunicación en tiempo real mediante <span className="text-green-400 font-semibold">WebSockets</span> entre todos los componentes del sistema.
                </p>
                <ul className="space-y-2 text-blue-200/70">
                  <li className="flex items-center gap-2">
                    <ChevronRight className="w-4 h-4 text-green-400" />
                    iPhone como cámara WiFi
                  </li>
                  <li className="flex items-center gap-2">
                    <ChevronRight className="w-4 h-4 text-green-400" />
                    Servidor local con YOLO
                  </li>
                  <li className="flex items-center gap-2">
                    <ChevronRight className="w-4 h-4 text-green-400" />
                    ESP32 controlando servos
                  </li>
                </ul>
              </div>
            </div>

            <div className="mt-8 p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl max-w-3xl mx-auto text-center">
              <p className="text-blue-200/80">
                <span className="text-yellow-400 font-semibold">💡 Innovación:</span> A diferencia de sistemas pasivos (CCTV), nuestra solución 
                <span className="text-white font-medium"> actúa en el momento del evento</span>, no después.
              </p>
            </div>
          </div>
        </section>

        {/* Slide 5: Metodología - Componentes */}
        <section className="h-screen snap-start snap-always relative bg-gradient-to-br from-[#0a1628] via-[#132a4a] to-[#1e3a5f] text-white flex items-center">
          <div className="max-w-7xl mx-auto px-6 w-full">
            <div className="text-center mb-8">
              <h2 className="text-5xl font-bold mb-4">5. Metodología</h2>
              <p className="text-xl text-blue-300">Componentes del Sistema</p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { name: '2 Servomotores 180°', desc: 'Movimiento horizontal y vertical para seguimiento pan/tilt', icon: Cog },
                { name: 'iPhone (Cámara WiFi)', desc: 'Transmite video en tiempo real al servidor local', icon: Camera },
                { name: 'ESP32', desc: 'Recibe comandos vía WebSocket y controla servomotores', icon: Cpu },
                { name: 'Láser Disuasivo', desc: 'Apuntador láser para simular respuesta no letal', icon: Crosshair },
                { name: 'Laptop (Servidor)', desc: 'Ejecuta modelo YOLO y servidor WebSocket', icon: Cpu },
                { name: 'Router TP-Link', desc: 'Red WLAN local para comunicación entre dispositivos', icon: Wifi },
                { name: 'Estructura de Cajas', desc: 'Montaje físico de la torreta simulada', icon: Radio },
                { name: 'Dashboard Web', desc: 'Interfaz React para monitoreo en tiempo real', icon: Eye },
              ].map((item, idx) => (
                <div key={idx} className="p-4 bg-gradient-to-br from-blue-900/40 to-indigo-900/40 border border-blue-600/30 rounded-xl hover:border-cyan-500/50 transition-all hover:scale-105">
                  <item.icon className="w-8 h-8 text-cyan-400 mb-3" />
                  <h4 className="font-bold text-white mb-1">{item.name}</h4>
                  <p className="text-blue-200/70 text-xs">{item.desc}</p>
                </div>
              ))}
            </div>

            <div className="mt-8 grid md:grid-cols-2 gap-4 max-w-4xl mx-auto">
              <div className="p-4 bg-purple-500/10 border border-purple-500/30 rounded-xl">
                <h4 className="font-bold text-purple-400 mb-2">Conexión WiFi (TP-Link)</h4>
                <p className="text-blue-200/70 text-sm">Todos los dispositivos conectados a la misma red WLAN para comunicación en tiempo real.</p>
              </div>
              <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-xl">
                <h4 className="font-bold text-green-400 mb-2">WebSockets</h4>
                <p className="text-blue-200/70 text-sm">Protocolo bidireccional para envío de coordenadas al ESP32 con latencia mínima (~0.6s).</p>
              </div>
            </div>
          </div>
        </section>

        {/* Slide 6: Diagrama de Bloques */}
        <section className="h-screen snap-start snap-always relative bg-gradient-to-br from-[#0a1628] via-[#132a4a] to-[#1e3a5f] text-white flex items-center">
          <div className="max-w-7xl mx-auto px-6 w-full">
            <h2 className="text-4xl font-bold mb-8 text-center">6. Diagrama de Bloques del Sistema</h2>
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Nodo de Captura */}
              <div className="p-6 bg-gradient-to-br from-purple-900/40 to-pink-900/40 border border-purple-500/30 rounded-2xl">
                <div className="flex items-center gap-3 mb-4">
                  <Camera className="w-8 h-8 text-purple-400" />
                  <h3 className="text-xl font-bold text-purple-400">Nodo de Captura</h3>
                </div>
                <p className="text-blue-200/70 text-sm mb-4">iPhone (Cámara WiFi)</p>
                <ul className="space-y-2 text-sm text-blue-200/70">
                  <li className="flex items-center gap-2">
                    <ChevronRight className="w-4 h-4 text-purple-400" />
                    Transmite video en tiempo real
                  </li>
                  <li className="flex items-center gap-2">
                    <ChevronRight className="w-4 h-4 text-purple-400" />
                    Conectado vía WiFi (TP-Link)
                  </li>
                </ul>
              </div>

              {/* Servidor */}
              <div className="p-6 bg-gradient-to-br from-blue-900/40 to-cyan-900/40 border border-cyan-500/30 rounded-2xl">
                <div className="flex items-center gap-3 mb-4">
                  <Cpu className="w-8 h-8 text-cyan-400" />
                  <h3 className="text-xl font-bold text-cyan-400">Servidor Local</h3>
                </div>
                <p className="text-blue-200/70 text-sm mb-4">Laptop + WebSocket Server</p>
                <ul className="space-y-2 text-sm text-blue-200/70">
                  <li className="flex items-center gap-2">
                    <ChevronRight className="w-4 h-4 text-cyan-400" />
                    Ejecuta modelo YOLOv8
                  </li>
                  <li className="flex items-center gap-2">
                    <ChevronRight className="w-4 h-4 text-cyan-400" />
                    Envía coordenadas vía WebSocket
                  </li>
                  <li className="flex items-center gap-2">
                    <ChevronRight className="w-4 h-4 text-cyan-400" />
                    Dashboard web React
                  </li>
                </ul>
              </div>

              {/* Nodo de Control */}
              <div className="p-6 bg-gradient-to-br from-green-900/40 to-emerald-900/40 border border-green-500/30 rounded-2xl">
                <div className="flex items-center gap-3 mb-4">
                  <Radio className="w-8 h-8 text-green-400" />
                  <h3 className="text-xl font-bold text-green-400">Nodo de Control</h3>
                </div>
                <p className="text-blue-200/70 text-sm mb-4">ESP32 + Servos + Láser</p>
                <ul className="space-y-2 text-sm text-blue-200/70">
                  <li className="flex items-center gap-2">
                    <ChevronRight className="w-4 h-4 text-green-400" />
                    Cliente WebSocket
                  </li>
                  <li className="flex items-center gap-2">
                    <ChevronRight className="w-4 h-4 text-green-400" />
                    Controla servos pan/tilt
                  </li>
                  <li className="flex items-center gap-2">
                    <ChevronRight className="w-4 h-4 text-green-400" />
                    Activa láser disuasivo
                  </li>
                </ul>
              </div>
            </div>

            {/* Flujo visual */}
            <div className="mt-8 flex items-center justify-center gap-4 flex-wrap">
              <div className="px-4 py-2 bg-purple-500/20 rounded-lg text-purple-300 text-sm">iPhone</div>
              <ChevronRight className="w-6 h-6 text-blue-400" />
              <div className="px-4 py-2 bg-blue-500/20 rounded-lg text-blue-300 text-sm">WiFi (TP-Link)</div>
              <ChevronRight className="w-6 h-6 text-blue-400" />
              <div className="px-4 py-2 bg-cyan-500/20 rounded-lg text-cyan-300 text-sm">YOLO + WebSocket</div>
              <ChevronRight className="w-6 h-6 text-blue-400" />
              <div className="px-4 py-2 bg-green-500/20 rounded-lg text-green-300 text-sm">ESP32</div>
              <ChevronRight className="w-6 h-6 text-blue-400" />
              <div className="px-4 py-2 bg-orange-500/20 rounded-lg text-orange-300 text-sm">Servos + Láser</div>
            </div>
          </div>
        </section>

        {/* Slide 7: Objetivos y Alcances */}
        <section className="h-screen snap-start snap-always relative bg-gradient-to-br from-[#0a1628] via-[#132a4a] to-[#1e3a5f] text-white flex items-center">
          <div className="max-w-7xl mx-auto px-6 w-full">
            <div className="grid lg:grid-cols-2 gap-12">
              {/* Objetivos */}
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <Target className="w-10 h-10 text-cyan-400" />
                  <h2 className="text-4xl font-bold">7. Objetivos</h2>
                </div>
                <div className="space-y-4">
                  <div className="p-5 bg-gradient-to-r from-cyan-900/40 to-blue-900/40 border border-green-500/50 rounded-xl relative overflow-hidden">
                    <div className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" />
                      CUMPLIDO
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center font-bold text-sm shrink-0">✓</div>
                      <p className="text-blue-200/80 pr-20">Diseñar e implementar un sistema capaz de <span className="text-cyan-400 font-semibold">detectar automáticamente armas de fuego</span> en tiempo real usando deep learning (YOLOv8).</p>
                    </div>
                  </div>
                  <div className="p-5 bg-gradient-to-r from-green-900/40 to-emerald-900/40 border border-green-500/50 rounded-xl relative overflow-hidden">
                    <div className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" />
                      CUMPLIDO
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center font-bold text-sm shrink-0">✓</div>
                      <p className="text-blue-200/80 pr-20">Desarrollar un sistema de respuesta con <span className="text-green-400 font-semibold">seguimiento activo</span> y mecanismo disuasivo no letal (láser).</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Alcances */}
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <CheckCircle className="w-10 h-10 text-green-400" />
                  <h2 className="text-4xl font-bold">Alcances</h2>
                </div>
                <div className="space-y-4">
                  <div className="p-4 bg-green-500/10 border border-green-500/40 rounded-xl flex items-start gap-3">
                    <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                      <CheckCircle className="w-4 h-4 text-white" />
                    </div>
                    <p className="text-blue-200/80 text-sm">Prototipo funcional probado <span className="text-green-400 font-medium">dentro de la universidad</span> en entorno controlado.</p>
                  </div>
                  <div className="p-4 bg-green-500/10 border border-green-500/40 rounded-xl flex items-start gap-3">
                    <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                      <CheckCircle className="w-4 h-4 text-white" />
                    </div>
                    <p className="text-blue-200/80 text-sm">Integración de <span className="text-green-400 font-medium">ESP32 + servos + YOLO</span> con comunicación vía WebSockets.</p>
                  </div>
                  <div className="p-4 bg-green-500/10 border border-green-500/40 rounded-xl flex items-start gap-3">
                    <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                      <CheckCircle className="w-4 h-4 text-white" />
                    </div>
                    <p className="text-blue-200/80 text-sm">Sistema <span className="text-green-400 font-medium">100% no letal</span> usando láser disuasivo.</p>
                  </div>
                  <div className="p-4 bg-green-500/10 border border-green-500/40 rounded-xl flex items-start gap-3">
                    <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                      <CheckCircle className="w-4 h-4 text-white" />
                    </div>
                    <p className="text-blue-200/80 text-sm">Dashboard web para <span className="text-green-400 font-medium">monitoreo en tiempo real</span> con historial de incidentes.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Slide 8: CTA + Footer */}
        <section className="h-screen snap-start snap-always relative bg-gradient-to-br from-[#0a1628] via-[#132a4a] to-[#1e3a5f] text-white flex items-center">
          <div className="max-w-4xl mx-auto px-6 text-center w-full">
            <div className="mb-12">
              <h2 className="text-5xl font-bold mb-6">¿Listo para ver el sistema en acción?</h2>
              <p className="text-xl text-blue-300 mb-10">
                Accede al dashboard para monitorear detecciones en tiempo real y revisar el historial de incidentes.
              </p>
              <a 
                href="/"
                className="inline-flex items-center gap-3 px-12 py-6 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-2xl font-semibold text-2xl hover:from-blue-500 hover:to-cyan-400 transition-all hover:shadow-xl hover:shadow-blue-500/25 hover:scale-105"
              >
                <Play className="w-8 h-8" />
                Abrir Dashboard
              </a>
            </div>

            {/* Autores */}
            <div className="mb-8">
              <div className="flex items-center justify-center gap-3 mb-4">
                <Users className="w-6 h-6 text-cyan-400" />
                <span className="text-lg font-semibold text-blue-300">Autores</span>
              </div>
              <div className="flex justify-center gap-8">
                <div className="text-center">
                  <div className="text-white font-semibold">Renato Cernades</div>
                </div>
                <div className="text-center">
                  <div className="text-white font-semibold">Max Antunez</div>
                </div>
                <div className="text-center">
                  <div className="text-white font-semibold">Gabriel Espinoza</div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="absolute bottom-8 left-0 right-0">
              <div className="flex flex-col items-center gap-4">
                <div className="flex items-center gap-2">
                  <Shield className="w-6 h-6 text-cyan-400" />
                  <span className="font-semibold text-lg">Torreta Inteligente</span>
                </div>
                <div className="text-blue-400 text-sm">
                  Proyecto IoT • Universidad de Ingeniería y Tecnología (UTEC) • 2025
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Hide scrollbar styles */}
      <style>{`
        #slide-container::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}
