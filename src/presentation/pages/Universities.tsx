import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GraduationCap, Search, Copy, Check, ShieldAlert, Key } from 'lucide-react';
import axios from 'axios';
import { API_CONFIG } from '../../application/config/api_config';

interface University {
  id: string;
  name: string;
  acronym: string | null;
  registrationCode: string | null;
}

export default function Universities() {
  const [registeredUniversities, setRegisteredUniversities] = useState<University[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<University[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchRegisteredUniversities();
    
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchQuery.length >= 2) {
        searchUniversities(searchQuery);
      } else {
        setSearchResults([]);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const fetchRegisteredUniversities = async () => {
    setIsLoading(true);
    try {
      const res = await axios.get(`${API_CONFIG.BASE_URL}/auth/universities/registered`);
      setRegisteredUniversities(res.data);
    } catch (error) {
      console.error('Error fetching registered universities:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const searchUniversities = async (query: string) => {
    setIsSearching(true);
    try {
      const res = await axios.get(`${API_CONFIG.BASE_URL}/auth/universities`, {
        params: { search: query }
      });
      setSearchResults(res.data);
      setShowDropdown(true);
    } catch (error) {
      console.error('Error searching universities:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const generateCode = async (id: string) => {
    try {
      await axios.put(`${API_CONFIG.BASE_URL}/auth/universities/${id}/code`);
      setSearchQuery('');
      setShowDropdown(false);
      fetchRegisteredUniversities();
    } catch (error) {
      console.error('Error generating code:', error);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="flex-1 bg-surface flex flex-col h-screen overflow-hidden">
      {/* Top Bar */}
      <div className="h-20 flex-none border-b border-outline-variant/50 bg-surface/50 backdrop-blur-xl px-8 flex items-center justify-between sticky top-0 z-40">
        <div>
          <h2 className="text-title-lg font-bold text-on-surface">Gestión de Universidades</h2>
          <p className="text-body-sm text-on-surface-variant">Genera códigos de acceso para el registro de docentes</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-8">
        <div className="max-w-6xl mx-auto space-y-8">
          
          {/* Action Section */}
          <div className="bg-surface-container-low rounded-2xl border border-outline-variant/50 p-6 shadow-sm">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-12 h-12 rounded-xl bg-primary-container text-primary flex items-center justify-center flex-shrink-0">
                <GraduationCap className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-title-md font-bold text-on-surface mb-1">Registrar Universidad</h3>
                <p className="text-body-md text-on-surface-variant max-w-3xl">
                  Busca una universidad existente en el sistema para generarle un código de acceso único. 
                  Los docentes requerirán este código de 6 dígitos al momento de registrarse en la aplicación.
                </p>
              </div>
            </div>

            <div className="relative max-w-2xl" ref={searchRef}>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-on-surface-variant" />
                <input
                  type="text"
                  placeholder="Buscar universidad (ej. Universidad Politécnica...)"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    if (e.target.value.length >= 2) setShowDropdown(true);
                  }}
                  onFocus={() => {
                    if (searchQuery.length >= 2) setShowDropdown(true);
                  }}
                  className="w-full bg-surface-container-lowest border border-outline-variant/50 rounded-xl pl-12 pr-4 py-4 text-body-md text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                />
                {isSearching && (
                  <div className="absolute right-4 top-1/2 -translate-y-1/2">
                    <div className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin"></div>
                  </div>
                )}
              </div>

              <AnimatePresence>
                {showDropdown && searchResults.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute top-full mt-2 w-full bg-surface-container-lowest border border-outline-variant/50 rounded-xl shadow-lg z-50 max-h-80 overflow-y-auto"
                  >
                    {searchResults.map((uni) => (
                      <div key={uni.id} className="p-4 hover:bg-surface-container-low transition-colors flex items-center justify-between group border-b border-outline-variant/20 last:border-0">
                        <div>
                          <h4 className="font-bold text-on-surface text-body-md">{uni.name}</h4>
                          {uni.acronym && <p className="text-label-sm text-on-surface-variant mt-0.5">{uni.acronym}</p>}
                        </div>
                        {uni.registrationCode ? (
                          <span className="flex items-center gap-1.5 px-3 py-1 bg-surface-container-highest text-on-surface-variant rounded-full text-label-sm font-bold">
                            <Check className="w-3.5 h-3.5" /> Ya registrada
                          </span>
                        ) : (
                          <button
                            onClick={() => generateCode(uni.id)}
                            className="flex items-center gap-2 px-4 py-2 bg-primary text-on-primary rounded-full text-label-sm font-bold opacity-0 group-hover:opacity-100 transition-all hover:bg-primary/90"
                          >
                            <Key className="w-4 h-4" /> Generar Código
                          </button>
                        )}
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Table Section */}
          <div>
            <h3 className="text-title-md font-bold text-on-surface mb-4">Universidades Activas</h3>
            
            {isLoading ? (
              <div className="flex justify-center p-12">
                <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
              </div>
            ) : registeredUniversities.length === 0 ? (
              <div className="bg-surface-container-lowest border border-outline-variant/50 rounded-2xl p-12 flex flex-col items-center justify-center text-center">
                <ShieldAlert className="w-12 h-12 text-on-surface-variant mb-4 opacity-50" />
                <h3 className="text-title-md font-bold text-on-surface mb-2">No hay universidades activas</h3>
                <p className="text-body-md text-on-surface-variant max-w-md">
                  No se ha generado ningún código de acceso. Utiliza el buscador de arriba para activar la primera universidad.
                </p>
              </div>
            ) : (
              <div className="bg-surface-container-lowest border border-outline-variant/50 rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-surface-container-low border-b border-outline-variant/50">
                        <th className="p-4 text-label-sm font-bold text-on-surface-variant uppercase tracking-wider">Universidad</th>
                        <th className="p-4 text-label-sm font-bold text-on-surface-variant uppercase tracking-wider">Acrónimo</th>
                        <th className="p-4 text-label-sm font-bold text-on-surface-variant uppercase tracking-wider">Código de Acceso</th>
                        <th className="p-4 text-label-sm font-bold text-on-surface-variant uppercase tracking-wider text-right">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-outline-variant/30">
                      {registeredUniversities.map((uni) => (
                        <tr key={uni.id} className="hover:bg-surface-container-low/50 transition-colors group">
                          <td className="p-4">
                            <span className="font-bold text-on-surface text-body-md">{uni.name}</span>
                          </td>
                          <td className="p-4">
                            <span className="text-body-sm text-on-surface-variant bg-surface-container px-2 py-1 rounded">
                              {uni.acronym || 'N/A'}
                            </span>
                          </td>
                          <td className="p-4">
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-title-sm font-bold text-primary tracking-widest bg-primary-container/30 px-3 py-1.5 rounded-lg border border-primary/20">
                                {uni.registrationCode}
                              </span>
                            </div>
                          </td>
                          <td className="p-4 text-right">
                            <button
                              onClick={() => copyToClipboard(uni.registrationCode!, uni.id)}
                              className="inline-flex items-center gap-2 px-4 py-2 bg-surface-container hover:bg-surface-container-highest border border-outline-variant/50 rounded-xl text-label-sm font-bold text-on-surface transition-colors"
                            >
                              {copiedId === uni.id ? (
                                <>
                                  <Check className="w-4 h-4 text-primary" />
                                  <span className="text-primary">Copiado</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="w-4 h-4" />
                                  Copiar
                                </>
                              )}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
          
        </div>
      </div>
    </div>
  );
}
