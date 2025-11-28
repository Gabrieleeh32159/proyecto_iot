import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';

export function AccumulatedChart() {
  // Datos simulados de uso acumulado
  const data = [
    { mes: 'Ene', incidencias: 12 },
    { mes: 'Feb', incidencias: 19 },
    { mes: 'Mar', incidencias: 25 },
    { mes: 'Abr', incidencias: 32 },
    { mes: 'May', incidencias: 38 },
    { mes: 'Jun', incidencias: 45 },
    { mes: 'Jul', incidencias: 52 },
    { mes: 'Ago', incidencias: 61 },
    { mes: 'Sep', incidencias: 68 },
    { mes: 'Oct', incidencias: 77 },
    { mes: 'Nov', incidencias: 85 },
  ];

  return (
    <div className="bg-gradient-to-br from-blue-900/40 to-indigo-900/40 border border-blue-600 rounded-xl p-6 backdrop-blur-sm">
      <h3 className="text-xl mb-4">Uso Acumulado de Armas</h3>
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id="colorIncidencias" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
          <XAxis dataKey="mes" stroke="#94a3b8" />
          <YAxis stroke="#94a3b8" />
          <Tooltip
            contentStyle={{
              backgroundColor: '#1e293b',
              border: '1px solid #3b82f6',
              borderRadius: '8px',
              color: '#fff'
            }}
          />
          <Area
            type="monotone"
            dataKey="incidencias"
            stroke="#3b82f6"
            strokeWidth={3}
            fillOpacity={1}
            fill="url(#colorIncidencias)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
