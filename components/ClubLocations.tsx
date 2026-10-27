import React, { useState } from 'react';
import { Country } from '../types';
import ClubButton from './ClubButton';
import { useLanguage } from '../context/LanguageContext';
import { DHL_HEADER_IMAGE } from '../assets/dhl-header-image';
import { DHL_DATA } from '../constants';
import ColombiaMap from './ColombiaMap';

interface ClubLocationsProps {
  country: Country;
  selectedClub: string | null;
  onClubSelect: (club: string, isDhl?: boolean) => void;
  onBack: () => void;
}

const ClubLocations: React.FC<ClubLocationsProps> = ({
  country,
  selectedClub,
  onClubSelect,
  onBack,
}) => {
  const { t, getCountryName } = useLanguage();
  const isDhl = country.code === 'dhl';
  const isColombia = country.code === 'co';

  const [colombiaView, setColombiaView] = useState<'map' | 'list'>('map');
  const [colombiaFilter, setColombiaFilter] = useState<'all' | 'pricesmart' | 'dhl'>('all');

  if (isDhl) {
    return (
      <div className="relative w-full min-h-[650px] flex flex-col items-center justify-start overflow-hidden rounded-2xl bg-slate-900">
        {/* Background Image for DHL - Optimized for sharpness */}
        <div className="absolute inset-0 z-0">
          <img 
            src={DHL_HEADER_IMAGE} 
            className="w-full h-full object-cover object-center scale-105" 
            alt="DHL Warehouse"
            loading="eager"
          />
          {/* Subtle gradient to ensure text readability without losing image crispness */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/10"></div>
        </div>

        <div className="relative z-10 w-full flex flex-col items-center pt-10 pb-12 px-6">
          <div className="mb-2">
            <h1 className="text-[#D40511] text-4xl sm:text-5xl font-black italic tracking-tighter drop-shadow-[0_2px_10px_rgba(0,0,0,0.3)]">
              DHL GLOBAL
            </h1>
          </div>

          <p className="text-[#D40511] font-black text-lg sm:text-xl mb-10 drop-shadow-[0_2px_5px_rgba(0,0,0,0.3)]">
            {t('selectClubPrompt')}
          </p>

          <div className="grid grid-cols-1 gap-4 w-full max-w-md mx-auto mb-12">
            {country.clubs?.map((clubName) => (
              <button
                key={clubName}
                onClick={() => onClubSelect(clubName, true)}
                className="w-full bg-white text-slate-700 py-4 px-6 rounded-xl font-bold text-lg text-left shadow-[0_10px_25px_rgba(0,0,0,0.2)] hover:bg-slate-50 transition-all active:scale-[0.98] border border-transparent"
              >
                {clubName}
              </button>
            ))}
          </div>

          <button
            onClick={onBack}
            className="bg-[#D40511] hover:bg-[#b0040e] text-white font-black py-4 px-12 rounded-xl shadow-2xl transition-all active:scale-95 uppercase tracking-widest text-sm"
          >
            {t('backButton')}
          </button>
        </div>
      </div>
    );
  }

  // Vista Especial Integrada para Colombia (PriceSmart + DHL)
  if (isColombia) {
    const showPriceSmart = colombiaFilter === 'all' || colombiaFilter === 'pricesmart';
    const showDhl = colombiaFilter === 'all' || colombiaFilter === 'dhl';

    return (
      <div className="relative w-full">
        <div className="relative z-10">
          {/* Encabezado de Colombia con selector de vista y filtros */}
          <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4 border-b border-gray-100 pb-5">
            <div className="flex items-center gap-3">
              <img
                src={`https://flagcdn.com/w40/co.png`}
                alt="Colombia flag"
                className="w-9 h-auto rounded-sm shadow-md"
              />
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-[#0d1a2e] uppercase tracking-tight">
                  {getCountryName(country)}
                </h2>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[11px] font-bold text-sky-600 bg-sky-50 px-2 py-0.5 rounded-full border border-sky-200">
                    10 PriceSmart
                  </span>
                  <span className="text-gray-300">•</span>
                  <span className="text-[11px] font-black text-[#D40511] bg-yellow-100 px-2 py-0.5 rounded-full border border-yellow-300">
                    5 DHL Logistics
                  </span>
                </div>
              </div>
            </div>

            {/* Alternar entre Vista Mapa y Vista Lista */}
            <div className="flex bg-slate-100 p-1.5 rounded-xl shadow-inner w-full sm:w-auto">
              <button
                onClick={() => setColombiaView('map')}
                className={`flex-1 sm:flex-none px-5 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${
                  colombiaView === 'map' ? 'bg-[#0d1a2e] text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                {t('viewModeMap')}
              </button>
              <button
                onClick={() => setColombiaView('list')}
                className={`flex-1 sm:flex-none px-5 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${
                  colombiaView === 'list' ? 'bg-[#0d1a2e] text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                {t('viewModeList')}
              </button>
            </div>
          </div>

          {/* Filtros de Marca: Todos | PriceSmart | DHL */}
          <div className="flex items-center justify-center gap-2 mb-6">
            <button
              onClick={() => setColombiaFilter('all')}
              className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider transition-all ${
                colombiaFilter === 'all'
                  ? 'bg-[#0d1a2e] text-white shadow-md'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {t('colombiaAllSites')} (15)
            </button>
            <button
              onClick={() => setColombiaFilter('pricesmart')}
              className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider transition-all ${
                colombiaFilter === 'pricesmart'
                  ? 'bg-[#0284c7] text-white shadow-md'
                  : 'bg-white text-slate-600 hover:bg-sky-50 border border-slate-200'
              }`}
            >
              PriceSmart (10)
            </button>
            <button
              onClick={() => setColombiaFilter('dhl')}
              className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider transition-all ${
                colombiaFilter === 'dhl'
                  ? 'bg-[#FFCC00] text-[#D40511] font-black border-2 border-[#D40511] shadow-md'
                  : 'bg-white text-[#D40511] hover:bg-yellow-50 border border-yellow-300'
              }`}
            >
              DHL Logistics (5)
            </button>
          </div>

          {/* Contenido: Mapa Interactivo o Lista de Sedes */}
          {colombiaView === 'map' ? (
            <div className="mb-8">
              <ColombiaMap
                onSelectClub={(clubName, isDhlSite) => onClubSelect(clubName, isDhlSite)}
                selectedClub={selectedClub}
                activeFilter={colombiaFilter}
              />
            </div>
          ) : (
            <div className="space-y-6 max-w-2xl mx-auto mb-8">
              {showPriceSmart && (
                <div className="bg-slate-50/80 p-5 rounded-2xl border border-sky-100">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="w-3 h-3 rounded-full bg-[#0284c7]"></span>
                    <h3 className="text-sm font-black text-[#0d1a2e] uppercase tracking-wider">
                      {t('colombiaPriceSmartClubs')} (10)
                    </h3>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {country.clubs?.map((clubName) => (
                      <ClubButton
                        key={clubName}
                        name={clubName}
                        isSelected={selectedClub === clubName}
                        onClick={() => onClubSelect(clubName, false)}
                        isDhl={false}
                      />
                    ))}
                  </div>
                </div>
              )}

              {showDhl && (
                <div className="bg-yellow-50/60 p-5 rounded-2xl border border-yellow-200">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="w-3 h-3 rounded-full bg-[#FFCC00] border border-[#D40511]"></span>
                    <h3 className="text-sm font-black text-[#D40511] uppercase tracking-wider">
                      {t('colombiaDhlHubs')} (5)
                    </h3>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {DHL_DATA.clubs?.map((clubName) => (
                      <ClubButton
                        key={clubName}
                        name={clubName}
                        isSelected={selectedClub === clubName}
                        onClick={() => onClubSelect(clubName, true)}
                        isDhl={true}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="text-center">
            <button
              onClick={onBack}
              className="bg-[#0d1a2e] hover:bg-[#1a2b4e] text-white font-black py-3 px-10 rounded-xl shadow-lg transition-all active:scale-95 uppercase tracking-widest text-xs"
            >
              {t('backButton')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Vista Regular para los demás países
  return (
    <div className="relative w-full">
      <div className="relative z-10">
        <div className="flex justify-center items-center mb-10">
          <div className="flex items-center gap-4">
            <img
              src={`https://flagcdn.com/w40/${country.code}.png`}
              alt={`${country.name} flag`}
              className="w-8 h-auto md:w-10 rounded-sm shadow-md"
            />
            <h2 className="text-xl sm:text-2xl md:text-2xl font-bold text-[#0d1a2e]">
              {getCountryName(country)}
            </h2>
          </div>
        </div>

        <p className="mb-8 text-center font-bold text-lg text-[#0d1a2e]">
          {t('selectClubPrompt')}
        </p>

        <div className="grid grid-cols-1 gap-2.5 max-w-sm sm:max-w-md mx-auto">
          {country.clubs?.map((clubName) => (
            <ClubButton
              key={clubName}
              name={clubName}
              isSelected={selectedClub === clubName}
              onClick={(name) => onClubSelect(name, false)}
              isDhl={false}
            />
          ))}
        </div>
        
        <div className="mt-12 text-center">
          <button
            onClick={onBack}
            className="bg-[#0d1a2e] hover:bg-[#1a2b4e] text-white font-black py-3 px-10 rounded-xl shadow-lg transition-all active:scale-95 uppercase tracking-widest text-xs"
          >
            {t('backButton')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ClubLocations;
