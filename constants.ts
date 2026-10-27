
import { Country } from './types';

export const USER_STORAGE_KEY = 'saltex_users_v2';

// The list of countries to be displayed.
// Note: Colombia is placed at the end to be handled specially in the UI layout.
export const COUNTRIES: Country[] = [
  { 
    name: 'Costa Rica', 
    code: 'cr', 
    count: 10, 
    clubs: [
      'Escazú',
      'Zapote',
      'Heredia',
      'Llorente',
      'Alajuela',
      'Tres Ríos',
      'Santa Ana',
      'Liberia',
      'Cartago',
      'San Carlos'
    ] 
  },
  { name: 'El Salvador', code: 'sv', count: 4, clubs: ['Santa Elena', 'Los Héroes', 'San Miguel', 'Santa Ana'] },
  { name: 'Guatemala', code: 'gt', count: 6, clubs: ['Miraflores', 'Pradera', 'Fraijanes', 'San Cristóbal', 'Aranda', 'Escuintla'] },
  { name: 'Honduras', code: 'hn', count: 3, clubs: ['Florencia', 'San Pedro Sula', 'El Sauce'] },
  { name: 'Nicaragua', code: 'ni', count: 2, clubs: ['Managua', 'Masaya'] },
  { name: 'Panamá', code: 'pa', count: 7, clubs: ['Vía Brasil', 'El Dorado', 'David', 'Brisas', 'Costa Verde', 'Santiago de Veraguas', 'Metro Park'] },
  { name: 'Aruba', code: 'aw', count: 1, clubs: ['Oranjestad'] },
  { name: 'Barbados', code: 'bb', count: 1, clubs: ['St. Michaels'] },
  { name: 'Dominican Republic', code: 'do', count: 5, clubs: ['Los Prados', 'Santiago', 'Arroyo Hondo', 'San Isidro', 'Bolívar'] },
  { name: 'Jamaica', code: 'jm', count: 4, clubs: ['Kingston', 'Portmore', 'Montego Bay', 'South Camp'] },
  { name: 'Trinidad & Tobago', code: 'tt', count: 4, clubs: ['Chaguanas', 'Port of Spain', 'Mausica', 'San Fernando'] },
  { name: 'Virgin Islands', code: 'vi', count: 1, clubs: ['St. Thomas'] },
  { 
    name: 'Colombia', 
    code: 'co', 
    count: 10, 
    clubs: [
      'Barranquilla', 
      'Cali - Cañas Gordas',
      'Cali - Menga', 
      'Pereira', 
      'Bogotá - Salitre', 
      'Medellín - Las Américas', 
      'Chía', 
      'Bogotá - Usaquén', 
      'Bucaramanga - Floridablanca', 
      'Medellín - El Poblado'
    ] 
  },
];

export const DHL_DATA: Country = {
  name: 'DHL GLOBAL',
  code: 'dhl', // Special code for DHL
  count: 5,
  clubs: ['Intexzona', 'San Carlos II', 'Easy', 'PLC', 'Rio Negro'],
};
