import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { ClipboardList, RefreshCw, AlertTriangle, ChevronLeft, ChevronRight, CheckCircle, Activity } from 'lucide-react';
import axios from 'axios';
import { API_CONFIG } from '../../application/config/api_config';

interface UserInfo {
  full_name: string;
  role: { name: string };
  profile_picture: string;
  email: string;
}

interface ActivityLog {
  id: string;
  userId: string | null;
  action: string;
  detail: string;
  ipAddress: string | null;
  createdAt: string;
  user?: UserInfo;
}

interface HistoryResponse {
  total: number;
  limit: number;
  offset: number;
  items: ActivityLog[];
}

const LIMIT = 15;

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleString('es-MX', {
    dateStyle: 'short',
    timeStyle: 'medium',
  });
}

export default function ActivityHistory() {
  const [data, setData] = useState<HistoryResponse | null>(null);
  const [offset, setOffset] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async (off: number) => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get<HistoryResponse>(
        `${API_CONFIG.BASE_URL}/auth/admin/activity`,
        { params: { limit: LIMIT, offset: off } }
      );
      setData(res.data);
    } catch {
      setError('No se pudo conectar al servicio de autenticación. Verifica que el backend esté en línea.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(offset); }, [fetchData, offset]);

  const totalPages = data ? Math.ceil(data.total / LIMIT) : 0;
  const currentPage = Math.floor(offset / LIMIT) + 1;

  const renderActionBadge = (action: string) => {
      switch (action) {
          case 'LOGIN': return <span className="px-2 py-1 bg-surface-variant text-on-surface-variant text-xs rounded-full">Sistema</span>;
          case 'UPLOAD_DOCUMENT': return <span className="px-2 py-1 bg-primary-container/20 text-primary text-xs rounded-full">Documento</span>;
          case 'SYSTEM_ALERT': return <span className="px-2 py-1 bg-error-container text-error text-xs rounded-full">Automático</span>;
          default: return <span className="px-2 py-1 bg-surface-variant text-on-surface-variant text-xs rounded-full">General</span>;
      }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-headline-lg font-bold text-on-surface flex items-center gap-3">
            <Activity className="w-8 h-8 text-primary" />
            Historial de Actividad
          </h1>
          <p className="text-body-md text-on-surface-variant mt-2">
            Registro unificado de todas las acciones en la plataforma, desde inicios de sesión hasta alertas automáticas.
          </p>
        </div>
        <button
          onClick={() => fetchData(offset)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary-container/20 text-primary text-label-md hover:bg-primary-container/40 transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Actualizar
        </button>
      </div>

      <div className="glass-panel rounded-2xl overflow-hidden">
        {error && (
          <div className="p-8 text-center text-on-surface-variant">
            <AlertTriangle className="w-10 h-10 text-error mx-auto mb-3" />
            <p className="text-body-md">{error}</p>
          </div>
        )}

        {loading && !error && (
          <div className="p-12 text-center text-on-surface-variant text-body-md animate-pulse">
            Cargando historial de acciones...
          </div>
        )}

        {!loading && !error && data && data.items.length === 0 && (
          <div className="p-12 text-center text-on-surface-variant">
            <Activity className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="text-body-md">Aún no hay acciones registradas.</p>
          </div>
        )}

        {!loading && !error && data && data.items.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-outline-variant/50 text-on-surface-variant text-label-sm uppercase tracking-wider bg-surface-container-low/50">
                  <th className="text-left px-5 py-4 w-12"></th>
                  <th className="text-left px-5 py-4">Usuario</th>
                  <th className="text-left px-5 py-4">Acción</th>
                  <th className="text-left px-5 py-4">Detalle</th>
                  <th className="text-left px-5 py-4">IP</th>
                  <th className="text-right px-5 py-4">Fecha y Hora</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/30">
                {data.items.map((item) => (
                  <tr key={item.id} className="hover:bg-surface-container-low/40 transition-colors">
                    <td className="px-5 py-3">
                        {item.action === 'SYSTEM_ALERT' ? (
                            <div className="w-8 h-8 rounded-full bg-error-container text-error flex items-center justify-center">
                                <AlertTriangle className="w-4 h-4" />
                            </div>
                        ) : (
                            <img 
                                src={item.user?.profile_picture || `https://ui-avatars.com/api/?name=${item.user?.full_name || 'U'}&background=random`} 
                                alt={item.user?.full_name} 
                                className="w-8 h-8 rounded-full object-cover" 
                            />
                        )}
                    </td>
                    <td className="px-5 py-3">
                      <p className="font-semibold text-on-surface">{item.user?.full_name || 'Sistema'}</p>
                      <p className="text-xs text-on-surface-variant uppercase">{item.user?.role?.name || ''}</p>
                    </td>
                    <td className="px-5 py-3">
                        {renderActionBadge(item.action)}
                    </td>
                    <td className="px-5 py-3 max-w-[300px]">
                      <span className="text-on-surface-variant block truncate" title={item.detail}>
                        {item.detail}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-outline font-mono text-xs">
                        {item.ipAddress || '—'}
                    </td>
                    <td className="px-5 py-3 text-right text-on-surface-variant whitespace-nowrap">
                      {formatDate(item.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {data && data.total > LIMIT && (
          <div className="flex items-center justify-between px-5 py-4 border-t border-outline-variant/50">
            <p className="text-label-sm text-on-surface-variant">
              Mostrando {offset + 1}–{Math.min(offset + LIMIT, data.total)} de {data.total}
            </p>
            <div className="flex gap-2">
              <button
                disabled={offset === 0}
                onClick={() => setOffset(Math.max(0, offset - LIMIT))}
                className="p-2 rounded-lg text-on-surface-variant hover:bg-surface-container disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                disabled={offset + LIMIT >= data.total}
                onClick={() => setOffset(offset + LIMIT)}
                className="p-2 rounded-lg text-on-surface-variant hover:bg-surface-container disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
