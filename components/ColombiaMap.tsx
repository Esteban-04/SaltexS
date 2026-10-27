import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { REAL_COUNTRY_PATHS } from '../data/mapData';

export interface ColombiaLocation {
  id: string;
  name: string;
  brand: 'pricesmart' | 'dhl';
  city: string;
  department: string;
  x: number;
  y: number;
}

export const COLOMBIA_SITES: ColombiaLocation[] = [
  // --- PriceSmart Clubs (10) ---
  { id: 'ps-baq', name: 'Barranquilla', brand: 'pricesmart', city: 'Barranquilla', department: 'Atlántico', x: 530, y: 364 },
  { id: 'ps-bga', name: 'Bucaramanga - Floridablanca', brand: 'pricesmart', city: 'Bucaramanga / Floridablanca', department: 'Santander', x: 540, y: 422 },
  { id: 'ps-mde-la', name: 'Medellín - Las Américas', brand: 'pricesmart', city: 'Medellín (Las Américas)', department: 'Antioquia', x: 481, y: 433 },
  { id: 'ps-mde-pob', name: 'Medellín - El Poblado', brand: 'pricesmart', city: 'Medellín (El Poblado)', department: 'Antioquia', x: 486, y: 442 },
  { id: 'ps-pei', name: 'Pereira', brand: 'pricesmart', city: 'Pereira', department: 'Risaralda', x: 478, y: 468 },
  { id: 'ps-cal-men', name: 'Cali - Menga', brand: 'pricesmart', city: 'Cali (Menga)', department: 'Valle del Cauca', x: 462, y: 492 },
  { id: 'ps-cal-cg', name: 'Cali - Cañas Gordas', brand: 'pricesmart', city: 'Cali (Cañas Gordas)', department: 'Valle del Cauca', x: 459, y: 504 },
  { id: 'ps-chia', name: 'Chía', brand: 'pricesmart', city: 'Chía', department: 'Cundinamarca', x: 511, y: 460 },
  { id: 'ps-bog-usa', name: 'Bogotá - Usaquén', brand: 'pricesmart', city: 'Bogotá (Usaquén)', department: 'Bogotá D.C.', x: 518, y: 468 },
  { id: 'ps-bog-sal', name: 'Bogotá - Salitre', brand: 'pricesmart', city: 'Bogotá (Salitre)', department: 'Bogotá D.C.', x: 512, y: 474 },

  // --- DHL Logistics Hubs (5) ---
  { id: 'dhl-int', name: 'Intexzona', brand: 'dhl', city: 'Funza / Cundinamarca', department: 'Hub Intexzona', x: 501, y: 469 },
  { id: 'dhl-sc2', name: 'San Carlos II', brand: 'dhl', city: 'Bogotá', department: 'Hub San Carlos II', x: 506, y: 477 },
  { id: 'dhl-easy', name: 'Easy', brand: 'dhl', city: 'Bogotá', department: 'Centro Operativo Easy', x: 514, y: 482 },
  { id: 'dhl-plc', name: 'PLC', brand: 'dhl', city: 'Bogotá', department: 'Centro Logístico PLC', x: 524, y: 474 },
  { id: 'dhl-rionegro', name: 'Rio Negro', brand: 'dhl', city: 'Rionegro', department: 'Hub Aeropuerto JMC / Antioquia', x: 494, y: 438 },
];

interface ColombiaMapProps {
  onSelectClub: (clubName: string, isDhl?: boolean) => void;
  selectedClub: string | null;
  activeFilter: 'all' | 'pricesmart' | 'dhl';
}

const ColombiaMap: React.FC<ColombiaMapProps> = ({
  onSelectClub,
  selectedClub,
  activeFilter,
}) => {
  const { t, language } = useLanguage();
  const [hoveredSite, setHoveredSite] = useState<ColombiaLocation | null>(null);

  const filteredSites = COLOMBIA_SITES.filter(site => {
    if (activeFilter === 'pricesmart') return site.brand === 'pricesmart';
    if (activeFilter === 'dhl') return site.brand === 'dhl';
    return true;
  });

  const colombiaPath = REAL_COUNTRY_PATHS['co'];

  return (
    <div className="relative w-full aspect-[4/3] sm:aspect-[16/10] bg-[#07101d] rounded-2xl overflow-hidden border border-cyan-500/30 shadow-2xl select-none group">
      {/* HUD Superior Informativo */}
      <div className="absolute top-4 left-4 z-20 pointer-events-none">
        <div className="bg-[#0b172a]/95 backdrop-blur-xl px-4 py-2.5 rounded-xl border border-cyan-500/30 shadow-xl">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_10px_#34d399] animate-pulse"></span>
            <h3 className="text-white font-black text-sm sm:text-base tracking-tight uppercase italic">
              {t('colombiaMapTitle')}
            </h3>
          </div>
          <div className="flex items-center gap-2 text-[10px] text-cyan-300 font-bold tracking-wider">
            <span className="text-sky-400">10 PriceSmart</span>
            <span className="text-white/30">•</span>
            <span className="text-amber-400">5 DHL Logistics</span>
          </div>
        </div>
      </div>

      {/* Leyenda Visual de Marcas */}
      <div className="absolute top-4 right-4 z-20 pointer-events-none">
        <div className="bg-[#0b172a]/90 backdrop-blur-md px-3 py-2 rounded-xl border border-white/10 shadow-lg flex flex-col gap-1.5 text-[11px] font-bold">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-[#0284c7] border-2 border-white shadow-sm"></span>
            <span className="text-sky-200">PriceSmart ({COLOMBIA_SITES.filter(s => s.brand === 'pricesmart').length})</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-[#FFCC00] border-2 border-[#D40511] shadow-sm"></span>
            <span className="text-yellow-300 font-black">DHL Logistics ({COLOMBIA_SITES.filter(s => s.brand === 'dhl').length})</span>
          </div>
        </div>
      </div>

      {/* SVG del Mapa de Colombia */}
      <svg
        viewBox="410 330 280 395"
        className="w-full h-full"
      >
        <defs>
          <radialGradient id="colombiaOcean" cx="50%" cy="50%" r="65%">
            <stop offset="0%" stopColor="#0b1b32" />
            <stop offset="60%" stopColor="#071221" />
            <stop offset="100%" stopColor="#030810" />
          </radialGradient>
          <pattern id="coGrid" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(56, 189, 248, 0.05)" strokeWidth="0.5" />
          </pattern>
          <filter id="glowPin" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2.5" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Fondo y Grilla */}
        <rect x="410" y="330" width="280" height="395" fill="url(#colombiaOcean)" />
        <rect x="410" y="330" width="280" height="395" fill="url(#coGrid)" />

        {/* Silueta Territorial de Colombia */}
        {colombiaPath && (
          <path
            d={colombiaPath}
            fill="rgba(14, 165, 233, 0.12)"
            stroke="#38bdf8"
            strokeWidth="1.2"
            style={{
              filter: 'drop-shadow(0 0 12px rgba(56, 189, 248, 0.3))'
            }}
          />
        )}

        {/* Líneas de Red entre Sedes de Colombia */}
        <g stroke="rgba(56, 189, 248, 0.2)" strokeWidth="0.8" strokeDasharray="2 3">
          {/* Troncal Barranquilla - Bucaramanga - Bogotá */}
          <line x1="530" y1="364" x2="540" y2="422" />
          <line x1="540" y1="422" x2="518" y2="468" />
          {/* Troncal Medellín - Rionegro (DHL) - Pereira - Cali */}
          <line x1="481" y1="433" x2="494" y2="438" stroke="#FFCC00" strokeWidth="1" opacity="0.6" />
          <line x1="481" y1="433" x2="478" y2="468" />
          <line x1="478" y1="468" x2="462" y2="492" />
          {/* Red Central Cundinamarca Bogotá (PriceSmart y DHL) */}
          <line x1="511" y1="460" x2="518" y2="468" />
          <line x1="518" y1="468" x2="512" y2="474" />
          <line x1="512" y1="474" x2="501" y2="469" stroke="#FFCC00" strokeWidth="1" opacity="0.6" />
          <line x1="501" y1="469" x2="506" y2="477" stroke="#FFCC00" strokeWidth="1" opacity="0.6" />
          <line x1="506" y1="477" x2="514" y2="482" stroke="#FFCC00" strokeWidth="1" opacity="0.6" />
          <line x1="514" y1="482" x2="524" y2="474" stroke="#FFCC00" strokeWidth="1" opacity="0.6" />
          {/* Conexión Medellín - Bogotá */}
          <line x1="486" y1="442" x2="511" y2="460" />
        </g>

        {/* Marcadores de Sedes (PriceSmart y DHL) */}
        {filteredSites.map((site) => {
          const isDhl = site.brand === 'dhl';
          const isSelected = selectedClub === site.name;
          const isHovered = hoveredSite?.id === site.id;

          const pinColor = isDhl ? '#FFCC00' : '#0284c7';
          const strokeColor = isDhl ? '#D40511' : '#ffffff';
          const pulseColor = isDhl ? '#FFCC00' : '#38bdf8';

          return (
            <g
              key={site.id}
              className="cursor-pointer"
              onClick={() => onSelectClub(site.name, isDhl)}
              onMouseEnter={() => setHoveredSite(site)}
              onMouseLeave={() => setHoveredSite(null)}
            >
              {/* Onda de Radar / Ping */}
              <circle
                cx={site.x}
                cy={site.y}
                r={isHovered || isSelected ? 16 : 9}
                fill={pulseColor}
                className={`transition-all duration-300 ${isHovered || isSelected ? 'opacity-40 animate-ping' : 'opacity-15'}`}
              />

              {/* Pin Exterior */}
              <circle
                cx={site.x}
                cy={site.y}
                r={isHovered ? 6.5 : 4.5}
                fill={pinColor}
                stroke={strokeColor}
                strokeWidth={isDhl ? 1.8 : 1.2}
                className="transition-all duration-200"
                style={{
                  filter: isHovered || isSelected ? 'drop-shadow(0 0 6px currentColor)' : undefined
                }}
              />

              {/* Centro del Pin */}
              <circle
                cx={site.x}
                cy={site.y}
                r={isHovered ? 2.5 : 1.6}
                fill={isDhl ? '#D40511' : '#ffffff'}
              />

              {/* Etiqueta Visual de la Sede */}
              <g transform={`translate(${site.x}, ${site.y})`}>
                <rect
                  x="-28"
                  y={site.y > 480 ? -18 : 8}
                  width="56"
                  height="14"
                  rx="7"
                  fill={isHovered ? (isDhl ? '#FFCC00' : '#0284c7') : '#0b1626'}
                  stroke={isDhl ? '#D40511' : isHovered ? '#38bdf8' : 'rgba(255,255,255,0.25)'}
                  strokeWidth="1"
                  className="transition-colors duration-200 shadow-md"
                />
                <text
                  x="0"
                  y={site.y > 480 ? -9 : 17}
                  textAnchor="middle"
                  className={`font-black text-[7px] tracking-tight pointer-events-none select-none ${
                    isHovered && isDhl ? 'fill-[#D40511]' : isDhl ? 'fill-[#FFCC00]' : 'fill-white'
                  }`}
                >
                  {isDhl ? `DHL ${site.name.slice(0, 7)}` : site.name.slice(0, 9)}
                </text>
              </g>
            </g>
          );
        })}
      </svg>

      {/* Card Flotante al pasar cursor por una Sede */}
      {hoveredSite && (
        <div className="absolute bottom-4 left-4 right-4 sm:left-auto sm:right-4 z-30 pointer-events-auto">
          <div
            onClick={() => onSelectClub(hoveredSite.name, hoveredSite.brand === 'dhl')}
            className={`cursor-pointer bg-[#0b172a]/95 backdrop-blur-2xl p-4 rounded-xl border shadow-2xl flex items-center justify-between gap-4 transition-all duration-200 ${
              hoveredSite.brand === 'dhl' ? 'border-[#FFCC00]/60' : 'border-cyan-400/50'
            }`}
          >
            <div className="flex items-center gap-3">
              {hoveredSite.brand === 'dhl' ? (
                <div className="w-10 h-8 rounded-lg bg-[#FFCC00] border-2 border-[#D40511] font-black italic text-[#D40511] flex items-center justify-center text-xs tracking-tighter shrink-0 shadow-md">
                  DHL
                </div>
              ) : (
                <div className="w-10 h-8 rounded-lg bg-[#0284c7] border-2 border-white font-black italic text-white flex items-center justify-center text-xs tracking-tighter shrink-0 shadow-md">
                  PS
                </div>
              )}
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-white font-black text-sm tracking-tight">
                    {hoveredSite.name}
                  </h4>
                  <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                    hoveredSite.brand === 'dhl'
                      ? 'bg-[#FFCC00] text-[#D40511]'
                      : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                  }`}>
                    {hoveredSite.brand === 'dhl' ? 'DHL LOGISTICS' : 'PRICESMART'}
                  </span>
                </div>
                <p className="text-slate-400 text-[11px] font-medium mt-0.5">
                  {hoveredSite.city} • {hoveredSite.department}
                </p>
              </div>
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                onSelectClub(hoveredSite.name, hoveredSite.brand === 'dhl');
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider shrink-0 transition-all ${
                hoveredSite.brand === 'dhl'
                  ? 'bg-[#FFCC00] text-[#D40511] hover:bg-yellow-400'
                  : 'bg-cyan-500 hover:bg-cyan-400 text-white'
              }`}
            >
              {language === 'en' ? 'Open Site →' : 'Abrir Sede →'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ColombiaMap;
