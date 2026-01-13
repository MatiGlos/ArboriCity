import React, { useState, useEffect } from 'react';
import { TreePine, Leaf, X, LayoutDashboard, Map as MapIcon, Upload, Image as ImageIcon, Filter } from 'lucide-react';
import MapaPrincipal from './MapaPrincipal';
import Dashboard from './Dashboard';

// OJO: Solo cambiamos esto para manejar la URL de forma centralizada
const API_BASE_URL = 'http://localhost:5000/api/arboles';

function App() {
  const [arboles, setArboles] = useState([]);
  const [arbolSeleccionado, setArbolSeleccionado] = useState(null);
  const [nuevoArbolCoords, setNuevoArbolCoords] = useState(null);
  const [activeTab, setActiveTab] = useState('map');
  const [newTreeImage, setNewTreeImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [filters, setFilters] = useState({ species: '', estado: '' });
  const [editando, setEditando] = useState(false);

  // CARGA INICIAL - Actualizado con API_BASE_URL
  useEffect(() => {
    fetch(API_BASE_URL)
      .then(res => res.json())
      .then(data => setArboles(data))
      .catch(err => console.error("Error al cargar:", err));
  }, []);

  const filtroArboles = arboles.filter(arbol => {
    const matchSpecies = !filters.species || 
      (arbol.especie || '').toLowerCase().includes(filters.species.toLowerCase());
    const matchEstado = !filters.estado || 
      (arbol.estado || '').toLowerCase() === filters.estado.toLowerCase();
    return matchSpecies && matchEstado;
  });

  const uniqueSpecies = [...new Set(arboles.map(a => a.especie).filter(Boolean))];

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert("La imagen es muy pesada (Máx 2MB)");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => setNewTreeImage(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleGuardarNuevoArbol = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const nuevo = {
      nom_arbol: formData.get('nombre'),
      nom_cientifico: formData.get('nom_cientifico'),
      especie: formData.get('especie'),
      edad: parseInt(formData.get('edad')) || 0,
      altura: parseFloat(formData.get('altura')) || 0,
      estado: formData.get('estado'),
      lat: nuevoArbolCoords.lat,
      lng: nuevoArbolCoords.lng,
      descripcion: formData.get('descripcion'),
      imagen: newTreeImage
    };

    try {
      // Actualizado con API_BASE_URL
      const response = await fetch(API_BASE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(nuevo)
      });
      if (response.ok) {
        const guardado = await response.json();
        setArboles([guardado, ...arboles]);
        setNuevoArbolCoords(null);
        setNewTreeImage(null);
      }
    } catch (err) { alert("Error de conexión"); }
  };

  const handleEditarArbol = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const editadoData = {
      nom_arbol: formData.get('nombre'),
      nom_cientifico: formData.get('nom_cientifico'),
      especie: formData.get('especie'),
      edad: parseInt(formData.get('edad')) || 0,
      altura: parseFloat(formData.get('altura')) || 0,
      estado: formData.get('estado'),
      descripcion: formData.get('descripcion'),
      imagen: newTreeImage || arbolSeleccionado.imagen
    };

    try {
      // Actualizado con API_BASE_URL e ID
      const response = await fetch(`${API_BASE_URL}/${arbolSeleccionado.id_arbol}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editadoData)
      });
      if (response.ok) {
        const actualizado = await response.json();
        setArboles(arboles.map(a => a.id_arbol === actualizado.id_arbol ? actualizado : a));
        setArbolSeleccionado(null);
        setEditando(false);
        setNewTreeImage(null);
      }
    } catch (err) { alert("Error al actualizar"); }
  };

  const handleEliminarArbol = async (id) => {
    if (window.confirm("¿Eliminar este árbol?")) {
      try {
        // Actualizado con API_BASE_URL e ID
        await fetch(`${API_BASE_URL}/${id}`, { method: 'DELETE' });
        setArboles(arboles.filter(a => a.id_arbol !== id));
        setArbolSeleccionado(null);
      } catch (err) { alert("Error al eliminar"); }
    }
  };

  // color de estado (se mantiene igual)
  const getEstadoColor = (estado) => {
    const e = (estado || '').toLowerCase();
    if (e === 'saludable') return 'text-green-600';
    if (e === 'regular') return 'text-yellow-500';
    if (e === 'malo') return 'text-orange-500'; 
    if (e === 'muerto') return 'text-red-600';    
    return 'text-slate-600';
  };

  return (
    <div className="h-screen bg-slate-50 flex flex-col overflow-hidden font-sans">
      <nav className="bg-green-900 text-white p-4 shadow-md z-20 flex justify-between items-center">
        <h1 className="text-xl font-bold flex items-center gap-2 italic"><Leaf className="text-green-400" /> ProtoArbol v2.0</h1>
        <div className="flex bg-green-800 rounded-lg p-1">
          <button onClick={() => setActiveTab('map')} className={`px-4 py-2 rounded-md flex items-center gap-2 transition-all ${activeTab === 'map' ? 'bg-white text-green-900 font-bold' : 'text-green-100 hover:bg-green-700'}`}><MapIcon size={18}/> Mapa</button>
          <button onClick={() => setActiveTab('dashboard')} className={`px-4 py-2 rounded-md flex items-center gap-2 transition-all ${activeTab === 'dashboard' ? 'bg-white text-green-900 font-bold' : 'text-green-100 hover:bg-green-700'}`}><LayoutDashboard size={18}/> Datos</button>
        </div>
      </nav>

      <div className="flex-1 flex relative overflow-hidden">
        {activeTab === 'map' ? (
          <>
            <main className="flex-1 p-0 relative h-full">
              <div className="absolute top-4 left-16 z-[999] bg-white p-3 rounded-lg shadow-lg flex gap-3 items-center border border-slate-200">
                <Filter size={18} className="text-slate-500" />
                <select className="border-none text-sm outline-none bg-transparent cursor-pointer" value={filters.species} onChange={(e) => setFilters({...filters, species: e.target.value})}>
                  <option value="">Todas las Especies</option>
                  {uniqueSpecies.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                <div className="w-px h-6 bg-slate-200 mx-1"></div>
                <select className="border-none text-sm outline-none bg-transparent cursor-pointer" value={filters.estado} onChange={(e) => setFilters({...filters, estado: e.target.value})}>
                  <option value="">Todos los Estados</option>
                  <option value="Saludable">Saludable</option>
                  <option value="Regular">Regular</option>
                  <option value="Malo">Malo</option>
                  <option value="Muerto">Muerto</option>
                </select>
              </div>

              <MapaPrincipal 
                arboles={filtroArboles} 
                onSelectArbol={(a) => { setArbolSeleccionado(a); setEditando(false); setNuevoArbolCoords(null); }} 
                posicionTemporal={nuevoArbolCoords}
                onMapClick={(coords) => { setNuevoArbolCoords(coords); setArbolSeleccionado(null); setEditando(false); setNewTreeImage(null); }}
              />
            </main>

            {(nuevoArbolCoords || editando) && (
              <aside className="absolute z-[1000] left-10 top-20 bg-white p-6 rounded-2xl shadow-2xl border w-80 max-h-[85vh] overflow-y-auto">
                <div className="flex justify-between mb-4 border-b pb-2">
                  <h3 className="font-bold text-green-800">{editando ? 'Editar Árbol' : 'Nuevo Registro'}</h3>
                  <button onClick={() => { setNuevoArbolCoords(null); setEditando(false); setNewTreeImage(null); }} className="text-slate-400 hover:text-slate-600"><X size={18}/></button>
                </div>
                
                <form onSubmit={editando ? handleEditarArbol : handleGuardarNuevoArbol} className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase">Nombre Común *</label>
                    <input name="nombre" placeholder="Ej: Roble" defaultValue={editando ? arbolSeleccionado.nom_arbol : ''} className="w-full border p-2 rounded text-sm bg-slate-50" required />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase">Nombre Científico</label>
                    <input name="nom_cientifico" placeholder="Ej: Nothofagus obliqua" defaultValue={editando ? arbolSeleccionado.nom_cientifico : ''} className="w-full border p-2 rounded text-sm bg-slate-50" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase">Especie / Familia</label>
                    <input name="especie" placeholder="Ej: Quercus" defaultValue={editando ? arbolSeleccionado.especie : ''} className="w-full border p-2 rounded text-sm bg-slate-50" required />
                  </div>
                  <div className="flex gap-2">
                    <div className="w-1/2 space-y-1">
                       <label className="text-xs font-bold text-slate-500 uppercase">Edad (años) *</label>
                       <input type="number" name="edad" placeholder="0" defaultValue={editando ? arbolSeleccionado.edad : ''} className="w-full border p-2 rounded text-sm bg-slate-50" required />
                    </div>
                    <div className="w-1/2 space-y-1">
                       <label className="text-xs font-bold text-slate-500 uppercase">Altura (m)</label>
                       <input type="number" step="0.1" name="altura" placeholder="0.0" defaultValue={editando ? arbolSeleccionado.altura : ''} className="w-full border p-2 rounded text-sm bg-slate-50" />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase">Estado Sanitario *</label>
                    <select name="estado" defaultValue={editando ? arbolSeleccionado.estado : ''} className="w-full border p-2 rounded text-sm bg-slate-50" required>
                      <option value="" disabled>Seleccione...</option>
                      <option value="Saludable">Saludable</option>
                      <option value="Regular">Regular</option>
                      <option value="Malo">Malo</option>
                      <option value="Muerto">Muerto</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase">Fotografía</label>
                    <div className="relative border-2 border-dashed border-slate-200 rounded-lg p-4 bg-slate-50 hover:bg-slate-100 transition-colors text-center">
                      <input type="file" accept="image/*" onChange={handleImageUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20" />
                      <div className="relative z-10 flex flex-col items-center">
                        <Upload size={24} className="text-slate-400 mb-1" />
                        <span className="text-[10px] font-medium text-slate-400">Clic para subir imagen</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1">
                     <label className="text-xs font-bold text-slate-500 uppercase">Descripción / Notas</label>
                     <textarea name="descripcion" placeholder="Detalles adicionales..." defaultValue={editando ? arbolSeleccionado.descripcion : ''} className="w-full border p-2 rounded text-sm bg-slate-50" rows="2"></textarea>
                  </div>
                  <button type="submit" className="w-full bg-green-700 text-white py-3 rounded-lg font-bold hover:bg-green-800 transition-all shadow-md">
                    {editando ? 'Actualizar Datos' : 'Guardar en Base de Datos'}
                  </button>
                </form>
              </aside>
            )}

            <aside className={`fixed right-0 top-0 h-full bg-white shadow-2xl transition-all duration-300 z-[1001] ${arbolSeleccionado && !editando ? 'w-[400px]' : 'w-0 overflow-hidden'}`}>
              {arbolSeleccionado && (
                <div className="w-[400px] flex flex-col h-full border-l">
                  <div className="h-72 bg-slate-100 relative overflow-hidden flex items-center justify-center">
                    {arbolSeleccionado.imagen ? (
                      <img src={arbolSeleccionado.imagen} className="w-full h-full object-cover cursor-zoom-in" onClick={() => setImagePreview(arbolSeleccionado.imagen)} alt="Árbol" />
                    ) : (
                      <div className="flex flex-col items-center justify-center text-slate-300 gap-2">
                        <TreePine size={80} strokeWidth={1} />
                        <span className="text-sm font-medium uppercase tracking-widest">Sin imagen</span>
                      </div>
                    )}
                    <button onClick={() => setArbolSeleccionado(null)} className="absolute top-4 right-4 bg-black/40 hover:bg-black/60 text-white p-2 rounded-full backdrop-blur-sm"><X size={22}/></button>
                  </div>

                  <div className="p-6 bg-green-800 text-white shadow-inner">
                    <h3 className="text-3xl font-bold leading-tight">{arbolSeleccionado.nom_arbol || 'Sin nombre'}</h3>
                    <p className="text-green-100 italic text-base mt-1 opacity-90">{arbolSeleccionado.nom_cientifico || 'Nombre científico no registrado'}</p>
                    <p className="text-xs text-green-300 mt-2 font-bold uppercase tracking-wider">Especie: {arbolSeleccionado.especie}</p>
                  </div>

                  <div className="p-6 space-y-6 overflow-y-auto flex-1 bg-white">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Estado</p>
                        <p className={`font-bold text-xl ${getEstadoColor(arbolSeleccionado.estado)}`}>
                          {arbolSeleccionado.estado || 'Desconocido'}
                        </p>
                      </div>
                      <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Edad</p>
                        <p className="font-bold text-xl text-slate-700">{arbolSeleccionado.edad ? `${arbolSeleccionado.edad} años` : 'N/A'}</p>
                      </div>
                    </div>

                    <div className="space-y-4 pt-2">
                      <div className="flex justify-between items-center py-2 border-b border-slate-50 text-sm">
                        <span className="text-slate-500">Altura</span>
                        <span className="font-bold text-slate-800">{arbolSeleccionado.altura ? `${arbolSeleccionado.altura} m` : '--'}</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-slate-50 text-sm">
                        <span className="text-slate-500">Latitud</span>
                        <span className="font-mono text-slate-700 font-bold">{Number(arbolSeleccionado.lat || 0).toFixed(6)}</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-slate-50 text-sm">
                        <span className="text-slate-500">Longitud</span>
                        <span className="font-mono text-slate-700 font-bold">{Number(arbolSeleccionado.lng || 0).toFixed(6)}</span>
                      </div>
                      <div className="flex justify-between items-center py-2 text-sm">
                        <span className="text-slate-500">ID Registro</span>
                        <span className="text-slate-400 font-mono">#{arbolSeleccionado.id_arbol}</span>
                      </div>
                    </div>

                    <div className="space-y-2 pt-2">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Observaciones</p>
                      <div className="text-sm text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-xl border border-dashed border-slate-300 min-h-[80px]">
                        "{arbolSeleccionado.descripcion || 'Sin descripción adicional.'}"
                      </div>
                    </div>

                    <div className="flex gap-4 pt-6">
                      <button onClick={() => setEditando(true)} className="flex-1 bg-blue-600 text-white py-4 rounded-xl font-bold hover:bg-blue-700 shadow-lg text-base transition-all active:scale-95">Editar</button>
                      <button onClick={() => handleEliminarArbol(arbolSeleccionado.id_arbol)} className="flex-1 bg-red-50 text-red-600 py-4 rounded-xl font-bold hover:bg-red-100 text-base transition-all active:scale-95">Eliminar</button>
                    </div>
                  </div>
                </div>
              )}
            </aside>
          </>
        ) : (
          <Dashboard arboles={arboles} />
        )}
      </div>

      {imagePreview && (
        <div className="fixed inset-0 bg-black/95 z-[2000] flex items-center justify-center p-4 cursor-zoom-out backdrop-blur-sm" onClick={() => setImagePreview(null)}>
          <img src={imagePreview} className="max-w-full max-h-full object-contain rounded-lg shadow-2xl" alt="Zoom" />
          <button className="absolute top-8 right-8 text-white bg-white/10 p-3 rounded-full hover:bg-white/20"><X size={32}/></button>
        </div>
      )}
    </div>
  );
}

export default App;