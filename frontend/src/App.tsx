import { useState, useEffect, useRef } from 'react';
import { IncidentCard } from './components/IncidentCard';
import { StatsCard } from './components/StatsCard';
import { AccumulatedChart } from './components/AccumulatedChart';
import { AlertTriangle, Calendar, TrendingUp } from 'lucide-react';

interface Incident {
  id: number;
  timestamp: string;
  location: string;
  weaponType: string;
  imageUrl: string;
  severity: 'high' | 'medium' | 'low';
}

export default function App() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [currentImage, setCurrentImage] = useState<string | null>(null);
  const [showingNewIncident, setShowingNewIncident] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalIncidents, setTotalIncidents] = useState(0);
  const [monthIncidents, setMonthIncidents] = useState(0);
  const incidentsPerPage = 6;
  const listRef = useRef<HTMLDivElement>(null);

  // Simular datos iniciales
  useEffect(() => {
    const mockIncidents: Incident[] = Array.from({ length: 15 }, (_, i) => ({
      id: i + 1,
      timestamp: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
      location: ['Sector A', 'Sector B', 'Sector C', 'Sector D'][Math.floor(Math.random() * 4)],
      weaponType: ['Pistola', 'Rifle', 'Escopeta'][Math.floor(Math.random() * 3)],
      imageUrl: `https://images.unsplash.com/photo-1557597774-9d273605dfa9?w=400&h=300&fit=crop&q=80&sig=${i}`,
      severity: ['high', 'medium', 'low'][Math.floor(Math.random() * 3)] as 'high' | 'medium' | 'low',
    }));
    
    setIncidents(mockIncidents);
    setTotalIncidents(mockIncidents.length);
    
    const now = new Date();
    const monthAgo = new Date(now.getFullYear(), now.getMonth(), 1);
    const thisMonth = mockIncidents.filter(
      inc => new Date(inc.timestamp) >= monthAgo
    ).length;
    setMonthIncidents(thisMonth);
  }, []);

  // Simular recepción de nuevas imágenes vía websocket
  useEffect(() => {
    const simulateWebSocket = setInterval(() => {
      const newIncident: Incident = {
        id: Date.now(),
        timestamp: new Date().toISOString(),
        location: ['Sector A', 'Sector B', 'Sector C', 'Sector D'][Math.floor(Math.random() * 4)],
        weaponType: ['Pistola', 'Rifle', 'Escopeta'][Math.floor(Math.random() * 3)],
        imageUrl: `https://images.unsplash.com/photo-1557597774-9d273605dfa9?w=800&h=600&fit=crop&q=80&sig=${Date.now()}`,
        severity: ['high', 'medium', 'low'][Math.floor(Math.random() * 3)] as 'high' | 'medium' | 'low',
      };

      setCurrentImage(newIncident.imageUrl);
      setShowingNewIncident(true);
      setTotalIncidents(prev => prev + 1);
      setMonthIncidents(prev => prev + 1);

      // Después de 10 segundos, scroll a la lista y añadir a incidentes
      setTimeout(() => {
        setIncidents(prev => [newIncident, ...prev]);
        setShowingNewIncident(false);
        setCurrentImage(null);
        setCurrentPage(1);
        
        // Scroll suave a la lista
        if (listRef.current) {
          listRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 10000);
    }, 30000); // Cada 30 segundos simula una nueva imagen

    return () => clearInterval(simulateWebSocket);
  }, []);

  // Paginación
  const indexOfLastIncident = currentPage * incidentsPerPage;
  const indexOfFirstIncident = indexOfLastIncident - incidentsPerPage;
  const currentIncidents = incidents.slice(indexOfFirstIncident, indexOfLastIncident);
  const totalPages = Math.ceil(incidents.length / incidentsPerPage);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a1628] via-[#132a4a] to-[#1e3a5f] text-white p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl mb-2">Dashboard de Incidencias</h1>
          <p className="text-blue-300">Sistema de Monitoreo de Uso de Armas de Fuego</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <StatsCard
            title="Total de Incidencias"
            value={totalIncidents}
            icon={<AlertTriangle className="w-6 h-6" />}
            color="blue"
          />
          <StatsCard
            title="Incidencias del Mes"
            value={monthIncidents}
            icon={<Calendar className="w-6 h-6" />}
            color="cyan"
          />
          <StatsCard
            title="Tendencia"
            value="+12%"
            icon={<TrendingUp className="w-6 h-6" />}
            color="indigo"
          />
        </div>

        {/* Chart */}
        <div className="mb-8">
          <AccumulatedChart />
        </div>

        {/* Nueva imagen recibida vía websocket */}
        {showingNewIncident && currentImage && (
          <div className="mb-8 bg-gradient-to-r from-red-900/30 to-orange-900/30 rounded-2xl p-6 border-2 border-red-500 animate-pulse">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
              <h2 className="text-2xl text-red-300">Nueva Incidencia Detectada</h2>
            </div>
            <div className="relative rounded-xl overflow-hidden bg-black/50">
              <img
                src={currentImage}
                alt="Nueva incidencia"
                className="w-full h-[500px] object-cover"
              />
              <div className="absolute top-4 right-4 bg-red-600 px-4 py-2 rounded-lg">
                <span>EN VIVO</span>
              </div>
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-6">
                <p className="text-lg">Procesando incidencia...</p>
                <p className="text-sm text-blue-300">Se agregará a la lista en 10 segundos</p>
              </div>
            </div>
          </div>
        )}

        {/* Lista de incidentes */}
        <div ref={listRef}>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl">Historial de Incidentes</h2>
            <div className="text-blue-300">
              Página {currentPage} de {totalPages}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
            {currentIncidents.map((incident) => (
              <IncidentCard key={incident.id} incident={incident} />
            ))}
          </div>

          {/* Paginación */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 bg-blue-800 hover:bg-blue-700 disabled:bg-blue-950 disabled:opacity-50 rounded-lg transition-colors"
              >
                Anterior
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    currentPage === page
                      ? 'bg-blue-600'
                      : 'bg-blue-800 hover:bg-blue-700'
                  }`}
                >
                  {page}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 bg-blue-800 hover:bg-blue-700 disabled:bg-blue-950 disabled:opacity-50 rounded-lg transition-colors"
              >
                Siguiente
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
