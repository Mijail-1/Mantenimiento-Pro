
import React, { useState, useEffect } from 'react';
import { UserRole, StaffMember } from '../src/App';
import { Users, UserIcon, DownloadIcon, ArrowLeftIcon } from './Icons';

interface LoginScreenProps {
  onLogin: (role: UserRole, user?: StaffMember) => void;
  staff: StaffMember[];
}

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}


const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin, staff }) => {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showWorkerLogin, setShowWorkerLogin] = useState(false);
  const [showAdminLogin, setShowAdminLogin] = useState(false);

  const [workerPhone, setWorkerPhone] = useState('');
  const [workerPassword, setWorkerPassword] = useState('');
  const [adminUsername, setAdminUsername] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!installPrompt) return;
    await installPrompt.prompt();
    await installPrompt.userChoice;
    setInstallPrompt(null);
  };
  
  const handleWorkerLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const worker = staff.find(s => s.phone === workerPhone);
    if (worker && worker.password === workerPassword) {
        onLogin('worker', worker);
    } else {
        setError('Teléfono o contraseña incorrectos.');
    }
  };

  const handleAdminLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (adminUsername === 'Guille' && adminPassword === '123456') {
        onLogin('admin');
    } else {
        setError('Usuario o contraseña incorrectos.');
    }
  };

  const handleGoBack = () => {
    setShowAdminLogin(false);
    setShowWorkerLogin(false);
    setError('');
    setWorkerPhone('');
    setWorkerPassword('');
    setAdminUsername('');
    setAdminPassword('');
  }

  if (showAdminLogin) {
     return (
      <div className="h-screen w-screen max-w-md mx-auto flex flex-col bg-gray-50 dark:bg-black font-sans">
        <header className="w-full h-14 px-2 flex items-center flex-shrink-0">
          <button onClick={handleGoBack} className="p-2 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800">
            <ArrowLeftIcon className="h-6 w-6" />
          </button>
        </header>
        <div className="flex-grow flex flex-col justify-center items-center p-8 text-center">
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Acceso Administrador</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-2 mb-8">Ingresa tus credenciales</p>
            <form onSubmit={handleAdminLoginSubmit} className="w-full space-y-4">
              <div>
                <input 
                  type="text" 
                  placeholder="Usuario"
                  value={adminUsername}
                  onChange={(e) => setAdminUsername(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  required
                />
              </div>
               <div>
                 <input 
                  type="password" 
                  placeholder="Contraseña"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  required
                />
               </div>
               {error && <p className="text-red-500 text-sm">{error}</p>}
               <button
                  type="submit"
                  className="w-full bg-blue-500 text-white font-bold py-3 px-4 rounded-lg shadow-md hover:bg-blue-600 transition-colors"
                >
                  Ingresar
                </button>
            </form>
        </div>
      </div>
    );
  }

  if (showWorkerLogin) {
    return (
      <div className="h-screen w-screen max-w-md mx-auto flex flex-col bg-gray-50 dark:bg-black font-sans">
        <header className="w-full h-14 px-2 flex items-center flex-shrink-0">
          <button onClick={handleGoBack} className="p-2 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800">
            <ArrowLeftIcon className="h-6 w-6" />
          </button>
        </header>
        <div className="flex-grow flex flex-col justify-center items-center p-8 text-center">
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Acceso Trabajador</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-2 mb-8">Ingresa tus credenciales</p>
            <form onSubmit={handleWorkerLoginSubmit} className="w-full space-y-4">
              <div>
                <input 
                  type="tel" 
                  placeholder="Número de Teléfono"
                  value={workerPhone}
                  onChange={(e) => setWorkerPhone(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  required
                />
              </div>
               <div>
                 <input 
                  type="password" 
                  placeholder="Contraseña"
                  value={workerPassword}
                  onChange={(e) => setWorkerPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  required
                />
               </div>
               {error && <p className="text-red-500 text-sm">{error}</p>}
               <button
                  type="submit"
                  className="w-full bg-green-500 text-white font-bold py-3 px-4 rounded-lg shadow-md hover:bg-green-600 transition-colors"
                >
                  Ingresar
                </button>
            </form>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-screen w-screen max-w-md mx-auto flex flex-col justify-center items-center bg-gray-50 dark:bg-black font-sans p-8 text-center">
      <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Mantenimiento Pro</h1>
      <p className="text-gray-500 dark:text-gray-400 mt-2 mb-12">Selecciona tu rol para continuar</p>
      
      <div className="space-y-4 w-full">
        <button
          onClick={() => setShowAdminLogin(true)}
          className="w-full flex items-center justify-center space-x-3 bg-blue-500 text-white font-bold py-3 px-4 rounded-lg shadow-md hover:bg-blue-600 transition-colors"
        >
          <Users className="w-6 h-6" />
          <span>Login como Administrador</span>
        </button>
        <button
          onClick={() => setShowWorkerLogin(true)}
          className="w-full flex items-center justify-center space-x-3 bg-green-500 text-white font-bold py-3 px-4 rounded-lg shadow-md hover:bg-green-600 transition-colors"
        >
          <UserIcon className="w-6 h-6" />
          <span>Login como Trabajador</span>
        </button>
      </div>

      {installPrompt && (
        <div className="absolute bottom-10 left-8 right-8">
            <button
              onClick={handleInstallClick}
              className="w-full flex items-center justify-center space-x-3 bg-indigo-500 text-white font-bold py-3 px-4 rounded-lg shadow-lg hover:bg-indigo-600 transition-transform transform hover:scale-105"
              aria-label="Instalar aplicación"
            >
              <DownloadIcon className="w-6 h-6" />
              <span>Instalar Aplicación</span>
            </button>
        </div>
      )}
    </div>
  );
};

export default LoginScreen;
