import React, { useEffect, useMemo, useState } from 'react';
import { MapContainer, TileLayer, Popup, useMapEvents, useMap, LayersControl } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.heat';
import { Blocks, LeafyGreen, TreePine, MapPinPlusInside, MapPlus } from 'lucide-react';
import { renderToStaticMarkup } from 'react-dom/server';
import { Marker } from 'react-leaflet';


const getColor = (estado) => {
  const s = (estado || '').toLowerCase();
  if (s.includes('muerto')) return '#dc2626'; 
  if (s.includes('regular')) return '#dcd926'; 
  if (s.includes('malo')) return '#d97706'; 
  return '#16a34a';
};

function ClickHandler({ onClick }) {
  useMapEvents({
    click(e) {
      onClick(e.latlng);
    },
  });
  return null;
}
//icono de árbol
const createTreeIcon = (estado) => {
  const color = getColor(estado);
  const iconHTML = renderToStaticMarkup(
    <TreePine size={24}  color={color} fill={color} fillOpacity={0.5} />
  );

  return L.divIcon({
    html: iconHTML,
    className: "custom-tree-icon",
    iconSize: [24, 24],
    iconAnchor: [12, 24], // base del icono alineada a la coord
    popupAnchor: [0, -24],
  });
};
//icono de árbol NUEVO
const createTempIcon = () => {
  const iconHTML = renderToStaticMarkup(
    <MapPinPlusInside size={32} color="#27c43c" fill="#c9e7c7" strokeWidth={2} />
  );

  return L.divIcon({
    html: iconHTML,
    className: "temp-marker-icon",
    iconSize: [32, 32],
    iconAnchor: [16, 32],
  });
};
function HeatLayer({ points }) {
  const map = useMap();
  useEffect(() => {
    const heat = L.heatLayer(points, {
      radius: 24,
      blur: 18,
      maxZoom: 17,
      minOpacity: 0.3
    });
    heat.addTo(map);
    return () => {
      map.removeLayer(heat);
    };
  }, [map, points]);
  return null;
}

function MapaPrincipal({ arboles, onSelectArbol, onMapClick, posicionTemporal }) {
  const posicionCentral = [-36.827, -73.050];
  const [zoom, setZoom] = useState(15);
  const heatPoints = useMemo(
    () =>
      arboles.map(a => [
        a.lat,
        a.lng,
        (a.estado || a.estado_actual || '').toLowerCase().includes('malo')
          ? 0.8
          : 0.5
      ]),
    [arboles]
  );

  return (
    <div className="h-full w-full rounded-2xl overflow-hidden shadow-inner border border-slate-200">
      <MapContainer 
        center={posicionCentral} 
        zoom={16} 
        maxZoom={19}
        minZoom={13}
        scrollWheelZoom={true}
        style={{ height: '100%', width: '100%' }}
        whenCreated={(map) => {
          map.on('zoomend', () => setZoom(map.getZoom()));
        }}
      >
        <ClickHandler onClick={onMapClick} /> 
        <LayersControl position="bottomright">
          <LayersControl.BaseLayer checked name="Modo oscuro">
            <TileLayer url="https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png" 
              maxNativeZoom={19} 
              maxZoom={19}/>
          </LayersControl.BaseLayer>
          <LayersControl.BaseLayer name="Modo claro">
            <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" 
              maxNativeZoom={19} 
              maxZoom={19}/>
          </LayersControl.BaseLayer>
          <LayersControl.BaseLayer name="Vista Satelital">
            <TileLayer url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}" 
              maxNativeZoom={19} 
              maxZoom={19}/>
          </LayersControl.BaseLayer>
        </LayersControl>

        {zoom < 15 ? (   //Agrupación de arboles 
          <HeatLayer points={heatPoints} />
        ) : (
          arboles.map((arbol) => (
            <Marker 
              key={arbol.id_arbol} 
              position={[arbol.lat, arbol.lng]} 
              icon={createTreeIcon(arbol.estado || arbol.estado_actual)} 
              eventHandlers={{
                click: () => onSelectArbol(arbol),
              }}
            >
              <Popup>
                <strong>{arbol.nom_arbol}</strong><br/>
                <span style={{color: getColor(arbol.estado || arbol.estado_actual)}}>
                  {arbol.estado || arbol.estado_actual || 'Estado desconocido'}
                </span>
              </Popup>
            </Marker>
          ))
        )}
        {posicionTemporal && (
          <Marker 
            position={[posicionTemporal.lat, posicionTemporal.lng]} 
            icon={createTempIcon()} 
          />
        )}
      </MapContainer>
    </div>
  );
}

export default MapaPrincipal;
