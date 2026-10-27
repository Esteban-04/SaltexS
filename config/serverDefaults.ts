
import { ServerDetails } from '../types';

// Helper function to easily define a server in the configuration list below.
// Usage: s(ID, IP, User, Password, TV_ID, TV_Pass)
const s = (
    id: number, 
    ip: string, 
    user: string = 'administrator', 
    password: string = 'Completeview!', 
    tvId: string = '', 
    tvPass: string = ''
): ServerDetails => ({
    id,
    name: `SERVER_${String(id).padStart(2, '0')}`,
    ip,
    user,
    password,
    teamviewerId: tvId,
    teamviewerPassword: tvPass,
    status: 'checking' // Default initial status
});

// ==================================================================================
// CONFIGURACIÓN DE SERVIDORES
// ==================================================================================

export const CLUB_SPECIFIC_DEFAULTS: Record<string, ServerDetails[]> = {
  // --- COLOMBIA ---
  'Barranquilla': [
      s(1, '192.168.11.10','administrator','Completeview!','1 626 036 641','@l3ss21++' ),
      s(2, '192.168.11.20','administrator','Completeview!','703 111 643','@l3ss21++'),
      s(3, '192.168.11.30','administrator','Completeview!','1 870 758 357','@l3ss21++'),
  ],
  'Cali - Cañas Gordas': [
      s(1, '192.168.12.10','administrator','Completeview!','1 279 617 762','@l3ss21++'),
      s(2, '192.168.12.20','administrator','Completeview!','1 289 199 790','@l3ss21++'),
  ],
  'Cali - Menga': [
      s(1, '192.168.13.10','administrator','Completeview!','1 623 109 087','@l3ss21++'),
      s(2, '192.168.13.20','administrator','Completeview!','307 986 008','@l3ss21++'),
  ],
  'Pereira': [
      s(1, '192.168.14.10','administrator','Completeview!','281 044 494','@l3ss21++'),
      s(2, '192.168.14.20','administrator','Completeview!','1 341 818 303','@l3ss21++'),
      s(3, '192.168.14.40','administrator','Completeview!','1 183 061 146','@l3ss21++'),
  ],
  'Bogotá - Salitre': [
      s(1, '192.168.15.10','administrator','Completeview!','N/A','N/A'),
      s(2, '192.168.15.20','administrator','Completeview!','1 228 790 199','@l3ss21++'),
      s(3, '192.168.15.30','administrator','Completeview!','478 973 430','@l3ss21++'),
      s(4, '192.168.15.40','administrator','Completeview!','211 163 822','@l3ss21++'),
  ],
  'Medellín - Las Américas': [
      s(1, '192.168.16.10','administrator','Completeview!','1 631 576 176','@l3ss21++'),
      s(2, '192.168.16.20','administrator','Completeview!','1 631 554 728','@l3ss21++'),
  ],
  'Chía': [
      s(1, '192.168.17.10','admin','Completeview!','1 264 471 565','@l3ss21++'),
      s(2, '192.168.17.20','SALIENT','Completeview!','1 272 871 782','@l3ss21++'),
      s(3, '192.168.17.30','administrador','Completeview!','1 272 896 646','@l3ss21++'),
      s(4, '192.168.17.40','administrator','Completeview!','1 396 635 647','@l3ss21++'),
      s(5, '192.168.17.60','administrator','Completeview!','1 407 994 534','@l3ss21++'),
  ],
  'Bogotá - Usaquén': [
      s(1, '192.168.18.10','administrador','Completeview!','674 654 075','@l3ss21++'),
      s(2, '192.168.18.20','administrator','Completeview!','1626036641','@l3ss21++'),
      s(3, '192.168.18.30','administrator','Completeview!','1 173 879 373','@l3ss21++'),
  ],
  'Bucaramanga - Floridablanca': [
      s(1, '192.168.19.10','administrator','Completeview!','985 234 209','@l3ss21++'),
      s(2, '192.168.19.20','administrator','Completeview!','1 060 623 534','@l3ss21++'),
      s(3, '192.168.19.30','administrator','Completeview!','1 747 628 156','@l3ss21++'),
  ],
  'Medellín - El Poblado': [
      s(1, '192.168.101.10','admin','Completeview!@','278 758 567','@l3ss21++'),
      s(2, '192.168.101.20','administrator','Completeview!@','269 870 231','@l3ss21++'),
  ],

  // --- DHL ---
  'Intexzona': [
      s(1, '192.168.205.10','administrator','Completeview!','1626036641','@l3ss21++'),
      s(2, '192.168.205.20','administrator','Completeview!','1626036641','@l3ss21++'),
  ],
  'San Carlos II': [
      s(1, '192.168.202.10','administrator','Completeview!','1626036641','@l3ss21++'),
      s(2, '192.168.202.20','administrator','Completeview!','1626036641','@l3ss21++'),
  ],
  'Easy': [
      s(1, '192.168.203.10','administrator','Completeview!','1626036641','@l3ss21++'),
  ],
  'PLC': [
       s(1, '192.168.201.10','administrator','Completeview!','1626036641','@l3ss21++'),
       s(2, '192.168.201.20','administrator','Completeview!','1626036641','@l3ss21++'),
  ],
  'Rio Negro': [
       s(1, '192.168.204.10','administrator','Completeview!','1626036641','@l3ss21++'),
  ],

  // --- COSTA RICA ---
  'Escazú': [
      s(1, '192.168.51.10', 'administrator', 'Completeview!', '1 626 036 641', '@l3ss21++'),
      s(2, '192.168.51.20', 'administrator', 'Completeview!', '1 626 036 642', '@l3ss21++'),
      s(3, '192.168.51.30', 'administrator', 'Completeview!', '1 626 036 643', '@l3ss21++'),
  ],
  'Zapote': [
      s(1, '192.168.52.10', 'administrator', 'Completeview!', '1 626 036 644', '@l3ss21++'),
      s(2, '192.168.52.20', 'administrator', 'Completeview!', '1 626 036 645', '@l3ss21++'),
  ],
  'Heredia': [
      s(1, '192.168.53.10', 'administrator', 'Completeview!', '1 626 036 646', '@l3ss21++'),
      s(2, '192.168.53.20', 'administrator', 'Completeview!', '1 626 036 647', '@l3ss21++'),
  ],
  'Llorente': [
      s(1, '192.168.54.10', 'administrator', 'Completeview!', '1 626 036 648', '@l3ss21++'),
      s(2, '192.168.54.20', 'administrator', 'Completeview!', '1 626 036 649', '@l3ss21++'),
  ],
  'Alajuela': [
      s(1, '192.168.55.10', 'administrator', 'Completeview!', '1 626 036 650', '@l3ss21++'),
      s(2, '192.168.55.20', 'administrator', 'Completeview!', '1 626 036 651', '@l3ss21++'),
  ],
  'Tres Ríos': [
      s(1, '192.168.56.10', 'administrator', 'Completeview!', '1 626 036 652', '@l3ss21++'),
      s(2, '192.168.56.20', 'administrator', 'Completeview!', '1 626 036 653', '@l3ss21++'),
  ],
  'cr_Santa Ana': [
      s(1, '192.168.57.10', 'administrator', 'Completeview!', '1 626 036 654', '@l3ss21++'),
      s(2, '192.168.57.20', 'administrator', 'Completeview!', '1 626 036 655', '@l3ss21++'),
  ],
  'Liberia': [
      s(1, '192.168.58.10', 'administrator', 'Completeview!', '1 626 036 656', '@l3ss21++'),
      s(2, '192.168.58.20', 'administrator', 'Completeview!', '1 626 036 657', '@l3ss21++'),
  ],
  'Cartago': [
      s(1, '192.168.1.10', 'administrator', 'Completeview!', '1 626 036 658', '@l3ss21++'),
      s(2, '192.168.1.20', 'administrator', 'Completeview!', '1 626 036 659', '@l3ss21++'),
      s(3, '192.168.1.30', 'administrator', 'Completeview!', '1 626 036 660', '@l3ss21++'),
  ],
  'San Carlos': [
      s(1, '192.168.59.10', 'administrator', 'Completeview!', '1 626 036 661', '@l3ss21++'),
      s(2, '192.168.59.20', 'administrator', 'Completeview!', '1 626 036 662', '@l3ss21++'),
  ],

  // --- EL SALVADOR ---
  'Santa Elena': [ 
      s(1, '192.168.71.10','administrator','Completeview!','621 522 823','@l3ss21++'), 
      s(2, '192.168.71.20','administrator','Completeview!','682 498 803','@l3ss21++'),
      s(3, '192.168.71.30','administrator','Completeview!','N/A','@l3ss21++'),
      s(4, '192.168.71.40','admin','NULL','N/A','NULL'),
  ],
  'Los Héroes': [ 
      s(1, '192.168.72.10','administrator','Completeview!','1 237 968 588','@l3ss21++'), 
      s(2, '192.168.72.20','administrator','Completeview!','1 236 510 034','@l3ss21++'),
      s(3, '192.168.72.30','administrator','Completeview!','N/A','N/A'), 
  ],
  'San Miguel': [ 
      s(1, '192.168.73.10','administrator','Completeview!@','628 215 335','@l3ss21++'),
      s(2, '192.168.73.20','administrator','Completeview!@','629 849 271','@l3ss21++'),
 ],
  'Santa Ana': [ 
      s(1, '192.168.74.10','Server 1 6704','Completeview!@','N/A','N/A'),
      s(2, '192.168.74.20','Server 2 6704','Completeview!@','611 752 548','@l3ss21++'),
   ],

  // --- GUATEMALA ---
  'Pradera': [ 
      s(1, '192.168.33.10','administrador','Completeview!@','N/A','N/A'), 
      s(2, '192.168.33.20','administrator','Completeview!','1626036641','@l3ss21++'),
      s(3, '192.168.33.30','administrador','Completeview!','1626036641','@l3ss21++'), 
  ],
  'Fraijanes': [ 
      s(1, '192.168.34.10','administrador','Completeview!','N/A','N/A'), 
      s(2, '192.168.34.20','administrador','Completeview!','N/A','N/A'),
      s(3, '192.168.34.30','administrador','Completeview!','N/A','N/A'), 
  ],
  'San Cristóbal': [ 
      s(1, '192.168.35.10','administrador','Completeview!','N/A','N/A'), 
      s(2, '192.168.35.20','administrador','Completeview!','1 364 504 927','@l3ss21++'),
  ],
  'Aranda': [ 
      s(1, '192.168.36.10','admin','Seg-6306','1626036641','@l3ss21++'), 
      s(2, '192.168.36.20','admin','Seg-6306','1626036641','@l3ss21++'),
  ],
  'Escuintla': [ 
      s(1, '192.168.37.10','administrador','Completeview!@','1626036641','@l3ss21++'), 
      s(2, '192.168.37.20','administrador','Completeview!@','1626036641','@l3ss21++'),
  ],

  // --- HONDURAS ---
  'Florencia': [ 
      s(1, '192.168.62.10','administrator','Completeview!','1626036641','@l3ss21++'),
      s(2, '192.168.62.20','administrator','Completeview!','1626036641','@l3ss21++'),
      s(3, '192.168.62.93','','!','','@l3ss21++'),
      s(4, '192.168.62.50','administrator','Completeview!','1626036641','@l3ss21++'),
   ],
  'San Pedro Sula': [ 
      s(1, '192.168.63.30','','Completeview!','1626036641','@l3ss21++'),
      s(2, '192.168.63.20','','Completeview!','1626036641','@l3ss21++'),
      s(3, '192.168.63.10','','Completeview!','1626036641','@l3ss21++'),
   ],
  'El Sauce':  [ 
      s(1, '192.168.64.10','administrator','Completeview!','1626036641','@l3ss21++'),
      s(2, '192.168.64.20','administrator','Completeview!','1626036641','@l3ss21++'),
   ],

  // --- NICARAGUA ---
  'Managua': [ 
      s(1, '192.168.91.10','administrator','Completeview!','1626036641','@l3ss21++'),
      s(2, '192.168.91.20','administrator','Completeview!','1626036641','@l3ss21++'),
      s(3, '192.168.91.30','administrator','Completeview!','1626036641','@l3ss21++'),
   ],
  'Masaya': [ 
      s(1, '192.168.92.10','administrator','Completeview!','1626036641','@l3ss21++'),
      s(2, '192.168.92.20','administrator','Completeview!','1626036641','@l3ss21++'),
   ],
  // --- PANAMA ---
  'Vía Brasil': [ 
      s(1, '192.168.20.10','administrator','Completeview!','1626036641','@l3ss21++'),
      s(2, '192.168.20.20','administrator','Completeview!','1626036641','@l3ss21++'),
      s(3, '192.168.20.30','administrator','Completeview!','1626036641','@l3ss21++'),
      s(4, '192.168.20.40','administrator','Completeview!','1626036641','@l3ss21++'),
   ],
  'El Dorado':  [ 
      s(1, '192.168.23.10','administrator','Completeview!','1626036641','@l3ss21++'),
      s(2, '192.168.23.20','administrator','Completeview!','1626036641','@l3ss21++'),
      s(3, '192.168.23.13','administrator','Completeview!','1626036641','@l3ss21++'),
   ],
  'David': [ 
      s(1, '192.168.24.10','administrator','Completeview!','1626036641','@l3ss21++'),
      s(2, '192.168.24.20','administrator','Completeview!','1626036641','@l3ss21++'),
      s(3, '192.168.24.30','administrator','Completeview!','1626036641','@l3ss21++'),
   ],
  'Brisas': [ 
      s(1, '192.168.25.10','administrator','Completeview!','1626036641','@l3ss21++'),
      s(2, '192.168.25.20','administrator','Completeview!','1626036641','@l3ss21++'),
      s(3, '192.168.25.30','administrator','Completeview!','1626036641','@l3ss21++'),
      s(4, '192.168.25.40','administrator','Completeview!','1626036641','@l3ss21++'),
   ],
  'Costa Verde': [ 
      s(1, '192.168.26.10','administrator','Completeview!','1626036641','@l3ss21++'),
      s(2, '192.168.26.20','administrator','Completeview!','1626036641','@l3ss21++'),
   ],
  'Santiago de Veraguas': [ 
      s(1, '192.168.27.10','administrator','Completeview!','1626036641','@l3ss21++'),
      s(2, '192.168.27.20','administrator','Completeview!','1626036641','@l3ss21++'),
      s(3, '192.168.27.30','administrator','Completeview!','1626036641','@l3ss21++'),
   ],
  'Metro Park': [ 
      s(1, '192.168.28.10','administrator','Completeview!','1626036641','@l3ss21++'),
      s(2, '192.168.28.20','administrator','Completeview!','1626036641','@l3ss21++'),
      s(3, '192.168.28.30','administrator','Completeview!','1626036641','@l3ss21++'),
   ],

  // --- ARUBA ---
  'Oranjestad': [ s(1, '192.168.1.10'), s(2, '192.168.1.20'), s(3, '192.168.1.30') ],

  // --- BARBADOS ---
  'St. Michaels': [ 
      s(1, '192.168.85.10','administrator','Completeview!','1626036641','@l3ss21++'),
      s(2, '192.168.85.20','administrator','Completeview!','1626036641','@l3ss21++'),
   ],

  // --- DOMINICAN REPUBLIC ---
  'Los Prados': [ 
      s(1, '192.168.61.10','admin','S@ltex7509!','1626036641','@l3ss21++'),
      s(2, '192.168.61.20','admin','S@ltex7509!','1626036641','@l3ss21++'),
      s(3, '192.168.61.30','admin','S@ltex7509!','1626036641','@l3ss21++'),
      s(4, '192.168.61.40','admin','S@ltex7509!','1626036641','@l3ss21++'),
   ],
  'Santiago': [ 
      s(1, '192.168.168.10','administrador','S@ltex7509!','1626036641','@l3ss21++'),
      s(2, '192.168.168.20','administrador','S@ltex7509!','1626036641','@l3ss21++'),
      s(3, '192.168.168.30','administrador','S@ltex7509!','1626036641','@l3ss21++'),
      s(4, '192.168.168.40','administrador','S@ltex7509!','1626036641','@l3ss21++'),
   ],
  'Arroyo Hondo':  [ 
      s(1, '192.168.84.10','administrador','Completeview!','1626036641','@l3ss21++'),
      s(2, '192.168.84.20','administrador','Completeview!','1626036641','@l3ss21++'),
      s(3, '192.168.84.30','administrador','Completeview!','1626036641','@l3ss21++'),
   ],
  'San Isidro': [ 
      s(1, '192.168.185.10','administrador','Completeview!','1626036641','@l3ss21++'),
      s(2, '192.168.185.20','administrador','Completeview!','1626036641','@l3ss21++'),
      s(3, '192.168.185.30','administrador','Completeview!','1626036641','@l3ss21++'),
   ],
  'Bolívar': [ 
      s(1, '192.168.138.10','administrador','S@ltex7509!','1626036641','@l3ss21++'),
      s(2, '192.168.138.20','administrador','S@ltex7509!','1626036641','@l3ss21++'),
      s(3, '192.168.138.30','administrador','S@ltex7509!','1626036641','@l3ss21++'),
      s(4, '192.168.138.40','administrador','S@ltex7509!','1626036641','@l3ss21++'),
   ],

  // --- JAMAICA ---
  'Kingston': [ 
      s(1, '192.168.171.10','administrator','Completeview!','1626036641','@l3ss21++'),
      s(2, '192.168.171.20','administrator','Completeview!','1626036641','@l3ss21++'),
      s(3, '192.168.171.30','administrator','Completeview!','1626036641','@l3ss21++'),
      s(4, '192.168.171.40','administrator','Completeview!','1626036641','@l3ss21++'),
   ],
  'Portmore':  [ 
      s(1, '192.168.172.10','salient','Completeview!','1626036641','@l3ss21++'),
      s(2, '192.168.172.20','vivotek','Completeview!','1626036641','@l3ss21++'),
      s(3, '192.168.172.30','vivotek','vivotek!','1626036641','@l3ss21++'),
   ],
  'Montego Bay': [
      s(1, '192.168.173.10','administrator','Completeview!','1626036641','@l3ss21++'),
      s(2, '192.168.173.20','administrator','Completeview!','1626036641','@l3ss21++'),
      s(3, '192.168.173.30','administrator','Completeview!','1626036641','@l3ss21++'),
   ],
  'South Camp': [
      s(1, '192.168.174.10','administrator','Completeview!','1626036641','@l3ss21++'),
      s(2, '192.168.174.20','administrator','Completeview!','1626036641','@l3ss21++'),
   ],

  // --- TRINIDAD & TOBAGO ---
  'Chaguanas': [ 
      s(1, '192.168.81.10','administrator','Completeview!','1626036641','@l3ss21++'),
      s(2, '192.168.81.20','administrator','Completeview!','1626036641','@l3ss21++'),
   ],
  'Port of Spain': [ 
      s(1, '192.168.82.10','administrator','Completeview!','1626036641','@l3ss21++'),
      s(2, '192.168.82.20','administrator','Completeview!','1626036641','@l3ss21++'),
   ],
  'Mausica': [ 
      s(1, '192.168.183.10','administrator','Completeview!','1626036641','@l3ss21++'),
      s(2, '192.168.183.20','administrator','Completeview!','1626036641','@l3ss21++'),
   ],
  'San Fernando': [ 
      s(1, '192.168.184.10','administrator','Completeview!','1626036641','@l3ss21++'),
      s(2, '192.168.184.20','administrator','Completeview!','1626036641','@l3ss21++'),
   ],

  // --- VIRGIN ISLANDS ---
  'St. Thomas': [ 
      s(1, '192.168.201.10','administrator','Completeview!','1626036641','@l3ss21++'),
   ],
};
