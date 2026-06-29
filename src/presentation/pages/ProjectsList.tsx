import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Search, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { API_CONFIG } from '../../application/config/api_config';

interface ProjectData {
  id: string;
  name: string;
  major: string;
  date: string;
  status: string;
  statusClass: string;
}

export default function ProjectsList() {
  const [projects, setProjects] = useState<ProjectData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        // -# pedimos todos los proyectos sin limite
        const res = await axios.get(`${API_CONFIG.BASE_URL}/clustering/integrator/admin/recent-projects`);
        if (Array.isArray(res.data)) {
          setProjects(res.data);
        }
      } catch (error) {
        console.error("Error fetching all projects:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProjects();
  }, []);

  const filteredProjects = projects.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.status.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col h-full"
    >
      <div className="flex items-center gap-4 mb-8">
        <Link to="/clustering" className="p-2 rounded-full hover:bg-surface-container transition-colors text-on-surface-variant">
          <ArrowLeft className="w-6 h-6" />
        </Link>
        <div>
          <h1 className="text-headline-lg font-bold text-on-surface">Historial de Proyectos</h1>
          <p className="text-body-md text-on-surface-variant mt-1">Directorio completo de trabajos académicos indexados en el sistema.</p>
        </div>
      </div>

      <div className="glass-panel p-6 rounded-2xl flex-1 flex flex-col">
        <div className="flex justify-between items-center mb-6">
          <div className="relative w-full max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-outline" />
            </div>
            <input
              type="text"
              placeholder="Buscar por nombre o estado..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-outline-variant/50 rounded-lg bg-surface-container-lowest text-body-md placeholder-outline focus:ring-2 focus:ring-primary/50 transition-all"
            />
          </div>
          <div className="text-body-sm text-on-surface-variant font-medium">
            Total: {filteredProjects.length} proyectos
          </div>
        </div>

        <div className="flex-1 overflow-auto rounded-xl border border-outline-variant/30">
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 bg-surface-container z-10 shadow-sm">
              <tr>
                <th className="py-4 px-6 font-label-md text-on-surface-variant text-[12px] uppercase tracking-wider">Nombre del Proyecto</th>
                <th className="py-4 px-6 font-label-md text-on-surface-variant text-[12px] uppercase tracking-wider">Carrera</th>
                <th className="py-4 px-6 font-label-md text-on-surface-variant text-[12px] uppercase tracking-wider">Fecha</th>
                <th className="py-4 px-6 font-label-md text-on-surface-variant text-[12px] uppercase tracking-wider text-right">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/30 bg-surface-container-lowest/50">
              {isLoading ? (
                <tr>
                  <td colSpan={4} className="py-12 text-center">
                    <div className="inline-block w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin mb-4"></div>
                    <p className="text-body-md text-on-surface-variant">Cargando proyectos desde ChromaDB...</p>
                  </td>
                </tr>
              ) : filteredProjects.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-12 text-center">
                    <FileText className="w-12 h-12 text-outline-variant/50 mx-auto mb-4" />
                    <p className="text-body-md text-on-surface-variant">No se encontraron proyectos.</p>
                  </td>
                </tr>
              ) : (
                filteredProjects.map((row) => (
                  <tr key={row.id} className="hover:bg-surface-container-low/50 transition-colors group">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-primary-container/30 text-primary flex items-center justify-center flex-shrink-0">
                          <FileText className="w-4 h-4" />
                        </div>
                        <span className="font-label-md text-on-surface line-clamp-1" title={row.name}>
                          {row.name}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-6 font-body-md text-on-surface-variant">{row.major}</td>
                    <td className="py-4 px-6 font-body-md text-on-surface-variant">{row.date}</td>
                    <td className="py-4 px-6 text-right">
                      <span className={`px-3 py-1.5 rounded-full text-[11px] font-bold tracking-wide shadow-sm border border-black/5 ${row.statusClass}`}>
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
    </motion.div>
  );
}
