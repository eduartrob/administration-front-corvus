
import { Bell, HelpCircle, Search, CheckCircle2 } from 'lucide-react';
import { useNotifications } from '../../../application/contexts/NotificationContext';

import { useState, useRef, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from '../organisms/Sidebar';
import { SettingsModal } from '../organisms/SettingsModal';

export function MainLayout() {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const { notifications, unreadCount, markAllAsRead } = useNotifications();
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsNotifOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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
            <div className="relative" ref={dropdownRef}>
              <button 
                onClick={() => {
                  setIsNotifOpen(!isNotifOpen);
                  if (!isNotifOpen && unreadCount > 0) markAllAsRead();
                }}
                className="p-2 text-on-surface-variant hover:bg-surface-container rounded-full transition-colors relative"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-error rounded-full"></span>
                )}
              </button>

              {isNotifOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-surface border border-outline-variant rounded-2xl shadow-xl z-50 overflow-hidden">
                  <div className="p-4 border-b border-outline-variant flex justify-between items-center bg-surface-container-low">
                    <h3 className="font-semibold text-on-surface">Notificaciones</h3>
                    <span className="text-xs text-primary font-medium">{unreadCount} nuevas</span>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="p-8 text-center text-on-surface-variant text-sm">
                        No hay notificaciones
                      </div>
                    ) : (
                      notifications.map(notif => (
                        <div key={notif.id} className={`p-4 border-b border-outline-variant/50 hover:bg-surface-container-low transition-colors ${!notif.read ? 'bg-primary/5' : ''}`}>
                          <div className="flex gap-3">
                            <div className="mt-1">
                              <CheckCircle2 className="w-5 h-5 text-primary" />
                            </div>
                            <div>
                              <p className="text-sm text-on-surface">{notif.message}</p>
                              <span className="text-xs text-on-surface-variant mt-1 block">
                                {notif.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
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
