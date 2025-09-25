import React from 'react';
import { LogOutIcon } from './Icons';

interface HeaderProps {
    title: string;
    onLogout: () => void;
}

const Header: React.FC<HeaderProps> = ({ title, onLogout }) => {
  return (
    <header className="w-full h-14 px-4 flex justify-between items-center text-black dark:text-white bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 flex-shrink-0 z-10">
      <h1 className="text-xl font-bold">{title}</h1>
      <button onClick={onLogout} aria-label="Logout" className="p-2 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800">
        <LogOutIcon className="h-6 w-6" />
      </button>
    </header>
  );
};

export default Header;