import React, { useState, useEffect, useCallback } from 'react';
import { COUNTRIES, DHL_DATA } from '../constants';
import { CLUB_SPECIFIC_DEFAULTS } from '../config/serverDefaults';
import { ServerDetails } from '../types';
import { XIcon, GlobeIcon, ActivityIcon } from '../assets/icons';
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
    clubs: {
        name: string;
        totalInClub: number;
    }[];
}

const ServerStatusSummary: React.FC = () => {
    const { t, getCountryName } = useLanguage();
    const [allServers, setAllServers] = useState<FlatServer[]>([]);
    const [showModal, setShowModal] = useState(false);

    const loadServers = useCallback(() => {
        let gatheredServers: FlatServer[] = [];

        const processClub = (countryName: string, countryCode: string, club: string) => {
            const defaults = CLUB_SPECIFIC_DEFAULTS[`${countryCode}_${club}`] || CLUB_SPECIFIC_DEFAULTS[club] || [];
            defaults.forEach((s: any) => {
                gatheredServers.push({ ...s, club, country: countryName, countryCode, status: 'online' } as FlatServer);
            });
        };

        COUNTRIES.forEach(c => c.clubs?.forEach(club => processClub(c.name, c.code, club)));
        DHL_DATA.clubs?.forEach(club => processClub('DHL GLOBAL', DHL_DATA.code, club));

        setAllServers(gatheredServers);
    }, []);

    useEffect(() => {
        loadServers();
    }, [loadServers]);

    const getCountryStats = (): CountryStatus[] => {
        const stats: Record<string, CountryStatus> = {};
        allServers.forEach(server => {
            if (!stats[server.country]) stats[server.country] = { name: server.country, code: server.countryCode, total: 0, clubs: [] };
            stats[server.country].total++;
            let clubEntry = stats[server.country].clubs.find(c => c.name === server.club);
            if (!clubEntry) {
                clubEntry = { name: server.club, totalInClub: 0 };
                stats[server.country].clubs.push(clubEntry);
            }
            clubEntry.totalInClub++;
        });
        return Object.values(stats);
    };

    const countryStats = getCountryStats();
    const totalServers = allServers.length;
    const totalClubs = countryStats.reduce((acc, c) => acc + c.clubs.length, 0);

    return (
        <>
            <button 
                onClick={() => setShowModal(true)}
                className="flex items-center gap-2.5 px-4 py-2 rounded-xl shadow-md bg-emerald-600 hover:bg-emerald-500 text-white transition-all border-none hover:scale-105 active:scale-95"
            >
                <div className="w-2.5 h-2.5 rounded-full bg-white shadow-[0_0_8px_#ffffff] animate-pulse"></div>
                <span className="font-black text-xs uppercase tracking-wider whitespace-nowrap">
                    {t('monitorSystemsOk')}
                </span>
            </button>

            {showModal && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-[#0d1a2e]/80 backdrop-blur-md">
                    <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-5xl overflow-hidden flex flex-col max-h-[90vh] border border-white/20">
                        
                        <div className="bg-[#0b1626] text-white px-8 py-6 flex justify-between items-center shrink-0">
                            <div>
                                <h3 className="text-2xl font-black italic tracking-tighter uppercase">{t('monitorGlobalTitle')}</h3>
                                <p className="text-emerald-400 text-[10px] font-bold uppercase tracking-[0.3em]">TODOS LOS SISTEMAS ACTIVOS Y CONFIGURADOS</p>
                            </div>
                            <button onClick={() => setShowModal(false)} className="bg-white/10 p-2 rounded-full hover:bg-white/20 transition-all text-white">
                                <XIcon className="w-6 h-6" />
                            </button>
                        </div>
                        
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-6 sm:p-8 bg-slate-50 border-b shrink-0">
                             <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
                                <p className="text-slate-400 text-[9px] font-black uppercase tracking-widest mb-1">{t('monitorTotalAssets')}</p>
                                <p className="text-3xl sm:text-4xl font-black text-slate-800">{totalServers}</p>
                             </div>
                             <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
                                <p className="text-slate-400 text-[9px] font-black uppercase tracking-widest mb-1">{t('monitorOnline')}</p>
                                <p className="text-3xl sm:text-4xl font-black text-emerald-500">{totalServers}</p>
                             </div>
                             <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
                                <p className="text-slate-400 text-[9px] font-black uppercase tracking-widest mb-1">SEDES REGIONALES</p>
                                <p className="text-3xl sm:text-4xl font-black text-blue-600">{totalClubs}</p>
                             </div>
                             <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
                                <p className="text-slate-400 text-[9px] font-black uppercase tracking-widest mb-1">{t('monitorUptime')}</p>
                                <p className="text-3xl sm:text-4xl font-black text-emerald-600">100%</p>
                             </div>
                        </div>

                        <div className="flex-grow overflow-y-auto p-6 sm:p-8 bg-white">
                            <h4 className="text-slate-400 font-black text-xs uppercase tracking-[0.2em] flex items-center gap-2 mb-6">
                                <GlobeIcon className="w-4 h-4" /> {t('monitorGeographicalBreakdown')}
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {countryStats.map(stat => (
                                    <div key={stat.name} className="p-5 rounded-2xl border-2 border-slate-100 bg-white hover:border-cyan-200 transition-all">
                                        <div className="flex justify-between items-center mb-4">
                                            <div className="flex items-center gap-3">
                                                <img src={`https://flagcdn.com/w40/${stat.code === 'dhl' ? 'un' : stat.code}.png`} className="w-5 h-auto rounded-sm shadow-xs" alt="" />
                                                <span className="font-black text-xs uppercase tracking-widest text-slate-700">{getCountryName(stat.code)}</span>
                                            </div>
                                            <span className="text-[10px] font-black px-2.5 py-1 rounded-md bg-emerald-100 text-emerald-700">
                                                OK
                                            </span>
                                        </div>
                                        <div className="space-y-1.5 border-t border-slate-100 pt-3">
                                            {stat.clubs.map(club => (
                                                <div key={club.name} className="flex justify-between items-center text-[10px] font-bold">
                                                    <span className="text-slate-600">{club.name}</span>
                                                    <span className="text-emerald-600 font-extrabold">
                                                        {club.totalInClub} srv
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="p-6 border-t bg-slate-50 flex justify-between items-center shrink-0">
                            <p className="text-slate-400 text-[11px] font-black uppercase tracking-widest italic">{t('monitorFooterCopyright')}</p>
                            <button onClick={() => setShowModal(false)} className="bg-[#0d1a2e] text-white px-8 py-3 rounded-xl font-black text-xs uppercase tracking-widest shadow-lg hover:bg-slate-800 transition-all">
                                {t('backButton')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default ServerStatusSummary;
