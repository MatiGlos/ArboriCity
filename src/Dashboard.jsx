import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { LayoutDashboard, Trees, Activity } from 'lucide-react';

const COLORS = ['#16a34a', '#dcd926', '#d97706', '#dc2626'];

function Dashboard({ arboles }) {
  // Process data for charts
  const especieCount = arboles.reduce((acc, curr) => {
    // Normalizar para evitar duplicados por mayúsculas/minúsculas
    const especie = (curr.especie || 'Desconocido').trim(); 
    // Capitalizar primera letra
    const especieFormat = especie.charAt(0).toUpperCase() + especie.slice(1).toLowerCase();
    acc[especieFormat] = (acc[especieFormat] || 0) + 1;
    return acc;
  }, {});

  const dataEspecie = Object.keys(especieCount).map(key => ({
    name: key,
    cantidad: especieCount[key]
  }));

  const estadoCount = arboles.reduce((acc, curr) => {
    const estado = curr.estado || 'Desconocido';
    acc[estado] = (acc[estado] || 0) + 1;
    return acc;
  }, {});

  const dataEstado = Object.keys(estadoCount).map(key => ({
    name: key,
    value: estadoCount[key]
  }));

  // Stats
  const totalArboles = arboles.length;
  const arbolesConEdad = arboles.filter(a => a.edad && !isNaN(a.edad));
  const avgEdad = arbolesConEdad.length > 0 
    ? arbolesConEdad.reduce((acc, curr) => acc + parseInt(curr.edad), 0) / arbolesConEdad.length 
    : 0;

  return (
    <div className="p-6 bg-slate-50 min-h-full overflow-y-auto w-full">
      <h2 className="text-2xl font-bold mb-6 text-slate-800 flex items-center gap-2">
        <LayoutDashboard className="text-green-600"/> Panel de Estadísticas
      </h2>
      
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-100 rounded-full text-green-600"><Trees size={24}/></div>
            <div>
              <p className="text-sm text-slate-500">Total Árboles</p>
              <h3 className="text-3xl font-bold text-slate-800">{totalArboles}</h3>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
           <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-100 rounded-full text-blue-600"><Activity size={24}/></div>
            <div>
              <p className="text-sm text-slate-500">Edad Promedio</p>
              <h3 className="text-3xl font-bold text-slate-800">{avgEdad.toFixed(1)} años</h3>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-lg border border-slate-100 h-96">
          <h3 className="font-bold text-lg mb-4 text-slate-700">Distribución por Especie</h3>
          <ResponsiveContainer width="100%" height="90%">
            <BarChart data={dataEspecie}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Legend />
              <Bar dataKey="cantidad" name="Cantidad" fill="#16a34a" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-lg border border-slate-100 h-96">
          <h3 className="font-bold text-lg mb-4 text-slate-700">Estado Sanitario</h3>
          <ResponsiveContainer width="100%" height="90%">
            <PieChart>
              <Pie
                data={dataEstado}
                cx="50%"
                cy="50%"
                labelLine={false}
                //label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {dataEstado.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;