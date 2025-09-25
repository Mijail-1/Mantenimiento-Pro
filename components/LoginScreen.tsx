
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
  
  const handleGoBack = () => {
    setShowWorkerLogin(false);
  }


  if (showWorkerLogin) {
    return (
      <div className="h-screen w-screen max-w-md mx-auto flex flex-col bg-gray-50 dark:bg-gray-900 font-sans">
        <header className="w-full h-14 px-2 flex items-center flex-shrink-0">
          <button onClick={handleGoBack} className="p-2 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800">
            <ArrowLeftIcon className="h-6 w-6" />
          </button>
        </header>
        <div className="flex-grow flex flex-col items-center p-8 text-center">
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Selecciona tu Perfil</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-2 mb-8">Toca tu nombre para ingresar</p>
            <div className="w-full space-y-3">
                {staff.map(worker => (
                    <button
                        key={worker.id}
                        onClick={() => onLogin('worker', worker)}
                        className="w-full flex items-center space-x-4 p-4 bg-white dark:bg-gray-800 rounded-lg shadow hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                         <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center font-bold text-gray-600 dark:text-gray-300 text-lg">
                            {worker.name.charAt(0)}
                        </div>
                        <span className="font-semibold text-gray-800 dark:text-white">{worker.name}</span>
                    </button>
                ))}
            </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-screen w-screen max-w-md mx-auto flex flex-col justify-center items-center bg-gray-50 dark:bg-gray-900 font-sans p-8 text-center">
      <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Mantenimiento Pro</h1>
      <p className="text-gray-500 dark:text-gray-400 mt-2 mb-12">Selecciona tu rol para continuar</p>
      
      <div className="space-y-4 w-full">
        <button
          onClick={() => onLogin('admin')}
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
