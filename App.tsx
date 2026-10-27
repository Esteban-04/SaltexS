import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Country, User, ServerDetails } from './types';
import { COUNTRIES, DHL_DATA, USER_STORAGE_KEY } from './constants';
import { CLUB_SPECIFIC_DEFAULTS } from './config/serverDefaults';
import CountryCard from './components/CountryCard';
import ClubLocations from './components/ClubLocations';
import FinalSelection from './components/FinalSelection';
import Login from './components/Login';
import AdminDashboard from './components/AdminDashboard';
import { useLanguage } from './context/LanguageContext';
import CodeBackground from './components/CodeBackground';
import BrandCard from './components/BrandCard';
import ServerStatusSummary from './components/ServerStatusSummary';
import MapView from './components/MapView';
import { UserIcon, GlobeIcon, ActivityIcon } from './assets/icons';

interface FlatServer extends ServerDetails {
    club: string;
    country: string;
    countryCode: string;
}

const App: React.FC = () => {
  const { language, setLanguage, t } = useLanguage();
  
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [showAdminDashboard, setShowAdminDashboard] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid');
  const [cloudStatus, setCloudStatus] = useState<'online' | 'offline' | 'checking'>('checking');

  const [selectedBrand, setSelectedBrand] = useState<string | null>(null);
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
  const [selectedClub, setSelectedClub] = useState<string | null>(null);

  const [users, setUsers] = useState<User[]>(() => {
    const requiredUsers: User[] = [
        { name: 'Cesar Correa', username: 'cesar', password: 'S@ltex7509!', role: 'admin', isDisabled: false, allowedCountries: [] },
        { name: 'Nick Pineda', username: 'nick', password: 'S@ltex7509!', role: 'admin', isDisabled: false, allowedCountries: [] },
        { name: 'Gio Vanegas', username: 'gio', password: 'S@ltex7509!', role: 'admin', isDisabled: false, allowedCountries: [] },
        { name: 'Mauricio Salmon', username: 'mauricio', password: 'S@ltex7509!', role: 'admin', isDisabled: false, allowedCountries: [] },
        { name: 'Pablo Estupiñan', username: 'pablo', password: 'S@ltex7509!', role: 'admin', isDisabled: false, allowedCountries: [] },
        { name: 'Cristian Salazar', username: 'csalazar', password: 'S@ltex7509!', role: 'admin', isDisabled: false, allowedCountries: [] },
        { name: 'Cristian Ortega', username: 'cortega', password: 'S@ltex7509!', role: 'admin', isDisabled: false, allowedCountries: [] }
    ];
    try {
      const savedUsers = localStorage.getItem(USER_STORAGE_KEY);
      let initialUsers: User[] = savedUsers ? JSON.parse(savedUsers) : [];
      requiredUsers.forEach(reqUser => {
          const index = initialUsers.findIndex(u => u.username === reqUser.username);
          if (index !== -1) {
              initialUsers[index] = { ...initialUsers[index], name: reqUser.name, password: reqUser.password, role: reqUser.role };
          } else {
              initialUsers.push(reqUser);
          }
      });
      return initialUsers;
    } catch (error) { return requiredUsers; }
  });

  const syncUsersFromCloud = useCallback(async () => {
    try {
        const savedUrl = localStorage.getItem('saltex_backend_url');
        const base = (savedUrl || '').replace(/\/+$/, '') || window.location.origin;
        const res = await fetch(`${base}/api/get-users`).catch(() => null);
        if (res && res.ok && (res.headers.get('content-type') || '').includes('application/json')) {
            const data = await res.json().catch(() => null);
            if (data && data.users && data.users.length > 0) {
                setUsers(data.users);
                localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(data.users));
                setCloudStatus('online');
                if (currentUser) {
                    const updatedMe = data.users.find((u: User) => u.username === currentUser.username);
                    if (updatedMe) setCurrentUser(updatedMe);
                }
                return;
            }
        }
        setCloudStatus('online');
    } catch (e) {
        setCloudStatus('online');
    }
  }, [currentUser]);

  useEffect(() => {
    syncUsersFromCloud();
  }, []);

  useEffect(() => { 
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(users)); 
  }, [users]);

  const handleLoginSuccess = (user: User, isSuperAdmin: boolean) => {
    setIsAuthenticated(true); 
    setIsAdmin(isSuperAdmin); 
    setCurrentUser(user);
    if (isSuperAdmin) setShowAdminDashboard(true);
  };

  const handleLogout = () => {
    setIsAuthenticated(false); 
    setIsAdmin(false); 
    setCurrentUser(null);
    setShowAdminDashboard(false); 
    setSelectedBrand(null); 
    setSelectedCountry(null); 
    setSelectedClub(null);
  };

  const getFilteredCountries = () => {
      const all = COUNTRIES;
      if (isAdmin || (currentUser && currentUser.role === 'admin')) return all;
      if (currentUser && currentUser.allowedCountries && currentUser.allowedCountries.length > 0) {
          return all.filter(c => currentUser.allowedCountries!.includes(c.code));
      }
      return [];
  };

  const visibleCountries = getFilteredCountries();
  const colombia = visibleCountries.find(c => c.code === 'co');
  const otherCountries = visibleCountries.filter(c => c.code !== 'co');

  const hasDhlAccess = isAdmin || (currentUser?.role === 'admin') || currentUser?.allowedCountries?.includes('dhl');
  const hasPriceSmartAccess = visibleCountries.length > 0;
  const canEditServers = isAdmin || (currentUser?.role === 'admin');

  if (!isAuthenticated) return (
      <div className="min-h-screen font-sans flex items-center justify-center p-4 relative overflow-hidden bg-[#0d1a2e]">
        <CodeBackground />
        <Login onLoginSuccess={handleLoginSuccess} users={users} setUsers={setUsers} />
      </div>
  );

  if (showAdminDashboard) return (
        <div className="min-h-screen font-sans flex items-center justify-center p-2 sm:p-4 bg-gray-100">
             <AdminDashboard users={users} setUsers={setUsers} onContinue={() => { setShowAdminDashboard(false); syncUsersFromCloud(); }} onLogout={handleLogout} currentUser={currentUser} />
        </div>
  );

  const renderContent = () => {
    if (!selectedBrand) return (
        <div className="py-8">
          <p className="text-gray-600 mb-10 text-center font-black text-2xl sm:text-3xl uppercase tracking-tighter italic">{t('selectBrandTitle')}</p>
          <div className={`grid ${hasPriceSmartAccess && hasDhlAccess ? 'grid-cols-1 md:grid-cols-2 max-w-3xl' : 'grid-cols-1 max-w-md'} gap-8 mx-auto px-4`}>
            {hasPriceSmartAccess && <BrandCard name="PriceSmart" onClick={() => setSelectedBrand('pricesmart')} className="active:scale-95" />}
            {hasDhlAccess && <BrandCard name="DHL" onClick={() => setSelectedBrand('dhl')} className="active:scale-95" />}
          </div>
        </div>
    );

    if (selectedBrand === 'pricesmart') {
      if (!selectedCountry) return (
        <div>
          <div className="flex flex-col sm:flex-row justify-between items-center mb-10 gap-6 border-b border-gray-100 pb-6">
              <h2 className="text-2xl sm:text-3xl font-black text-gray-800 uppercase tracking-tighter italic">{t('allCountriesTitle')}</h2>
              <div className="flex bg-slate-100 p-1.5 rounded-xl shadow-inner w-full sm:w-auto">
                  <button onClick={() => setViewMode('grid')} className={`flex-1 sm:flex-none px-6 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${viewMode === 'grid' ? 'bg-[#0d1a2e] text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}>{t('toggleViewGrid')}</button>
                  <button onClick={() => setViewMode('map')} className={`flex-1 sm:flex-none px-6 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${viewMode === 'map' ? 'bg-[#0d1a2e] text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}>{t('toggleViewMap')}</button>
              </div>
          </div>
          
          {viewMode === 'grid' ? (
              <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {otherCountries.map(c => <CountryCard key={c.code} country={c} isSelected={false} onSelect={setSelectedCountry} />)}
                  </div>
                  {colombia && <div className="mt-4"><CountryCard country={colombia} isSelected={false} onSelect={setSelectedCountry} /></div>}
              </div>
          ) : (
              <MapView 
                countries={visibleCountries} 
                selectedCountryCode={null} 
                onSelectCountry={setSelectedCountry} 
              />
          )}
          
          <div className="mt-12 text-center">
            <button onClick={() => setSelectedBrand(null)} className="w-full sm:w-auto bg-[#0d1a2e] text-white font-black py-4 px-10 rounded-xl hover:bg-[#1a2b4e] uppercase tracking-widest shadow-lg transition-all active:scale-95">{t('backButton')}</button>
          </div>
        </div>
      );
      if (!selectedClub) return <ClubLocations country={selectedCountry} selectedClub={null} onClubSelect={setSelectedClub} onBack={() => setSelectedCountry(null)} />;
      return <FinalSelection country={selectedCountry} clubName={selectedClub} onBack={() => setSelectedClub(null)} canEdit={canEditServers} />;
    }

    if (selectedBrand === 'dhl') {
      if (!selectedClub) return <ClubLocations country={DHL_DATA} selectedClub={null} onClubSelect={setSelectedClub} onBack={() => setSelectedBrand(null)} />;
      return <FinalSelection country={DHL_DATA} clubName={selectedClub} onBack={() => setSelectedClub(null)} canEdit={canEditServers} />;
    }
    return null;
  };
  
  return (
    <div className="bg-gray-50 min-h-screen font-sans flex flex-col">
       <header className="shadow-xl py-4 bg-[#0d1a2e] sticky top-0 z-[60]">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-4">
                 <h1 className="text-xl md:text-2xl font-black text-white italic tracking-tighter">SALTEX GROUP</h1>
                 {(isAdmin || (currentUser?.role === 'admin')) && (
                   <div className="flex items-center gap-2">
                     <button onClick={() => setShowAdminDashboard(true)} className="text-[10px] bg-blue-600/20 text-blue-400 px-3 py-1 rounded-full border border-blue-500/30 font-black uppercase tracking-widest">{t('adminBadge')}</button>
                     <div className={`w-2 h-2 rounded-full ${cloudStatus === 'online' ? 'bg-green-500 shadow-[0_0_8px_#22c55e]' : cloudStatus === 'checking' ? 'bg-amber-500 animate-pulse' : 'bg-red-500'}`} title={cloudStatus === 'online' ? t('cloudConnected') : t('cloudOffline')}></div>
                   </div>
                 )}
            </div>
            
            <div className="flex items-center gap-2 sm:gap-6 w-full sm:w-auto justify-between sm:justify-end">
                <ServerStatusSummary />
                
                <div className="flex items-center gap-4 border-l border-white/10 pl-4">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full border-2 border-white/20 overflow-hidden bg-slate-800 shadow-inner shrink-0">
                            {currentUser?.avatar ? (
                                <img src={currentUser.avatar} alt="Profile" className="w-full h-full object-cover" />
                            ) : (
                                <UserIcon className="w-full h-full p-2 text-white/40" />
                            )}
                        </div>
                        <div className="hidden lg:flex flex-col">
                            <span className="text-white text-[11px] font-black uppercase leading-none tracking-tight">{currentUser?.name?.split(' ')[0]}</span>
                            <span className="text-blue-400 text-[9px] font-bold uppercase tracking-widest mt-0.5">{currentUser?.role === 'admin' ? t('roleAdmin') : t('roleUser')}</span>
                        </div>
                    </div>

                    <div className="flex items-center text-white text-[10px] font-black bg-white/5 rounded-xl p-1">
                        <button onClick={() => setLanguage('es')} className={`px-2 py-1.5 rounded-lg transition-all ${language === 'es' ? 'bg-white text-[#0d1a2e]' : 'hover:bg-white/10'}`}>ES</button>
                        <button onClick={() => setLanguage('en')} className={`px-2 py-1.5 rounded-lg transition-all ${language === 'en' ? 'bg-white text-[#0d1a2e]' : 'hover:bg-white/10'}`}>EN</button>
                    </div>
                    
                    <button onClick={handleLogout} className="bg-white text-[#0d1a2e] font-black py-2 px-4 rounded-xl shadow-lg hover:bg-gray-100 text-xs uppercase tracking-tighter active:scale-95 transition-all">{t('logoutButton')}</button>
                </div>
            </div>
        </div>
      </header>
      <main className="flex-grow flex items-center justify-center p-3 sm:p-6 lg:p-8">
        <div className={`w-full max-w-5xl mx-auto rounded-2xl shadow-2xl bg-white ${selectedBrand === 'dhl' && !selectedClub ? 'p-0 overflow-hidden border-none' : 'p-5 sm:p-10 border border-gray-100'}`}>
            {renderContent()}
        </div>
      </main>
      <footer className="py-6 text-center text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] bg-white border-t border-gray-100">
          {t('appFooterCopyright')}
      </footer>
    </div>
  );
};

export default App;
