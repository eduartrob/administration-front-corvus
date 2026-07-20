import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, ChevronDown, Edit2, Trash2, ChevronLeft, ChevronRight, Database } from 'lucide-react';
import { useGlobalFilter } from '../../application/contexts/GlobalFilterContext';
import { Skeleton } from '../components/atoms/Skeleton';

export default function Materias() {
  const { globalUniversityId, globalCareerId } = useGlobalFilter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Fake network request
    const timer = setTimeout(() => setIsLoading(false), 1500);
    return () => clearTimeout(timer);
  }, []);


  if (!globalUniversityId || !globalCareerId) {
    return (
      <div className="p-8 h-full flex items-center justify-center">
        <div className="bg-surface-container-low border border-outline-variant/50 rounded-2xl p-16 flex flex-col items-center justify-center text-center max-w-2xl">
          <Database className="w-16 h-16 text-on-surface-variant mb-6 opacity-40" />
          <h2 className="text-title-lg font-bold text-on-surface mb-2">Selecciona una Universidad y Carrera</h2>
          <p className="text-body-lg text-on-surface-variant">
            Para gestionar las materias, primero debes seleccionar una universidad y su respectiva carrera en la barra superior.
          </p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="h-full flex flex-col"
    >
      <div className="mb-8">
        <h1 className="text-headline-lg font-bold text-on-surface">Gestión de Materias</h1>
        <p className="text-body-md text-on-surface-variant mt-2 max-w-2xl">Administra el currículo, asigna departamentos y revisa proyectos asociados.</p>
      </div>

      <div className="glass-panel rounded-2xl flex flex-col flex-1 overflow-hidden">
        {/* Actions Bar */}
        <div className="p-4 sm:p-6 border-b border-outline-variant/50 flex flex-wrap gap-4 justify-between items-center bg-surface-container-low/30">
          <div className="flex flex-wrap gap-3">
            <button className="flex items-center gap-2 bg-surface-container-lowest border border-outline-variant px-4 py-2.5 rounded-xl text-on-surface font-label-md hover:bg-surface-container-low transition-colors shadow-sm">
              Todos los Departamentos <ChevronDown className="w-4 h-4 text-outline" />
            </button>
          </div>
          <button className="flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-xl font-label-md interactive-element hover:bg-primary/90 shadow-sm">
            <Plus className="w-5 h-5" /> Nueva Materia
          </button>
        </div>

        {/* Table Area */}
        <div className="flex-1 overflow-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead className="sticky top-0 bg-surface-container-lowest shadow-[0_1px_0_0_var(--color-outline-variant)]">
              <tr>
                <th className="py-4 px-6 font-label-md text-on-surface-variant text-[13px] uppercase tracking-wider">Código</th>
                <th className="py-4 px-6 font-label-md text-on-surface-variant text-[13px] uppercase tracking-wider">Nombre de la Materia</th>
                <th className="py-4 px-6 font-label-md text-on-surface-variant text-[13px] uppercase tracking-wider">Departamento</th>
                <th className="py-4 px-6 font-label-md text-on-surface-variant text-[13px] uppercase tracking-wider">Proyectos Asociados</th>
                <th className="py-4 px-6 font-label-md text-on-surface-variant text-[13px] uppercase tracking-wider text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/40 bg-surface-container-lowest">
              {isLoading ? (
                [...Array(3)].map((_, i) => (
                  <tr key={i}>
                    <td className="py-5 px-6"><Skeleton className="w-16 h-5" /></td>
                    <td className="py-5 px-6"><Skeleton className="w-48 h-5" /></td>
                    <td className="py-5 px-6"><Skeleton className="w-32 h-6 rounded-full" /></td>
                    <td className="py-5 px-6"><Skeleton className="w-20 h-5" /></td>
                    <td className="py-5 px-6"><div className="flex justify-end gap-2"><Skeleton className="w-8 h-8 rounded-lg" /><Skeleton className="w-8 h-8 rounded-lg" /></div></td>
                  </tr>
                ))
              ) : [
                { 
                  code: 'CS101', name: 'Introducción a la Programación',
                  department: 'Ciencias de la Computación', deptColor: 'bg-primary-container/20 text-primary',
                  projects: '12 Activos'
                },
                { 
                  code: 'MATH205', name: 'Álgebra Lineal Avanzada',
                  department: 'Matemáticas Aplicadas', deptColor: 'bg-secondary-container/20 text-secondary',
                  projects: '5 Activos'
                },
                { 
                  code: 'ENG301', name: 'Termodinámica Aplicada',
                  department: 'Ingeniería', deptColor: 'bg-surface-variant text-on-surface-variant',
                  projects: '8 Activos'
                }
              ].map((row, i) => (
                <tr key={i} className="hover:bg-surface-container-low/30 transition-colors group cursor-pointer">
                  <td className="py-5 px-6">
                    <span className="font-mono text-body-md text-on-surface-variant">{row.code}</span>
                  </td>
                  <td className="py-5 px-6">
                    <p className="font-label-md text-on-surface text-[15px]">{row.name}</p>
                  </td>
                  <td className="py-5 px-6">
                    <span className={`px-3 py-1 rounded-full text-[12px] font-semibold tracking-wide ${row.deptColor}`}>
                      {row.department}
                    </span>
                  </td>
                  <td className="py-5 px-6">
                    <span className="font-body-md text-[14px] text-on-surface-variant">{row.projects}</span>
                  </td>
                  <td className="py-5 px-6">
                    <div className="flex items-center justify-end gap-2">
                      <button className="p-2 text-outline hover:text-primary hover:bg-primary-container/10 rounded-lg transition-colors">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-outline hover:text-error hover:bg-error-container rounded-lg transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {}
        <div className="p-4 border-t border-outline-variant/50 flex justify-between items-center bg-surface-container-lowest">
          <p className="text-body-md text-on-surface-variant">Mostrando 1 a 3 de 45 resultados</p>
          <div className="flex gap-2">
            <button className="p-2 border border-outline-variant rounded-lg text-outline hover:bg-surface-container-low transition-colors disabled:opacity-50">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button className="p-2 border border-outline-variant rounded-lg text-on-surface hover:bg-surface-container-low transition-colors">
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
