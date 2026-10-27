
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { COUNTRIES, DHL_DATA } from '../constants';
import { CLUB_SPECIFIC_DEFAULTS } from '../config/serverDefaults';
import { ServerDetails } from '../types';
import { XIcon, GlobeIcon, ActivityIcon, TrashIcon } from '../assets/icons';
import { useLanguage } from '../context/LanguageContext';

interface FlatServer extends ServerDetails {
    club: string;
    country: string;
    countryCode: string;
}

interface CountryStatus {
    name: string;
    code: string;
    total: number;
    offline: number;
    clubs: {
        name: string;
        offlineCount: number;
        totalInClub: number;
    }[];
}

interface StatusReport {
    id: string;
    timestamp: string;
    total: number;
    online: number;
    offline: number;
    offlineList: { club: string, country: string, name: string, ip: string }[];
    percentage: string;
}

const FileTextIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
    </svg>
);

const ServerStatusSummary: React.FC = () => {
    const { t, getCountryName } = useLanguage();
    const [allServers, setAllServers] = useState<FlatServer[]>([]);
    const [offlineServers, setOfflineServers] = useState<FlatServer[]>([]);
    const [checking, setChecking] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [lastUpdated, setLastUpdated] = useState<string>('');
    const [reports, setReports] = useState<StatusReport[]>([]);
    const checkingRef = useRef(false);

    const getBackendUrl = () => {
        const saved = localStorage.getItem('saltex_backend_url');
        return (saved && saved.trim() !== '') ? saved : window.location.origin;
    };

    const checkGlobalStatus = useCallback(async (isManual = false) => {
        if (checkingRef.current && !isManual) return;
        checkingRef.current = true;
        setChecking(true);
        const backendUrl = getBackendUrl();
        
        try {
            const cloudRes = await fetch(`${backendUrl}/api/get-all-configs`);
            const allConfigs = cloudRes.ok ? await cloudRes.json() : {};
            let gatheredServers: FlatServer[] = [];

            const processClub = (countryName: string, countryCode: string, club: string) => {
                const configKey = `config_${countryCode}_${club.replace(/[^a-zA-Z0-9]/g, '_')}`;
                const config = allConfigs[configKey] || { servers: CLUB_SPECIFIC_DEFAULTS[club] || [] };
                config.servers.forEach((s: any) => {
                    gatheredServers.push({ ...s, club, country: countryName, countryCode } as FlatServer);
                });
            };

            COUNTRIES.forEach(c => c.clubs?.forEach(club => processClub(c.name, c.code, club)));
            DHL_DATA.clubs?.forEach(club => processClub('DHL GLOBAL', DHL_DATA.code, club));

            setAllServers(gatheredServers);

            const serversToPing = gatheredServers.filter(s => s.ip && !s.ip.includes('X') && s.ip !== 'N/A');
            const cloudCheckRes = await fetch(`${backendUrl}/api/check-status`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ servers: serversToPing.map((s, i) => ({ id: i, ip: s.ip })) })
            }).catch(() => null);

            const cloudResults = cloudCheckRes && cloudCheckRes.ok ? await cloudCheckRes.json() : { results: [] };
            const finalOffline: FlatServer[] = [];
            
            for (const s of gatheredServers) {
                if (!s.ip || s.ip.includes('X') || s.ip === 'N/A') {
                    finalOffline.push(s);
                    continue;
                }
                const res = cloudResults.results?.find((r: any) => r.ip === s.ip);
                if (!res || res.status === 'offline') {
                    finalOffline.push(s);
                }
            }

            setOfflineServers(finalOffline);
            setLastUpdated(new Date().toLocaleTimeString());
            return { total: gatheredServers.length, offline: finalOffline };
        } catch (error) {
            console.error("Global monitor error:", error);
            return null;
        } finally {
            setChecking(false);
            checkingRef.current = false;
        }
    }, []);

    const generateSnapshotReport = useCallback(async () => {
        const data = await checkGlobalStatus(true);
        if (data) {
            const online = data.total - data.offline.length;
            const percentage = ((online / data.total) * 100).toFixed(1);
            const newReport: StatusReport = {
                id: Math.random().toString(36).substr(2, 9),
                timestamp: new Date().toLocaleString(),
                total: data.total,
                online: online,
                offline: data.offline.length,
                offlineList: data.offline.map(s => ({ club: s.club, country: s.country, name: s.name, ip: s.ip })),
                percentage: percentage
            };
            setReports(prev => [newReport, ...prev].slice(0, 50));
            setShowModal(true);
        }
    }, [checkGlobalStatus]);

    useEffect(() => {
        const statusInterval = setInterval(() => checkGlobalStatus(false), 30000);
        return () => clearInterval(statusInterval);
    }, [checkGlobalStatus]);

    const getCountryStats = (): CountryStatus[] => {
        const stats: Record<string, CountryStatus> = {};
        allServers.forEach(server => {
            if (!stats[server.country]) stats[server.country] = { name: server.country, code: server.countryCode, total: 0, offline: 0, clubs: [] };
            stats[server.country].total++;
            const isOffline = offlineServers.some(os => os.ip === server.ip && os.club === server.club && os.name === server.name);
            if (isOffline) stats[server.country].offline++;
            let clubEntry = stats[server.country].clubs.find(c => c.name === server.club);
            if (!clubEntry) {
                clubEntry = { name: server.club, offlineCount: 0, totalInClub: 0 };
                stats[server.country].clubs.push(clubEntry);
            }
            clubEntry.totalInClub++;
            if (isOffline) clubEntry.offlineCount++;
        });
        return Object.values(stats);
    };

    const countryStats = getCountryStats();
    const totalServers = allServers.length;
    const totalOffline = offlineServers.length;
    const totalOnline = totalServers - totalOffline;

    return (
        <>
            <button 
                onClick={() => setShowModal(true)}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-xl shadow-lg transition-all border-none ${
                    totalOffline > 0 ? 'bg-red-600 animate-pulse text-white' : 'bg-[#2ecc71] text-white'
                } hover:scale-105 active:scale-95`}
            >
                <ActivityIcon className="w-5 h-5" />
                <span className="font-black text-xs uppercase tracking-widest">
                    {checking ? t('monitorChecking') : (totalOffline > 0 ? `${totalOffline} ${t('monitorOfflineLabel')}` : t('monitorSystemsOk'))}
                </span>
            </button>

            {showModal && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-[#0d1a2e]/80 backdrop-blur-md">
                    <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-6xl overflow-hidden flex flex-col max-h-[90vh] border border-white/20">
                        
                        <div className="bg-[#0b1626] text-white px-8 py-6 flex justify-between items-center shrink-0">
                            <div>
                                <h3 className="text-2xl font-black italic tracking-tighter uppercase">{t('monitorGlobalTitle')}</h3>
                                <p className="text-blue-400 text-[10px] font-bold uppercase tracking-[0.3em]">{lastUpdated ? t('monitorLastScan', lastUpdated) : t('monitorScanning')}</p>
                            </div>
                            <button onClick={() => setShowModal(false)} className="bg-white/10 p-2 rounded-full hover:bg-white/20 transition-all">
                                <XIcon className="w-6 h-6" />
                            </button>
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 p-8 bg-slate-50 border-b shrink-0">
                             <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100"><p className="text-slate-400 text-[9px] font-black uppercase tracking-widest mb-1">{t('monitorTotalAssets')}</p><p className="text-4xl font-black text-slate-800">{totalServers}</p></div>
                             <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100"><p className="text-slate-400 text-[9px] font-black uppercase tracking-widest mb-1">{t('monitorOnline')}</p><p className="text-4xl font-black text-green-500">{totalOnline}</p></div>
                             <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100"><p className="text-slate-400 text-[9px] font-black uppercase tracking-widest mb-1">{t('monitorOffline')}</p><p className="text-4xl font-black text-red-500">{totalOffline}</p></div>
                             <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100"><p className="text-slate-400 text-[9px] font-black uppercase tracking-widest mb-1">{t('monitorUptime')}</p><p className="text-4xl font-black text-blue-600">{totalServers > 0 ? ((totalOnline / totalServers) * 100).toFixed(1) : 0}%</p></div>
                        </div>

                        <div className="flex-grow overflow-y-auto p-8 bg-white grid grid-cols-1 lg:grid-cols-3 gap-8">
                            <div className="lg:col-span-2 space-y-6">
                                <h4 className="text-slate-400 font-black text-xs uppercase tracking-[0.2em] flex items-center gap-2 mb-4">
                                    <GlobeIcon className="w-4 h-4" /> {t('monitorGeographicalBreakdown')}
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {countryStats.map(stat => (
                                        <div key={stat.name} className={`p-5 rounded-2xl border-2 transition-all ${stat.offline > 0 ? 'border-red-100 bg-red-50/30' : 'border-slate-50 bg-white'}`}>
                                            <div className="flex justify-between items-center mb-4">
                                                <div className="flex items-center gap-3">
                                                    <img src={`https://flagcdn.com/w40/${stat.code === 'dhl' ? 'un' : stat.code}.png`} className="w-5 h-auto rounded-sm" />
                                                    <span className="font-black text-xs uppercase tracking-widest text-slate-700">{getCountryName(stat.code)}</span>
                                                </div>
                                                <span className={`text-[10px] font-black px-2 py-1 rounded-md ${stat.offline > 0 ? 'bg-red-500 text-white' : 'bg-green-100 text-green-700'}`}>
                                                    {stat.offline > 0 ? `${stat.offline} ERR` : 'OK'}
                                                </span>
                                            </div>
                                            <div className="space-y-2">
                                                {stat.clubs.map(club => (
                                                    <div key={club.name} className="flex justify-between items-center text-[10px] font-bold">
                                                        <span className="text-slate-500">{club.name}</span>
                                                        <span className={club.offlineCount > 0 ? 'text-red-500' : 'text-slate-300'}>
                                                            {club.totalInClub - club.offlineCount}/{club.totalInClub}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-6 lg:border-l lg:pl-8">
                                <div className="flex justify-between items-center mb-4">
                                    <h4 className="text-slate-400 font-black text-xs uppercase tracking-[0.2em] flex items-center gap-2">
                                        <FileTextIcon className="w-4 h-4" /> {t('monitorSystemReports')}
                                    </h4>
                                    <button onClick={() => setReports([])} className="text-slate-300 hover:text-red-500 transition-colors"><TrashIcon className="w-4 h-4"/></button>
                                </div>
                                <div className="space-y-4">
                                    {reports.length === 0 ? (
                                        <div className="bg-slate-50 rounded-2xl p-10 text-center border-2 border-dashed border-slate-100">
                                            <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest leading-loose">{t('monitorNoActiveReports')}<br/>{t('monitorSystemIsMonitoring')}</p>
                                        </div>
                                    ) : (
                                        reports.map(report => (
                                            <div key={report.id} className="bg-[#0b1626] rounded-2xl p-5 text-white shadow-xl animate-in slide-in-from-bottom-4">
                                                <div className="flex justify-between items-start mb-4">
                                                    <div>
                                                        <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-1">{report.timestamp}</p>
                                                        <p className="text-xl font-black italic">{report.percentage}% <span className="text-[10px] non-italic font-bold text-slate-500 ml-1">{t('monitorAvailabilityUpper')}</span></p>
                                                    </div>
                                                    <span className="bg-red-500 text-white px-3 py-1 rounded-full text-[9px] font-black uppercase">
                                                        {t('monitorErrorsUpper', report.offline)}
                                                    </span>
                                                </div>
                                                {report.offlineList.length > 0 && (
                                                    <div className="space-y-2 border-t border-white/5 pt-3 mt-2">
                                                        {report.offlineList.slice(0, 3).map((off, i) => (
                                                             <div key={i} className="flex justify-between items-center text-[9px] font-bold">
                                                                <span className="text-red-400 uppercase">{off.club}</span>
                                                                <span className="text-white/40">{off.name}</span>
                                                            </div>
                                                        ))}
                                                        {report.offlineList.length > 3 && <p className="text-[8px] text-slate-500 italic font-bold">{t('monitorMoreIssues', report.offlineList.length - 3)}</p>}
                                                    </div>
                                                )}
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="p-8 border-t bg-slate-50 flex flex-col sm:flex-row justify-between items-center gap-4 shrink-0">
                            <p className="text-slate-400 text-[11px] font-black uppercase tracking-widest italic">{t('monitorFooterCopyright')}</p>
                            <div className="flex gap-4">
                                <button onClick={() => checkGlobalStatus(true)} disabled={checking} className="bg-white border-2 border-slate-200 text-slate-700 px-8 py-3 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-slate-50 transition-all flex items-center gap-2">
                                    <ActivityIcon className={`w-4 h-4 ${checking ? 'animate-spin' : ''}`} /> {t('monitorScanNow')}
                                </button>
                                <button onClick={() => generateSnapshotReport()} className="bg-blue-600 text-white px-8 py-3 rounded-xl font-black text-xs uppercase tracking-widest shadow-xl hover:bg-blue-700 transition-all flex items-center gap-2">
                                    <FileTextIcon className="w-4 h-4" /> {t('monitorCreateReport')}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default ServerStatusSummary;
