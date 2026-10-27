import React from 'react';
import { Country } from '../types';
import { useLanguage } from '../context/LanguageContext';

interface CountryCardProps {
  country: Country;
  isSelected: boolean;
  onSelect: (country: Country) => void;
}

const CountryCard: React.FC<CountryCardProps> = ({ country, isSelected, onSelect }) => {
  const { getCountryName } = useLanguage();
  const borderClass = isSelected 
    ? 'border-2 border-[#0d1a2e]' 
    : 'border border-gray-200';

  return (
    <div
      onClick={() => onSelect(country)}
      className={`bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer flex items-center ${borderClass}`}
    >
      <img
        src={`https://flagcdn.com/w40/${country.code}.png`}
        alt={`${country.name} flag`}
        className="w-8 h-auto mr-4 rounded-sm shadow-md"
      />
      <div className="flex items-center justify-between w-full">
        <span className="text-gray-800 font-bold text-base">
          {getCountryName(country)} ({country.count})
        </span>
        {country.code === 'co' && (
          <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-[#FFCC00] text-[#D40511] border border-[#D40511]/30 shadow-xs">
            + 5 DHL
          </span>
        )}
      </div>
    </div>
  );
};

export default CountryCard;
