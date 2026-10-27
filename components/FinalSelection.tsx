import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Country, ServerDetails } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { XIcon, SearchIcon, EyeIcon, EyeOffIcon, SaveIcon, PlusIcon, TrashIcon, ActivityIcon, CopyIcon } from '../assets/icons';
import { CLUB_SPECIFIC_DEFAULTS } from '../config/serverDefaults';

interface CameraData {
  id: number;
  name: string;
  ip: string;
  manufacturer: string;
  user: string;
  password: string;
  compression: string;
}

interface FinalSelectionProps {
  country: Country;
  clubName: string;
  onBack: () => void;
  canEdit: boolean;
}

const MonitorIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 17.25v1.007a3 3 0 0 1-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0 1 15 18.257V17.25m6-12V15a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 15V5.25m18 0A2.25 2.25 0 0 0 18.75 3H5.25A2.25 2.25 0 0 0 3 5.25m18 0V12a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 12V5.25" />
  </svg>
);

const TVIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21 3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
  </svg>
);

const FinalSelection: React.FC<FinalSelectionProps> = ({ country, clubName, onBack, canEdit }) => {
  const { t } = useLanguage();
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [serverToDelete, setServerToDelete] = useState<number | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [visiblePasswords, setVisiblePasswords] = useState<Record<string, boolean>>({});
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [servers, setServers] = useState<ServerDetails[]>([]);
  const [cameras, setCameras] = useState<CameraData[]>([]);

  // Referencias para evitar bucles de efectos
  const isVerifyingRef = useRef(false);
  const serversRef = useRef<ServerDetails[]>([]);
  
  // Sincronizar la referencia con el estado de servidores
  useEffect(() => {
    serversRef.current = servers;
  }, [servers]);

  const isDhl = country.code === 'dhl' || ['Intexzona', 'San Carlos II', 'Easy', 'PLC', 'Rio Negro'].includes(clubName);
  const effectiveCountryCode = isDhl ? 'dhl' : country.code;
  const configKey = `config_${effectiveCountryCode}_${clubName.replace(/[^a-zA-Z0-9]/g, '_')}`;
  
  const getBackendUrl = () => {
    const saved = localStorage.getItem('saltex_backend_url');
    return (saved && saved.trim() !== '') ? saved : window.location.origin;
  };

  const checkServerStatus = useCallback(async (isManual = false, serverListOverride?: ServerDetails[]) => {
    // Usar la lista proporcionada o la actual de la referencia
    const listToProcess = serverListOverride || serversRef.current;
    
    // Evitar concurrencia
    if (isVerifyingRef.current || listToProcess.length === 0) return;
    
    isVerifyingRef.current = true;
    setIsVerifying(true);
    
    const backendUrl = getBackendUrl();

    try {
        const cloudRes = await fetch(`${backendUrl}/api/check-status`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ servers: listToProcess.map(s => ({ id: s.id, ip: s.ip })) })
        });
        
        if (cloudRes.ok) {
            const cloudData = await cloudRes.json();
            setServers(currentServers => {
                return currentServers.map(s => {
                    const res = cloudData.results.find((r: any) => r.ip === s.ip);
                    return { ...s, status: res ? (res.status as ServerDetails['status']) : 'offline' };
                });
            });
            if (isManual) showSuccess(t('saveSuccess'));
        }
    } catch (error) {
        console.error("Cloud check error:", error);
    } finally {
        isVerifyingRef.current = false;
        setIsVerifying(false);
    }
  }, [t]);

  const loadCloudData = useCallback(async () => {
    const backendUrl = getBackendUrl();
    try {
        const response = await fetch(`${backendUrl}/api/get-config/${configKey}`);
        let loadedServers: ServerDetails[] = [];
        
        if (!response.ok) throw new Error("Invalid response");
        const data = await response.json();
        
        if (data.servers && data.servers.length > 0) {
            loadedServers = data.servers.map((s: any) => ({ ...s, status: 'checking' as const }));
            setCameras(data.cameras || []);
        } else {
            const defaults = CLUB_SPECIFIC_DEFAULTS[`${effectiveCountryCode}_${clubName}`] || CLUB_SPECIFIC_DEFAULTS[clubName] || [];
            loadedServers = defaults.map(s => ({ ...s, status: 'checking' as const }));
            setCameras([]);
        }
        setServers(loadedServers);
        // Disparar chequeo inicial
        checkServerStatus(false, loadedServers);
    } catch (e) {
        const defaults = CLUB_SPECIFIC_DEFAULTS[`${effectiveCountryCode}_${clubName}`] || CLUB_SPECIFIC_DEFAULTS[clubName] || [];
        const defaultServers = defaults.map(s => ({ ...s, status: 'checking' as const }));
        setServers(defaultServers);
        checkServerStatus(false, defaultServers);
    }
  }, [effectiveCountryCode, clubName, configKey, checkServerStatus]);

  useEffect(() => { loadCloudData(); }, [loadCloudData]);

  // Temporizador estable de 10 segundos
  useEffect(() => {
    const timer = setInterval(() => {
      // Solo verificamos si no estamos ya en proceso (isVerifyingRef lo maneja internamente)
      checkServerStatus(false);
    }, 10000);
    
    return () => clearInterval(timer);
  }, [checkServerStatus]);

  const handleSave = async (updatedServers?: ServerDetails[]) => {
    if (!canEdit) return;
    const backendUrl = getBackendUrl();
    try {
        await fetch(`${backendUrl}/api/save-config`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ key: configKey, servers: updatedServers || servers, cameras })
        });
        showSuccess(t('saveSuccess'));
    } catch (e) { showSuccess("Error"); }
  };

  const handleServerFieldChange = (serverId: number, field: keyof ServerDetails, value: string) => {
    setServers(prev => prev.map(s => s.id === serverId ? { ...s, [field]: value } : s));
  };

  const handleCopyId = (serverId: number, idText: string) => {
    if (!idText || idText === 'N/A') return;
    navigator.clipboard.writeText(idText).then(() => {
        setCopiedId(serverId);
        setTimeout(() => setCopiedId(null), 2000);
    });
  };

  const showSuccess = (message: string) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  const toggleVisibility = (e: React.MouseEvent, key: string) => {
    e.stopPropagation();
    setVisiblePasswords(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleAddServer = () => {
      const newId = servers.length > 0 ? Math.max(...servers.map(s => s.id)) + 1 : 1;
      const newName = `${t('serverNamePrefix')} ${String(newId).padStart(2, '0')}`;
      const updated: ServerDetails[] = [...servers, { id: newId, name: newName, ip: '', user: 'administrator', password: 'Completeview!', teamviewerId: '', teamviewerPassword: '', status: 'checking' }];
      setServers(updated);
      handleSave(updated);
  };

  const confirmDeleteServer = () => { 
      if (serverToDelete !== null) { 
          const updated = servers.filter(s => s.id !== serverToDelete);
          setServers(updated); 
          setServerToDelete(null); 
          handleSave(updated);
      } 
  };

  const inputStyle = "bg-transparent border-none text-white focus:ring-1 focus:ring-blue-500/30 rounded px-1 transition-all outline-none w-full placeholder-white/10";

  return (
    <div className="w-full flex flex-col items-center relative px-2 py-2 bg-transparent">
      {successMessage && <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[200] bg-green-500 text-white px-8 py-4 rounded-2xl shadow-2xl font-black animate-bounce text-sm uppercase">{successMessage}</div>}
      
      {/* Header with Title and Verify Button aligned as in the screenshot */}
      <div className="w-full max-w-6xl flex justify-between items-center mb-8 px-4">
        <div className="flex-1"></div> {/* Spacer for symmetry */}
        
        <div className="flex flex-col items-center justify-center text-center">
          {isDhl ? (
            <div className="flex items-center gap-5">
               <span className="text-[#D40511] text-3xl sm:text-5xl font-black italic tracking-tighter">DHL GLOBAL</span>
               <h2 className="text-3xl sm:text-5xl font-black text-[#00172f] tracking-tighter leading-none">{clubName.toUpperCase()}</h2>
            </div>
          ) : (
            <div className="flex items-center gap-3">
                <img src={`https://flagcdn.com/w80/${country.code}.png`} className="h-6 sm:h-8 rounded-sm shadow-sm" alt="Flag" />
                <h2 className="text-3xl sm:text-4xl font-black text-[#0d1a2e] tracking-tight uppercase italic">{clubName}</h2>
            </div>
          )}
        </div>

        <div className="flex-1 flex justify-end">
          <button 
            onClick={() => checkServerStatus(true)} 
            disabled={isVerifying} 
            className={`flex items-center gap-2 bg-white border border-slate-200 px-5 py-2.5 rounded-xl shadow-sm transition-all group ${isVerifying ? 'opacity-70 cursor-wait' : 'hover:bg-slate-50'}`}
          >
            <ActivityIcon className={`w-4 h-4 text-slate-400 group-hover:text-blue-500 ${isVerifying ? 'animate-spin text-blue-500' : ''}`} />
            <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest whitespace-nowrap">
                {isVerifying ? t('statusChecking') : t('checkStatusButton')}
            </span>
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-6xl px-4">
        {servers.map((server, index) => {
            const isOddTotal = servers.length % 2 !== 0;
            const isFirstAndOdd = index === 0 && isOddTotal;
            const serverTitle = server.name.toUpperCase().replace('SERVER', t('serverNamePrefix')).replace('SERVIDOR', t('serverNamePrefix')).replace('_', ' ');

            return (
                <div key={server.id} className={`group bg-[#0d1a2e] rounded-2xl p-6 text-white shadow-xl relative border border-white/5 transition-all duration-300 ${isFirstAndOdd ? 'md:col-span-2' : ''}`}>
                    <div className="absolute top-5 left-5">
                        <div className={`flex items-center gap-2 px-3 py-1 rounded-lg border ${server.status === 'online' ? 'bg-green-600/20 border-green-500/30 text-green-400' : server.status === 'checking' ? 'bg-blue-600/20 border-blue-500/30 text-blue-400' : 'bg-red-600/20 border-red-500/30 text-red-400'}`}>
                            <div className={`w-2 h-2 rounded-full ${server.status === 'online' ? 'bg-green-400 shadow-[0_0_8px_#4ade80]' : server.status === 'checking' ? 'bg-blue-400 animate-pulse' : 'bg-red-400 shadow-[0_0_8px_#f87171]'}`}></div>
                            <span className="text-[9px] font-black tracking-widest uppercase">{server.status === 'online' ? t('statusOnline') : server.status === 'checking' ? t('statusChecking') : t('statusOffline')}</span>
                        </div>
                    </div>

                    {canEdit && (
                        <button onClick={(e) => { e.stopPropagation(); setServerToDelete(server.id); }} className="absolute top-5 right-5 text-slate-600 hover:text-red-400 transition-colors">
                            <TrashIcon className="w-5 h-5" />
                        </button>
                    )}
                    
                    <div className="mt-8">
                        <div className="text-center mb-6">
                            <input value={serverTitle} onChange={(e) => handleServerFieldChange(server.id, 'name', e.target.value)} readOnly={!canEdit} className="text-lg font-black uppercase tracking-[0.2em] text-white/90 bg-transparent border-none text-center focus:ring-0 w-full outline-none" />
                            <div className="w-full h-px bg-white/5 mt-4"></div>
                        </div>

                        <div className={`space-y-6 ${isFirstAndOdd ? 'grid md:grid-cols-2 md:gap-x-12 md:space-y-0' : ''}`}>
                            <div className="space-y-4">
                                <div className="flex items-center gap-2 text-slate-500"><MonitorIcon className="w-4 h-4" /><span className="text-[10px] font-black uppercase tracking-widest leading-none">{t('remoteDesktopLabel')}</span></div>
                                <div className="pl-6 space-y-2">
                                    <input value={server.ip || ''} onChange={(e) => handleServerFieldChange(server.id, 'ip', e.target.value)} readOnly={!canEdit} placeholder="192.168.0.1" className={`${inputStyle} text-2xl font-black tracking-tight`} />
                                    <div className="flex items-center gap-2"><span className="text-[10px] text-slate-500 font-bold uppercase shrink-0">{t('userLabel')}</span><input value={server.user || ''} onChange={(e) => handleServerFieldChange(server.id, 'user', e.target.value)} readOnly={!canEdit} className={`${inputStyle} text-sm font-bold`} /></div>
                                    <div className="flex items-center justify-between gap-2">
                                        <div className="flex items-center gap-2 w-full"><span className="text-[10px] text-slate-500 font-bold uppercase shrink-0">{t('finalPasswordLabel')}</span><input type={visiblePasswords[`srv_${server.id}_p`] ? 'text' : 'password'} value={server.password || ''} onChange={(e) => handleServerFieldChange(server.id, 'password', e.target.value)} readOnly={!canEdit} className={`${inputStyle} text-sm font-bold tracking-widest`} /></div>
                                        <button onClick={(e) => toggleVisibility(e, `srv_${server.id}_p`)} className="text-slate-600 hover:text-white transition-colors">{visiblePasswords[`srv_${server.id}_p`] ? <EyeOffIcon className="h-4 h-4" /> : <EyeIcon className="h-4 h-4" />}</button>
                                    </div>
                                </div>
                            </div>
                            <div className={`space-y-4 pt-6 border-t border-white/5 ${isFirstAndOdd ? 'md:pt-0 md:border-t-0 md:border-l md:pl-10' : ''}`}>
                                <div className="flex items-center gap-2 text-slate-500"><TVIcon className="w-4 h-4" /><span className="text-[10px] font-black uppercase tracking-widest leading-none">{t('teamviewerLabel')}</span></div>
                                <div className="pl-6 space-y-2">
                                    <div className="flex items-center justify-between gap-2 group/copy">
                                        <div className="flex items-center gap-2 w-full">
                                          <span className="text-[10px] text-slate-500 font-bold uppercase shrink-0">{t('idLabel')}</span>
                                          <input 
                                            value={server.teamviewerId || ''} 
                                            onChange={(e) => handleServerFieldChange(server.id, 'teamviewerId', e.target.value)} 
                                            readOnly={!canEdit} 
                                            placeholder="000 000 000" 
                                            className={`${inputStyle} text-xl font-black tracking-tight`} 
                                          />
                                        </div>
                                        <div className="flex items-center gap-2 relative">
                                          {copiedId === server.id && (
                                            <span className="absolute -top-8 right-0 bg-blue-500 text-white text-[9px] font-black px-2 py-1 rounded-md shadow-xl animate-bounce uppercase">{t('copiedLabel')}</span>
                                          )}
                                          <button 
                                            onClick={() => handleCopyId(server.id, server.teamviewerId)} 
                                            className={`p-1.5 rounded-lg transition-all ${copiedId === server.id ? 'bg-blue-500/20 text-blue-400' : 'text-slate-600 hover:text-blue-400 hover:bg-white/5'}`}
                                            title={t('copyTeamviewerIdTooltip')}
                                          >
                                            <CopyIcon className="w-4 h-4" />
                                          </button>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between gap-2">
                                        <div className="flex items-center gap-2 w-full"><span className="text-[10px] text-slate-500 font-bold uppercase shrink-0">{t('finalPasswordLabel')}</span><input type={visiblePasswords[`srv_${server.id}_tv`] ? 'text' : 'password'} value={server.teamviewerPassword || ''} onChange={(e) => handleServerFieldChange(server.id, 'teamviewerPassword', e.target.value)} readOnly={!canEdit} className={`${inputStyle} text-sm font-bold tracking-widest`} /></div>
                                        <button onClick={(e) => toggleVisibility(e, `srv_${server.id}_tv`)} className="text-slate-600 hover:text-white transition-colors">{visiblePasswords[`srv_${server.id}_tv`] ? <EyeOffIcon className="h-4 h-4" /> : <EyeIcon className="h-4 h-4" />}</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            );
        })}
      </div>

      <div className="mt-12 mb-8 w-full max-w-4xl flex flex-wrap gap-4 justify-center px-4">
        <button onClick={onBack} className="w-full sm:w-48 bg-white text-[#0d1a2e] border-2 border-slate-200 font-black py-3 rounded-xl shadow-lg hover:bg-slate-50 transition-all uppercase tracking-widest text-[10px]">{t('backButton')}</button>
        
        {canEdit && (
            <>
                <button onClick={handleAddServer} className="w-full sm:w-56 bg-blue-600 text-white font-black py-3 rounded-xl shadow-xl hover:bg-blue-700 transition-all flex items-center justify-center text-[10px] uppercase tracking-widest gap-2"><PlusIcon className="w-4 h-4" />{t('addServerButton')}</button>
                <button onClick={() => handleSave()} className="w-full sm:w-48 bg-[#0d1a2e] text-white font-black py-3 rounded-xl shadow-xl hover:bg-slate-800 transition-all flex items-center justify-center text-[10px] uppercase tracking-widest gap-2"><SaveIcon className="w-4 h-4" />{t('saveButton')}</button>
            </>
        )}
      </div>

      {serverToDelete !== null && (
          <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
              <div className="bg-white rounded-xl shadow-2xl w-full max-w-[320px] overflow-hidden text-center relative border border-slate-100 flex flex-col">
                  <div className="h-1 bg-red-600 w-full absolute top-0 left-0"></div>
                  <div className="p-8 flex flex-col items-center">
                    <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mb-4"><TrashIcon className="w-8 h-8 text-red-500" /></div>
                    <h3 className="text-xl font-bold text-slate-800 mb-2">{t('deleteServerModalTitle')}</h3>
                    <p className="text-slate-500 text-sm leading-relaxed px-6">{t('deleteServerConfirm')}</p>
                  </div>
                  <div className="flex border-t border-slate-50 mt-4">
                      <button onClick={() => setServerToDelete(null)} className="flex-1 py-4 bg-slate-50 text-slate-600 font-bold text-sm hover:bg-slate-100 transition-all border-r border-slate-100">{t('noButton')}</button>
                      <button onClick={confirmDeleteServer} className="flex-1 py-4 bg-red-600 text-white font-bold text-sm hover:bg-red-700 transition-all">{t('yesButton')}</button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

export default FinalSelection;
