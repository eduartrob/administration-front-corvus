import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { Play, Database, FileClock, Compass } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ScatterChart, Scatter, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, BarChart, Bar, CartesianGrid } from 'recharts';
import { API_CONFIG } from '../../application/config/api_config';
// -# el scatterdata inicializa vacio ya que debe venir del backend
const CLUSTER_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];

const CustomScatterShape = (props: any) => {
  const { cx, cy, fill, payload } = props;
  const isBlueOcean = payload.label === -1;
  const size = isBlueOcean ? 16 : 14;

  if (isBlueOcean) {
    return (
      <g>
        <path
          d={`M ${cx} ${cy - size} L ${cx + size * 0.3} ${cy - size * 0.3} L ${cx + size} ${cy - size * 0.3} L ${cx + size * 0.4} ${cy + size * 0.2} L ${cx + size * 0.6} ${cy + size} L ${cx} ${cy + size * 0.5} L ${cx - size * 0.6} ${cy + size} L ${cx - size * 0.4} ${cy + size * 0.2} L ${cx - size} ${cy - size * 0.3} L ${cx - size * 0.3} ${cy - size * 0.3} Z`}
          fill="#ef4444"
          stroke="#7f1d1d"
          strokeWidth={1}
        />
        <text x={cx} y={cy} dy={3} textAnchor="middle" fill="#ffffff" fontSize={10} fontWeight="bold">
          {payload.num}
        </text>
      </g>
    );
  }

  return (
    <g>
      <circle cx={cx} cy={cy} r={size} fill={fill} stroke="#ffffff" strokeWidth={1.5} opacity={0.9} />
      <text x={cx} y={cy} dy={3.5} textAnchor="middle" fill="#ffffff" fontSize={10} fontWeight="bold">
        {payload.num}
      </text>
    </g>
  );
};

export default function Clustering() {
  const [viewMode, setViewMode] = useState<'2d' | '3d'>('2d');
  const [projectCount, setProjectCount] = useState<number>(0);
  const [dynamicBarData, setDynamicBarData] = useState<any[]>([]);
  const [scatterData, setScatterData] = useState<any[]>([]); 
  const [recentProjects, setRecentProjects] = useState<any[]>([]);
  const [isExecuting, setIsExecuting] = useState(false);
  const [executeMsg, setExecuteMsg] = useState('');
  const [html3d, setHtml3d] = useState<string>('');
  const [blueOceansCount, setBlueOceansCount] = useState<number>(0);

  useEffect(() => {
    const fetchClusteringData = async () => {
      try {
        const countRes = await axios.get(`${API_CONFIG.BASE_URL}/clustering/integrator/admin/projects-count`);
        if (countRes.data && countRes.data.count !== undefined) {
          setProjectCount(countRes.data.count);
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
        if (statsRes.data && statsRes.data.clusters_detail) {
          const formattedData = statsRes.data.clusters_detail.map((c: any) => ({
            name: c.cluster_name || `Clúster ${c.cluster_id}`,
            value: c.project_count
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
      }

      try {
        const scatterRes = await axios.get(`${API_CONFIG.BASE_URL}/clustering/integrator/admin/clusters-2d`);
        if (Array.isArray(scatterRes.data)) {
          setScatterData(scatterRes.data);
        }
      } catch (error) {
        console.error('Error fetching scatter data:', error);
      }

      try {
        const htmlRes = await axios.get(`${API_CONFIG.BASE_URL}/clustering/integrator/admin/clusters-3d`);
        if (typeof htmlRes.data === 'string') {
          setHtml3d(htmlRes.data);
        }
      } catch (error) {
        console.error('Error fetching 3D html:', error);
      }
    };

    fetchClusteringData();

    // -# configurar polling cada 10 segundos para dar la sensacion de tiempo real
    const intervalId = setInterval(fetchClusteringData, 10000);

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
    } finally {
      setIsExecuting(false);
      setTimeout(() => setExecuteMsg(''), 6000);
    }
  };

  const clusteredCount = dynamicBarData.reduce((acc, curr) => acc + (curr.value || 0), 0) + blueOceansCount;
  const pendingClustering = Math.max(0, projectCount - clusteredCount);
  const pendingPercentage = projectCount > 0 ? (pendingClustering / projectCount) * 100 : 0;

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
        {}
        <div className="flex flex-col gap-6">
          <div className="glass-panel p-6 rounded-2xl flex items-center justify-between">
            <div>
              <p className="text-body-md text-on-surface-variant mb-2">Proyectos Agrupados<br/>(En Clústeres)</p>
              <div className="flex items-end gap-3">
                <h2 className="text-display-lg font-bold text-on-surface leading-none">
                  {clusteredCount.toLocaleString()}
                </h2>
                <span className="text-primary font-semibold text-label-md mb-2 flex items-center">
                  Total BD: {projectCount}
                </span>
              </div>
            </div>
            <div className="w-14 h-14 bg-primary-fixed rounded-full flex items-center justify-center text-primary border border-primary/20">
              <Database className="w-7 h-7" />
            </div>
          </div>

          <div className="glass-panel p-6 rounded-2xl relative overflow-hidden">
            <div className="flex items-center justify-between mb-4">
              <p className="text-body-md text-on-surface-variant">Nuevos Proyectos<br/>(Pendientes)</p>
              <div className="w-12 h-12 bg-secondary-container/30 rounded-xl flex items-center justify-center text-secondary border border-secondary/20">
                <FileClock className="w-6 h-6" />
              </div>
            </div>
            <h2 className="text-display-lg font-bold text-on-surface mb-4 leading-none">{pendingClustering}</h2>
            
            <div className="w-full bg-surface-container-highest rounded-full h-1.5 mb-2">
              <div className="bg-secondary h-full rounded-full" style={{ width: `${pendingPercentage}%` }}></div>
            </div>
            <p className="text-[12px] font-medium text-on-surface-variant text-right">{pendingPercentage.toFixed(1)}% del lote actual</p>
          </div>

          {}
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
                <h2 className="text-display-lg font-bold text-on-surface leading-none">{blueOceansCount}</h2>
                <span className="text-error font-medium text-label-sm">hallazgos</span>
              </div>
            </div>
          </div>
        </div>

        {}
        <div className="lg:col-span-2 glass-panel p-6 rounded-2xl flex flex-col">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h3 className="text-title-lg font-bold text-on-surface">Mapa de Clusters Semánticos</h3>
              <p className="text-body-md text-on-surface-variant">Distribución de proyectos académicos basada en similitud vectorial.</p>
            </div>
            
            {}
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

          <div className="flex-1 min-h-[300px] bg-surface-container-lowest rounded-xl border border-outline-variant/30 p-2 overflow-hidden relative">
            {viewMode === '2d' ? (
              <>
                {scatterData.length > 0 ? (
                  <>
                    <div className="absolute top-4 right-4 flex gap-3 z-10 bg-surface-container-lowest/80 p-2 rounded-lg backdrop-blur-sm border border-outline-variant/30">
                      <div className="flex items-center gap-1.5">
                        <span className="w-3 h-3 rounded-full bg-primary"></span>
                        <span className="text-[10px] font-semibold text-on-surface-variant uppercase">Clusters Densos</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="w-3 h-3 rounded-full border-2 border-error border-dashed"></span>
                        <span className="text-[10px] font-semibold text-error uppercase">Océanos Azules</span>
                      </div>
                    </div>
                    <ResponsiveContainer width="100%" height="100%">
                      <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" opacity={0.5} />
                        <XAxis type="number" dataKey="x" hide />
                        <YAxis type="number" dataKey="y" hide />
                        <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                        <Scatter name="Proyectos" data={scatterData} shape={<CustomScatterShape />}>
                          {scatterData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.label === -1 ? '#ef4444' : CLUSTER_COLORS[entry.label % CLUSTER_COLORS.length]} />
                          ))}
                        </Scatter>
                      </ScatterChart>
                    </ResponsiveContainer>
                  </>
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-center p-6">
                    <Database className="w-12 h-12 text-outline-variant mb-4 opacity-50" />
                    <h4 className="text-body-lg font-bold text-on-surface-variant mb-1">Mapa Semántico Vacío</h4>
                    <p className="text-body-sm text-outline max-w-sm">No hay datos de coordenadas 2D. Ejecuta el Clustering Global para agrupar los proyectos y generar el mapa topológico.</p>
                  </div>
                )}
              </>
            ) : (
              <iframe 
                srcDoc={html3d || "<html><body><div style='display:flex;justify-content:center;align-items:center;height:100%;font-family:sans-serif;color:gray'>Cargando Mapa 3D interactivo...</div></body></html>"} 
                className="w-full h-full border-0"
                title="3D Cluster Map"
                sandbox="allow-scripts allow-same-origin"
              />
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {}
        <div className="glass-panel p-6 rounded-2xl">
          <h3 className="text-title-lg font-bold text-on-surface mb-1">Proyectos por Categoría</h3>
          <p className="text-body-md text-on-surface-variant mb-6">Volumen de trabajos clasificados automáticamente.</p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dynamicBarData} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#757684' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#757684' }} />
                <Tooltip cursor={{ fill: '#f8f9ff' }} contentStyle={{ borderRadius: '8px', border: '1px solid #c4c5d5' }} />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {dynamicBarData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color || (index === 0 ? '#00288e' : index === 1 ? '#3755c3' : '#c4c5d5')} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {}
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
    </motion.div>
  );
}
