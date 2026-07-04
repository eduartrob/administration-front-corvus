import { motion } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Play, Database, Compass, BarChart2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, BarChart, Bar, CartesianGrid } from 'recharts';
import { API_CONFIG } from '../../application/config/api_config';
import { ToastNotification } from '../components/molecules/ToastNotification';
import { Skeleton } from '../components/atoms/Skeleton';

export default function Clustering() {
  const [viewMode, setViewMode] = useState<'2d' | '3d'>('2d');
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [isLoadingMaps, setIsLoadingMaps] = useState(true);
  const [projectCount, setProjectCount] = useState<number>(0);
  const [dynamicBarData, setDynamicBarData] = useState<any[]>([]);
  const [recentProjects, setRecentProjects] = useState<any[]>([]);
  const [isExecuting, setIsExecuting] = useState(false);
  const [executeMsg, setExecuteMsg] = useState('');
  const [html2d, setHtml2d] = useState<string>('');
  const [html3d, setHtml3d] = useState<string>('');
  const [blueOceansCount, setBlueOceansCount] = useState<number>(0);
  const isExecutingRef = useRef(false);
  const [toastMsg, setToastMsg] = useState('');
  const [selectedTab, setSelectedTab] = useState<string>('global');
  const [driftMetrics, setDriftMetrics] = useState<any>(null);

  const fetchMaps = async (tab: string) => {
    try {
      const scatterRes = await axios.get(`${API_CONFIG.BASE_URL}/clustering/integrator/admin/clusters-2d-html?filter_cluster_id=${tab}`);
      if (typeof scatterRes.data === 'string') {
        setHtml2d(scatterRes.data);
      }
    } catch (error) {
      console.error('Error fetching 2D html:', error);
    }

    try {
      const htmlRes = await axios.get(`${API_CONFIG.BASE_URL}/clustering/integrator/admin/clusters-3d?filter_cluster_id=${tab}`);
      if (typeof htmlRes.data === 'string') {
        setHtml3d(htmlRes.data);
      }
    } catch (error) {
      console.error('Error fetching 3D html:', error);
    } finally {
      setIsLoadingMaps(false);
    }
  };

  useEffect(() => {
    fetchMaps(selectedTab);
  }, [selectedTab]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const countRes = await axios.get(`${API_CONFIG.BASE_URL}/clustering/integrator/admin/projects-count`);
        if (countRes.data && countRes.data.count !== undefined) {
          setProjectCount(countRes.data.count);
        }
        
        try {
          const driftRes = await axios.get(`${API_CONFIG.BASE_URL}/clustering/integrator/drift-metrics`);
          setDriftMetrics(driftRes.data);
        } catch (e) {
          console.warn('Drift metrics not available');
        }
      } catch (error) {
        console.error('Error fetching project count:', error);
      }

      try {
        const recentRes = await axios.get(`${API_CONFIG.BASE_URL}/clustering/integrator/admin/recent-projects?limit=5`);
        if (Array.isArray(recentRes.data)) {
          setRecentProjects(recentRes.data);
        }
      } catch (error) {
        console.error('Error fetching recent projects:', error);
      }
      
      try {
        const statsRes = await axios.get(`${API_CONFIG.BASE_URL}/clustering/integrator/admin/clusters-stats`);
        if (statsRes.data && statsRes.data.is_clustering_running !== undefined) {
           const wasExecuting = isExecutingRef.current;
           const isNowExecuting = statsRes.data.is_clustering_running;
           
           setIsExecuting(isNowExecuting);
           isExecutingRef.current = isNowExecuting;

           if (statsRes.data.last_error && !isNowExecuting) {
             setExecuteMsg(`Fallo en el servidor: ${statsRes.data.last_error}`);
           }

           // Si acaba de terminar de ejecutarse, actualizamos también los mapas
           if (wasExecuting === true && isNowExecuting === false) {
             if (!statsRes.data.last_error) {
               setSelectedTab('global');
               fetchMaps('global');
             }
           }
        }
        if (statsRes.data && statsRes.data.clusters_detail) {
          const formattedData = statsRes.data.clusters_detail.map((c: any) => ({
            name: c.cluster_name || `Clúster ${c.cluster_id}`,
            value: c.project_count,
            cluster_id: c.cluster_id
          }));
          setDynamicBarData(formattedData);
        }
        if (statsRes.data && statsRes.data.blue_oceans !== undefined) {
          setBlueOceansCount(statsRes.data.blue_oceans);
        } else if (statsRes.data && statsRes.data.labels && statsRes.data.data) {
          const formattedData = statsRes.data.labels.map((label: string, index: number) => ({
            name: label,
            value: statsRes.data.data[index],
            color: statsRes.data.colors ? statsRes.data.colors[index] : undefined
          }));
          setDynamicBarData(formattedData);
        } else if (Array.isArray(statsRes.data)) {
          setDynamicBarData(statsRes.data);
        } else if (statsRes.data && Array.isArray(statsRes.data.categories)) {
          setDynamicBarData(statsRes.data.categories);
        }
      } catch (error) {
        console.error('Error fetching cluster stats:', error);
      } finally {
        setIsLoadingStats(false);
      }
    };

    fetchStats();
    
    // -# Configurar polling cada 10 segundos SOLO para las estadísticas
    const intervalId = setInterval(fetchStats, 10000);

    return () => clearInterval(intervalId);
  }, []);

  const executeClustering = async () => {
    setIsExecuting(true);
    setExecuteMsg('');
    try {
      const res = await axios.post(`${API_CONFIG.BASE_URL}/clustering/integrator/admin/execute`);
      setExecuteMsg(res.data?.message || 'Clustering global iniciado. Esto puede tomar unos minutos.');
    } catch (error) {
      console.error(error);
      setExecuteMsg('Error al iniciar clustering');
      setIsExecuting(false);
    } finally {
      setTimeout(() => setExecuteMsg(''), 6000);
    }
  };

  const clusteredCount = dynamicBarData.reduce((acc, curr) => acc + (curr.value || 0), 0) + blueOceansCount;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-headline-lg font-bold text-on-surface">Clustering de Proyectos</h1>
          <p className="text-body-md text-on-surface-variant mt-2 max-w-2xl">Análisis semántico y agrupación automatizada de trabajos académicos para identificar sinergias y nuevas áreas de investigación.</p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <button 
            onClick={executeClustering}
            disabled={isExecuting}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-label-md interactive-element shadow-sm transition-colors ${isExecuting ? 'bg-outline text-white cursor-not-allowed' : 'bg-primary text-white hover:bg-primary/90'}`}
          >
            {isExecuting ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
              <Play className="w-5 h-5" fill="currentColor" />
            )}
            {isExecuting ? 'Iniciando...' : 'Ejecutar Clustering Global'}
          </button>
          {executeMsg && (
            <span className={`text-[12px] font-medium px-3 py-1 rounded-full ${executeMsg.includes('Error') ? 'bg-error text-white' : 'bg-primary text-white'}`}>
              {executeMsg}
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="flex flex-col gap-6">
          <div className="glass-panel p-6 rounded-2xl flex items-center justify-between">
            <div>
              <p className="text-body-md text-on-surface-variant mb-2">Proyectos Agrupados<br/>(En Clústeres)</p>
              <div className="flex items-end gap-3">
                <h2 className="text-display-lg font-bold text-on-surface leading-none">
                  {isLoadingStats ? <Skeleton variant="text" className="w-20 h-10" /> : clusteredCount.toLocaleString()}
                </h2>
                <span className="text-primary font-semibold text-label-md mb-2 flex items-center">
                  Total BD: {isLoadingStats ? <Skeleton variant="text" className="w-8 h-4 ml-2" /> : projectCount}
                </span>
              </div>
            </div>
            <div className="w-14 h-14 bg-primary-fixed rounded-full flex items-center justify-center text-primary border border-primary/20">
              <Database className="w-7 h-7" />
            </div>
          </div>

          <div className="glass-panel p-6 rounded-2xl flex flex-col justify-between border border-error-container/30 bg-error-container/5 hover:bg-error-container/10 transition-colors">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-error-container text-error rounded-xl shadow-sm">
                <Compass className="w-6 h-6" />
              </div>
              <span className="px-3 py-1 bg-surface-container-low text-error text-label-sm font-semibold rounded-full border border-error/30 animate-pulse">
                Inexplorados
              </span>
            </div>
            <div>
              <p className="text-body-md text-on-surface-variant mb-1">Océanos Azules</p>
              <div className="flex items-baseline gap-2">
                <h2 className="text-display-lg font-bold text-on-surface leading-none">
                  {isLoadingStats ? <Skeleton variant="text" className="w-12 h-10" /> : blueOceansCount}
                </h2>
                <span className="text-error font-medium text-label-sm">hallazgos</span>
              </div>
            </div>
          </div>

          {(() => {
            if (isLoadingStats) {
              return <div className="glass-panel p-6 rounded-2xl h-48 flex items-center justify-center"><Skeleton className="w-full h-full" /></div>;
            }
            const metrics = driftMetrics || {
              status: 'normal',
              drift_rate_pct: 0,
              message: 'Ecosistema estable.',
              total_new_projects: 0,
              sse_anomalies_count: 0
            };
            return (
              <div className={`glass-panel p-6 rounded-2xl flex flex-col justify-between transition-colors ${metrics.status === 'alert' ? 'border border-error/40 bg-error/5 hover:bg-error/10' : ''}`}>
                <div className="flex items-center justify-between mb-4">
                  <p className="text-body-md text-on-surface-variant">Tasa de Deriva<br/>(Drift Rate)</p>
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center border ${metrics.status === 'alert' ? 'bg-error-container/30 text-error border-error/20' : 'bg-primary-container/30 text-primary border-primary/20'}`}>
                    <BarChart2 className="w-6 h-6" />
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className={`text-display-lg font-bold leading-none ${metrics.status === 'alert' ? 'text-error' : 'text-on-surface'}`}>
                      {`${metrics.drift_rate_pct}%`}
                    </h2>
                    <span className={`px-3 py-1 text-label-sm font-semibold rounded-full border ${metrics.status === 'alert' ? 'bg-error/10 text-error border-error/30 animate-pulse' : 'bg-surface-container-low text-on-surface-variant border-outline/30'}`}>
                      {metrics.status === 'alert' ? 'Requiere Atención' : 'Estable'}
                    </span>
                  </div>
                  <p className={`text-label-sm mb-3 ${metrics.status === 'alert' ? 'text-error font-medium' : 'text-on-surface-variant'}`}>
                    {metrics.status === 'alert' ? '⚠️ ' : '✅ '}{metrics.message}
                  </p>
                  <div className="w-full bg-surface-container-highest rounded-full h-1.5 mb-2">
                    <div className={`h-full rounded-full ${metrics.status === 'alert' ? 'bg-error' : 'bg-primary'}`} style={{ width: `${Math.min(metrics.drift_rate_pct, 100)}%` }}></div>
                  </div>
                  <div className="flex justify-between items-center mt-1">
                    <p className="text-[12px] font-medium text-on-surface-variant">Nuevos: {metrics.total_new_projects}</p>
                    <p className="text-[12px] font-medium text-on-surface-variant">Anomalías: {metrics.sse_anomalies_count}</p>
                  </div>
                </div>
              </div>
            );
          })()}
        </div>

        <div className="lg:col-span-2 glass-panel p-6 rounded-2xl flex flex-col">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h3 className="text-title-lg font-bold text-on-surface">Mapa de Clusters Semánticos</h3>
              <p className="text-body-md text-on-surface-variant">Distribución de proyectos académicos basada en similitud vectorial.</p>
            </div>
            <div className="flex bg-surface-container-low p-1 rounded-xl border border-outline-variant/50">
              <button 
                onClick={() => setViewMode('2d')}
                className={`px-4 py-1.5 rounded-lg font-label-md transition-colors ${viewMode === '2d' ? 'bg-surface-container-lowest shadow-sm text-primary' : 'text-on-surface-variant'}`}
              >
                2D
              </button>
              <button 
                onClick={() => setViewMode('3d')}
                className={`px-4 py-1.5 rounded-lg font-label-md transition-colors ${viewMode === '3d' ? 'bg-surface-container-lowest shadow-sm text-primary' : 'text-on-surface-variant'}`}
              >
                3D (Plotly)
              </button>
            </div>
          </div>

          <div className="flex overflow-x-auto gap-2 pb-4 mb-2 scrollbar-thin scrollbar-thumb-outline-variant scrollbar-track-transparent">
            <button
              onClick={() => setSelectedTab('global')}
              className={`whitespace-nowrap px-4 py-2 rounded-lg font-label-md transition-all ${selectedTab === 'global' ? 'bg-primary text-white shadow-sm' : 'bg-surface-container-lowest text-on-surface-variant hover:bg-surface-container-low border border-outline-variant/50'}`}
            >
              Vista Global
            </button>
            {dynamicBarData.map((c, i) => (
              <button
                key={i}
                onClick={() => setSelectedTab(c.cluster_id?.toString() || '')}
                className={`whitespace-nowrap px-4 py-2 rounded-lg font-label-md transition-all ${selectedTab === c.cluster_id?.toString() ? 'bg-primary text-white shadow-sm' : 'bg-surface-container-lowest text-on-surface-variant hover:bg-surface-container-low border border-outline-variant/50'}`}
              >
                {c.name}
              </button>
            ))}
            <button
              onClick={() => setSelectedTab('blue_oceans')}
              className={`whitespace-nowrap px-4 py-2 rounded-lg font-label-md transition-all ${selectedTab === 'blue_oceans' ? 'bg-error text-white shadow-sm' : 'bg-error-container/20 text-error hover:bg-error-container/40 border border-error/30'}`}
            >
              🌊 Océanos Azules
            </button>
          </div>

          <div className="flex-1 min-h-[400px] bg-surface-container-lowest rounded-xl border border-outline-variant/30 p-2 overflow-hidden relative">
            {isLoadingMaps ? (
              <Skeleton className="w-full h-full min-h-[400px]" />
            ) : viewMode === '2d' ? (
              <iframe 
                srcDoc={html2d || "<html><body><div style='display:flex;justify-content:center;align-items:center;height:100%;font-family:sans-serif;color:gray'>Cargando Mapa 2D interactivo...</div></body></html>"} 
                className="w-full h-full border-0 rounded-xl min-h-[400px]"
                title="2D Cluster Map"
                sandbox="allow-scripts allow-same-origin"
              />
            ) : (
              <iframe 
                srcDoc={html3d || "<html><body><div style='display:flex;justify-content:center;align-items:center;height:100%;font-family:sans-serif;color:gray'>Cargando Mapa 3D interactivo...</div></body></html>"} 
                className="w-full h-full border-0 min-h-[400px]"
                title="3D Cluster Map"
                sandbox="allow-scripts allow-same-origin"
              />
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-panel p-6 rounded-2xl">
          <h3 className="text-title-lg font-bold text-on-surface mb-1">Proyectos por Categoría</h3>
          <p className="text-body-md text-on-surface-variant mb-6">Volumen de trabajos clasificados automáticamente.</p>
          <div className="h-64">
            {isLoadingStats ? (
              <Skeleton className="w-full h-full" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dynamicBarData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                  <Tooltip 
                    cursor={{fill: '#f1f5f9'}}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                    {dynamicBarData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color || '#3b82f6'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="glass-panel p-6 rounded-2xl flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-title-lg font-bold text-on-surface">Proyectos Recientes</h3>
              <p className="text-body-md text-on-surface-variant mt-1">Últimas adiciones al proceso de clustering.</p>
            </div>
            <Link to="/proyectos" className="text-primary font-label-md hover:underline">Ver todos →</Link>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-outline-variant bg-surface-container-low/50">
                  <th className="py-3 px-4 font-label-md text-on-surface-variant text-[12px] uppercase tracking-wider rounded-tl-lg">Nombre del Proyecto</th>
                  <th className="py-3 px-4 font-label-md text-on-surface-variant text-[12px] uppercase tracking-wider">Carrera</th>
                  <th className="py-3 px-4 font-label-md text-on-surface-variant text-[12px] uppercase tracking-wider">Fecha</th>
                  <th className="py-3 px-4 font-label-md text-on-surface-variant text-[12px] uppercase tracking-wider rounded-tr-lg">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/30">
                {recentProjects.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-body-sm text-outline-variant">
                      Cargando proyectos o no hay historial disponible...
                    </td>
                  </tr>
                ) : (
                  recentProjects.map((row, i) => (
                    <tr key={i} className="hover:bg-surface-container-low/30 transition-colors">
                      <td className="py-4 px-4 font-label-md text-on-surface max-w-[200px] truncate" title={row.name}>{row.name}</td>
                      <td className="py-4 px-4 font-body-md text-on-surface-variant">{row.major}</td>
                      <td className="py-4 px-4 font-body-md text-on-surface-variant">{row.date}</td>
                      <td className="py-4 px-4">
                        <span className={`px-3 py-1 rounded-full text-[11px] font-semibold tracking-wide ${row.statusClass}`}>
                          {row.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <ToastNotification isOpen={!!toastMsg} message={toastMsg} onClose={() => setToastMsg('')} />
    </motion.div>
  );
}
