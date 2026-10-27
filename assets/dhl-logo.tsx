
import React from 'react';

export const DhlLogo: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    viewBox="0 0 400 60"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <g fill="#D40511">
      {/* Las 3 líneas de la izquierda */}
      <rect x="0" y="25" width="40" height="3" />
      <rect x="0" y="35" width="40" height="3" />
      <rect x="0" y="45" width="40" height="3" />
      
      {/* Letras DHL (simplificadas pero efectivas para el estilo) */}
      <path d="M60 10 L140 10 L135 25 L105 25 L100 40 L130 40 L125 55 L55 55 Z" /> {/* D */}
      <path d="M150 10 L180 10 L175 25 L195 25 L200 10 L230 10 L215 55 L185 55 L190 40 L170 40 L165 55 L135 55 Z" /> {/* H */}
      <path d="M240 10 L270 10 L260 40 L300 40 L295 55 L225 55 Z" /> {/* L */}

      {/* Las 3 líneas de la derecha */}
      <rect x="320" y="25" width="60" height="3" />
      <rect x="320" y="35" width="60" height="3" />
      <rect x="320" y="45" width="60" height="3" />
    </g>
  </svg>
);
