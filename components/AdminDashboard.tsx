
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { User } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { EyeIcon, EyeOffIcon, PlusIcon, GlobeIcon, UserIcon, KeyIcon, PencilIcon, TrashIcon, CameraIcon, XIcon, SaveIcon } from '../assets/icons';
import { COUNTRIES, USER_STORAGE_KEY } from '../constants';

const SUPER_ADMIN_USERNAME = 'admin';

interface AdminDashboardProps {
  users: User[];
  setUsers: React.Dispatch<React.SetStateAction<User[]>>;
  onContinue: () => void;
  onLogout: () => void;
  currentUser: User | null;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ users, setUsers, onContinue, onLogout, currentUser }) => {
  const { language, setLanguage, t, getCountryName } = useLanguage();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [activeTab, setActiveTab] = useState<'users' | 'alerts'>('users');
  const [visiblePasswords, setVisiblePasswords] = useState<Record<string, boolean>>({});
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  const [showPermissionsModal, setShowPermissionsModal] = useState(false);
  const [editingUser, setEditingUser] = useState<string | null>(null);
  const [tempAllowedCountries, setTempAllowedCountries] = useState<string[]>([]);
  
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [newUser, setNewUser] = useState<User>({ name: '', username: '', password: '', role: 'user', avatar: '', isDisabled: false, allowedCountries: [] });
  
  const [showEditUserModal, setShowEditUserModal] = useState(false);
  const [editUserData, setEditUserData] = useState<User | null>(null);
  const [originalUsername, setOriginalUsername] = useState<string>('');

  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordTargetUser, setPasswordTargetUser] = useState<string | null>(null);
  const [newPasswordValue, setNewPasswordValue] = useState('');

  const [backendUrl, setBackendUrl] = useState(() => {
      const saved = localStorage.getItem('saltex_backend_url');
      return saved || '';
  });

  const showSuccess = (message: string) => {
      setSuccessMessage(message);
      setTimeout(() => setSuccessMessage(null), 3000);
  };

  const syncToCloud = useCallback(async (currentUsersList: User[]) => {
      localStorage.setItem('saltex_backend_url', backendUrl);
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(currentUsersList));
      try {
          const base = backendUrl || window.location.origin;
          await fetch(`${base}/api/save-users`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ users: currentUsersList })
          });
      } catch (err) {
          console.error("Cloud sync failed", err);
      }
  }, [backendUrl]);

  const handleSaveAll = async () => {
      await syncToCloud(users);
      showSuccess(t('globalSaveSuccess'));
  };

  const toggleUserStatus = async (username: string) => {
    if (username === SUPER_ADMIN_USERNAME) return;
    const updated = users.map(u => u.username === username ? { ...u, isDisabled: !u.isDisabled } : u);
    setUsers(updated);
    await syncToCloud(updated);
  };

  const togglePasswordVisibility = (username: string) => setVisiblePasswords(prev => ({ ...prev, [username]: !prev[username] }));
  
  const changeUserRole = async (username: string, newRole: 'admin' | 'user') => {
      if (username === SUPER_ADMIN_USERNAME) return;
      const updated = users.map(u => u.username === username ? { ...u, role: newRole } : u);
      setUsers(updated);
      await syncToCloud(updated);
  };

  const deleteUser = async (username: string) => {
      if (username === SUPER_ADMIN_USERNAME) return;
      const userToDelete = users.find(u => u.username === username);
      
      if (userToDelete && !userToDelete.isDisabled) {
          alert(t('deleteActiveUserError'));
          return;
      }

      if (window.confirm(t('confirmDeleteUser'))) {
          const updated = users.filter(u => u.username !== username);
          setUsers(updated);
          await syncToCloud(updated);
          showSuccess(t('userDeleteSuccess'));
      }
  };

  const openPermissionsModal = (username: string) => {
      const user = users.find(u => u.username === username);
      if (user) { 
        setEditingUser(username); 
        setTempAllowedCountries(user.allowedCountries || []); 
        setShowPermissionsModal(true); 
      }
  };

  const savePermissions = async () => {
      if (editingUser) {
          const updated = users.map(u => u.username === editingUser ? { ...u, allowedCountries: tempAllowedCountries } : u);
          setUsers(updated);
          setShowPermissionsModal(false);
          await syncToCloud(updated);
          showSuccess(t('globalSaveSuccess'));
      }
  };

  const openEditUserModal = (username: string) => {
      const user = users.find(u => u.username === username);
      if (user) {
          setEditUserData({ ...user });
          setOriginalUsername(username);
          setShowEditUserModal(true);
      }
  };

  const openPasswordModal = (username: string) => {
    setPasswordTargetUser(username);
    setNewPasswordValue('');
    setShowPasswordModal(true);
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordTargetUser || !newPasswordValue.trim()) return;
    
    const updated = users.map(u => u.username === passwordTargetUser ? { ...u, password: newPasswordValue.trim() } : u);
    setUsers(updated);
    setShowPasswordModal(false);
    await syncToCloud(updated);
    showSuccess(t('passwordUpdateSuccess'));
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!editUserData) return;
      const updated = users.map(user => user.username === originalUsername ? { ...editUserData } : user);
      setUsers(updated);
      setShowEditUserModal(false);
      await syncToCloud(updated);
      showSuccess(t('userUpdateSuccess'));
  };

  const handleAddUser = async (e: React.FormEvent) => {
      e.preventDefault();
      if (users.some(u => u.username === newUser.username)) return;
      const updated = [...users, { ...newUser }];
      setUsers(updated);
      setShowAddUserModal(false);
      setNewUser({ name: '', username: '', password: '', role: 'user', avatar: '', isDisabled: false, allowedCountries: [] });
      await syncToCloud(updated);
      showSuccess(t('userCreateSuccess'));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'add' | 'edit') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        if (type === 'add') {
          setNewUser(prev => ({ ...prev, avatar: base64String }));
        } else if (type === 'edit') {
          setEditUserData(prev => prev ? { ...prev, avatar: base64String } : null);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleToggleCountry = (code: string) => {
    setTempAllowedCountries(prev => 
      prev.includes(code) ? prev.filter(c => c !== code) : [...prev, code]
    );
  };

  const handleSelectAll = () => {
    const allCodes = [...COUNTRIES.map(c => c.code), 'dhl'];
    if (tempAllowedCountries.length === allCodes.length) {
      setTempAllowedCountries([]);
    } else {
      setTempAllowedCountries(allCodes);
    }
  };

  const displayUsers = [...users].sort((a, _b) => a.username === SUPER_ADMIN_USERNAME ? -1 : 1);

  return (
    <div className="w-full max-w-7xl mx-auto bg-white rounded-xl shadow-2xl overflow-hidden flex flex-col h-[95vh] sm:h-[90vh] relative font-sans">
      {successMessage && <div className="fixed top-24 left-1/2 transform -translate-x-1/2 z-[100] bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg font-bold animate-bounce text-sm uppercase">{successMessage}</div>}

      {/* HEADER Dashboard */}
      <div className="bg-[#0b1626] px-6 sm:px-10 py-10 flex flex-col md:flex-row justify-between items-center gap-6 shrink-0 border-b border-white/5">
        <div className="flex flex-col w-full md:w-auto">
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-none mb-1">{t('adminDashboardTitle')}</h2>
          <p className="text-[#22d3ee] text-sm font-medium mb-3">{t('adminDashboardSubtitle')}</p>
          <div className="flex items-center gap-2">
             <UserIcon className="w-4 h-4 text-white/50" />
             <p className="text-white text-[10px] uppercase tracking-wider">
               {t('loggedInAs')} <span className="font-bold">Super Admin</span>
             </p>
          </div>
        </div>
        
        <div className="flex flex-wrap items-center justify-end gap-3 w-full md:w-auto">
            <div className="bg-[#0f172a] rounded-xl p-1.5 flex items-center shrink-0 border border-white/10 shadow-inner">
                <button 
                  onClick={() => setLanguage('es')} 
                  className={`px-4 py-2 text-[11px] font-black rounded-lg transition-all ${language === 'es' ? 'bg-white text-[#0f172a] shadow-lg scale-105' : 'text-slate-500 hover:text-white'}`}
                >
                  ES
                </button>
                <div className="w-px h-3 bg-white/10 mx-2"></div>
                <button 
                  onClick={() => setLanguage('en')} 
                  className={`px-4 py-2 text-[11px] font-black rounded-lg transition-all ${language === 'en' ? 'bg-white text-[#0f172a] shadow-lg scale-105' : 'text-slate-500 hover:text-white'}`}
                >
                  EN
                </button>
            </div>

            <button onClick={handleSaveAll} className="bg-[#00e676] text-[#0b1626] px-6 py-4 rounded-2xl text-sm font-black hover:bg-[#00c853] transition-all flex items-center gap-3 shadow-[0_0_20px_rgba(0,230,118,0.3)] active:scale-95 whitespace-nowrap">
              <SaveIcon className="w-5 h-5" /> 
              <span>{t('saveChangesButton')}</span>
            </button>

            <button onClick={() => setShowAddUserModal(true)} className="bg-[#2979ff] text-white px-6 py-4 rounded-2xl text-sm font-black hover:bg-[#2962ff] transition-all flex items-center gap-3 shadow-[0_0_20px_rgba(41,121,255,0.3)] active:scale-95 whitespace-nowrap">
              <PlusIcon className="w-5 h-5" /> 
              <span>{t('addUserButton')}</span>
            </button>

            <button onClick={onLogout} className="bg-[#ff1744] text-white px-6 py-4 rounded-2xl text-sm font-black hover:bg-[#d50000] transition-all shadow-[0_0_20px_rgba(255,23,68,0.3)] active:scale-95 whitespace-nowrap">
              {t('logoutButton')}
            </button>

            <button onClick={onContinue} className="bg-white text-[#0b1626] px-8 py-4 rounded-2xl text-sm font-black hover:bg-slate-100 transition-all shadow-xl active:scale-95 whitespace-nowrap">
              {t('continueToApp')}
            </button>
        </div>
      </div>

      <div className="bg-white px-4 sm:px-10 flex border-b shrink-0">
          <button onClick={() => setActiveTab('users')} className={`px-8 py-5 text-sm font-black transition-all border-b-4 uppercase tracking-widest ${activeTab === 'users' ? 'border-[#0b1626] text-[#0b1626]' : 'border-transparent text-gray-300 hover:text-gray-500'}`}>{t('usersTab')}</button>
          <button onClick={() => setActiveTab('alerts')} className={`px-8 py-5 text-sm font-black transition-all border-b-4 uppercase tracking-widest ${activeTab === 'alerts' ? 'border-[#0b1626] text-[#0b1626]' : 'border-transparent text-gray-300 hover:text-gray-500'}`}>{t('alertsTab')}</button>
      </div>

      <div className="flex-grow overflow-y-auto bg-white p-4 sm:p-6">
          {activeTab === 'users' ? (
              <div className="bg-white overflow-hidden">
                 <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-white border-b border-slate-50">
                                <th className="px-6 py-6 text-[11px] font-black text-slate-300 uppercase tracking-widest">{t('userTableStatus')}</th>
                                <th className="px-6 py-6 text-[11px] font-black text-slate-300 uppercase tracking-widest">{t('userTableName')}</th>
                                <th className="px-6 py-6 text-[11px] font-black text-slate-300 uppercase tracking-widest">{t('userTableUsername')}</th>
                                <th className="px-6 py-6 text-[11px] font-black text-slate-300 uppercase tracking-widest">{t('userTablePassword')}</th>
                                <th className="px-6 py-6 text-[11px] font-black text-slate-300 uppercase tracking-widest">{t('userTablePermissions')}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50 bg-white">
                            {displayUsers.map(user => {
                                const isSuper = user.username === SUPER_ADMIN_USERNAME;
                                return (
                                    <tr key={user.username} className="hover:bg-slate-50/20 transition-colors">
                                        <td className="px-6 py-8">
                                            <div className="flex items-center gap-3">
                                                <button onClick={() => toggleUserStatus(user.username)} disabled={isSuper} className={`relative h-6 w-11 rounded-full transition-colors ${!user.isDisabled ? 'bg-[#2ecc71]' : 'bg-slate-200'} disabled:opacity-30 cursor-pointer`}><span className={`absolute left-1 top-1 inline-block h-4 w-4 transform bg-white rounded-full transition-transform ${!user.isDisabled ? 'translate-x-5' : 'translate-x-0'}`} /></button>
                                                <span className="text-[13px] font-bold text-slate-400">{!user.isDisabled ? t('statusActive') : t('statusDisabled')}</span>
                                            </div>
                                        </td>
                                        
                                        <td className="px-6 py-8 whitespace-nowrap">
                                            <div className="flex items-center gap-4">
                                                <div className="w-11 h-11 rounded-full bg-slate-100 flex items-center justify-center text-slate-300 shrink-0 overflow-hidden shadow-inner border border-slate-50">
                                                  {user.avatar ? <img src={user.avatar} className="w-full h-full object-cover" alt="" /> : <UserIcon className="w-5 h-5" />}
                                                </div>
                                                <div>
                                                   <p className="text-[15px] font-black text-slate-800 leading-tight">{user.name}</p>
                                                </div>
                                            </div>
                                        </td>
                                        
                                        <td className="px-6 py-8 whitespace-nowrap">
                                          <span className="text-[14px] font-bold text-slate-300">{user.username}</span>
                                        </td>
                                        
                                        <td className="px-6 py-8 whitespace-nowrap">
                                            <div className="flex items-center gap-3">
                                              <span className={`text-[14px] font-bold ${visiblePasswords[user.username] ? 'text-[#3b82f6] font-mono' : 'text-slate-300 tracking-tighter'}`}>
                                                {visiblePasswords[user.username] ? user.password : '••••••'}
                                              </span>
                                              <button onClick={() => togglePasswordVisibility(user.username)} className="text-slate-200 hover:text-slate-400 transition-colors p-1">
                                                {visiblePasswords[user.username] ? <EyeOffIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
                                              </button>
                                              {!isSuper && (
                                                <div className="flex items-center gap-1.5 border-l border-slate-100 pl-3 ml-2">
                                                  <button onClick={() => openEditUserModal(user.username)} className="text-slate-200 hover:text-blue-500 transition-colors p-1" title={t('editUserTitle')}>
                                                    <PencilIcon className="h-4 w-4" />
                                                  </button>
                                                  <button onClick={() => openPasswordModal(user.username)} className="text-slate-200 hover:text-amber-500 transition-colors p-1" title={t('changePasswordTitle')}>
                                                    <KeyIcon className="h-4 w-4" />
                                                  </button>
                                                </div>
                                              )}
                                            </div>
                                        </td>
                                        
                                        <td className="px-6 py-8">
                                            <div className="flex items-center gap-4">
                                                <div className="relative">
                                                    <select 
                                                      value={user.role} 
                                                      onChange={e => changeUserRole(user.username, e.target.value as any)} 
                                                      disabled={isSuper} 
                                                      className="appearance-none text-[13px] font-bold text-slate-600 border border-blue-100 rounded-xl bg-white px-5 py-2.5 pr-10 focus:ring-1 focus:ring-blue-400 focus:border-blue-500 outline-none w-36 disabled:bg-slate-50 transition-all cursor-pointer"
                                                    >
                                                        <option value="admin">{t('roleAdmin')}</option>
                                                        <option value="user">{t('roleUser')}</option>
                                                    </select>
                                                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-300">
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                                    </div>
                                                </div>
                                                
                                                {!isSuper && (
                                                  <div className="flex items-center gap-3 ml-2">
                                                      {user.role === 'user' && (
                                                        <button onClick={() => openPermissionsModal(user.username)} className="text-slate-300 hover:text-blue-400 transition-colors p-1" title={t('modalPermissionsTitle')}>
                                                          <GlobeIcon className="h-5 w-5" />
                                                        </button>
                                                      )}
                                                      <button 
                                                        onClick={() => deleteUser(user.username)} 
                                                        disabled={!user.isDisabled}
                                                        className={`p-1 transition-colors ${!user.isDisabled ? 'text-slate-100 cursor-not-allowed opacity-50' : 'text-slate-300 hover:text-red-400 cursor-pointer'}`}
                                                        title={!user.isDisabled ? t('deleteActiveUserError') : t('actionDelete')}
                                                      >
                                                        <TrashIcon className="h-5 w-5" />
                                                      </button>
                                                  </div>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                 </div>
              </div>
          ) : (
              <div className="max-w-3xl mx-auto space-y-8 py-10">
                  <div className="bg-white p-12 rounded-[2.5rem] shadow-sm border border-slate-100">
                    <div className="flex items-center space-x-6 mb-10">
                        <div className="bg-blue-50 p-6 rounded-2xl text-blue-600 shrink-0 shadow-inner"><GlobeIcon className="w-12 h-12" /></div>
                        <div><h3 className="text-3xl font-black text-slate-800 tracking-tight uppercase italic">{t('backendUrlTitle')}</h3><p className="text-slate-400 text-sm font-bold">{t('backendUrlSubtitle')}</p></div>
                    </div>
                    <div className="space-y-4">
                        <input type="text" value={backendUrl} onChange={e => setBackendUrl(e.target.value)} className="w-full bg-slate-50 border-2 border-slate-100 p-6 rounded-2xl focus:border-blue-500 outline-none font-mono text-base shadow-inner transition-all" placeholder={t('backendUrlPlaceholder')} />
                    </div>
                  </div>
              </div>
          )}
      </div>

      {/* MODALES */}
      {(showAddUserModal || showEditUserModal || showPermissionsModal || showPasswordModal) && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm transition-all">
              <div className={`bg-white shadow-2xl overflow-hidden flex flex-col animate-in zoom-in duration-200 ${showPermissionsModal ? 'w-full max-w-md rounded-[2rem]' : 'w-full max-w-[420px] rounded-[1.5rem]'} relative`}>
                  {/* Blue Top Border for password modal and others */}
                  {(showPasswordModal || showEditUserModal || showAddUserModal) && (
                    <div className="absolute top-0 left-0 w-full h-2 bg-[#2979ff]"></div>
                  )}

                  {showPermissionsModal && (
                      <div className="flex flex-col h-full bg-white">
                          <div className="px-10 pt-10 pb-4 flex justify-between items-start">
                            <h4 className="text-[22px] font-black text-[#0b1626] tracking-tight">{t('modalPermissionsTitle')}</h4>
                            <button onClick={handleSelectAll} className="text-[11px] font-black text-[#2979ff] hover:text-[#0b1626] transition-all uppercase tracking-wider mt-1">{t('selectAll')}</button>
                          </div>
                          <div className="px-10 pb-6 overflow-y-auto grow max-h-[50vh]">
                              <div className="grid grid-cols-2 gap-x-6 gap-y-3 py-6 border-t border-slate-50">
                                {COUNTRIES.map(c => (
                                    <label key={c.code} className="flex items-center gap-4 cursor-pointer group p-2 rounded-xl hover:bg-slate-50 transition-colors">
                                        <input type="checkbox" className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-0 cursor-pointer" checked={tempAllowedCountries.includes(c.code)} onChange={() => handleToggleCountry(c.code)} />
                                        <img src={`https://flagcdn.com/w40/${c.code}.png`} className="w-6 h-auto rounded-[2px] shadow-sm shrink-0" alt="" />
                                        <span className="text-[13px] font-bold text-[#475569] group-hover:text-[#0b1626] transition-colors leading-none truncate">{getCountryName(c)}</span>
                                    </label>
                                ))}
                              </div>
                              <div className="mt-2 pt-6 border-t border-slate-50">
                                <p className="text-[10px] font-black text-slate-300 mb-4 uppercase tracking-[0.2em]">{t('dhlAccessLabel')}</p>
                                <label className="flex items-center gap-5 cursor-pointer group w-full p-3 rounded-2xl bg-slate-50 hover:bg-slate-100 transition-colors">
                                    <input type="checkbox" className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-0 cursor-pointer" checked={tempAllowedCountries.includes('dhl')} onChange={() => handleToggleCountry('dhl')} />
                                    <img src="https://www.dhl.com/content/dam/dhl/global/core/images/logos/dhl-logo.svg" alt="DHL" className="h-3.5 w-auto transition-all" />
                                </label>
                              </div>
                          </div>
                          <div className="px-10 py-8 bg-slate-50/50 flex justify-end gap-3 border-t border-slate-50">
                              <button onClick={() => setShowPermissionsModal(false)} className="px-6 py-3 bg-white text-[#475569] border border-slate-200 rounded-xl font-bold text-[12px] uppercase tracking-widest transition-all hover:bg-slate-50 active:scale-95">{t('cancelButton')}</button>
                              <button onClick={savePermissions} className="px-6 py-3 bg-[#0b1626] text-white rounded-xl font-bold text-[12px] uppercase tracking-widest shadow-lg hover:bg-[#1a2b4e] active:scale-95 transition-all">{t('saveButton')}</button>
                          </div>
                      </div>
                  )}

                  {showPasswordModal && (
                    <form onSubmit={handleUpdatePassword} className="p-10 pt-12 space-y-8 bg-white">
                      <h4 className="text-2xl font-black text-[#0d1a2e] tracking-tight">
                        {t('changePasswordTitle')}: <span className="font-bold">{passwordTargetUser}</span>
                      </h4>
                      
                      <div className="space-y-4">
                        <input 
                          required 
                          autoFocus
                          type="text"
                          value={newPasswordValue} 
                          onChange={e => setNewPasswordValue(e.target.value)} 
                          placeholder={t('newPasswordLabel')}
                          className="w-full border-2 border-[#3b82f6] p-4 rounded-xl bg-white text-slate-800 text-base font-bold outline-none placeholder:text-slate-300 transition-all focus:ring-2 focus:ring-blue-100" 
                        />
                      </div>

                      <div className="flex justify-end items-center gap-8 pt-2">
                        <button 
                          type="button" 
                          onClick={() => setShowPasswordModal(false)} 
                          className="text-[#475569] font-bold text-sm hover:text-[#0b1626] transition-colors"
                        >
                          {t('cancelButton')}
                        </button>
                        <button 
                          type="submit" 
                          className="bg-[#2979ff] text-white px-8 py-3.5 rounded-xl font-black text-sm shadow-xl hover:bg-[#1a68ff] active:scale-95 transition-all"
                        >
                          {t('updateButton')}
                        </button>
                      </div>
                    </form>
                  )}

                  {showAddUserModal && (
                      <form onSubmit={handleAddUser} className="flex flex-col h-full bg-white pt-2">
                          <div className="bg-[#0b1626] p-8 flex justify-between items-center"><h4 className="text-xl font-black text-white uppercase italic tracking-tighter">{t('addUserTitle')}</h4><button type="button" onClick={() => setShowAddUserModal(false)} className="text-white/40 hover:text-white transition-colors"><XIcon className="w-7 h-7"/></button></div>
                          <div className="p-10 space-y-6 grow">
                              <div className="flex justify-center mb-8"><div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}><div className="h-28 w-28 rounded-full border-4 border-slate-50 overflow-hidden bg-slate-50 flex items-center justify-center group-hover:border-blue-400 transition-all shadow-xl">{newUser.avatar ? <img src={newUser.avatar} className="h-full w-full object-cover" alt="" /> : <UserIcon className="h-10 w-10 text-slate-200" />}</div><div className="absolute bottom-1 right-1 bg-blue-600 p-2.5 rounded-full text-white shadow-xl border-4 border-white"><CameraIcon className="w-4 h-4" /></div><input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={(e) => handleImageChange(e, 'add')} /></div></div>
                              <div className="space-y-1"><label className="text-[10px] font-black text-slate-300 uppercase tracking-widest ml-1">{t('fullNamePlaceholder')}</label><input required value={newUser.name} onChange={e => setNewUser({...newUser, name: e.target.value})} className="w-full border-2 border-slate-100 p-4 rounded-xl bg-slate-50 text-base font-bold outline-none focus:border-blue-500 transition-all" /></div>
                              <div className="space-y-1"><label className="text-[10px] font-black text-slate-300 uppercase tracking-widest ml-1">{t('usernamePlaceholder')}</label><input required value={newUser.username} onChange={e => setNewUser({...newUser, username: e.target.value})} className="w-full border-2 border-slate-100 p-4 rounded-xl bg-slate-50 text-base font-bold outline-none focus:border-blue-500 transition-all" /></div>
                              <div className="space-y-1"><label className="text-[10px] font-black text-slate-300 uppercase tracking-widest ml-1">{t('passwordPlaceholder')}</label><input required type="password" value={newUser.password} onChange={e => setNewUser({...newUser, password: e.target.value})} className="w-full border-2 border-slate-100 p-4 rounded-xl bg-slate-50 text-base font-bold outline-none focus:border-blue-500 transition-all" /></div>
                          </div>
                          <div className="p-10 bg-slate-50 border-t flex gap-4"><button type="button" onClick={() => setShowAddUserModal(false)} className="flex-1 py-4 font-black text-slate-400 uppercase tracking-widest hover:text-slate-600">{t('cancelButton')}</button><button type="submit" className="flex-1 py-4 bg-blue-600 text-white rounded-xl font-black uppercase tracking-widest shadow-xl hover:bg-blue-700 transition-all">{t('createButton')}</button></div>
                      </form>
                  )}
                  {showEditUserModal && editUserData && (
                      <form onSubmit={handleUpdateUser} className="p-10 space-y-6 bg-white pt-12">
                          <h4 className="text-2xl font-black text-slate-800 uppercase italic tracking-tighter">{t('editUserTitle')}</h4>
                          <div className="flex justify-center my-8"><div className="relative cursor-pointer" onClick={() => fileInputRef.current?.click()}><div className="h-32 w-32 rounded-full border-4 border-slate-50 overflow-hidden bg-slate-50 flex items-center justify-center shadow-xl">{editUserData.avatar ? <img src={editUserData.avatar} className="h-full w-full object-cover" alt="" /> : <UserIcon className="h-12 w-12 text-slate-200" />}</div><div className="absolute bottom-1 right-1 bg-blue-600 p-3 rounded-full text-white shadow-xl border-4 border-white"><CameraIcon className="w-4 h-4" /></div><input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={(e) => handleImageChange(e, 'edit')} /></div></div>
                          <div className="space-y-5">
                              <div className="space-y-1"><label className="text-[10px] font-black text-slate-300 uppercase tracking-widest ml-1">{t('fullNamePlaceholder')}</label><input required value={editUserData.name} onChange={e => setEditUserData({...editUserData, name: e.target.value})} className="w-full border-2 border-slate-100 p-4 rounded-xl bg-slate-50 text-slate-800 text-base font-bold outline-none focus:border-blue-500" /></div>
                              <div className="space-y-1"><label className="text-[10px] font-black text-slate-300 uppercase tracking-widest ml-1">{t('roleLabel')}</label><select value={editUserData.role} onChange={e => setEditUserData({...editUserData, role: e.target.value as any})} className="w-full border-2 border-slate-100 p-4 rounded-xl bg-slate-50 text-slate-800 text-base font-bold outline-none appearance-none cursor-pointer"><option value="user">{t('roleUser')}</option><option value="admin">{t('roleAdmin')}</option></select></div>
                          </div>
                          <div className="flex justify-end items-center gap-6 mt-10"><button type="button" onClick={() => setShowEditUserModal(false)} className="text-slate-400 font-bold uppercase tracking-widest hover:text-slate-600">{t('cancelButton')}</button><button type="submit" className="bg-blue-600 text-white px-10 py-4 rounded-xl font-bold uppercase tracking-widest shadow-xl hover:bg-blue-700 active:scale-95 transition-all">{t('updateButton')}</button></div>
                      </form>
                  )}
              </div>
          </div>
      )}
    </div>
  );
};

export default AdminDashboard;
