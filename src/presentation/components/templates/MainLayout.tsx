import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from '../organisms/Sidebar';
import { SettingsModal } from '../organisms/SettingsModal';
import { Bell, HelpCircle, Search } from 'lucide-react';

export function MainLayout() {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar onOpenSettings={() => setIsSettingsOpen(true)} />
      <div className="flex-1 flex flex-col">
        {}
        <header className="h-20 bg-surface border-b border-outline-variant flex items-center justify-between px-8 sticky top-0 z-10">
          <div className="flex-1 max-w-2xl">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-outline" />
              </div>
              <input
                type="text"
                placeholder="Buscar proyectos, categorías..."
                className="block w-full pl-10 pr-3 py-2.5 border-none rounded-xl bg-surface-container-low text-body-md placeholder-outline focus:ring-2 focus:ring-primary/50 transition-all"
              />
            </div>
          </div>
          <div className="flex items-center gap-4 ml-4">
            <button className="p-2 text-on-surface-variant hover:bg-surface-container rounded-full transition-colors relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-error rounded-full"></span>
            </button>
            <button className="p-2 text-on-surface-variant hover:bg-surface-container rounded-full transition-colors">
              <HelpCircle className="w-5 h-5" />
            </button>
            <div className="w-10 h-10 rounded-full bg-primary-container overflow-hidden border-2 border-surface-container-highest cursor-pointer ml-2">
              <img src="https://i.pravatar.cc/150?u=a042581f4e29026704d" alt="Profile" className="w-full h-full object-cover" />
            </div>
          </div>
        </header>
        
        {}
        <main className="flex-1 p-8 overflow-auto">
          <Outlet />
        </main>
      </div>
      
      {}
      <SettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
      />
    </div>
  );
}
