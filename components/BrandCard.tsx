
import React from 'react';

interface BrandCardProps {
  name: string;
  onClick: () => void;
  className?: string;
}

const BrandCard: React.FC<BrandCardProps> = ({ name, onClick, className }) => {
  const lowerCaseName = name.toLowerCase();
  
  let backgroundClass = 'bg-white';
  let textClass = 'text-gray-800';
  let hoverBorderClass = 'hover:border-[#0d1a2e]';
  let fontStyling = 'font-bold text-2xl tracking-wide';

  // Check brands
  const isDhl = lowerCaseName.includes('dhl');
  const isPriceSmart = lowerCaseName.includes('pricesmart');

  if (isDhl) {
    backgroundClass = 'bg-[#FFCC00]';
    hoverBorderClass = 'hover:border-[#D40511]';
  } else if (isPriceSmart) {
    backgroundClass = 'bg-[#0d1a2e]';
    textClass = 'text-white';
    hoverBorderClass = 'hover:border-white';
    // Updated styling to match the screenshot: Large, bold, mixed case (PriceSmart)
    fontStyling = 'font-bold text-5xl tracking-normal';
  }

  return (
    <div
      onClick={onClick}
      className={`${backgroundClass} p-6 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer flex flex-col items-center justify-center text-center ${hoverBorderClass} ${className ?? 'border-2 border-transparent'}`}
      style={{ minHeight: '200px' }}
    >
      {isDhl ? (
        <img 
          src="https://www.dhl.com/content/dam/dhl/global/core/images/logos/dhl-logo.svg" 
          alt="DHL Logo" 
          className="w-48 md:w-64 h-auto object-contain"
        />
      ) : (
        <span className={`${textClass} ${fontStyling}`}>
          {name}
        </span>
      )}
    </div>
  );
};

export default BrandCard;
