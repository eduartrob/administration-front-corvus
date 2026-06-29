import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, GraduationCap, AlertCircle, ArrowRight } from 'lucide-react';
import axios from 'axios';
import { API_CONFIG } from '../../application/config/api_config';
import { Link } from 'react-router-dom';

function formatRelativeTime(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) return `Hace unos segundos`;
  if (diffInSeconds < 3600) return `Hace ${Math.floor(diffInSeconds / 60)} min`;
  if (diffInSeconds < 86400) return `Hace ${Math.floor(diffInSeconds / 3600)} horas`;
  return `Hace ${Math.floor(diffInSeconds / 86400)} días`;
}

export default function Dashboard() {
  const [stats, setStats] = useState({ students: 0, teachers: 0 });
  const [activities, setActivities] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingActivities, setIsLoadingActivities] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await axios.get(`${API_CONFIG.BASE_URL}/auth/admin/stats/users`);
        if (response.data && response.data.success) {
          setStats({
            students: response.data.students || 0,
            teachers: response.data.teachers || 0
          });
        }
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        setStats({ students: 0, teachers: 0 });
      } finally {
        setIsLoading(false);
      }
    };

    const fetchActivities = async () => {
      try {
        const res = await axios.get(`${API_CONFIG.BASE_URL}/auth/admin/activity?limit=5`);
        if (res.data && res.data.success) {
          const mapped = res.data.items.map((log: any) => {
             let actionText = '';
             let tag = '';
             let tagClass = '';
             let isAlert = false;
             
             if (log.action === 'LOGIN') {
                actionText = 'inició sesión en la plataforma';
                tag = 'Sistema';
                tagClass = 'bg-surface-variant text-on-surface-variant';
             } else if (log.action === 'UPLOAD_DOCUMENT') {
                actionText = 'subió un documento';
                tag = 'Documento';
                tagClass = 'bg-primary-container/20 text-primary';
             } else if (log.action === 'SYSTEM_ALERT') {
                actionText = 'detectó una alerta de similitud alta';
                tag = 'Automático';
                tagClass = 'bg-error-container text-error';
                isAlert = true;
             } else {
                actionText = 'realizó una acción';
                tag = 'General';
                tagClass = 'bg-surface-variant text-on-surface-variant';
             }
             
             return {
                id: log.id,
                user: log.user?.full_name || 'Usuario desconocido',
                role: log.user?.role?.name?.toLowerCase() || '',
                action: actionText,
                detail: log.detail,
                time: formatRelativeTime(log.createdAt),
                tag,
                tagClass,
                avatar: log.user?.profile_picture || `https://ui-avatars.com/api/?name=${log.user?.full_name || 'U'}&background=random`,
                isAlert: isAlert || log.action === 'SYSTEM_ALERT'
             };
          });
          setActivities(mapped);
        }
      } catch (error) {
        console.error('Error fetching activities:', error);
      } finally {
        setIsLoadingActivities(false);
      }
    };

    fetchStats();
    fetchActivities();
  }, []);
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
              {isLoading ? '...' : stats.students.toLocaleString()}
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
              {isLoading ? '...' : stats.teachers.toLocaleString()}
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
          <div className="p-8 text-center text-on-surface-variant animate-pulse">
            Cargando historial...
          </div>
        ) : activities.length === 0 ? (
          <div className="p-8 text-center text-on-surface-variant">
            No hay acciones recientes registradas.
          </div>
        ) : (
          <div className="divide-y divide-outline-variant/50">
            {activities.map((item) => (
              <div key={item.id} className="p-4 sm:p-5 flex items-center gap-4 hover:bg-surface-container-low/50 transition-colors">
                <div className="flex-shrink-0 w-12 h-12 rounded-full overflow-hidden bg-surface-container-highest border border-outline-variant flex items-center justify-center">
                  {item.isAlert ? (
                    <AlertCircle className="w-6 h-6 text-error" />
                  ) : (
                    <img src={item.avatar} alt={item.user} className="w-full h-full object-cover" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                <p className="text-body-md text-on-surface truncate">
                  {item.role ? `El ${item.role} ` : ''}
                  <span className="font-semibold">{item.user}</span> {item.action}.
                </p>
                <p className="text-label-sm text-on-surface-variant truncate mt-0.5">{item.detail}</p>
              </div>
              <div className="flex flex-col items-end gap-2 flex-shrink-0">
                <span className="text-label-sm text-outline font-medium">{item.time}</span>
                <span className={`text-[12px] px-3 py-0.5 rounded-full font-medium ${item.tagClass}`}>
                  {item.tag}
                </span>
              </div>
            </div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}
