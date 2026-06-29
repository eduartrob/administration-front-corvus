import { motion } from 'framer-motion';
import { Download, Filter, ChevronDown, ChevronLeft, ChevronRight, AlertTriangle, Clock, Calendar } from 'lucide-react';

export default function ValidacionTareas() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="h-full flex flex-col"
    >
      <div className="mb-8">
        <h1 className="text-headline-lg font-bold text-on-surface">Validación de Tareas</h1>
        <p className="text-body-md text-on-surface-variant mt-2 max-w-3xl">Revisa, evalúa y aprueba las entregas pendientes de tus alumnos. Utiliza los filtros para priorizar la revisión académica.</p>
      </div>

      <div className="glass-panel rounded-2xl flex flex-col flex-1 overflow-hidden">
        {}
        <div className="p-4 sm:p-6 border-b border-outline-variant/50 flex flex-wrap gap-4 justify-between items-center bg-surface-container-low/30">
          <div className="flex flex-wrap gap-3">
            <button className="flex items-center gap-2 bg-surface-container-lowest border border-outline-variant px-4 py-2 rounded-xl text-on-surface font-label-md hover:bg-surface-container-low transition-colors shadow-sm">
              Todas las Materias <ChevronDown className="w-4 h-4 text-outline" />
            </button>
            <button className="flex items-center gap-2 bg-primary-container/10 border border-primary/20 px-4 py-2 rounded-xl text-primary font-label-md hover:bg-primary-container/20 transition-colors shadow-sm">
              Prioridad <ChevronDown className="w-4 h-4" />
            </button>
            <button className="flex items-center gap-2 bg-surface-container-lowest border border-outline-variant px-4 py-2 rounded-xl text-on-surface font-label-md hover:bg-surface-container-low transition-colors shadow-sm">
              <Filter className="w-4 h-4 text-outline" /> Más Filtros
            </button>
          </div>
          <button className="flex items-center gap-2 bg-surface-variant text-on-surface px-4 py-2 rounded-xl font-label-md hover:bg-surface-variant/80 transition-colors">
            <Download className="w-4 h-4" /> Exportar CSV
          </button>
        </div>

        {}
        <div className="flex-1 overflow-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead className="sticky top-0 bg-surface-container-lowest shadow-[0_1px_0_0_var(--color-outline-variant)]">
              <tr>
                <th className="py-4 px-6 font-label-md text-on-surface-variant text-[13px] uppercase tracking-wider">Tarea</th>
                <th className="py-4 px-6 font-label-md text-on-surface-variant text-[13px] uppercase tracking-wider">Alumno</th>
                <th className="py-4 px-6 font-label-md text-on-surface-variant text-[13px] uppercase tracking-wider">Fecha de Entrega</th>
                <th className="py-4 px-6 font-label-md text-on-surface-variant text-[13px] uppercase tracking-wider">Prioridad</th>
                <th className="py-4 px-6 font-label-md text-on-surface-variant text-[13px] uppercase tracking-wider text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/40 bg-surface-container-lowest">
              {[
                { 
                  task: 'Prototipo de Alta Fidelidad', subject: 'Diseño de Interfaces',
                  student: 'Ana García Ríos', id: 'ID: 2021045', avatar: 'https://i.pravatar.cc/150?u=a',
                  date: 'Hace 2 horas', dateIcon: AlertTriangle, dateColor: 'text-error',
                  priority: 'Alta', priorityClass: 'chip-alta'
                },
                { 
                  task: 'Análisis de Algoritmos de Búsqueda', subject: 'Estructuras de Datos',
                  student: 'Miguel Ramírez', id: 'ID: 2022108', initials: 'MR', color: 'bg-primary text-white',
                  date: 'Ayer, 18:30', dateIcon: Clock, dateColor: 'text-outline',
                  priority: 'Media', priorityClass: 'chip-media'
                },
                { 
                  task: 'Ensayo: Ética en la IA', subject: 'Ética Profesional',
                  student: 'Carlos Soto', id: 'ID: 2020899', avatar: 'https://i.pravatar.cc/150?u=c',
                  date: '12 Oct, 09:15', dateIcon: Calendar, dateColor: 'text-outline',
                  priority: 'Baja', priorityClass: 'chip-baja'
                },
                { 
                  task: 'User Journey Map', subject: 'Diseño de Interfaces',
                  student: 'Laura Flores', id: 'ID: 2021334', initials: 'LF', color: 'bg-secondary-container text-on-secondary-container',
                  date: '10 Oct, 23:59', dateIcon: Calendar, dateColor: 'text-outline',
                  priority: 'Media', priorityClass: 'chip-media'
                }
              ].map((row, i) => (
                <tr key={i} className="hover:bg-surface-container-low/30 transition-colors group cursor-pointer">
                  <td className="py-5 px-6">
                    <p className="font-label-md text-on-surface text-[15px]">{row.task}</p>
                    <p className="text-label-sm text-on-surface-variant mt-0.5">{row.subject}</p>
                  </td>
                  <td className="py-5 px-6">
                    <div className="flex items-center gap-3">
                      {row.avatar ? (
                        <img src={row.avatar} alt={row.student} className="w-10 h-10 rounded-full object-cover border border-outline-variant" />
                      ) : (
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${row.color}`}>
                          {row.initials}
                        </div>
                      )}
                      <div>
                        <p className="font-label-md text-on-surface">{row.student}</p>
                        <p className="text-label-sm text-on-surface-variant mt-0.5">{row.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-5 px-6">
                    <div className={`flex items-center gap-2 ${row.dateColor}`}>
                      <row.dateIcon className="w-4 h-4" />
                      <span className="font-body-md text-[14px] text-on-surface-variant">{row.date}</span>
                    </div>
                  </td>
                  <td className="py-5 px-6">
                    <span className={row.priorityClass}>{row.priority}</span>
                  </td>
                  <td className="py-5 px-6 text-right opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="text-primary font-label-md hover:underline px-4 py-2 hover:bg-primary-container/10 rounded-lg">
                      Revisar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {}
        <div className="p-4 border-t border-outline-variant/50 flex justify-between items-center bg-surface-container-lowest">
          <p className="text-body-md text-on-surface-variant">Mostrando 4 de 28 tareas pendientes</p>
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
