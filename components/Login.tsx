
import React, { useState } from 'react';
import { UserIcon, EyeIcon, EyeOffIcon, LockClosedIcon } from '../assets/icons';
import { SaltexLogo } from '../assets/saltex-logo';
import { useLanguage } from '../context/LanguageContext';
import { User } from '../types';

interface LoginProps {
  onLoginSuccess: (user: User, isSuperAdmin: boolean) => void;
  users: User[];
  setUsers: React.Dispatch<React.SetStateAction<User[]>>;
}

type ErrorKey = 'loginErrorIncorrectCredentials' | 'registerErrorEmailExists' | 'loginErrorAccountDisabled';

const Login: React.FC<LoginProps> = ({ onLoginSuccess, users, setUsers }) => {
  const { language, setLanguage, t } = useLanguage();
  // State for different views
  const [view, setView] = useState<'login' | 'forgotPassword' | 'register'>('login');

  // State for login form
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false); // State for toggling login password visibility
  const [error, setError] = useState<ErrorKey | null>(null);

  // State for forgot password flow
  const [resetEmail, setResetEmail] = useState('');
  const [resetMessage, setResetMessage] = useState('');

  // State for registration flow
  const [registerName, setRegisterName] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [registerMessage, setRegisterMessage] = useState('');

  const handleLoginSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    
    // Normalizar credenciales para evitar fallos por espacios o mayúsculas en el usuario
    const normalizedUsername = username.trim().toLowerCase();
    const rawPassword = password.trim();

    // Check for hardcoded admin user
    const isSuperAdmin = normalizedUsername === 'admin' && rawPassword === 'Pr1c3sm4rt2025!';
    
    if (isSuperAdmin) {
        setError(null);
        const adminUser: User = { username: 'admin', password: '', name: 'Super Admin', role: 'admin', isDisabled: false };
        onLoginSuccess(adminUser, true);
        return;
    }

    // Check for dynamically registered users (insensible a mayúsculas en el username)
    const registeredUser = users.find(
        user => user.username.toLowerCase() === normalizedUsername && user.password === rawPassword
    );

    if (registeredUser) {
        if (registeredUser.isDisabled) {
            setError('loginErrorAccountDisabled');
        } else {
            setError(null);
            const userWithRole = { ...registeredUser, role: registeredUser.role || 'user' };
            onLoginSuccess(userWithRole, false);
        }
    } else {
        setError('loginErrorIncorrectCredentials');
    }
  };

  const handleResetSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setResetMessage(t('resetSuccessMessage', resetEmail.trim()));
    setResetEmail('');
  };

  const handleRegisterSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const normalizedEmail = registerEmail.trim().toLowerCase();
    
    // Check if user already exists
    const existingUser = users.find(user => user.username.toLowerCase() === normalizedEmail);
    if (existingUser) {
        setError('registerErrorEmailExists');
        setRegisterMessage('');
        return;
    }
    
    // Add new user
    const newUser: User = { 
        name: registerName.trim(), 
        username: normalizedEmail, 
        password: registerPassword.trim(),
        isDisabled: false,
        role: 'user',
        allowedCountries: []
    };
    setUsers(currentUsers => [...currentUsers, newUser]);
    
    setError(null);
    setRegisterMessage(t('registerSuccessMessage'));
    
    setTimeout(() => {
      setRegisterName('');
      setRegisterEmail('');
      setRegisterPassword('');
      navigateTo('login');
    }, 2000);
  };
  
  const navigateTo = (targetView: 'login' | 'forgotPassword' | 'register') => {
      setError(null);
      setResetMessage('');
      setRegisterMessage('');
      setView(targetView);
      setShowPassword(false);
      setShowRegisterPassword(false);
  }
  
  const languageSwitcher = (
    <div className="absolute top-4 right-4 flex items-center text-sm font-medium">
      <button
        onClick={() => setLanguage('es')}
        className={`px-2 py-1 rounded-md transition-colors duration-200 ${language === 'es' ? 'bg-[#0d1a2e] text-cyan-200' : 'text-gray-500 hover:bg-gray-100'}`}
      >
        ES
      </button>
      <span className="mx-1 text-gray-400">|</span>
      <button
        onClick={() => setLanguage('en')}
        className={`px-2 py-1 rounded-md transition-colors duration-200 ${language === 'en' ? 'bg-[#0d1a2e] text-cyan-200' : 'text-gray-500 hover:bg-gray-100'}`}
      >
        EN
      </button>
    </div>
  );

  if (view === 'register') {
      return (
        <div className="relative w-full max-w-md bg-white rounded-xl shadow-2xl p-8 space-y-6 z-10">
            {languageSwitcher}
            <div className="flex justify-center pt-8">
                <SaltexLogo className="h-12 w-auto" />
            </div>
            <h2 className="text-center text-xl font-semibold text-gray-700">{t('createAccountTitle')}</h2>
            
            {registerMessage ? (
                <p className="text-center text-sm text-green-600 bg-green-50 p-3 rounded-md">{registerMessage}</p>
            ) : error ? (
                 <p className="text-center text-sm text-red-600 bg-red-50 p-3 rounded-md">{t(error)}</p>
            ) : (
                <p className="text-center text-gray-600 text-sm">
                    {t('registerSubheading')}
                </p>
            )}

            <form onSubmit={handleRegisterSubmit} className="space-y-6">
                 <div className="relative">
                    <input
                        id="register-name"
                        name="name"
                        type="text"
                        autoComplete="name"
                        required
                        value={registerName}
                        onChange={(e) => setRegisterName(e.target.value)}
                        placeholder={t('fullNamePlaceholder')}
                        className="block w-full pl-10 pr-3 py-2 border-b border-gray-300 focus:outline-none focus:ring-0 focus:border-[#0d1a2e] sm:text-sm"
                        disabled={!!registerMessage}
                    />
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <UserIcon className="h-5 w-5 text-gray-400" />
                    </div>
                </div>
                <div className="relative">
                    <input
                        id="register-email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        required
                        value={registerEmail}
                        onChange={(e) => setRegisterEmail(e.target.value)}
                        placeholder={t('usernamePlaceholder')}
                        className="block w-full pl-10 pr-3 py-2 border-b border-gray-300 focus:outline-none focus:ring-0 focus:border-[#0d1a2e] sm:text-sm"
                        disabled={!!registerMessage}
                    />
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <UserIcon className="h-5 w-5 text-gray-400" />
                    </div>
                </div>
                 <div className="relative">
                    <input
                        id="register-password"
                        name="password"
                        type={showRegisterPassword ? 'text' : 'password'}
                        autoComplete="new-password"
                        required
                        value={registerPassword}
                        onChange={(e) => setRegisterPassword(e.target.value)}
                        placeholder={t('passwordPlaceholder')}
                        className="block w-full pl-10 pr-10 py-2 border-b border-gray-300 focus:outline-none focus:ring-0 focus:border-[#0d1a2e] sm:text-sm"
                        disabled={!!registerMessage}
                    />
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <LockClosedIcon className="h-5 w-5 text-gray-400" />
                    </div>
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                        <button type="button" onClick={() => setShowRegisterPassword(!showRegisterPassword)} className="text-gray-400 hover:text-gray-500 focus:outline-none">
                            {showRegisterPassword ? <EyeOffIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                        </button>
                    </div>
                </div>
                <div>
                    <button
                        type="submit"
                        disabled={!!registerMessage}
                        className="w-full flex justify-center py-2 px-4 border border-[#0d1a2e] rounded-md shadow-sm text-sm font-medium text-[#0d1a2e] bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0d1a2e] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {t('registerButton')}
                    </button>
                </div>
            </form>
             <div className="text-center">
                <a
                    href="#"
                    onClick={(e) => { e.preventDefault(); navigateTo('login'); }}
                    className="text-xs font-medium text-[#0d1a2e] hover:text-[#1a2b4e]"
                >
                    {t('backToLoginLink')}
                </a>
            </div>
        </div>
      );
  }

  if (view === 'forgotPassword') {
    return (
        <div className="relative w-full max-w-md bg-white rounded-xl shadow-2xl p-8 space-y-6 z-10">
            {languageSwitcher}
            <div className="flex justify-center pt-8">
                <SaltexLogo className="h-12 w-auto" />
            </div>
            <h2 className="text-center text-xl font-semibold text-gray-700">{t('resetPasswordTitle')}</h2>
            
            {resetMessage ? (
                <p className="text-center text-sm text-green-600 bg-green-50 p-3 rounded-md">{resetMessage}</p>
            ) : (
                <p className="text-center text-gray-600 text-sm">
                    {t('resetSubheading')}
                </p>
            )}

            <form onSubmit={handleResetSubmit} className="space-y-6">
                <div className="relative">
                    <input
                        id="email-reset"
                        name="email"
                        type="email"
                        autoComplete="email"
                        required
                        value={resetEmail}
                        onChange={(e) => setResetEmail(e.target.value)}
                        placeholder={t('usernamePlaceholder')}
                        className="block w-full pl-10 pr-3 py-2 border-b border-gray-300 focus:outline-none focus:ring-0 focus:border-[#0d1a2e] sm:text-sm"
                    />
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <UserIcon className="h-5 w-5 text-gray-400" />
                    </div>
                </div>

                <div>
                    <button
                        type="submit"
                        className="w-full flex justify-center py-2 px-4 border border-[#0d1a2e] rounded-md shadow-sm text-sm font-medium text-[#0d1a2e] bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0d1a2e]"
                    >
                        {t('sendLinkButton')}
                    </button>
                </div>
            </form>
             <div className="text-center">
                <a
                    href="#"
                    onClick={(e) => { e.preventDefault(); navigateTo('login'); }}
                    className="text-xs font-medium text-[#0d1a2e] hover:text-[#1a2b4e]"
                >
                    {t('backToLoginLink')}
                </a>
            </div>
        </div>
    );
  }

  return (
    <div className="relative w-full max-w-md bg-white rounded-xl shadow-2xl p-8 space-y-6 z-10">
        {languageSwitcher}
        <div className="flex justify-center pt-8">
            <SaltexLogo className="h-12 w-auto" />
        </div>
        <h2 className="text-center text-xl font-semibold text-gray-700">{t('welcomeMessage')}</h2>
        
        <form onSubmit={handleLoginSubmit} className="space-y-6">
            <div className="relative">
                <input
                    id="username"
                    name="username"
                    type="text"
                    autoComplete="username"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder={t('usernamePlaceholder')}
                    className="block w-full pl-10 pr-3 py-2 border-b border-gray-300 focus:outline-none focus:ring-0 focus:border-[#0d1a2e] sm:text-sm"
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <UserIcon className="h-5 w-5 text-gray-400" />
                </div>
            </div>
            
            <div className="relative">
                <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={t('passwordPlaceholder')}
                    className="block w-full pl-10 pr-10 py-2 border-b border-gray-300 focus:outline-none focus:ring-0 focus:border-[#0d1a2e] sm:text-sm"
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <LockClosedIcon className="h-5 w-5 text-gray-400" />
                </div>
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="text-gray-400 hover:text-gray-500 focus:outline-none">
                        {showPassword ? <EyeOffIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                    </button>
                </div>
            </div>

             {error && (
                <p className="text-center text-xs text-red-600 -mt-2">{t(error)}</p>
            )}

            <div>
                <button
                    type="submit"
                    className="w-full flex justify-center py-2 px-4 border border-[#0d1a2e] rounded-md shadow-sm text-sm font-medium text-[#0d1a2e] bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0d1a2e]"
                >
                    {t('loginButton')}
                </button>
            </div>
        </form>

        <div className="text-center text-sm">
            <a
                href="#"
                onClick={(e) => { e.preventDefault(); navigateTo('forgotPassword'); }}
                className="font-medium text-[#0d1a2e] hover:text-[#1a2b4e]"
            >
                {t('forgotPasswordButton')}
            </a>
        </div>

        <div className="text-center text-sm">
            <p className="text-gray-600">
                {t('registerPrompt')} <a href="#" onClick={(e) => { e.preventDefault(); navigateTo('register'); }} className="font-medium text-[#0d1a2e] hover:text-[#1a2b4e]">{t('registerLink')}</a>.
            </p>
        </div>
    </div>
  );
};

export default Login;
