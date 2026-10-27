import React from 'react';

interface ClubButtonProps {
  name: string;
  isSelected: boolean;
  onClick: (name: string) => void;
  isDhl?: boolean;
}

const ClubButton: React.FC<ClubButtonProps> = ({ name, isSelected, onClick, isDhl = false }) => {
  const baseClasses = "w-full text-left px-5 py-3.5 rounded-lg border-2 transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-1 text-base sm:text-lg tracking-tight";
  
  // Dynamic classes based on brand
  const focusRingClass = isDhl ? "focus:ring-[#D40511]" : "focus:ring-[#3b82f6]";
  
  let stateClasses = "";

  if (isSelected) {
    // Selected State
    if (isDhl) {
      stateClasses = "bg-[#D40511] text-white border-[#D40511] font-bold shadow-sm";
    } else {
      stateClasses = "bg-[#2563eb] text-white border-[#2563eb] font-bold shadow-sm";
    }
  } else {
    // Unselected State - Match exact screenshot format: white bg, blue-300 border, navy bold text
    if (isDhl) {
      stateClasses = "bg-white text-gray-800 border-gray-200 hover:border-[#D40511] hover:bg-red-50/20 font-bold shadow-sm";
    } else {
      stateClasses = "bg-white text-[#0f2d59] border-[#93c5fd] hover:border-[#2563eb] hover:bg-blue-50/40 font-bold shadow-sm";
    }
  }

  return (
    <button
      onClick={() => onClick(name)}
      className={`${baseClasses} ${focusRingClass} ${stateClasses}`}
    >
      {name}
    </button>
  );
};

export default ClubButton;