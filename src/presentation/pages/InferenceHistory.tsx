import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { ClipboardList, RefreshCw, AlertTriangle, CheckCircle, Minus, ChevronLeft, ChevronRight } from 'lucide-react';
import axios from 'axios';
import { API_CONFIG } from '../../application/config/api_config';

interface InferenceRecord {
  id: number;
  user_id: string;
  timestamp: number;
  filename: string;
  score_colision: number;
  nivel_riesgo: 'Bajo' | 'Medio' | 'Alto';
  academic_alignment: number;
  veredicto: string | null;
  secciones_faltantes: string;
  secciones_opcionales: string;
  cluster_id?: number | null;
}

import { MinimapPreview, type MinimapCluster } from '../components/molecules/MinimapPreview';

interface HistoryResponse {
  total: number;
  limit: number;
  offset: number;
  items: InferenceRecord[];
}

const LIMIT = 15;

const riskConfig = {
  Bajo:  { color: 'text-green-400',  bg: 'bg-green-400/10',  icon: CheckCircle,     label: 'Bajo' },
  Medio: { color: 'text-yellow-400', bg: 'bg-yellow-400/10', icon: Minus,            label: 'Medio' },
  Alto:  { color: 'text-red-400',    bg: 'bg-red-400/10',    icon: AlertTriangle,    label: 'Alto' },
};

function formatDate(ts: number) {
  return new Date(ts * 1000).toLocaleString('es-MX', {
    dateStyle: 'short',
    timeStyle: 'short',
  });
}

export default function InferenceHistory() {
  const [data, setData]       = useState<HistoryResponse | null>(null);
  const [offset, setOffset]   = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);
  
  const [minimapClusters, setMinimapClusters] = useState<MinimapCluster[]>([]);
  const [hoveredInference, setHoveredInference] = useState<number | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  const fetchData = useCallback(async (off: number) => {
    setLoading(true);
    setError(null);
    try {
      const [res, minimapRes] = await Promise.all([
        axios.get<HistoryResponse>(
          `${API_CONFIG.BASE_URL}/clustering/integrator/inference-history`,
          { params: { limit: LIMIT, offset: off } }
        ),
        axios.get<{ clusters: MinimapCluster[] }>(
          `${API_CONFIG.BASE_URL}/clustering/integrator/admin/minimap-data`
        ).catch(() => ({ data: { clusters: [] } }))
      ]);
      setData(res.data);
      setMinimapClusters(minimapRes.data.clusters || []);
    } catch {
      setError('No se pudo conectar al servicio de clustering. Verifica que el backend esté en línea.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(offset); }, [fetchData, offset]);

  const totalPages  = data ? Math.ceil(data.total / LIMIT) : 0;
  const currentPage = Math.floor(offset / LIMIT) + 1;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {}
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-headline-lg font-bold text-on-surface flex items-center gap-3">
            <ClipboardList className="w-8 h-8 text-primary" />
            Historial de Inferencias
          </h1>
          <p className="text-body-md text-on-surface-variant mt-2">
            Registro de auditoría de todos los análisis de propuestas enviados por los alumnos.
          </p>
        </div>
        <button
          id="refresh-inference-history"
          onClick={() => fetchData(offset)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary-container/20 text-primary text-label-md hover:bg-primary-container/40 transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Actualizar
        </button>
      </div>

      {}
      {data && (
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="glass-panel p-5 rounded-2xl">
            <p className="text-label-md text-on-surface-variant uppercase tracking-wider mb-1">Total Análisis</p>
            <h2 className="text-display-lg font-bold text-on-surface">{data.total}</h2>
          </div>
          <div className="glass-panel p-5 rounded-2xl">
            <p className="text-label-md text-on-surface-variant uppercase tracking-wider mb-1">Riesgo Alto</p>
            <h2 className="text-display-lg font-bold text-red-400">
              {data.items.filter(i => i.nivel_riesgo === 'Alto').length}
              <span className="text-label-md text-on-surface-variant font-normal ml-1">en esta página</span>
            </h2>
          </div>
          <div className="glass-panel p-5 rounded-2xl">
            <p className="text-label-md text-on-surface-variant uppercase tracking-wider mb-1">Página</p>
            <h2 className="text-display-lg font-bold text-on-surface">{currentPage} / {totalPages || 1}</h2>
          </div>
        </div>
      )}

      {}
      <div className="glass-panel rounded-2xl overflow-hidden">
        {error && (
          <div className="p-8 text-center text-on-surface-variant">
            <AlertTriangle className="w-10 h-10 text-error mx-auto mb-3" />
            <p className="text-body-md">{error}</p>
          </div>
        )}

        {loading && !error && (
          <div className="p-12 text-center text-on-surface-variant text-body-md animate-pulse">
            Cargando historial...
          </div>
        )}

        {!loading && !error && data && data.items.length === 0 && (
          <div className="p-12 text-center text-on-surface-variant">
            <ClipboardList className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="text-body-md">Aún no hay inferencias registradas.</p>
            <p className="text-label-sm mt-1">Las inferencias aparecerán aquí cuando los alumnos suban sus propuestas.</p>
          </div>
        )}

        {!loading && !error && data && data.items.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-outline-variant/50 text-on-surface-variant text-label-sm uppercase tracking-wider">
                  <th className="text-left px-5 py-3">#</th>
                  <th className="text-left px-5 py-3">Usuario</th>
                  <th className="text-left px-5 py-3">Archivo</th>
                  <th className="text-left px-5 py-3">Fecha</th>
                  <th className="text-center px-5 py-3">Score Colisión</th>
                  <th className="text-center px-5 py-3">Riesgo</th>
                  <th className="text-center px-5 py-3">Alineación</th>
                  <th className="text-left px-5 py-3">Secciones encontradas</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/30">
                {data.items.map((item) => {
                  const risk = riskConfig[item.nivel_riesgo] ?? riskConfig['Bajo'];
                  const RiskIcon = risk.icon;
                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-surface-container-low/40 transition-colors relative cursor-default"
                      onMouseEnter={() => setHoveredInference(item.id)}
                      onMouseMove={(e) => {
                        setTooltipPos({ x: e.clientX, y: e.clientY });
                      }}
                      onMouseLeave={() => setHoveredInference(null)}
                    >
                      <td className="px-5 py-3 text-outline font-mono text-xs">{item.id}</td>
                      <td className="px-5 py-3">
                        <span className="font-medium text-on-surface text-label-md">{item.user_id}</span>
                      </td>
                      <td className="px-5 py-3 max-w-[180px]">
                        <span className="text-on-surface-variant truncate block" title={item.filename}>
                          {item.filename || '—'}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-on-surface-variant whitespace-nowrap">
                        {formatDate(item.timestamp)}
                      </td>
                      <td className="px-5 py-3 text-center">
                        <div className="inline-flex items-center gap-1">
                          <div className="w-24 h-2 rounded-full bg-surface-container-highest overflow-hidden">
                            <div
                              className={`h-full rounded-full ${item.score_colision > 50 ? 'bg-red-400' : item.score_colision > 20 ? 'bg-yellow-400' : 'bg-green-400'}`}
                              style={{ width: `${Math.min(item.score_colision, 100)}%` }}
                            />
                          </div>
                          <span className="text-label-sm text-on-surface-variant w-8 text-right">
                            {item.score_colision.toFixed(0)}%
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-3 text-center">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-label-sm font-medium ${risk.bg} ${risk.color}`}>
                          <RiskIcon className="w-3.5 h-3.5" />
                          {risk.label}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-center">
                        <span className={`text-label-md font-semibold ${item.academic_alignment >= 70 ? 'text-green-400' : item.academic_alignment >= 40 ? 'text-yellow-400' : 'text-red-400'}`}>
                          {item.academic_alignment}%
                        </span>
                      </td>
                      <td className="px-5 py-3 max-w-[220px]">
                        <span className="text-label-sm text-on-surface-variant line-clamp-2" title={item.secciones_opcionales}>
                          {item.secciones_opcionales || '—'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {}
        {data && data.total > LIMIT && (
          <div className="flex items-center justify-between px-5 py-4 border-t border-outline-variant/50">
            <p className="text-label-sm text-on-surface-variant">
              Mostrando {offset + 1}–{Math.min(offset + LIMIT, data.total)} de {data.total}
            </p>
            <div className="flex gap-2">
              <button
                id="inference-history-prev"
                disabled={offset === 0}
                onClick={() => setOffset(Math.max(0, offset - LIMIT))}
                className="p-2 rounded-lg text-on-surface-variant hover:bg-surface-container disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                id="inference-history-next"
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

      {hoveredInference !== null && (
        <div
          className="fixed pointer-events-none z-[100]"
          style={{
            left: tooltipPos.x + 15,
            top: tooltipPos.y + 15,
          }}
        >
          <MinimapPreview
            clusters={minimapClusters}
            targetClusterId={data?.items.find(i => i.id === hoveredInference)?.cluster_id}
          />
        </div>
      )}
    </motion.div>
  );
}
