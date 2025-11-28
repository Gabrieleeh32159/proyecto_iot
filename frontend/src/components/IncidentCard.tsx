import { MapPin, Clock, Shield } from "lucide-react";

interface Incident {
  id: number;
  timestamp: string;
  location: string;
  weaponType: string;
  imageUrl: string;
  severity: "high" | "medium" | "low";
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
      <div className="relative h-48 overflow-hidden bg-black/50">
        <img
          src={incident.imageUrl}
          alt={`Incidente ${incident.id}`}
          className="w-full h-full object-cover opacity-90"
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
        <div className="flex items-center gap-2 text-sm">
          <Shield className="w-4 h-4 text-blue-400" />
          <span>{incident.weaponType}</span>
        </div>
      </div>
    </div>
  );
}