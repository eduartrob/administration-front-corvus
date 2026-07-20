import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, GraduationCap, AlertCircle, ArrowRight } from 'lucide-react';
import axios from 'axios';
import { API_CONFIG } from '../../application/config/api_config';
import { Link } from 'react-router-dom';
import { useGlobalFilter } from '../../application/contexts/GlobalFilterContext';
import { Skeleton } from '../components/atoms/Skeleton';

// @ts-ignore
export function formatRelativeTime(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) return `Hace unos segundos`;
  if (diffInSeconds < 3600) return `Hace ${Math.floor(diffInSeconds / 60)} min`;
  if (diffInSeconds < 86400) return `Hace ${Math.floor(diffInSeconds / 3600)} horas`;
  return `Hace ${Math.floor(diffInSeconds / 86400)} días`;
}

export default function Dashboard() {
  const { globalUniversityId, globalCareerId } = useGlobalFilter();
  const [stats, setStats] = useState([
  { title: "Usuarios Totales", value: 0, icon: Users, change: "+12%", trend: "up" },
  { title: "Alumnos Activos", value: 0, icon: GraduationCap, change: "+5%", trend: "up" },
  { title: "Profesores", value: 0, icon: Users, change: "+2", trend: "neutral" }
]);
  const [activities, setActivities] = useState<any[]>([]);
  const isLoading = false;
  const isLoadingActivities = false;

  useEffect(() => {
    if (!globalUniversityId || !globalCareerId) return;

    const queryParams = `?university_id=${globalUniversityId}&career_id=${globalCareerId}`;

    const fetchStats = async () => {
      try {
        const statsRes = await axios.get(`${API_CONFIG.BASE_URL}/auth/admin/stats/users${queryParams}`);
        setStats(prev => [
          { ...prev[0], value: statsRes.data.total_users !== undefined ? statsRes.data.total_users : 0 },
          { ...prev[1], value: statsRes.data.students !== undefined ? statsRes.data.students : 0 },
          { ...prev[2], value: statsRes.data.teachers !== undefined ? statsRes.data.teachers : 0 }
        ]);

        const activityRes = await axios.get(`${API_CONFIG.BASE_URL}/auth/admin/activity?limit=5&university_id=${globalUniversityId}&career_id=${globalCareerId}`);
        if (activityRes.data && Array.isArray(activityRes.data.items)) {
          setActivities(activityRes.data.items);
        } else {
          setActivities([]);
        }
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      }
    };
    fetchStats();
  }, [globalUniversityId, globalCareerId]);
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="mb-8">
        <h1 className="text-headline-lg font-bold text-on-surface">Visión General</h1>
        <p className="text-body-md text-on-surface-variant mt-2">Métricas de rendimiento institucional y actividad reciente en la plataforma de innovación académica.</p>
      </div>

      {}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="glass-panel p-6 rounded-2xl flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-surface-container rounded-xl text-primary">
              <Users className="w-6 h-6" />
            </div>
            <span className="px-3 py-1 bg-surface-container-low text-on-surface-variant text-label-sm font-semibold rounded-full border border-outline-variant flex items-center">
              <svg className="w-3 h-3 mr-1 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
              +12%
            </span>
          </div>
          <div>
            <p className="text-label-md text-on-surface-variant uppercase tracking-wider mb-1">TOTAL ALUMNOS REGISTRADOS</p>
            <h2 className="text-display-lg font-bold text-on-surface">
              {isLoading ? <Skeleton variant="text" className="w-16 h-12" /> : stats[1].value.toLocaleString()}
            </h2>
          </div>
        </div>

        <div className="glass-panel p-6 rounded-2xl flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-secondary-container/20 rounded-xl text-secondary">
              <GraduationCap className="w-6 h-6" />
            </div>
            <span className="px-3 py-1 bg-surface-container-low text-on-surface-variant text-label-sm font-semibold rounded-full border border-outline-variant">
              → Estable
            </span>
          </div>
          <div>
            <p className="text-label-md text-on-surface-variant uppercase tracking-wider mb-1">PROFESORES ACTIVOS</p>
            <h2 className="text-display-lg font-bold text-on-surface">
              {isLoading ? <Skeleton variant="text" className="w-12 h-12" /> : stats[2].value.toLocaleString()}
            </h2>
          </div>
        </div>

        <div className="glass-panel p-6 rounded-2xl flex flex-col justify-between border-error-container">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-error-container text-error rounded-xl">
              <AlertCircle className="w-6 h-6" />
            </div>
            <button className="px-3 py-1 bg-surface-container-low text-primary text-label-sm font-semibold rounded-full border border-primary/30 hover:bg-primary-container/10 transition-colors">
              Revisar
            </button>
          </div>
          <div>
            <p className="text-label-md text-on-surface-variant uppercase tracking-wider mb-1">ALERTAS DEL SISTEMA</p>
            <div className="flex items-baseline gap-2">
              <h2 className="text-display-lg font-bold text-on-surface">4</h2>
              <span className="text-error font-medium text-title-lg">críticas</span>
            </div>
          </div>
        </div>
      </div>

      {}
      <div className="mb-6 flex justify-between items-end">
        <h3 className="text-title-lg font-semibold text-on-surface">Historial de Acciones Recientes</h3>
        <Link to="/actividad" className="text-primary font-label-md hover:underline flex items-center gap-1">
          Ver todo el historial <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      <div className="glass-panel rounded-2xl overflow-hidden">
        {isLoadingActivities ? (
          <div className="divide-y divide-outline-variant/50">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="p-4 sm:p-5 flex items-center gap-4">
                <Skeleton variant="circular" className="w-12 h-12 flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="w-3/4 h-4" />
                  <Skeleton className="w-1/2 h-3" />
                </div>
                <div className="flex flex-col items-end gap-2 flex-shrink-0">
                  <Skeleton className="w-16 h-3" />
                  <Skeleton className="w-20 h-5 rounded-full" />
                </div>
              </div>
            ))}
          </div>
        ) : activities.length === 0 ? (
          <div className="p-8 text-center text-on-surface-variant">
            No hay acciones recientes registradas.
          </div>
        ) : (
          <div className="divide-y divide-outline-variant/50">
            {activities.map((item) => {
              const fullName = item.user?.full_name || item.user?.email || 'Usuario';
              const roleName = item.user?.role?.name || '';
              const avatar = item.user?.profile_picture || `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=random`;
              
              return (
                <div key={item.id} className="p-4 sm:p-5 flex items-center gap-4 hover:bg-surface-container-low/50 transition-colors">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full overflow-hidden bg-surface-container-highest border border-outline-variant flex items-center justify-center">
                    <img src={avatar} alt={fullName} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                  <p className="text-body-md text-on-surface truncate">
                    {roleName ? `El ${roleName} ` : ''}
                    <span className="font-semibold">{fullName}</span> {item.action}.
                  </p>
                  <p className="text-label-sm text-on-surface-variant truncate mt-0.5">{item.detail}</p>
                </div>
                <div className="flex flex-col items-end gap-2 flex-shrink-0">
                  <span className="text-label-sm text-outline font-medium">{formatRelativeTime(item.createdAt)}</span>
                </div>
              </div>
              );
            })}
          </div>
        )}
      </div>
    </motion.div>
  );
}
