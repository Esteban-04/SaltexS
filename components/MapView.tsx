import React, { useState, useRef } from 'react';
import { Country } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { REAL_COUNTRY_PATHS, CONTEXT_LAND_PATHS, CALIBRATED_MARKER_POSITIONS } from '../data/mapData';

interface MapViewProps {
  countries: Country[];
  selectedCountryCode: string | null;
  onSelectCountry: (country: Country) => void;
  offlineServers: any[];
  isChecking: boolean;
}

const MapView: React.FC<MapViewProps> = ({ countries, selectedCountryCode, onSelectCountry, offlineServers, isChecking }) => {
  const { t, getCountryName } = useLanguage();
  const [hoveredCountry, setHoveredCountry] = useState<string | null>(null);
  
  // Vista por defecto: América proporcionada y completa
  const [mapFocus, setMapFocus] = useState<'americas' | 'regional'>('americas');
  const [zoom, setZoom] = useState(0.58);
  const [pan, setPan] = useState({ x: 45, y: -30 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    setIsDragging(true);
    dragStartRef.current = { x: e.clientX - pan.x, y: e.clientY - pan.y };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPan({
      x: e.clientX - dragStartRef.current.x,
      y: e.clientY - dragStartRef.current.y
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.25, 3.5));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.25, 0.4));
  
  const handleFocusAmericas = () => {
    setMapFocus('americas');
    setZoom(0.58);
    setPan({ x: 45, y: -30 });
  };

  const handleFocusRegional = () => {
    setMapFocus('regional');
    setZoom(1.05);
    setPan({ x: -20, y: -10 });
  };

  const handleResetView = () => {
    if (mapFocus === 'americas') {
      handleFocusAmericas();
    } else {
      handleFocusRegional();
    }
  };

  const getCountryStatus = (code: string) => {
    if (isChecking) return 'checking';
    const isOffline = offlineServers.some(s => s.countryCode === code || (code === 'dhl' && s.country === 'DHL GLOBAL'));
    return isOffline ? 'offline' : 'online';
  };

  const getOfflineCount = (code: string) => {
    return offlineServers.filter(s => s.countryCode === code || (code === 'dhl' && s.country === 'DHL GLOBAL')).length;
  };

  const getCountryObj = (code: string): Country | null => {
    if (code === 'dhl') {
      return { name: 'DHL GLOBAL', code: 'dhl', count: 5, clubs: ['Intexzona', 'San Carlos II', 'Easy', 'PLC', 'Rio Negro'] };
    }
    return countries.find(c => c.code === code) || null;
  };

  const hoveredObj = hoveredCountry ? getCountryObj(hoveredCountry) : null;

  return (
    <div className="relative w-full aspect-[16/10] sm:aspect-[16/9] bg-[#07101d] rounded-[2rem] overflow-hidden border border-cyan-500/20 shadow-2xl select-none group">
      {/* HUD Superior con Telemetría */}
      <div className="absolute top-5 left-5 z-20 pointer-events-none">
        <div className="bg-[#0b172a]/95 backdrop-blur-xl px-5 py-3 rounded-2xl border border-cyan-500/30 shadow-2xl">
          <div className="flex items-center gap-3 mb-1">
            <div className={`w-3 h-3 rounded-full shadow-[0_0_15px] ${isChecking ? 'bg-amber-400 animate-pulse shadow-amber-400' : 'bg-emerald-400 shadow-emerald-400'}`}></div>
            <h3 className="text-white font-black text-lg sm:text-xl tracking-tight uppercase italic leading-none">
              {isChecking ? t('mapCheckingConnections') : t('mapTitle')}
            </h3>
          </div>
          <div className="flex items-center gap-2.5 text-[10px] text-cyan-300 font-bold tracking-wider">
            <span>{t('mapActiveCountries', countries.length)}</span>
            <span className="text-white/30">•</span>
            <span className="text-slate-400">SOLO AMÉRICA • PROPORCIÓN REAL</span>
          </div>
        </div>
      </div>

      {/* Selector de Enfoque y Controles de Zoom */}
      <div className="absolute top-5 right-5 z-20 flex flex-col items-end gap-2">
        {/* Toggle de Enfoque: Toda América vs Centroamérica & Caribe */}
        <div className="bg-[#0b172a]/95 backdrop-blur-xl p-1.5 rounded-xl border border-cyan-500/30 shadow-2xl flex items-center gap-1.5">
          <button
            onClick={handleFocusAmericas}
            className={`px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider transition-all flex items-center gap-1.5 ${
              mapFocus === 'americas'
                ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/30'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <span>🌎</span>
            <span>Toda América</span>
          </button>
          <button
            onClick={handleFocusRegional}
            className={`px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider transition-all flex items-center gap-1.5 ${
              mapFocus === 'regional'
                ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/30'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <span>📍</span>
            <span>Centroamérica & Caribe</span>
          </button>
        </div>

        {/* Botones de Zoom */}
        <div className="bg-[#0b172a]/90 backdrop-blur-xl p-1.5 rounded-xl border border-white/10 shadow-xl flex flex-col gap-1">
          <button
            onClick={handleZoomIn}
            title={t('mapZoomIn')}
            className="w-8 h-8 rounded-lg bg-white/5 hover:bg-cyan-500/20 text-white hover:text-cyan-300 font-bold flex items-center justify-center transition-all text-base border border-transparent hover:border-cyan-500/40"
          >
            +
          </button>
          <button
            onClick={handleZoomOut}
            title={t('mapZoomOut')}
            className="w-8 h-8 rounded-lg bg-white/5 hover:bg-cyan-500/20 text-white hover:text-cyan-300 font-bold flex items-center justify-center transition-all text-base border border-transparent hover:border-cyan-500/40"
          >
            -
          </button>
          <button
            onClick={handleResetView}
            title={t('mapReset')}
            className="w-8 h-8 rounded-lg bg-white/5 hover:bg-cyan-500/20 text-white hover:text-cyan-300 font-bold flex items-center justify-center transition-all text-[11px] uppercase tracking-tighter border border-transparent hover:border-cyan-500/40"
          >
            ⟲
          </button>
        </div>
      </div>

      {/* SVG del Mapa con Pan y Zoom */}
      <div
        className="w-full h-full cursor-grab active:cursor-grabbing"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <svg
          viewBox="0 0 960 620"
          className="w-full h-full transition-transform duration-75 ease-out"
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transformOrigin: 'center center'
          }}
        >
          <defs>
            <pattern id="radarGridAmericas" width="45" height="45" patternUnits="userSpaceOnUse">
              <path d="M 45 0 L 0 0 0 45" fill="none" stroke="rgba(56, 189, 248, 0.05)" strokeWidth="0.6" />
            </pattern>
            <radialGradient id="oceanGlowAmericas" cx="45%" cy="45%" r="75%">
              <stop offset="0%" stopColor="#0b1b32" />
              <stop offset="60%" stopColor="#071221" />
              <stop offset="100%" stopColor="#030810" />
            </radialGradient>
            <filter id="countryGlowAmericas" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Océano Infinito y Grilla de Radar */}
          <rect x="-3000" y="-3000" width="7000" height="7000" fill="url(#oceanGlowAmericas)" />
          <rect x="-3000" y="-3000" width="7000" height="7000" fill="url(#radarGridAmericas)" />

          {/* Países Continentales de Contexto de las Américas */}
          <g className="context-lands opacity-85">
            {Object.entries(CONTEXT_LAND_PATHS).map(([code, path], idx) => (
              <path
                key={`ctx-land-${code || 'land'}-${idx}`}
                d={path}
                fill="#0d1c31"
                stroke="rgba(255, 255, 255, 0.12)"
                strokeWidth="0.8"
                className="transition-colors duration-200"
              />
            ))}
          </g>

          {/* Troncales de Fibra Óptica y Enlaces de Red entre Sedes */}
          <g stroke="rgba(56, 189, 248, 0.22)" strokeWidth="1" strokeDasharray="3 4">
            {/* Troncal Backbone Miami -> Caribe -> Centroamérica */}
            <line key="link-miami-do" x1="325" y1="-40" x2="606" y2="184" stroke="rgba(56, 189, 248, 0.35)" strokeWidth="1.2" />
            <line key="link-miami-cr" x1="325" y1="-40" x2="294" y2="394" stroke="rgba(56, 189, 248, 0.35)" strokeWidth="1.2" />
            <line key="link-miami-co" x1="325" y1="-40" x2="546" y2="510" stroke="rgba(56, 189, 248, 0.35)" strokeWidth="1.2" />

            {/* Cadena de Centroamérica */}
            <line key="link-gt-sv" x1="154" y1="260" x2="188" y2="306" />
            <line key="link-sv-hn" x1="188" y1="306" x2="240" y2="275" />
            <line key="link-hn-ni" x1="240" y1="275" x2="275" y2="327" />
            <line key="link-ni-cr" x1="275" y1="327" x2="294" y2="394" />
            <line key="link-cr-pa" x1="294" y1="394" x2="387" y2="427" />
            <line key="link-pa-co" x1="387" y1="427" x2="546" y2="510" />

            {/* Arco del Caribe */}
            <line key="link-jm-do" x1="450" y1="202" x2="606" y2="184" />
            <line key="link-do-vi" x1="606" y1="184" x2="733" y2="197" />
            <line key="link-vi-bb" x1="733" y1="197" x2="853" y2="319" />
            <line key="link-bb-tt" x1="853" y1="319" x2="813" y2="383" />
            <line key="link-co-aw" x1="546" y1="510" x2="616" y2="335" />
            <line key="link-aw-tt" x1="616" y1="335" x2="813" y2="383" />

            {/* Rutas DHL Colombia y Enlaces Regionales */}
            <line key="link-dhl-co" x1="495" y1="462" x2="546" y2="510" stroke="#FFCC00" strokeWidth="2" strokeDasharray="3 3" opacity="0.85" />
            <line key="link-dhl-pa" x1="495" y1="462" x2="387" y2="427" stroke="rgba(255, 204, 0, 0.6)" strokeWidth="1.2" strokeDasharray="2 3" />
            <line key="link-dhl-do" x1="495" y1="462" x2="606" y2="184" stroke="rgba(255, 204, 0, 0.6)" strokeWidth="1.2" strokeDasharray="2 3" />
          </g>

          {/* Países Activos del Sistema con Formas Geográficas Exactas */}
          {Object.entries(REAL_COUNTRY_PATHS).map(([code, path], idx) => {
            const isSelected = selectedCountryCode === code;
            const isHovered = hoveredCountry === code;
            const status = getCountryStatus(code);

            let fillColor = 'rgba(14, 165, 233, 0.18)';
            let strokeColor = '#38bdf8';
            let strokeWidth = 1.5;

            if (status === 'offline') {
              fillColor = isHovered ? 'rgba(239, 68, 68, 0.5)' : 'rgba(239, 68, 68, 0.3)';
              strokeColor = '#ef4444';
              strokeWidth = 2;
            } else if (isSelected || isHovered) {
              fillColor = 'rgba(14, 165, 233, 0.45)';
              strokeColor = '#38bdf8';
              strokeWidth = 2.5;
            }

            return (
              <path
                key={`real-country-${code || 'item'}-${idx}`}
                d={path}
                className="transition-all duration-200 cursor-pointer"
                style={{
                  fill: fillColor,
                  stroke: strokeColor,
                  strokeWidth: strokeWidth,
                  filter: isHovered || isSelected ? 'drop-shadow(0 0 12px rgba(56, 189, 248, 0.65))' : undefined
                }}
                onMouseEnter={() => setHoveredCountry(code)}
                onMouseLeave={() => setHoveredCountry(null)}
                onClick={(e) => {
                  e.stopPropagation();
                  const country = getCountryObj(code);
                  if (country) onSelectCountry(country);
                }}
              />
            );
          })}

          {/* Marcadores y Pines Geográficos Calibrados */}
          {Object.entries(CALIBRATED_MARKER_POSITIONS).map(([code, pos], idx) => {
            const isHovered = hoveredCountry === code;
            const isSelected = selectedCountryCode === code;
            const status = getCountryStatus(code);
            const offlineCount = getOfflineCount(code);
            const country = getCountryObj(code);
            const count = country ? country.count : 0;
            const isDhl = code === 'dhl';

            return (
              <g
                key={`marker-group-${code || 'marker'}-${idx}`}
                className="cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  if (country) onSelectCountry(country);
                }}
                onMouseEnter={() => setHoveredCountry(code)}
                onMouseLeave={() => setHoveredCountry(null)}
              >
                {/* Aura de pulso de radar */}
                <circle
                  cx={pos.x}
                  cy={pos.y}
                  r={status === 'offline' ? 32 : isHovered ? 28 : 18}
                  fill={status === 'offline' ? '#ef4444' : isDhl ? '#FFCC00' : status === 'checking' ? '#f59e0b' : '#38bdf8'}
                  className={`transition-all duration-500 ${isHovered || isSelected || status === 'offline' ? 'opacity-35 animate-ping' : 'opacity-10'}`}
                />

                {/* Pin exterior */}
                <circle
                  cx={pos.x}
                  cy={pos.y}
                  r={isHovered ? 12 : 9}
                  className="transition-all duration-200"
                  fill={status === 'offline' ? '#ef4444' : isDhl ? '#FFCC00' : status === 'checking' ? '#f59e0b' : '#0284c7'}
                  stroke={isDhl ? '#D40511' : '#ffffff'}
                  strokeWidth={isDhl ? '3' : '2.5'}
                />

                {/* Núcleo interior */}
                <circle
                  cx={pos.x}
                  cy={pos.y}
                  r={isHovered ? 5 : 4}
                  fill={isDhl ? '#D40511' : '#ffffff'}
                />

                {/* Badge con Bandera / Código y Conteo de Sedes */}
                <g transform={`translate(${pos.x}, ${pos.y})`}>
                  <rect
                    x={isDhl ? -38 : -34}
                    y={pos.y > 450 ? -32 : 14}
                    width={isDhl ? 76 : 68}
                    height="20"
                    rx="10"
                    fill={isDhl ? '#FFCC00' : isHovered ? '#0284c7' : '#0b1626'}
                    stroke={isDhl ? '#D40511' : isHovered ? '#38bdf8' : status === 'offline' ? '#ef4444' : 'rgba(255,255,255,0.25)'}
                    strokeWidth={isDhl ? '2' : '1.5'}
                    className="transition-colors duration-200 shadow-md"
                  />
                  <text
                    x="0"
                    y={pos.y > 450 ? -18 : 28}
                    textAnchor="middle"
                    className={`font-black text-[10px] tracking-tight pointer-events-none select-none ${
                      isDhl ? 'fill-[#D40511]' : 'fill-white'
                    }`}
                  >
                    {isDhl ? `DHL (5)` : `${code.toUpperCase()} (${count})`}
                  </text>
                </g>

                {/* Contador de fallos si hay offline */}
                {status === 'offline' && (
                  <text
                    x={pos.x}
                    y={pos.y > 450 ? -36 : -18}
                    textAnchor="middle"
                    className="fill-red-400 text-[10px] font-black uppercase tracking-tighter"
                  >
                    {t('mapFailures', offlineCount)}
                  </text>
                )}
              </g>
            );
          })}
        </svg>
      </div>

      {/* Tarjeta Flotante Informativa al pasar el cursor */}
      {hoveredObj && (
        <div className="absolute top-5 right-20 z-30 pointer-events-auto max-w-sm">
          <div
            onClick={() => onSelectCountry(hoveredObj)}
            className={`cursor-pointer bg-[#0b172a]/95 backdrop-blur-2xl p-4 rounded-2xl border shadow-2xl flex items-center gap-4 hover:scale-105 transition-all duration-200 ${
              hoveredObj.code === 'dhl' ? 'border-[#FFCC00]/60' : 'border-cyan-400/50'
            }`}
          >
            {hoveredObj.code === 'dhl' ? (
              <div className="w-12 h-9 rounded-lg shadow-md shrink-0 bg-[#FFCC00] border-2 border-[#D40511] flex items-center justify-center font-black italic text-[#D40511] text-sm tracking-tighter">
                DHL
              </div>
            ) : (
              <div className="w-12 h-9 overflow-hidden rounded-lg shadow-md shrink-0 border border-white/20 bg-black/20">
                <img
                  src={`https://flagcdn.com/w80/${hoveredObj.code}.png`}
                  className="w-full h-full object-cover"
                  alt=""
                />
              </div>
            )}
            <div>
              <div className="flex items-center gap-2">
                <p className="text-white font-black text-sm uppercase tracking-wide leading-none">
                  {hoveredObj.code === 'dhl' ? 'DHL COLOMBIA' : getCountryName(hoveredObj)}
                </p>
                <span className={`font-extrabold text-[10px] px-2 py-0.5 rounded-full border ${
                  hoveredObj.code === 'dhl'
                    ? 'bg-[#FFCC00]/20 text-yellow-300 border-[#FFCC00]/30'
                    : 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30'
                }`}>
                  {hoveredObj.count} {hoveredObj.count === 1 ? t('mapLocationSingular') : t('mapLocationPlural')}
                </span>
              </div>
              <div className="flex items-center gap-2 mt-1.5">
                <span className={`w-2 h-2 rounded-full ${getCountryStatus(hoveredObj.code) === 'offline' ? 'bg-red-500 animate-ping' : 'bg-emerald-400'}`}></span>
                <p className={`${getCountryStatus(hoveredObj.code) === 'offline' ? 'text-red-400' : 'text-emerald-400'} font-bold text-[11px] tracking-wide`}>
                  {getCountryStatus(hoveredObj.code) === 'offline'
                    ? t('mapServersDown', getOfflineCount(hoveredObj.code))
                    : t('mapVpnOk')}
                </p>
              </div>
              <p className="text-cyan-400 text-[10px] font-bold mt-1">
                {hoveredObj.code === 'dhl' ? 'Intexzona • San Carlos II • Easy • PLC • Rio Negro' : t('mapClickToOpen')}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Barra Inferior de Acceso Rápido a Todos los Países */}
      <div className="absolute bottom-3 left-4 right-4 z-20 pointer-events-auto">
        <div className="bg-[#07111e]/90 backdrop-blur-md p-2 rounded-xl border border-white/10 flex items-center gap-2 overflow-x-auto scrollbar-none">
          <span className="text-white/40 text-[10px] font-black uppercase tracking-wider pl-2 shrink-0">
            {t('mapSitesBarLabel')}
          </span>
          {countries.map((c, idx) => (
            <button
              key={`quick-bar-${c.code || c.name || idx}`}
              onClick={() => onSelectCountry(c)}
              onMouseEnter={() => setHoveredCountry(c.code)}
              onMouseLeave={() => setHoveredCountry(null)}
              className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                hoveredCountry === c.code
                  ? 'bg-cyan-500 text-white shadow-md shadow-cyan-500/30 scale-105'
                  : 'bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white'
              }`}
            >
              <img
                src={`https://flagcdn.com/w40/${c.code}.png`}
                alt=""
                className="w-4 h-3 object-cover rounded-xs"
              />
              <span>{getCountryName(c)}</span>
              <span className="text-[10px] opacity-75 font-black">({c.count})</span>
            </button>
          ))}

          {/* Botón directo para DHL Colombia */}
          <button
            onClick={() => onSelectCountry(getCountryObj('dhl')!)}
            onMouseEnter={() => setHoveredCountry('dhl')}
            onMouseLeave={() => setHoveredCountry(null)}
            className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              hoveredCountry === 'dhl'
                ? 'bg-[#FFCC00] text-[#D40511] shadow-md shadow-yellow-500/30 scale-105 font-black'
                : 'bg-[#FFCC00]/20 text-yellow-300 hover:bg-[#FFCC00]/30 hover:text-yellow-100 border border-[#FFCC00]/30'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-[#FFCC00] animate-pulse"></span>
            <span>DHL Colombia</span>
            <span className="text-[10px] font-black">(5)</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default MapView;