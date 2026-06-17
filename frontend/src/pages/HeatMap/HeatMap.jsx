import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet';
import { api } from '../../utils/api';
import s from './HeatMap.module.css';
import 'leaflet/dist/leaflet.css';

function getHeatColor(temp) {
  if (temp >= 44) return '#991B1B';
  if (temp >= 42) return '#DC2626';
  if (temp >= 40) return '#EF4444';
  if (temp >= 38) return '#F59E0B';
  if (temp >= 36) return '#FBBF24';
  return '#3B82F6';
}

function getGreenColor(pct) {
  if (pct >= 30) return '#15803D';
  if (pct >= 20) return '#22C55E';
  if (pct >= 10) return '#86EFAC';
  return '#FCA5A5';
}

function getDensityColor(density) {
  if (density >= 20000) return '#7C3AED';
  if (density >= 12000) return '#A78BFA';
  if (density >= 6000) return '#C4B5FD';
  return '#E9D5FF';
}

const LAYERS = {
  heat: { label: 'Heat', colorFn: (z) => getHeatColor(z.surface_temperature) },
  green: { label: 'Green Cover', colorFn: (z) => getGreenColor(z.green_cover_pct) },
  density: { label: 'Population', colorFn: (z) => getDensityColor(z.population_density) },
};

export default function HeatMap() {
  const [zones, setZones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedZone, setSelectedZone] = useState(null);
  const [activeLayer, setActiveLayer] = useState('heat');

  useEffect(() => {
    async function load() {
      try {
        const data = await api.getHeatmap();
        setZones(data);
      } catch (err) {
        console.error('Failed to load heatmap:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return <div className={s.loading}>Loading heat map data...</div>;
  }

  const center = zones.length > 0
    ? [zones.reduce((s, z) => s + z.latitude, 0) / zones.length,
       zones.reduce((s, z) => s + z.longitude, 0) / zones.length]
    : [17.41, 78.47];

  const colorFn = LAYERS[activeLayer].colorFn;

  return (
    <div className={s.page}>
      <div className={s.pageHeader}>
        <div>
          <h1 className={s.pageTitle}>Urban Heat Map</h1>
          <p className={s.pageSubtitle}>
            Interactive visualization of {zones.length} zones · Click a zone for details
          </p>
        </div>
        <div className={s.controls}>
          {Object.entries(LAYERS).map(([key, layer]) => (
            <button
              key={key}
              className={`${s.layerBtn} ${activeLayer === key ? s.layerBtnActive : ''}`}
              onClick={() => setActiveLayer(key)}
            >
              {layer.label}
            </button>
          ))}
        </div>
      </div>

      <div className={s.mapContainer}>
        <MapContainer
          center={center}
          zoom={12}
          style={{ width: '100%', height: '100%' }}
          zoomControl={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/">OSM</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {zones.map((zone) => (
            <CircleMarker
              key={zone.zone_id}
              center={[zone.latitude, zone.longitude]}
              radius={Math.max(12, zone.area_sqkm * 1.5)}
              pathOptions={{
                fillColor: colorFn(zone),
                color: '#0F172A',
                weight: 1.5,
                opacity: 0.8,
                fillOpacity: 0.7,
              }}
              eventHandlers={{
                click: () => setSelectedZone(zone),
              }}
            >
              <Popup>
                <strong>{zone.zone_name}</strong><br />
                Temp: {zone.surface_temperature}°C<br />
                Green: {zone.green_cover_pct}%
              </Popup>
            </CircleMarker>
          ))}
        </MapContainer>

        {/* Legend */}
        <div className={s.legend}>
          <div className={s.legendTitle}>
            {activeLayer === 'heat' ? 'Surface Temperature' : activeLayer === 'green' ? 'Green Cover' : 'Population Density'}
          </div>
          <div className={s.legendScale}>
            {activeLayer === 'heat' && (
              <>
                <div className={s.legendBlock} style={{ background: '#3B82F6' }} />
                <div className={s.legendBlock} style={{ background: '#FBBF24' }} />
                <div className={s.legendBlock} style={{ background: '#F59E0B' }} />
                <div className={s.legendBlock} style={{ background: '#EF4444' }} />
                <div className={s.legendBlock} style={{ background: '#DC2626' }} />
                <div className={s.legendBlock} style={{ background: '#991B1B' }} />
              </>
            )}
            {activeLayer === 'green' && (
              <>
                <div className={s.legendBlock} style={{ background: '#FCA5A5' }} />
                <div className={s.legendBlock} style={{ background: '#86EFAC' }} />
                <div className={s.legendBlock} style={{ background: '#22C55E' }} />
                <div className={s.legendBlock} style={{ background: '#15803D' }} />
              </>
            )}
            {activeLayer === 'density' && (
              <>
                <div className={s.legendBlock} style={{ background: '#E9D5FF' }} />
                <div className={s.legendBlock} style={{ background: '#C4B5FD' }} />
                <div className={s.legendBlock} style={{ background: '#A78BFA' }} />
                <div className={s.legendBlock} style={{ background: '#7C3AED' }} />
              </>
            )}
          </div>
          <div className={s.legendLabels}>
            <span>{activeLayer === 'heat' ? '< 36°C' : activeLayer === 'green' ? '< 10%' : '< 6K'}</span>
            <span>{activeLayer === 'heat' ? '> 44°C' : activeLayer === 'green' ? '> 30%' : '> 20K'}</span>
          </div>
        </div>

        {/* Detail Panel */}
        {selectedZone && (
          <div className={s.detailPanel}>
            <button className={s.detailClose} onClick={() => setSelectedZone(null)}>✕</button>
            <div className={s.detailTitle}>{selectedZone.zone_name}</div>
            <div className={s.detailZoneId}>{selectedZone.zone_id}</div>
            <div className={s.detailGrid}>
              <div className={s.detailItem}>
                <span className={s.detailLabel}>Temperature</span>
                <span className={s.detailValue}>{selectedZone.surface_temperature}°C</span>
              </div>
              <div className={s.detailItem}>
                <span className={s.detailLabel}>Green Cover</span>
                <span className={s.detailValue}>{selectedZone.green_cover_pct}%</span>
              </div>
              <div className={s.detailItem}>
                <span className={s.detailLabel}>Population</span>
                <span className={s.detailValue}>{selectedZone.population_density?.toLocaleString()}</span>
              </div>
              <div className={s.detailItem}>
                <span className={s.detailLabel}>Trees</span>
                <span className={s.detailValue}>{selectedZone.tree_count?.toLocaleString()}</span>
              </div>
              <div className={s.detailItem}>
                <span className={s.detailLabel}>Building Density</span>
                <span className={s.detailValue}>{selectedZone.building_density}</span>
              </div>
              <div className={s.detailItem}>
                <span className={s.detailLabel}>Area</span>
                <span className={s.detailValue}>{selectedZone.area_sqkm} km²</span>
              </div>
            </div>
            <span className={`${s.riskBadge} ${
              selectedZone.heat_risk_score > 65 ? s.riskHigh :
              selectedZone.heat_risk_score > 45 ? s.riskMedium : s.riskLow
            }`}>
              Risk Score: {selectedZone.heat_risk_score}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
