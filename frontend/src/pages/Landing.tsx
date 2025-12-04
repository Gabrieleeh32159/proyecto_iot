import { Shield, Camera, Cpu, Wifi, Target, Clock, DollarSign, ChevronRight, Play, Zap, Eye, Radio } from 'lucide-react';

export function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a1628] via-[#132a4a] to-[#1e3a5f] text-white">
      {/* Hero Section */}
      <header className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiMyMDQ1NmMiIGZpbGwtb3BhY2l0eT0iMC4xIj48Y2lyY2xlIGN4PSIzMCIgY3k9IjMwIiByPSIyIi8+PC9nPjwvZz48L3N2Zz4=')] opacity-50"></div>
        
        <nav className="relative z-10 max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
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

        <div className="relative z-10 max-w-7xl mx-auto px-6 pt-20 pb-32">
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
                  onClick={() => {
                    document.getElementById('arquitectura')?.scrollIntoView({ 
                      behavior: 'smooth',
                      block: 'start'
                    });
                  }}
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
                <div className="aspect-video bg-black/50 rounded-2xl flex items-center justify-center mb-6 overflow-hidden relative">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-32 h-32 border-4 border-red-500/50 rounded-full animate-ping"></div>
                  </div>
                  <div className="relative z-10 text-center">
                    <Target className="w-16 h-16 text-red-400 mx-auto mb-2 animate-pulse" />
                    <span className="text-red-400 font-semibold">DETECCIÓN ACTIVA</span>
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
      </header>

      {/* Stats Section */}
      <section className="py-16 bg-black/20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: '2 FPS', label: 'Procesamiento', icon: Clock },
              { value: 'YOLOv8', label: 'Modelo IA', icon: Cpu },
              { value: '< 600ms', label: 'Respuesta Servo', icon: Target },
              { value: 'WebSocket', label: 'Comunicación', icon: Wifi },
            ].map((stat, idx) => (
              <div key={idx} className="text-center">
                <stat.icon className="w-8 h-8 text-cyan-400 mx-auto mb-3" />
                <div className="text-3xl font-bold text-white mb-1">{stat.value}</div>
                <div className="text-blue-300">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Introduction Section */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16">
            <div>
              <h2 className="text-4xl font-bold mb-6">Introducción</h2>
              <p className="text-lg text-blue-200/80 mb-6 leading-relaxed">
                La <span className="text-cyan-400 font-semibold">Torreta Inteligente 24/7</span> es una solución de seguridad activa basada en Internet de las Cosas (IoT) e Inteligencia Artificial (Deep Learning).
              </p>
              <p className="text-blue-200/70 mb-6 leading-relaxed">
                A diferencia de los sistemas de videovigilancia tradicionales —que se limitan a registrar eventos de manera pasiva— este proyecto propone una arquitectura de <span className="text-white font-medium">detección y respuesta autónoma</span>.
              </p>
              <p className="text-blue-200/70 leading-relaxed">
                El sistema utiliza visión computacional para identificar amenazas en tiempo real (como la presencia de armas de fuego) y activa protocolos de seguimiento automatizado sin intervención humana inicial. El objetivo es <span className="text-green-400">reducir la ventana de tiempo</span> entre la detección del delito y la acción defensiva.
              </p>
            </div>
            
            <div>
              <h2 className="text-4xl font-bold mb-6">Problemática</h2>
              <div className="space-y-4">
                <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
                  <h4 className="font-semibold text-red-400 mb-2">Seguridad Pasiva vs. Activa</h4>
                  <p className="text-sm text-blue-200/70">Las cámaras convencionales solo sirven como evidencia forense después del crimen. No evitan el asalto en el momento crítico.</p>
                </div>
                <div className="p-4 bg-orange-500/10 border border-orange-500/30 rounded-xl">
                  <h4 className="font-semibold text-orange-400 mb-2">Tiempo de Respuesta</h4>
                  <p className="text-sm text-blue-200/70">Un asalto dura menos de 2 minutos. El tiempo de llegada policial supera ampliamente este margen, dejando a la víctima indefensa.</p>
                </div>
                <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-xl">
                  <h4 className="font-semibold text-yellow-400 mb-2">Factor Humano</h4>
                  <p className="text-sm text-blue-200/70">Los guardias están expuestos a fatiga, distracciones o intimidación. Un sistema automatizado opera 24/7 sin estas vulnerabilidades.</p>
                </div>
                <div className="p-4 bg-purple-500/10 border border-purple-500/30 rounded-xl">
                  <h4 className="font-semibold text-purple-400 mb-2">Costo de la Inseguridad</h4>
                  <p className="text-sm text-blue-200/70">Para las PYMES, contratar seguridad privada armada es insostenible. Se requiere una solución tecnológica escalable y de menor costo.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Architecture Section */}
      <section id="arquitectura" className="py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Arquitectura del Sistema</h2>
            <p className="text-xl text-blue-300 max-w-2xl mx-auto">
              Cuatro componentes trabajando en perfecta sincronía para detectar y rastrear amenazas
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: Camera,
                title: 'Captura de Video',
                description: 'iPhone como cámara IP conectada vía WiFi, transmitiendo frames en tiempo real al servidor de procesamiento.',
                color: 'from-purple-500 to-pink-500',
                tech: 'Continuity Camera'
              },
              {
                icon: Cpu,
                title: 'Backend Inteligente',
                description: 'Servidor FastAPI con modelo YOLO que detecta armas y calcula la posición exacta para el seguimiento.',
                color: 'from-blue-500 to-cyan-500',
                tech: 'FastAPI + YOLOv8'
              },
              {
                icon: Radio,
                title: 'Microcontrolador',
                description: 'ESP32 se conecta al servidor vía WebSocket al encenderse, recibe instrucciones y controla los servomotores.',
                color: 'from-green-500 to-emerald-500',
                tech: 'ESP32 + WebSocket'
              },
              {
                icon: Eye,
                title: 'Dashboard',
                description: 'Panel de control React que muestra detecciones en vivo, historial de incidentes y estadísticas.',
                color: 'from-orange-500 to-amber-500',
                tech: 'React + TypeScript'
              },
            ].map((item, idx) => (
              <div key={idx} className="group relative">
                <div className="absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl blur-xl" 
                     style={{ backgroundImage: `linear-gradient(to bottom right, var(--tw-gradient-stops))` }}></div>
                <div className="relative h-full bg-gradient-to-br from-blue-900/40 to-indigo-900/40 border border-blue-600/30 rounded-2xl p-6 hover:border-blue-500/50 transition-all">
                  <div className={`w-14 h-14 bg-gradient-to-br ${item.color} rounded-xl flex items-center justify-center mb-5`}>
                    <item.icon className="w-7 h-7 text-white" />
                  </div>
                  <div className="text-xs font-semibold text-cyan-400 mb-2">{item.tech}</div>
                  <h3 className="text-xl font-bold mb-3">{item.title}</h3>
                  <p className="text-blue-200/70 text-sm leading-relaxed">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Solution Section */}
      <section className="py-24 bg-gradient-to-b from-transparent via-blue-900/20 to-transparent">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl font-bold mb-6">¿Cómo Funciona?</h2>
              <p className="text-lg text-blue-200/80 mb-8">
                Nuestro sistema integra hardware y software para crear una solución de seguridad 
                completa y autónoma.
              </p>
              
              <div className="space-y-6">
                {[
                  {
                    step: '01',
                    title: 'Conexión del ESP32',
                    description: 'El ESP32 se enciende y establece conexión WebSocket con el servidor backend, quedando listo para recibir comandos.'
                  },
                  {
                    step: '02',
                    title: 'Captura del Frame',
                    description: 'La cámara captura imágenes y las envía por WiFi al servidor backend para su procesamiento.'
                  },
                  {
                    step: '03',
                    title: 'Procesamiento con YOLO',
                    description: 'El servidor procesa cada frame con YOLOv8, detectando armas con 60%+ de confianza y aplicando ByteTrack.'
                  },
                  {
                    step: '04',
                    title: 'Cálculo de Instrucciones',
                    description: 'Se calculan los ángulos de los servos basándose en la posición del objeto detectado y el FOV de la cámara.'
                  },
                  {
                    step: '05',
                    title: 'Ejecución en ESP32',
                    description: 'El servidor envía las instrucciones vía WebSocket al ESP32, que ejecuta los comandos y mueve los servos.'
                  },
                ].map((item, idx) => (
                  <div key={idx} className="flex gap-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center font-bold">
                      {item.step}
                    </div>
                    <div>
                      <h4 className="font-semibold text-lg mb-1">{item.title}</h4>
                      <p className="text-blue-200/70 text-sm">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="relative">
              <div className="bg-gradient-to-br from-blue-900/60 to-indigo-900/60 border border-blue-600/30 rounded-2xl p-8">
                <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                  <Wifi className="w-5 h-5 text-cyan-400" />
                  Flujo de Comunicación
                </h3>
                
                <div className="space-y-4">
                  <div className="flex items-center gap-4 p-4 bg-green-500/10 border border-green-500/30 rounded-xl">
                    <Radio className="w-8 h-8 text-green-400" />
                    <div className="flex-1">
                      <div className="font-semibold">1. ESP32 se conecta</div>
                      <div className="text-sm text-blue-300">WebSocket → Servidor (listo para comandos)</div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-green-400" />
                  </div>
                  
                  <div className="flex items-center gap-4 p-4 bg-purple-500/10 border border-purple-500/30 rounded-xl">
                    <Camera className="w-8 h-8 text-purple-400" />
                    <div className="flex-1">
                      <div className="font-semibold">2. Cámara envía frames</div>
                      <div className="text-sm text-blue-300">WiFi → Servidor (procesamiento)</div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-purple-400" />
                  </div>
                  
                  <div className="flex items-center gap-4 p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl">
                    <Cpu className="w-8 h-8 text-blue-400" />
                    <div className="flex-1">
                      <div className="font-semibold">3. Servidor procesa</div>
                      <div className="text-sm text-blue-300">YOLO + ByteTrack → Cálculo de ángulos</div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-blue-400" />
                  </div>
                  
                  <div className="flex items-center gap-4 p-4 bg-cyan-500/10 border border-cyan-500/30 rounded-xl">
                    <Target className="w-8 h-8 text-cyan-400" />
                    <div className="flex-1">
                      <div className="font-semibold">4. ESP32 ejecuta</div>
                      <div className="text-sm text-blue-300">WebSocket → GPIO → Servos se mueven</div>
                    </div>
                    <Target className="w-5 h-5 text-cyan-400" />
                  </div>
                </div>
                
                <div className="mt-6 p-4 bg-black/30 rounded-xl">
                  <div className="text-sm text-cyan-400 font-mono mb-2">Protocolo de Comando:</div>
                  <code className="text-green-400 font-mono">"90,120"</code>
                  <span className="text-blue-300 text-sm ml-2">→ Servo X: 90°, Servo Y: 120°</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Billing Section */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Sistema de Facturación</h2>
            <p className="text-xl text-blue-300 max-w-2xl mx-auto">
              Modelo de pago por uso basado en el tiempo de detección activa
            </p>
          </div>
          
          <div className="max-w-3xl mx-auto">
            <div className="bg-gradient-to-br from-green-900/40 to-emerald-900/40 border border-green-600/30 rounded-2xl p-8">
              <div className="flex items-center justify-center gap-4 mb-8">
                <DollarSign className="w-12 h-12 text-green-400" />
                <div>
                  <div className="text-5xl font-bold text-green-400">$0.01</div>
                  <div className="text-green-300">por segundo de detección</div>
                </div>
              </div>
              
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center p-4 bg-black/30 rounded-xl">
                  <Clock className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                  <div className="font-semibold">Medición Precisa</div>
                  <div className="text-sm text-blue-300">Desde primera detección hasta timeout</div>
                </div>
                <div className="text-center p-4 bg-black/30 rounded-xl">
                  <Target className="w-8 h-8 text-cyan-400 mx-auto mb-2" />
                  <div className="font-semibold">Solo Activo</div>
                  <div className="text-sm text-blue-300">Cobra solo cuando hay detección</div>
                </div>
                <div className="text-center p-4 bg-black/30 rounded-xl">
                  <Eye className="w-8 h-8 text-green-400 mx-auto mb-2" />
                  <div className="font-semibold">Transparente</div>
                  <div className="text-sm text-blue-300">Dashboard con costos en vivo</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Technologies Section */}
      <section className="py-24 bg-black/20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Stack Tecnológico</h2>
            <p className="text-xl text-blue-300">Tecnologías de vanguardia para máximo rendimiento</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
            {[
              { name: 'Python', category: 'Backend' },
              { name: 'FastAPI', category: 'API' },
              { name: 'YOLOv8', category: 'IA' },
              { name: 'OpenCV', category: 'Visión' },
              { name: 'React', category: 'Frontend' },
              { name: 'TypeScript', category: 'Lenguaje' },
              { name: 'Tailwind', category: 'Estilos' },
              { name: 'WebSocket', category: 'Protocolo' },
              { name: 'ESP32', category: 'Hardware' },
              { name: 'Vite', category: 'Build' },
            ].map((tech, idx) => (
              <div key={idx} className="group p-4 bg-gradient-to-br from-blue-900/40 to-indigo-900/40 border border-blue-600/30 rounded-xl text-center hover:border-blue-500/50 transition-all hover:scale-105">
                <div className="text-lg font-semibold mb-1">{tech.name}</div>
                <div className="text-xs text-cyan-400">{tech.category}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold mb-6">¿Listo para ver el sistema en acción?</h2>
          <p className="text-xl text-blue-300 mb-8">
            Accede al dashboard para monitorear detecciones en tiempo real y revisar el historial de incidentes.
          </p>
          <a 
            href="/"
            className="inline-flex items-center gap-3 px-10 py-5 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-xl font-semibold text-xl hover:from-blue-500 hover:to-cyan-400 transition-all hover:shadow-xl hover:shadow-blue-500/25"
          >
            <Play className="w-6 h-6" />
            Abrir Dashboard
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-blue-800/50">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Shield className="w-6 h-6 text-cyan-400" />
            <span className="font-semibold">Dibujito AI</span>
          </div>
          <div className="text-blue-400 text-sm">
            Sistema de Detección y Seguimiento de Armas • UTEC 2025
          </div>
        </div>
      </footer>
    </div>
  );
}
