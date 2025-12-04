import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useMemo } from 'react';

interface Incident {
  id: number;
  timestamp: string;
  duration?: number;
}

interface AccumulatedChartProps {
  incidents: Incident[];
}

export function AccumulatedChart({ incidents }: AccumulatedChartProps) {
  // Calculate incidents per month from real data
  const data = useMemo(() => {
    const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    const monthData: { [key: string]: { incidencias: number; costo: number } } = {};
    
    // Initialize all months of the current year
    const currentYear = new Date().getFullYear();
    monthNames.forEach((_, index) => {
      const key = `${currentYear}-${String(index + 1).padStart(2, '0')}`;
      monthData[key] = { incidencias: 0, costo: 0 };
    });
    
    // Count incidents per month
    incidents.forEach(incident => {
      const date = new Date(incident.timestamp);
      const year = date.getFullYear();
      const month = date.getMonth() + 1;
      const key = `${year}-${String(month).padStart(2, '0')}`;
      
      if (monthData[key]) {
        monthData[key].incidencias += 1;
        monthData[key].costo += (incident.duration || 0) * 0.01;
      }
    });
    
    // Convert to array and sort by date, filter months with data or recent
    const result = Object.entries(monthData)
      .map(([key, value]) => {
        const [year, month] = key.split('-');
        return {
          mes: monthNames[parseInt(month) - 1],
          monthKey: key,
          incidencias: value.incidencias,
          costo: parseFloat(value.costo.toFixed(2))
        };
      })
      .filter(item => {
        // Show last 6 months or months with data
        const currentMonth = new Date().getMonth();
        const itemMonth = parseInt(item.monthKey.split('-')[1]) - 1;
        const monthDiff = currentMonth - itemMonth;
        return (monthDiff >= 0 && monthDiff <= 5) || item.incidencias > 0;
      })
      .sort((a, b) => a.monthKey.localeCompare(b.monthKey))
      .slice(-6); // Last 6 months max
    
    return result;
  }, [incidents]);

  return (
    <div className="bg-gradient-to-br from-blue-900/40 to-indigo-900/40 border border-blue-600 rounded-xl p-6 backdrop-blur-sm">
      <h3 className="text-xl mb-4">Incidencias por Mes</h3>
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id="colorIncidencias" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/>
            </linearGradient>
            <linearGradient id="colorCosto" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#22c55e" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#22c55e" stopOpacity={0.1}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
          <XAxis dataKey="mes" stroke="#94a3b8" />
          <YAxis yAxisId="left" stroke="#94a3b8" />
          <YAxis yAxisId="right" orientation="right" stroke="#22c55e" tickFormatter={(value) => `$${value}`} />
          <Tooltip
            contentStyle={{
              backgroundColor: '#1e293b',
              border: '1px solid #3b82f6',
              borderRadius: '8px',
              color: '#fff'
            }}
            formatter={(value: number, name: string) => {
              if (name === 'costo') return [`$${value.toFixed(2)}`, 'Costo'];
              return [value, 'Incidencias'];
            }}
          />
          <Area
            yAxisId="left"
            type="monotone"
            dataKey="incidencias"
            stroke="#3b82f6"
            strokeWidth={3}
            fillOpacity={1}
            fill="url(#colorIncidencias)"
            name="incidencias"
          />
          <Area
            yAxisId="right"
            type="monotone"
            dataKey="costo"
            stroke="#22c55e"
            strokeWidth={2}
            fillOpacity={0.3}
            fill="url(#colorCosto)"
            name="costo"
          />
        </AreaChart>
      </ResponsiveContainer>
      <div className="flex justify-center gap-6 mt-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
          <span className="text-blue-300">Incidencias</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          <span className="text-green-300">Costo ($)</span>
        </div>
      </div>
    </div>
  );
}
