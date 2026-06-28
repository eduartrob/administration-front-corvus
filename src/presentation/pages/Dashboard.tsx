import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, GraduationCap, AlertCircle, ArrowRight } from 'lucide-react';
import axios from 'axios';
import { API_CONFIG } from '../../application/config/api_config';

export default function Dashboard() {
  const [stats, setStats] = useState({ students: 0, teachers: 0 });
  const [isLoading, setIsLoading] = useState(true);

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
        // Fallbacks for UI if backend is not fully reachable yet
        setStats({ students: 0, teachers: 0 });
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
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

      {/* Stats Cards */}
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

      {/* Recent Activity */}
      <div className="mb-6 flex justify-between items-end">
        <h3 className="text-title-lg font-semibold text-on-surface">Historial de Acciones Recientes</h3>
        <button className="text-primary font-label-md hover:underline flex items-center gap-1">
          Ver todo el historial <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      <div className="glass-panel rounded-2xl overflow-hidden">
        <div className="divide-y divide-outline-variant/50">
          {[
            {
              id: 1,
              user: 'Juan Pérez',
              role: 'alumno',
              action: 'subió su Tesis',
              detail: 'Proyecto: Análisis Predictivo Avanzado',
              time: 'Hace 5 min',
              tag: 'Documento',
              tagClass: 'bg-primary-container/20 text-primary',
              avatar: 'https://i.pravatar.cc/150?u=1'
            },
            {
              id: 2,
              user: 'Carlos',
              role: 'Profesor',
              action: 'inició sesión en la plataforma',
              detail: 'Acceso desde IP institucional',
              time: 'Hace 15 min',
              tag: 'Sistema',
              tagClass: 'bg-surface-variant text-on-surface-variant',
              avatar: 'https://i.pravatar.cc/150?u=2'
            },
            {
              id: 3,
              user: 'María G.',
              role: 'coordinadora',
              action: 'validó el cluster de proyectos',
              detail: 'Materia: Ingeniería de Datos',
              time: 'Hace 1 hora',
              tag: 'Validación',
              tagClass: 'bg-secondary-container/20 text-secondary',
              avatar: 'https://i.pravatar.cc/150?u=3'
            },
            {
              id: 4,
              user: 'El sistema',
              role: '',
              action: 'detectó una alerta de similitud alta',
              detail: 'Proyecto ID: #8821 - Requiere revisión manual',
              time: 'Hace 2 horas',
              tag: 'Automático',
              tagClass: 'bg-error-container text-error',
              avatar: '',
              isAlert: true
            }
          ].map((item) => (
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
      </div>
    </motion.div>
  );
}
