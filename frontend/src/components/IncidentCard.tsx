import { MapPin, Clock, Shield, Timer, DollarSign } from "lucide-react";

interface Incident {
  id: number;
  timestamp: string;
  location: string;
  weaponType: string;
  imageUrl: string;
  severity: "high" | "medium" | "low";
  duration?: number; // Duration in seconds
  confidence?: number; // Confidence level
}

interface IncidentCardProps {
  incident: Incident;
}

export function IncidentCard({ incident }: IncidentCardProps) {
  const severityColors = {
    high: "border-red-500 bg-red-900/20",
    medium: "border-yellow-500 bg-yellow-900/20",
    low: "border-green-500 bg-green-900/20",
  };

  const severityLabels = {
    high: "Alta",
    medium: "Media",
    low: "Baja",
  };

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div
      className={`${severityColors[incident.severity]} border rounded-xl overflow-hidden backdrop-blur-sm hover:scale-105 transition-transform`}
    >
      <div className="relative overflow-hidden bg-black/50 flex items-center justify-center" style={{ aspectRatio: '4/3' }}>
        <img
          src={incident.imageUrl}
          alt={`Incidente ${incident.id}`}
          className="w-full h-full object-contain opacity-90"
        />
        <div className="absolute top-2 right-2 bg-black/70 px-3 py-1 rounded-lg text-xs">
          {severityLabels[incident.severity]}
        </div>
      </div>
      <div className="p-4">
        <div className="flex items-center gap-2 mb-2 text-sm text-blue-300">
          <Clock className="w-4 h-4" />
          <span>{formatDate(incident.timestamp)}</span>
        </div>
        <div className="flex items-center gap-2 mb-2 text-sm">
          <MapPin className="w-4 h-4 text-blue-400" />
          <span>{incident.location}</span>
        </div>
        <div className="flex items-center gap-2 mb-2 text-sm">
          <Shield className="w-4 h-4 text-blue-400" />
          <span>{incident.weaponType}</span>
        </div>
        {incident.duration !== undefined && (
          <div className="flex items-center justify-between gap-2 mt-3 pt-3 border-t border-white/10">
            <div className="flex items-center gap-2 text-sm text-cyan-300">
              <Timer className="w-4 h-4" />
              <span>{incident.duration}s</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-green-300 font-semibold">
              <DollarSign className="w-4 h-4" />
              <span>${(incident.duration * 0.01).toFixed(2)}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}