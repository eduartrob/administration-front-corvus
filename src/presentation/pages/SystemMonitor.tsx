import { useState, useEffect, useRef } from 'react';
import { Activity, Server, Cpu, HardDrive, TerminalSquare, AlertTriangle, Clock } from 'lucide-react';
import { API_CONFIG } from '../../application/config/api_config';
import { Skeleton } from '../components/atoms/Skeleton';

interface ContainerStats {
  id: string;
  name: string;
  state: string;
  cpu_percent: string;
  mem_usage_bytes: number;
  mem_limit_bytes: number;
  mem_percent: string;
}

interface HostStats {
  cpu_percent: string;
  total_mem_mb: string;
  free_mem_mb: string;
  uptime_secs: number;
}

export default function SystemMonitor() {
  const [hostStats, setHostStats] = useState<HostStats | null>(null);
  const [containers, setContainers] = useState<ContainerStats[]>([]);
  const [selectedContainer, setSelectedContainer] = useState<string | null>(null);
  const [logs, setLogs] = useState<{type: string, line: string}[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const hostEventSource = useRef<EventSource | null>(null);
  const logsEventSource = useRef<EventSource | null>(null);
  const logsEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll logs
  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  // Format memory
  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatUptime = (seconds: number) => {
    const d = Math.floor(seconds / (3600 * 24));
    const h = Math.floor(seconds % (3600 * 24) / 3600);
    const m = Math.floor(seconds % 3600 / 60);
    return `${d}d ${h}h ${m}m`;
  };

  // Connect to Host Stats SSE
  useEffect(() => {
    const sessionData = localStorage.getItem('corvus_session') || sessionStorage.getItem('corvus_session');
    const token = sessionData ? JSON.parse(sessionData).token : '';
    
    const sse = new EventSource(`${API_CONFIG.BASE_URL}/system/host-stats?token=${token}`);
    sse.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.host) setHostStats(data.host);
        if (data.containers) setContainers(data.containers);
        setError(null);
        setIsLoading(false);
      } catch (err) {
        console.error("Error parsing host stats", err);
      }
    };
    sse.onerror = () => {
      setError('Desconectado del servidor. Intentando reconectar...');
    };

    hostEventSource.current = sse;
    return () => sse.close();
  }, []);

  // Connect to Logs SSE when a container is selected
  useEffect(() => {
    if (!selectedContainer) return;
    setLogs([]);

    if (logsEventSource.current) logsEventSource.current.close();

    const sessionData = localStorage.getItem('corvus_session') || sessionStorage.getItem('corvus_session');
    const token = sessionData ? JSON.parse(sessionData).token : '';
    
    const sseLogs = new EventSource(`${API_CONFIG.BASE_URL}/system/containers/${selectedContainer}/logs?token=${token}`);
    sseLogs.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (!data.error) {
        setLogs(prev => [...prev.slice(-200), data]); // keep last 200 lines
      }
    };
    logsEventSource.current = sseLogs;

    return () => sseLogs.close();
  }, [selectedContainer]);

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-900 p-4 sm:p-6 space-y-6 overflow-y-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <Activity className="w-6 h-6 text-indigo-600" />
            Recursos del Sistema
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Métricas en tiempo real del servidor y microservicios.
          </p>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-lg bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5" />
          <p className="text-red-800 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* Tarjetas del Servidor */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-blue-100 dark:bg-blue-500/20 rounded-xl">
            <Cpu className="w-7 h-7 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Servidor CPU</p>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
              {hostStats ? `${hostStats.cpu_percent}%` : '--%'}
            </h3>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-purple-100 dark:bg-purple-500/20 rounded-xl">
            <HardDrive className="w-7 h-7 text-purple-600 dark:text-purple-400" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Servidor RAM (Libre / Total)</p>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">
              {hostStats ? `${hostStats.free_mem_mb} MB / ${hostStats.total_mem_mb} MB` : '-- MB'}
            </h3>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-emerald-100 dark:bg-emerald-500/20 rounded-xl">
            <Clock className="w-7 h-7 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Uptime</p>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
              {hostStats ? formatUptime(hostStats.uptime_secs) : '--'}
            </h3>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tabla de Microservicios */}
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden flex flex-col h-[500px] shadow-sm">
          <div className="p-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 flex justify-between items-center">
            <h3 className="font-semibold text-slate-800 dark:text-white flex items-center gap-2">
              <Server className="w-4 h-4 text-indigo-500" /> 
              Microservicios en Vivo
            </h3>
            <span className="text-xs font-medium px-2 py-1 bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300 rounded-full">
              {containers.length} Total
            </span>
          </div>
          <div className="overflow-y-auto flex-1 p-2">
            {isLoading ? (
              <div className="p-4 space-y-3">
                <Skeleton className="h-10 w-full rounded-lg" />
                <Skeleton className="h-10 w-full rounded-lg" />
                <Skeleton className="h-10 w-full rounded-lg" />
              </div>
            ) : (
              <div className="w-full text-left text-sm">
                <div className="grid grid-cols-12 gap-2 p-3 font-semibold text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700 sticky top-0 bg-white dark:bg-slate-800">
                  <div className="col-span-5">Contenedor</div>
                  <div className="col-span-2 text-center">Estado</div>
                  <div className="col-span-2 text-right">CPU</div>
                  <div className="col-span-3 text-right">RAM</div>
                </div>
                {containers.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setSelectedContainer(c.id)}
                    className={`w-full grid grid-cols-12 gap-2 p-3 items-center border-b border-slate-100 dark:border-slate-700/50 transition-colors ${
                      selectedContainer === c.id 
                        ? 'bg-indigo-50 dark:bg-indigo-500/10 border-indigo-200 dark:border-indigo-500/30' 
                        : 'hover:bg-slate-50 dark:hover:bg-slate-700/50 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <div className="col-span-5 truncate font-medium flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${c.state === 'running' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                      {c.name}
                    </div>
                    <div className="col-span-2 text-center text-xs">
                      {c.state === 'running' ? (
                        <span className="text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-500/20 px-2 py-0.5 rounded-full">Activo</span>
                      ) : (
                        <span className="text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-500/20 px-2 py-0.5 rounded-full">Error</span>
                      )}
                    </div>
                    <div className="col-span-2 text-right font-mono text-xs">
                      {c.state === 'running' ? `${c.cpu_percent}%` : '--'}
                    </div>
                    <div className="col-span-3 text-right font-mono text-xs">
                       {c.state === 'running' ? formatBytes(c.mem_usage_bytes) : '--'}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Mini Consola (Terminal) */}
        <div className="bg-slate-950 rounded-xl overflow-hidden shadow-inner border border-slate-800 flex flex-col h-[500px]">
          <div className="flex items-center justify-between px-4 py-3 bg-slate-900 border-b border-slate-800">
            <div className="flex items-center gap-2 text-slate-400">
              <TerminalSquare className="w-5 h-5" />
              <span className="text-xs font-mono font-semibold tracking-wider uppercase">
                {selectedContainer ? `Terminal: ${containers.find(c => c.id === selectedContainer)?.name}` : 'Terminal - Selecciona un contenedor'}
              </span>
            </div>
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-slate-700"></div>
              <div className="w-3 h-3 rounded-full bg-slate-700"></div>
              <div className="w-3 h-3 rounded-full bg-slate-700"></div>
            </div>
          </div>
          
          <div className="p-4 flex-1 overflow-y-auto font-mono text-sm leading-relaxed">
            {!selectedContainer ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-600 space-y-2">
                <TerminalSquare className="w-12 h-12 opacity-20" />
                <p>Haz clic en un contenedor para ver sus logs en vivo.</p>
              </div>
            ) : logs.length === 0 ? (
              <div className="h-full flex items-center justify-center text-slate-600">
                <span className="animate-pulse">Esperando registros de {selectedContainer}...</span>
              </div>
            ) : (
              <div className="space-y-1">
                {logs.map((log, i) => (
                  <div key={i} className={`break-all ${log.type === 'stderr' ? 'text-red-400' : 'text-emerald-400'}`}>
                    <span className="text-slate-600 mr-2 select-none">{'>'}</span>
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
  );
}
