import { useState, useEffect, useRef } from 'react';
import { Activity, Server, Cpu, HardDrive, TerminalSquare, AlertTriangle, CheckCircle, PowerOff } from 'lucide-react';
import { API_CONFIG } from '../../application/config/api_config';
import { Skeleton } from '../components/atoms/Skeleton';

interface Container {
  id: string;
  name: string;
  image: string;
  state: string;
  status: string;
}

interface Stats {
  cpu_percent: string;
  mem_usage_bytes: number;
  mem_limit_bytes: number;
  mem_percent: string;
}

export default function SystemMonitor() {
  const [containers, setContainers] = useState<Container[]>([]);
  const [selectedContainer, setSelectedContainer] = useState<string | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [logs, setLogs] = useState<{type: string, line: string}[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const statsEventSource = useRef<EventSource | null>(null);
  const logsEventSource = useRef<EventSource | null>(null);
  const logsEndRef = useRef<HTMLDivElement>(null);

  // Fetch containers on load
  useEffect(() => {
    fetchContainers();
    const interval = setInterval(fetchContainers, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchContainers = async () => {
    try {
      // Assuming api-gateway is running on 3000 locally
      const sessionData = localStorage.getItem('corvus_session') || sessionStorage.getItem('corvus_session');
      const token = sessionData ? JSON.parse(sessionData).token : '';
      const response = await fetch(`${API_CONFIG.BASE_URL}/system/containers`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const json = await response.json();
      if (json.success) {
        setContainers(json.data);
        setError(null);
      }
    } catch (err) {
      setError('No se pudo conectar con el API Gateway. ¿Están los contenedores encendidos?');
    } finally {
      setIsLoading(false);
    }
  };

  // Connect to SSE when a container is selected
  useEffect(() => {
    if (!selectedContainer) return;

    setLogs([]);
    setStats(null);

    // Close previous connections
    if (statsEventSource.current) statsEventSource.current.close();
    if (logsEventSource.current) logsEventSource.current.close();

    // Open Stats SSE
    const sessionData = localStorage.getItem('corvus_session') || sessionStorage.getItem('corvus_session');
    const token = sessionData ? JSON.parse(sessionData).token : '';
    const sseStats = new EventSource(`${API_CONFIG.BASE_URL}/system/containers/${selectedContainer}/stats?token=${token}`);
    sseStats.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (!data.error) setStats(data);
    };
    statsEventSource.current = sseStats;

    // Open Logs SSE
    const sseLogs = new EventSource(`${API_CONFIG.BASE_URL}/system/containers/${selectedContainer}/logs?token=${token}`);
    sseLogs.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (!data.error) {
        setLogs(prev => [...prev.slice(-200), data]); // keep last 200 lines
      }
    };
    logsEventSource.current = sseLogs;

    return () => {
      sseStats.close();
      sseLogs.close();
    };
  }, [selectedContainer]);

  // Auto-scroll logs
  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getStatusColor = (state: string) => {
    switch (state.toLowerCase()) {
      case 'running': return 'text-green-500 bg-green-500/10';
      case 'exited': return 'text-red-500 bg-red-500/10';
      case 'restarting': return 'text-yellow-500 bg-yellow-500/10';
      default: return 'text-gray-500 bg-gray-500/10';
    }
  };

  const activeErrors = containers.filter(c => c.state !== 'running');

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-900 p-6 space-y-6 overflow-y-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <Activity className="w-6 h-6 text-indigo-600" />
            Monitor del Sistema
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Visualiza el estado de los contenedores Docker y métricas en tiempo real.
          </p>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-lg bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5" />
          <p className="text-red-800 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* Alertas */}
      {activeErrors.length > 0 && !error && (
        <div className="p-4 rounded-lg bg-yellow-50 dark:bg-yellow-500/10 border border-yellow-200 dark:border-yellow-500/20">
          <h3 className="font-semibold text-yellow-800 dark:text-yellow-400 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" /> 
            Contenedores inactivos ({activeErrors.length})
          </h3>
          <ul className="mt-2 text-sm text-yellow-700 dark:text-yellow-500 space-y-1">
            {activeErrors.map(c => (
              <li key={c.id}>• {c.name} está en estado: <span className="font-bold">{c.state}</span></li>
            ))}
          </ul>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Lista de Contenedores */}
        <div className="lg:col-span-1 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden flex flex-col h-[400px]">
          <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
            <h3 className="font-semibold text-slate-800 dark:text-white flex items-center gap-2">
              <Server className="w-4 h-4" /> 
              Microservicios
            </h3>
            <span className="text-xs font-medium px-2 py-1 bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300 rounded-full">
              {containers.length} Total
            </span>
          </div>
          <div className="overflow-y-auto flex-1 p-2 space-y-1">
            {isLoading && containers.length === 0 ? (
              Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="w-full p-3 flex items-center justify-between">
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                  <Skeleton variant="circular" className="w-8 h-8 ml-4" />
                </div>
              ))
            ) : (
              containers.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setSelectedContainer(c.id)}
                  className={`w-full text-left p-3 rounded-lg flex items-center justify-between transition-colors ${
                    selectedContainer === c.id 
                      ? 'bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/30' 
                      : 'hover:bg-slate-50 dark:hover:bg-slate-700/50 border border-transparent'
                  }`}
                >
                  <div className="truncate pr-2">
                    <p className="font-medium text-sm text-slate-900 dark:text-slate-200 truncate">{c.name}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{c.image.split('/').pop()}</p>
                  </div>
                  <div className={`p-1.5 rounded-full ${getStatusColor(c.state)}`}>
                    {c.state === 'running' ? <CheckCircle className="w-4 h-4" /> : <PowerOff className="w-4 h-4" />}
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Detalles y Stats */}
        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-blue-100 dark:bg-blue-500/20 rounded-lg">
                  <Cpu className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="font-medium text-slate-700 dark:text-slate-300">Uso de CPU</h3>
              </div>
              <p className="text-3xl font-bold text-slate-900 dark:text-white">
                {selectedContainer ? (stats?.cpu_percent || '0.00') : '--'}%
              </p>
            </div>
            
            <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-purple-100 dark:bg-purple-500/20 rounded-lg">
                  <HardDrive className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
                <h3 className="font-medium text-slate-700 dark:text-slate-300">Consumo de RAM</h3>
              </div>
              <div className="flex items-baseline gap-2">
                <p className="text-3xl font-bold text-slate-900 dark:text-white">
                  {selectedContainer ? (stats ? formatBytes(stats.mem_usage_bytes) : '0 B') : '--'}
                </p>
                {stats && <span className="text-sm text-slate-500 dark:text-slate-400">/ {formatBytes(stats.mem_limit_bytes)}</span>}
              </div>
              {stats && (
                <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-1.5 mt-3">
                  <div className="bg-purple-500 h-1.5 rounded-full" style={{ width: `${Math.min(100, parseFloat(stats.mem_percent))}%` }}></div>
                </div>
              )}
            </div>
          </div>

          {/* Mini Consola (Terminal) */}
          <div className="bg-slate-950 rounded-xl overflow-hidden shadow-inner border border-slate-800 flex flex-col h-[300px] lg:h-[400px]">
            <div className="flex items-center justify-between px-4 py-2 bg-slate-900 border-b border-slate-800">
              <div className="flex items-center gap-2 text-slate-400">
                <TerminalSquare className="w-4 h-4" />
                <span className="text-xs font-mono font-semibold tracking-wider uppercase">
                  {selectedContainer ? `LOGS: ${containers.find(c => c.id === selectedContainer)?.name}` : 'SELECCIONA UN CONTENEDOR'}
                </span>
              </div>
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-slate-700"></div>
                <div className="w-3 h-3 rounded-full bg-slate-700"></div>
                <div className="w-3 h-3 rounded-full bg-slate-700"></div>
              </div>
            </div>
            
            <div className="p-4 flex-1 overflow-y-auto font-mono text-sm">
              {!selectedContainer ? (
                <div className="h-full flex items-center justify-center text-slate-600">
                  Esperando selección...
                </div>
              ) : logs.length === 0 ? (
                <div className="h-full flex items-center justify-center text-slate-600">
                  Esperando registros...
                </div>
              ) : (
                <div className="space-y-1">
                  {logs.map((log, i) => (
                    <div key={i} className={`break-all ${log.type === 'stderr' ? 'text-red-400' : 'text-slate-300'}`}>
                      <span className="text-slate-600 mr-2">{'>'}</span>
                      {log.line}
                    </div>
                  ))}
                  <div ref={logsEndRef} />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
