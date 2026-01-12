import React, { useState, useEffect } from 'react';
import { TreePine, Leaf, X, LayoutDashboard, Map as MapIcon, Upload, Image as ImageIcon, Filter } from 'lucide-react';
import MapaPrincipal from './MapaPrincipal';
import Dashboard from './Dashboard';
import { MOCK_ARBOLES as initialData } from './data';

function App() {
  // Inicializar estado desde localStorage o usar datos mock
  const [arboles, setArboles] = useState(() => {
    const saved = localStorage.getItem('arboles_data');
    return saved ? JSON.parse(saved) : initialData;
  });
  const [arbolSeleccionado, setArbolSeleccionado] = useState(null);
  const [nuevoArbolCoords, setNuevoArbolCoords] = useState(null);
  const [activeTab, setActiveTab] = useState('map'); // 'map' or 'dashboard'
  const [newTreeImage, setNewTreeImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [filters, setFilters] = useState({ species: '' });

  // Efecto para guardar en localStorage cuando cambia la lista de árboles
  useEffect(() => {
    localStorage.setItem('arboles_data', JSON.stringify(arboles));
  }, [arboles]);

  // Filtrado por especie
  const filtroArboles = arboles.filter(arbol => {
    const matchSpecies = !filters.species || 
      (arbol.especie || '').toLowerCase().includes(filters.species.toLowerCase()) || 
      (arbol.nom_arbol || '').toLowerCase().includes(filters.species.toLowerCase());

    const matchEstado = !filters.estado || 
      (arbol.estado || arbol.estado_actual || '').toLowerCase() === filters.estado.toLowerCase();

  return matchSpecies && matchEstado;
});

  const uniqueSpecies = [...new Set(arboles.map(a => a.especie).filter(Boolean))];
  // Manejo de imagen
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 500000) { // 500KB limit
        alert("La imagen es muy grande. Por favor use una imagen menor a 500KB.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewTreeImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Función para guardar el nuevo árbol desde el formulario
  const handleGuardarNuevoArbol = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    // Validaciones extra (aunque 'required' en input ayuda)
    if (!formData.get('nombre') || !formData.get('edad') || !formData.get('estado')) {
      alert("Por favor complete los campos obligatorios: Nombre, Edad y Estado.");
      return;
    }

    const nuevo = {
      id_arbol: Date.now(), // Usar timestamp para ID único
      nom_arbol: formData.get('nombre'),
      nom_cientifico: formData.get('nom_cientifico'),
      especie: formData.get('especie') || formData.get('nombre'), // Fallback
      edad: formData.get('edad'),
      estado: formData.get('estado'),
      altura: formData.get('altura'),
      lat: nuevoArbolCoords.lat,
      lng: nuevoArbolCoords.lng,
      descripcion: formData.get('descripcion') || "Añadido manualmente desde el mapa.",
      imagen: newTreeImage
    };
    setArboles([...arboles, nuevo]);
    setNuevoArbolCoords(null); // Cerrar formulario
    setNewTreeImage(null);
  };
    const [editando, setEditando] = useState(false); // Para alternar entre vista y formulario

    const handleEliminarArbol = (id) => {
      if (window.confirm("¿Estás seguro de eliminar este registro?")) {
        setArboles(arboles.filter(a => a.id_arbol !== id));
        setArbolSeleccionado(null);
      }
    };

    const handleEditarArbol = (e) => {
      e.preventDefault();
      const formData = new FormData(e.target);
      const actualizados = arboles.map(a => {
        if (a.id_arbol === arbolSeleccionado.id_arbol) {
          return {
            ...a,
            nom_arbol: formData.get('nombre'),
            nom_cientifico: formData.get('nom_cientifico'),
            especie: formData.get('especie'),
            edad: formData.get('edad'),
            altura: formData.get('altura'),
            estado: formData.get('estado'),
            descripcion: formData.get('descripcion'),
            imagen: newTreeImage || a.imagen // Mantiene la vieja si no hay nueva
          };
        }
        return a;
      });
      setArboles(actualizados);
      setArbolSeleccionado(null);
      setEditando(false);
    };

  return (
    <div className="h-screen bg-slate-50 flex flex-col overflow-hidden">
      <nav className="bg-green-900 text-white p-4 shadow-md z-20 flex justify-between items-center shrink-0">
        <h1 className="text-xl font-bold flex items-center gap-2 italic">
          <Leaf className="text-green-400" /> ProtoArbol v2.0
        </h1>
        <div className="flex bg-green-800 rounded-lg p-1">
          <button 
            onClick={() => setActiveTab('map')}
            className={`px-4 py-2 rounded-md flex items-center gap-2 transition-colors ${activeTab === 'map' ? 'bg-white text-green-900 font-bold' : 'text-green-100 hover:bg-green-700'}`}
          >
            <MapIcon size={18} /> Mapa
          </button>
          <button 
            onClick={() => setActiveTab('dashboard')}
            className={`px-4 py-2 rounded-md flex items-center gap-2 transition-colors ${activeTab === 'dashboard' ? 'bg-white text-green-900 font-bold' : 'text-green-100 hover:bg-green-700'}`}
          >
            <LayoutDashboard size={18} /> Datos
          </button>
        </div>
      </nav>

      <div className="flex-1 flex relative overflow-hidden">
        {activeTab === 'map' ? (
          <>
            <main className="flex-1 p-0 relative h-full">
              {/* Barra de Filtros */}
              <div className="absolute top-4 left-16 z-[999] bg-white p-3 rounded-lg shadow-lg flex gap-3 items-center border border-slate-200">
                <Filter size={18} className="text-slate-500" />
                
                {/* Selector de Especies */}
                <select 
                  className="border rounded px-2 py-1 text-sm bg-slate-50"
                  value={filters.species}
                  onChange={(e) => setFilters({ ...filters, species: e.target.value })}
                >
                  <option value="">Todas las Especies</option>
                  {uniqueSpecies.map(s => <option key={s} value={s}>{s}</option>)}
                </select>

                {/* Selector de Estado Sanitario */}
                <select 
                  className="border rounded px-2 py-1 text-sm bg-slate-50"
                  value={filters.estado || ''}
                  onChange={(e) => setFilters({ ...filters, estado: e.target.value })}
                >
                  <option value="">Todos los Estados</option>
                  <option value="saludable">Saludable</option>
                  <option value="regular">Regular</option>
                  <option value="malo">Malo</option>
                  <option value="muerto">Muerto</option>
                </select>

                {/* Botón Limpiar (si hay cualquier filtro activo) */}
                {(filters.species || filters.estado) && (
                  <button 
                    onClick={() => setFilters({ species: '', estado: '' })} 
                    className="text-xs text-red-500 hover:underline"
                  >
                    Limpiar
                  </button>
                )}

                <div className="text-xs text-slate-400 ml-2 border-l pl-2">
                  Mostrando {filtroArboles.length} árboles
                </div>
              </div>

              <MapaPrincipal 
                arboles={filtroArboles} 
                onSelectArbol={setArbolSeleccionado} 
                posicionTemporal={nuevoArbolCoords}
                onMapClick={(coords) => {
                  setNuevoArbolCoords(coords);
                  setNewTreeImage(null);
                }}
              />
            </main>

            {/* Formulario Nuevo Árbol */}
            {nuevoArbolCoords && (
              <aside className="absolute z-[1000] left-10 top-20 bg-white p-6 rounded-2xl shadow-2xl border border-green-100 w-80 max-h-[80vh] overflow-y-auto">
                <div className="flex justify-between mb-4">
                  <h3 className="font-bold text-green-800">Registrar Árbol</h3>
                  <button onClick={() => setNuevoArbolCoords(null)}><X size={18}/></button>
                </div>
                <form onSubmit={editando ? handleEditarArbol : handleGuardarNuevoArbol} className="space-y-3">
                  {/* Título dinámico */}
                  <h3 className="font-bold text-green-800">
                    {editando ? 'Editar Registro' : 'Registrar Árbol'}
                  </h3>
                  
                  <p className="text-[10px] text-gray-400 font-mono">
                    COORD: {nuevoArbolCoords.lat.toFixed(4)}, {nuevoArbolCoords.lng.toFixed(4)}
                  </p>
                  <div>
                    <label className="text-xs font-semibold text-gray-600">Nombre Común <span className="text-red-500">*</span></label>
                    <input name="nombre" placeholder="Ej: Roble" className="w-full border p-2 rounded text-sm" required />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-gray-600">Nombre Científico</label>
                    <input name="nom_cientifico" placeholder="Ej: Nothofagus obliqua" className="w-full border p-2 rounded text-sm" />
                  </div>
                  
                  {/* Hidden or Auto-filled species field based on name if desired, or explicit input */}
                  <div>
                     <label className="text-xs font-semibold text-gray-600">Especie / Familia</label>
                     <input name="especie" placeholder="Ej: Quercus" className="w-full border p-2 rounded text-sm" />
                  </div>

                  <div className="flex gap-2">
                    <div className="w-1/2">
                      <label className="text-xs font-semibold text-gray-600">Edad (años) <span className="text-red-500">*</span></label>
                      <input type="number" name="edad" placeholder="0" className="w-full border p-2 rounded text-sm" required />
                    </div>
                    <div className="w-1/2">
                      <label className="text-xs font-semibold text-gray-600">Altura (m)</label>
                      <input type="number" step="0.1" name="altura" placeholder="0.0" className="w-full border p-2 rounded text-sm" />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-gray-600">Estado Sanitario <span className="text-red-500">*</span></label>
                    <select name="estado" className="w-full border p-2 rounded text-sm" required defaultValue="">
                      <option value="" disabled>Seleccione...</option>
                      <option value="Saludable">Saludable</option>
                      <option value="Regular">Regular</option>
                      <option value="Malo">Malo</option>
                      <option value="Muerto">Muerto</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-600 flex items-center gap-1"><ImageIcon size={12}/> Fotografía</label>
                    <div className="border-2 border-dashed border-slate-300 rounded p-4 text-center cursor-pointer hover:bg-slate-50 transition-colors relative">
                      <input type="file" accept="image/*" onChange={handleImageUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
                      {newTreeImage ? (
                        <div className="relative">
                          <img src={newTreeImage} alt="Preview" className="h-20 mx-auto object-cover rounded" />
                          <button type="button" onClick={(e) => {e.preventDefault(); setNewTreeImage(null);}} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5"><X size={12}/></button>
                        </div>
                      ) : (
                        <div className="text-slate-400 text-xs">
                          <Upload size={20} className="mx-auto mb-1"/>
                          <span className="block">Clic para subir imagen</span>
                          <span className="text-[10px]">(Max 500KB)</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-gray-600">Descripción / Notas</label>
                    <textarea name="descripcion" rows="2" className="w-full border p-2 rounded text-sm" placeholder="Detalles adicionales..."></textarea>
                  </div>

                  <button type="submit" className="w-full bg-green-600 text-white py-2 rounded font-bold hover:bg-green-700 transition-colors">Guardar en Mapa</button>
                </form>
              </aside>
            )}

            {/* Sidebar Detalle */}
            <aside className={`fixed right-0 top-0 h-full bg-white shadow-2xl transition-transform duration-300 z-[1001] ${arbolSeleccionado ? 'w-96' : 'w-0 overflow-hidden'}`}>
              {arbolSeleccionado && (
                <div className="w-96 h-full flex flex-col">
                 <div className="relative h-48 bg-slate-200">
                    {arbolSeleccionado.imagen ? (
                      <img 
                        src={arbolSeleccionado.imagen} 
                        alt={arbolSeleccionado.nom_arbol} 
                        className="w-full h-full object-cover cursor-zoom-in" 
                        onClick={() => setImagePreview(arbolSeleccionado.imagen)}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-400">
                        <div className="text-center">
                          <TreePine size={48} className="mx-auto opacity-50"/>
                          <span className="text-sm">Sin imagen</span>
                        </div>
                      </div>
                    )}
                    <button onClick={() => setArbolSeleccionado(null)} className="absolute top-4 right-4 bg-black/50 hover:bg-black/70 text-white p-1 rounded-full backdrop-blur-sm transition-colors"><X size={20} /></button>
                 </div>
                  <div className="p-6 bg-green-800 text-white">
                     <h3 className="text-xl font-bold">{arbolSeleccionado.nom_arbol}</h3>
                     <p className="text-green-200 italic text-sm">{arbolSeleccionado.nom_cientifico || 'Nombre científico no registrado'}</p>
                     <p className="text-green-100 text-xs mt-1">Especie: {arbolSeleccionado.especie}</p>
                  </div>
                  <div className="p-6 space-y-4 flex-1 overflow-y-auto">
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                        <span className="text-xs text-gray-500 block uppercase tracking-wider">Estado</span>
                        <span className={`font-bold ${arbolSeleccionado.estado?.includes('Muerto') ? 'text-red-600' : 'text-green-700'}`}>
                          {arbolSeleccionado.estado || arbolSeleccionado.estado_actual || 'Desconocido'}
                        </span>
                      </div>
                      <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                        <span className="text-xs text-gray-500 block uppercase tracking-wider">Edad</span>
                        <span className="font-bold text-slate-700">
                          {arbolSeleccionado.edad ? `${arbolSeleccionado.edad} años` : 'N/A'}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-3 bg-white p-2">
                      <div className="flex justify-between border-b border-slate-100 pb-2">
                        <span className="text-gray-500 text-sm">Altura</span>
                        <span className="font-medium text-gray-800">{arbolSeleccionado.altura ? `${arbolSeleccionado.altura} m` : 'No registrada'}</span>
                      </div>
                      <div className="flex justify-between border-b border-slate-100 pb-2">
                        <span className="text-gray-500 text-sm">Latitud</span>
                        <span className="font-medium text-gray-800">{arbolSeleccionado.lat?.toFixed(6)}</span>
                      </div>
                      <div className="flex justify-between border-b border-slate-100 pb-2">
                        <span className="text-gray-500 text-sm">Longitud</span>
                        <span className="font-medium text-gray-800">{arbolSeleccionado.lng?.toFixed(6)}</span>
                      </div>
                      <div className="flex justify-between border-b border-slate-100 pb-2">
                         <span className="text-gray-500 text-sm">ID Registro</span>
                         <span className="font-mono text-xs text-gray-400">#{arbolSeleccionado.id_arbol}</span>
                      </div>
                    </div>
                    <div className="flex gap-2 pt-2">
                      <button 
                        onClick={() => { setEditando(true); setNuevoArbolCoords({ lat: arbolSeleccionado.lat, lng: arbolSeleccionado.lng }); }}
                        className="flex-1 bg-blue-600 text-white py-2 rounded-lg text-sm font-bold hover:bg-blue-700"
                      >
                        Editar
                      </button>
                      <button 
                        onClick={() => handleEliminarArbol(arbolSeleccionado.id_arbol)}
                        className="flex-1 bg-red-100 text-red-600 py-2 rounded-lg text-sm font-bold hover:bg-red-200"
                      >
                        Eliminar
                      </button>
                    </div>
                    <div className="pt-2">
                      <h4 className="font-bold text-gray-700 mb-2 text-sm uppercase tracking-wide">Observaciones</h4>
                      <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 text-gray-600 text-sm leading-relaxed italic">
                        "{arbolSeleccionado.descripcion || "Sin descripción disponible."}"
                      </div>
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

      {/* Visor de imagen completa */}
      {imagePreview && (
        <div className="fixed inset-0 bg-black/80 z-[2000] flex items-center justify-center" onClick={() => setImagePreview(null)}>
          <img src={imagePreview} alt="Vista completa" className="max-w-[95vw] max-h-[95vh] object-contain" />
          <button className="absolute top-6 right-6 bg-white/20 text-white p-2 rounded-full" onClick={() => setImagePreview(null)}>
            <X />
          </button>
        </div>
      )}
    </div>
  );
}

export default App;
