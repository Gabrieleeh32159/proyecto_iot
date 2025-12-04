import { useState, useEffect, useRef } from 'react';
import { IncidentCard } from './components/IncidentCard';
import { StatsCard } from './components/StatsCard';
import { AccumulatedChart } from './components/AccumulatedChart';
import { AlertTriangle, Calendar, DollarSign, Wifi, WifiOff, Filter } from 'lucide-react';
import { WebSocketService } from './services/websocket';
// @ts-ignore - gifshot doesn't have types
import gifshot from 'gifshot';

const API_URL = 'http://localhost:8000';

interface Incident {
  id: number;
  timestamp: string;
  location: string;
  weaponType: string;
  imageUrl: string;
  severity: 'high' | 'medium' | 'low';
  duration?: number;
  confidence?: number;
}

interface ActiveIncidentSession {
  id: number;
  startTime: string;
  firstFrame: string;
  weaponType: string;
  confidence: number;
  bbox: { x1: number; y1: number; x2: number; y2: number };
  capturedFrames: string[]; // Array of base64 frames for GIF creation
  lastFrameTime: number; // Timestamp of last captured frame
}

export default function App() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [currentImage, setCurrentImage] = useState<string | null>(null);
  const [showingNewIncident, setShowingNewIncident] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalIncidents, setTotalIncidents] = useState(0);
  const [monthIncidents, setMonthIncidents] = useState(0);
  const [monthlyCost, setMonthlyCost] = useState(0);
  const [activeIncident, setActiveIncident] = useState<ActiveIncidentSession | null>(null);
  const [wsStatus, setWsStatus] = useState<'connecting' | 'connected' | 'disconnected' | 'error'>('disconnected');
  const [selectedMonth, setSelectedMonth] = useState<string>('all');
  const incidentsPerPage = 6;
  const listRef = useRef<HTMLDivElement>(null);
  const closeIncidentTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load incidents from backend API
  const loadIncidentsFromBackend = async () => {
    try {
      const response = await fetch(`${API_URL}/api/incidents`);
      if (response.ok) {
        const data = await response.json();
        setIncidents(data.incidents);
        setTotalIncidents(data.stats.total);
        setMonthIncidents(data.stats.thisMonth);
        setMonthlyCost(data.stats.monthlyCost || 0);
        console.log(`[App] Loaded ${data.incidents.length} incidents from backend`);
        console.log(`💰 Monthly cost: $${(data.stats.monthlyCost || 0).toFixed(2)}`);
      }
    } catch (error) {
      console.error('[App] Error loading incidents from backend:', error);
    }
  };

  // Initialize - load from backend
  useEffect(() => {
    loadIncidentsFromBackend();
  }, []);

  // WebSocket connection for real-time weapon detection
  useEffect(() => {
    const ws = new WebSocketService('ws://localhost:8000/ws/display');
    
    ws.onStatus((status) => {
      setWsStatus(status);
      console.log('[WebSocket] Status:', status);
    });

    ws.onMessage((data) => {
      // Always update live image when there's a frame (even after tracking stops)
      if (data.frame) {
        setCurrentImage(`data:image/jpeg;base64,${data.frame}`);
      }

      // Handle weapon detection with session tracking
      if (data.weapon_detected && data.tracking_active) {
        
        // Cancel any pending save timer if tracking resumed
        if (closeIncidentTimerRef.current) {
          clearTimeout(closeIncidentTimerRef.current);
          closeIncidentTimerRef.current = null;
          console.log('🔄 Tracking resumed - save timer cancelled');
        }
        
        setActiveIncident((currentActive) => {
          if (!currentActive) {
            // NEW INCIDENT - First detection
            const newSession: ActiveIncidentSession = {
              id: Date.now(),
              startTime: new Date().toISOString(),
              firstFrame: `data:image/jpeg;base64,${data.frame}`,
              weaponType: data.detections[0]?.class || 'Gun',
              confidence: data.detections[0]?.confidence || 0,
              bbox: data.detections[0]?.bbox || { x1: 0, y1: 0, x2: 0, y2: 0 },
              capturedFrames: [`data:image/jpeg;base64,${data.frame}`],
              lastFrameTime: Date.now()
            };
            
            setShowingNewIncident(true);
            setTotalIncidents(prev => prev + 1);
            setMonthIncidents(prev => prev + 1);
            
            console.log('🆕 New incident detected!', newSession.id);
            
            return newSession;
          } else {
            // SAME INCIDENT - Update confidence if higher and ensure panel stays open
            setShowingNewIncident(true);
            
            // Capture frames every 100ms for GIF (max 20 frames = 2 seconds at 10 FPS)
            const now = Date.now();
            const timeSinceLastFrame = now - currentActive.lastFrameTime;
            
            if (timeSinceLastFrame >= 100 && currentActive.capturedFrames.length < 20) {
              return {
                ...currentActive,
                confidence: Math.max(currentActive.confidence, data.detections[0]?.confidence || currentActive.confidence),
                capturedFrames: [...currentActive.capturedFrames, `data:image/jpeg;base64,${data.frame}`],
                lastFrameTime: now
              };
            }
            
            return {
              ...currentActive,
              confidence: Math.max(currentActive.confidence, data.detections[0]?.confidence || currentActive.confidence)
            };
          }
        });
        
      } else if (!data.tracking_active) {
        // INCIDENT ENDED - Tracker deactivated
        setActiveIncident((currentActive) => {
          if (!currentActive) {
            return null;
          }
          
          // Only start timer if not already started
          if (!closeIncidentTimerRef.current) {
            console.log('✅ Incident ended, will save in 5 seconds:', currentActive.id);
            
            // Keep showing video for 5 more seconds, then save and close
            closeIncidentTimerRef.current = setTimeout(async () => {
              console.log('💾 Saving incident after 5 second delay:', currentActive.id);
              console.log(`📹 Creating GIF from ${currentActive.capturedFrames.length} frames`);
              
              const duration = Math.round(
                (Date.now() - new Date(currentActive.startTime).getTime()) / 1000
              );
              
              // Determine severity based on confidence
              let severity: 'high' | 'medium' | 'low' = 'medium';
              if (currentActive.confidence >= 0.85) severity = 'high';
              else if (currentActive.confidence < 0.7) severity = 'low';
              
              // Create GIF from captured frames
              if (currentActive.capturedFrames.length >= 2) {
                gifshot.createGIF({
                  images: currentActive.capturedFrames,
                  gifWidth: 640,
                  gifHeight: 480,
                  interval: 0.1,
                  numFrames: Math.min(currentActive.capturedFrames.length, 20),
                  frameDuration: 1,
                  sampleInterval: 10,
                  numWorkers: 2
                }, async (obj: any) => {
                  if (!obj.error) {
                    const gifDataUrl = obj.image;
                    console.log('✅ GIF created successfully');
                    
                    // Save GIF and metadata to backend
                    try {
                      const response = await fetch(`${API_URL}/api/save-gif`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          incident_id: currentActive.id,
                          gif_data: gifDataUrl,
                          timestamp: currentActive.startTime,
                          location: 'Camera 1',
                          weaponType: currentActive.weaponType,
                          severity,
                          confidence: currentActive.confidence,
                          duration
                        })
                      });
                      
                      if (response.ok) {
                        const result = await response.json();
                        console.log(`💾 GIF saved to server: ${result.filename} (${result.size} bytes)`);
                        
                        // Reload incidents from backend
                        await loadIncidentsFromBackend();
                        console.log(`📝 Incident saved (duration: ${duration}s, cost: $${(duration * 0.01).toFixed(2)})`);
                      } else {
                        console.error('❌ Failed to save GIF to server');
                      }
                    } catch (error) {
                      console.error('❌ Error saving GIF to server:', error);
                    }
                    
                    // Clear UI
                    setShowingNewIncident(false);
                    setActiveIncident(null);
                    setCurrentImage(null);
                    closeIncidentTimerRef.current = null;
                    
                    if (listRef.current) {
                      listRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }
                  } else {
                    console.error('❌ Error creating GIF:', obj.error);
                    setShowingNewIncident(false);
                    setActiveIncident(null);
                    setCurrentImage(null);
                    closeIncidentTimerRef.current = null;
                  }
                });
              } else {
                console.log('⚠️ Not enough frames for GIF, skipping save');
                setShowingNewIncident(false);
                setActiveIncident(null);
                setCurrentImage(null);
                closeIncidentTimerRef.current = null;
              }
            }, 5000);
          }
          
          return currentActive;
        });
      }
    });

    ws.connect();

    return () => {
      ws.disconnect();
      if (closeIncidentTimerRef.current) {
        clearTimeout(closeIncidentTimerRef.current);
      }
    };
  }, []);

  // Get unique months from incidents for filter
  const availableMonths = Array.from(new Set(
    incidents.map(inc => {
      const date = new Date(inc.timestamp);
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    })
  )).sort().reverse();

  const monthNames: { [key: string]: string } = {
    '01': 'Enero', '02': 'Febrero', '03': 'Marzo', '04': 'Abril',
    '05': 'Mayo', '06': 'Junio', '07': 'Julio', '08': 'Agosto',
    '09': 'Septiembre', '10': 'Octubre', '11': 'Noviembre', '12': 'Diciembre'
  };

  // Filter incidents by selected month
  const filteredIncidents = selectedMonth === 'all' 
    ? incidents 
    : incidents.filter(inc => {
        const date = new Date(inc.timestamp);
        const incMonth = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        return incMonth === selectedMonth;
      });

  // Paginación
  const indexOfLastIncident = currentPage * incidentsPerPage;
  const indexOfFirstIncident = indexOfLastIncident - incidentsPerPage;
  const currentIncidents = filteredIncidents.slice(indexOfFirstIncident, indexOfLastIncident);
  const totalPages = Math.ceil(filteredIncidents.length / incidentsPerPage);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a1628] via-[#132a4a] to-[#1e3a5f] text-white p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl mb-2">Dashboard de Incidencias</h1>
              <p className="text-blue-300">Sistema de Monitoreo de Uso de Armas de Fuego</p>
            </div>
            
            {/* WebSocket Status Indicator */}
            <div className="flex items-center gap-2 px-4 py-2 bg-black/30 rounded-lg">
              {wsStatus === 'connected' ? (
                <>
                  <Wifi className="w-5 h-5 text-green-400" />
                  <span className="text-green-400">Conectado</span>
                </>
              ) : wsStatus === 'connecting' ? (
                <>
                  <div className="w-5 h-5 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin" />
                  <span className="text-yellow-400">Conectando...</span>
                </>
              ) : (
                <>
                  <WifiOff className="w-5 h-5 text-red-400" />
                  <span className="text-red-400">Desconectado</span>
                </>
              )}
            </div>
          </div>
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
            title="Costo del Mes"
            value={`$${(monthlyCost || 0).toFixed(2)}`}
            icon={<DollarSign className="w-6 h-6" />}
            color="green"
          />
        </div>

        {/* Chart */}
        <div className="mb-8">
          <AccumulatedChart incidents={incidents} />
        </div>

        {/* Nueva imagen recibida vía websocket */}
        {showingNewIncident && currentImage && activeIncident && (
          <div className="mb-8 bg-gradient-to-r from-red-900/30 to-orange-900/30 rounded-2xl p-6 border-2 border-red-500 animate-pulse">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                <h2 className="text-2xl text-red-300">Nueva Incidencia Detectada</h2>
              </div>
              <div className="flex items-center gap-4 text-sm">
                <div className="bg-black/50 px-3 py-1 rounded-lg">
                  <span className="text-blue-300">Tipo: </span>
                  <span className="text-white font-semibold">{activeIncident.weaponType}</span>
                </div>
                <div className="bg-black/50 px-3 py-1 rounded-lg">
                  <span className="text-blue-300">Confianza: </span>
                  <span className="text-white font-semibold">{(activeIncident.confidence * 100).toFixed(1)}%</span>
                </div>
              </div>
            </div>
            <div className="relative rounded-xl overflow-hidden bg-black/50 flex items-center justify-center" style={{ aspectRatio: '4/3' }}>
              <img
                src={currentImage}
                alt="Nueva incidencia"
                className="w-full h-full object-contain"
              />
              <div className="absolute top-4 right-4 bg-red-600 px-4 py-2 rounded-lg font-bold">
                <span>🔴 EN VIVO</span>
              </div>
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-6">
                <p className="text-lg font-semibold">Rastreando objetivo...</p>
                <p className="text-sm text-blue-300">Se guardará automáticamente cuando finalice la detección</p>
              </div>
            </div>
          </div>
        )}

        {/* Lista de incidentes */}
        <div ref={listRef}>
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
            <h2 className="text-2xl font-semibold">Historial de Incidentes</h2>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
              {/* Filtro por mes */}
              <div className="flex items-center gap-2 bg-blue-900/30 px-4 py-2 rounded-xl border border-blue-700/50">
                <Filter className="w-4 h-4 text-blue-400" />
                <span className="text-blue-300 text-sm">Filtrar:</span>
                <select
                  value={selectedMonth}
                  onChange={(e) => {
                    setSelectedMonth(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="bg-blue-800/50 border border-blue-600 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                >
                  <option value="all">Todos los meses</option>
                  {availableMonths.map(month => {
                    const [year, m] = month.split('-');
                    return (
                      <option key={month} value={month}>
                        {monthNames[m]} {year}
                      </option>
                    );
                  })}
                </select>
              </div>
              {/* Contador de incidentes */}
              <div className="bg-cyan-900/30 px-4 py-2 rounded-xl border border-cyan-700/50 text-sm">
                <span className="text-cyan-300">{filteredIncidents.length} incidentes</span>
                <span className="text-blue-400 mx-2">•</span>
                <span className="text-blue-300">Página {currentPage} de {totalPages || 1}</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
            {currentIncidents.map((incident, index) => (
              <IncidentCard key={`${incident.id}-${incident.timestamp}-${index}`} incident={incident} />
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
