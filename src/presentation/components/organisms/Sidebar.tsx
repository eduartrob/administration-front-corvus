import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LayoutDashboard, Network, BookOpen, CheckSquare, LogOut, Sun, Moon, Settings, ClipboardList, Activity } from 'lucide-react';
import { useAuth } from '../../../application/contexts/AuthContext';
import { useTheme } from '../../../application/contexts/ThemeContext';
import { CorvusLogo } from '../atoms/CorvusLogo';

const menuItems = [
  { path: '/', label: 'Dashboard Principal', icon: LayoutDashboard },
  { path: '/clustering', label: 'Clustering de Proyectos', icon: Network },
  { path: '/inferencias', label: 'Historial de Inferencias', icon: ClipboardList },
  { path: '/materias', label: 'Gestión de Materias', icon: BookOpen },
  { path: '/tareas', label: 'Validación de Tareas', icon: CheckSquare },
  { path: '/system-monitor', label: 'Monitor del Sistema', icon: Activity },
];

interface SidebarProps {
  onOpenSettings?: () => void;
}

export function Sidebar({ onOpenSettings }: SidebarProps) {
  const location = useLocation();
  const { logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <aside className="w-64 bg-surface border-r border-outline-variant flex flex-col h-screen sticky top-0">
      <div className="h-20 flex items-center px-6 border-b border-outline-variant/50">
        <div className="flex items-center gap-3">
          <div className="bg-primary text-white p-2 rounded-lg flex items-center justify-center">
            <CorvusLogo className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="font-title-lg text-[18px] text-primary leading-tight">Corvus</h1>
            <p className="text-[10px] text-on-surface-variant font-label-md tracking-wider uppercase">Innovación Académica</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 py-6 px-3 flex flex-col gap-1">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;
          return (
            <Link key={item.path} to={item.path} className="relative group">
              {isActive && (
                <motion.div
                  layoutId="active-nav-indicator"
                  className="absolute inset-0 bg-primary-container/20 border-r-4 border-primary rounded-lg"
                  initial={false}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
              <div className={`relative px-3 py-3 flex items-center gap-3 rounded-lg transition-colors ${isActive ? 'text-primary' : 'text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface'}`}>
                <Icon className={`w-5 h-5 ${isActive ? 'text-primary' : ''}`} />
                <span className={`font-label-md text-[14px] ${isActive ? 'font-semibold' : ''}`}>{item.label}</span>
              </div>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-outline-variant/50 flex flex-col gap-2">
        <button 
          onClick={onOpenSettings}
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-body-md text-on-surface-variant hover:bg-surface-container-low transition-colors w-full"
        >
          <Settings className="w-5 h-5" />
          Configuración
        </button>
        <button 
          onClick={toggleTheme}
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-body-md text-on-surface-variant hover:bg-surface-container-low transition-colors w-full"
        >
          {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          {theme === 'dark' ? 'Modo Claro' : 'Modo Oscuro'}
        </button>
        <button 
          onClick={logout}
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-body-md text-error hover:bg-error-container/50 transition-colors w-full"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-label-md text-[14px]">Cerrar Sesión</span>
        </button>
      </div>
    </aside>
  );
}
