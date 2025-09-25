import React from 'react';
import { TabType } from './PhoneShell';
import { UserRole } from '../App';
import { HomeIcon, ClipboardList, AlertTriangle, Users, MessageSquareIcon, UserIcon } from './Icons';

interface HomeBarProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType, title: string) => void;
  userRole: UserRole;
}

const HomeBar: React.FC<HomeBarProps> = ({ activeTab, setActiveTab, userRole }) => {
  const adminTabs: { id: TabType; icon: React.ReactNode; label: string; title: string }[] = [
    { id: 'dashboard', icon: <HomeIcon className="w-6 h-6" />, label: 'Inicio', title: 'Dashboard' },
    { id: 'tasks', icon: <ClipboardList className="w-6 h-6" />, label: 'Tareas', title: 'Gestión de Tareas' },
    { id: 'incidents', icon: <AlertTriangle className="w-6 h-6" />, label: 'Incidentes', title: 'Incidentes Reportados' },
    { id: 'staff', icon: <Users className="w-6 h-6" />, label: 'Personal', title: 'Gestión de Personal' },
    { id: 'chat', icon: <MessageSquareIcon className="w-6 h-6" />, label: 'Chat', title: 'Chat' },
  ];

  const workerTabs: { id: TabType; icon: React.ReactNode; label: string; title: string }[] = [
    { id: 'my-tasks', icon: <ClipboardList className="w-6 h-6" />, label: 'Mis Tareas', title: 'Mis Tareas' },
    { id: 'report', icon: <AlertTriangle className="w-6 h-6" />, label: 'Reportar', title: 'Reportar Incidente' },
    { id: 'chat', icon: <MessageSquareIcon className="w-6 h-6" />, label: 'Chat', title: 'Chat con Supervisor' },
    { id: 'profile', icon: <UserIcon className="w-6 h-6" />, label: 'Perfil', title: 'Mi Perfil' },
  ];

  const tabs = userRole === 'admin' ? adminTabs : workerTabs;

  return (
    <nav className="w-full h-16 flex justify-around items-center bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 flex-shrink-0">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => setActiveTab(tab.id, tab.title)}
          className={`flex flex-col items-center justify-center w-full h-full transition-colors duration-200 ${
            activeTab === tab.id
              ? 'text-blue-500'
              : 'text-gray-500 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400'
          }`}
          aria-label={tab.label}
          aria-current={activeTab === tab.id}
        >
          {tab.icon}
          <span className="text-xs mt-1">{tab.label}</span>
        </button>
      ))}
    </nav>
  );
};

export default HomeBar;