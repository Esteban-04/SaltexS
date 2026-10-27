
export interface Country {
  name: string;
  code: string; // ISO 3166-1 alpha-2 code
  count: number;
  clubs?: string[];
}

// Define a type for our user object
export interface User {
  username: string;
  password: string;
  name?: string;
  avatar?: string; // Base64 encoded image string
  isDisabled?: boolean;
  role?: 'admin' | 'user';
  allowedCountries?: string[]; // Array of country codes
}

export interface ServerDetails {
  id: number;
  name: string;
  ip: string;
  user: string;
  password?: string;
  teamviewerId: string;
  teamviewerPassword?: string;
  status?: 'online' | 'offline' | 'checking'; // Added status field
}
