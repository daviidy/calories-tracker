'use client';

import { useState } from 'react';
import Sidebar from './Sidebar';

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
      {/* Mobile sidebar */}
      <div className={`fixed inset-0 z-20 transition-opacity bg-black opacity-50 lg:hidden ${
        isSidebarOpen ? 'block' : 'hidden'
      }`} onClick={() => setIsSidebarOpen(false)} />
      
      <div className={`fixed inset-y-0 left-0 z-30 w-64 transition duration-300 transform bg-white lg:translate-x-0 lg:static lg:inset-0 dark:bg-gray-900 ${
        isSidebarOpen ? 'translate-x-0 ease-out' : '-translate-x-full ease-in'
      }`}>
        <Sidebar />
      </div>

      <div className="flex flex-col flex-1 overflow-hidden">
        <header className="flex items-center justify-between px-6 py-4 bg-white dark:bg-gray-900 lg:hidden">
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="p-1 text-gray-600 dark:text-gray-400"
          >
            <svg 
              className="w-6 h-6" 
              viewBox="0 0 24 24" 
              fill="none" 
              xmlns="http://www.w3.org/2000/svg"
            >
              <path 
                d="M4 6H20M4 12H20M4 18H20" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </header>

        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 dark:bg-gray-800">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout; 