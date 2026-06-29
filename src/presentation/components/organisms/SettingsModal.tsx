import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save, FileText, Settings, Sliders, CheckCircle } from 'lucide-react';
import axios from 'axios';
import { API_CONFIG } from '../../../application/config/api_config';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const [activeTab, setActiveTab] = useState<'engine' | 'appearance'>('engine');
  const [allowedExtensions, setAllowedExtensions] = useState<string[]>([]);
  const [llmProvider, setLlmProvider] = useState<'ollama' | 'groq'>('ollama');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{text: string, type: 'success' | 'error'} | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchConfig();
      setMessage(null);
    }
  }, [isOpen]);

  const fetchConfig = async () => {
    setIsLoading(true);
    try {
      const res = await axios.get(`${API_CONFIG.BASE_URL}/clustering/integrator/admin/config`);
      if (res.data) {
        if (res.data.allowed_extensions) setAllowedExtensions(res.data.allowed_extensions);
        if (res.data.llm_provider) setLlmProvider(res.data.llm_provider);
      }
    } catch (error) {
      console.error('Error fetching config', error);
      setAllowedExtensions(['.pdf', '.md', '.txt']);
      setLlmProvider('ollama');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    setMessage(null);
    try {
      await axios.post(`${API_CONFIG.BASE_URL}/clustering/integrator/admin/config`, {
        allowed_extensions: allowedExtensions,
        llm_provider: llmProvider
      });
      setMessage({ text: 'Configuración actualizada con éxito.', type: 'success' });
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      console.error('Error saving config', error);
      setMessage({ text: 'Error al actualizar la configuración.', type: 'error' });
    } finally {
      setIsSaving(false);
    }
  };

  const toggleExtension = (ext: string) => {
    setAllowedExtensions(prev => 
      prev.includes(ext) 
        ? prev.filter(e => e !== ext)
        : [...prev, ext]
    );
  };

  const ExtensionToggle = ({ ext, label, desc }: { ext: string, label: string, desc: string }) => {
    const isChecked = allowedExtensions.includes(ext);
    
    return (
      <div className="flex items-center justify-between p-4 bg-surface-container-low rounded-xl border border-outline-variant/50">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-surface flex items-center justify-center text-primary shadow-sm border border-outline-variant/30">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-body-lg font-bold text-on-surface">{label} ({ext})</h4>
            <p className="text-body-sm text-on-surface-variant">{desc}</p>
          </div>
        </div>
        
        {}
        <button 
          onClick={() => toggleExtension(ext)}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${isChecked ? 'bg-primary' : 'bg-surface-variant'}`}
        >
          <span 
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isChecked ? 'translate-x-6' : 'translate-x-1'}`}
          />
        </button>
      </div>
    );
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={onClose}
          />
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-4xl h-[80vh] flex bg-surface rounded-2xl shadow-2xl overflow-hidden z-10"
          >
            {}
            <div className="w-64 bg-surface-container-lowest border-r border-outline-variant/50 flex flex-col p-4">
              <h2 className="text-label-lg font-bold text-on-surface-variant uppercase tracking-wider mb-4 px-3">
                Ajustes
              </h2>
              
              <nav className="flex flex-col gap-1">
                <button 
                  onClick={() => setActiveTab('engine')}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-body-md font-medium transition-colors ${activeTab === 'engine' ? 'bg-primary-container/30 text-primary' : 'text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface'}`}
                >
                  <Sliders className="w-5 h-5" />
                  Motor IA
                </button>
                <button 
                  onClick={() => setActiveTab('appearance')}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-body-md font-medium transition-colors ${activeTab === 'appearance' ? 'bg-primary-container/30 text-primary' : 'text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface'}`}
                >
                  <Settings className="w-5 h-5" />
                  Apariencia
                </button>
              </nav>
            </div>

            {}
            <div className="flex-1 flex flex-col bg-surface relative">
              <div className="absolute top-4 right-4 z-20">
                <button 
                  onClick={onClose}
                  className="p-2 rounded-full text-on-surface-variant hover:bg-surface-container-highest transition-colors border border-outline-variant/50 bg-surface shadow-sm"
                >
                  <X className="w-5 h-5" />
                </button>
                <p className="text-[10px] text-center mt-1 text-on-surface-variant font-bold uppercase tracking-wider">Esc</p>
              </div>

              {activeTab === 'engine' && (
                <div className="flex-1 overflow-y-auto p-10 flex flex-col">
                  <h3 className="text-headline-sm font-bold text-on-surface mb-2">Motor de Clustering</h3>
                  <p className="text-body-md text-on-surface-variant mb-8 pb-6 border-b border-outline-variant/50">
                    Controla qué tipos de archivos son procesados por el motor de NLP y vectorización en ChromaDB.
                  </p>

                  {isLoading ? (
                    <div className="flex-1 flex items-center justify-center">
                      <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <h4 className="text-body-lg font-bold text-on-surface mt-6 mb-2">Extensiones de Archivo</h4>
                      <ExtensionToggle ext=".pdf" label="Documentos PDF" desc="Artículos científicos, tesis y libros." />
                      <ExtensionToggle ext=".md" label="Archivos Markdown" desc="Documentación técnica y notas." />
                      <ExtensionToggle ext=".txt" label="Texto Plano" desc="Transcripts o apuntes básicos sin formato." />
                      
                      <h4 className="text-body-lg font-bold text-on-surface mt-8 mb-2 border-t border-outline-variant/50 pt-6">Proveedor de Inteligencia Artificial</h4>
                      <p className="text-body-sm text-on-surface-variant mb-4">Selecciona el motor principal de IA. Groq ofrece inferencia ultra-rápida (&#60;3s), mientras Ollama garantiza 100% privacidad ejecutándose localmente (&#126;40s). Si Groq falla, el sistema usará Ollama automáticamente como respaldo (Failover).</p>
                      
                      <div className="flex gap-4">
                        <button
                          onClick={() => setLlmProvider('groq')}
                          className={`relative flex-1 p-5 rounded-2xl border-2 transition-all overflow-hidden ${llmProvider === 'groq' ? 'bg-primary/10 border-primary shadow-sm' : 'bg-surface-container-low border-outline-variant/50 hover:bg-surface-container hover:border-outline-variant'}`}
                        >
                          {llmProvider === 'groq' && (
                            <div className="absolute top-3 right-3 text-primary animate-in fade-in zoom-in duration-200">
                              <CheckCircle className="w-5 h-5 fill-primary text-white" />
                            </div>
                          )}
                          <div className={`text-left ${llmProvider === 'groq' ? 'text-primary font-bold' : 'text-on-surface'}`}>
                            <h5 className="font-bold mb-1 text-lg">GroqCloud (Alta Velocidad)</h5>
                            <p className="text-sm opacity-80 font-normal">Llama-3.3-70B vía LPU (Nube segura)</p>
                          </div>
                        </button>
                        <button
                          onClick={() => setLlmProvider('ollama')}
                          className={`relative flex-1 p-5 rounded-2xl border-2 transition-all overflow-hidden ${llmProvider === 'ollama' ? 'bg-primary/10 border-primary shadow-sm' : 'bg-surface-container-low border-outline-variant/50 hover:bg-surface-container hover:border-outline-variant'}`}
                        >
                          {llmProvider === 'ollama' && (
                            <div className="absolute top-3 right-3 text-primary animate-in fade-in zoom-in duration-200">
                              <CheckCircle className="w-5 h-5 fill-primary text-white" />
                            </div>
                          )}
                          <div className={`text-left ${llmProvider === 'ollama' ? 'text-primary font-bold' : 'text-on-surface'}`}>
                            <h5 className="font-bold mb-1 text-lg">Ollama (Offline/Local)</h5>
                            <p className="text-sm opacity-80 font-normal">Llama-3.2-3B (Máxima Privacidad)</p>
                          </div>
                        </button>
                      </div>

                      {message && (
                        <div className={`mt-6 p-4 rounded-xl text-body-md font-medium ${message.type === 'success' ? 'bg-primary-container text-primary' : 'bg-error-container text-error'}`}>
                          {message.text}
                        </div>
                      )}
                      
                      <div className="mt-8 pt-6 border-t border-outline-variant/50 flex justify-end">
                        <button 
                          onClick={handleSave}
                          disabled={isSaving}
                          className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-label-md transition-colors ${isSaving ? 'bg-surface-variant text-on-surface-variant cursor-not-allowed' : 'bg-primary text-white hover:bg-primary/90 shadow-md hover:shadow-lg'}`}
                        >
                          {isSaving ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                          ) : (
                            <Save className="w-5 h-5" />
                          )}
                          {isSaving ? 'Guardando...' : 'Guardar Cambios'}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'appearance' && (
                <div className="flex-1 p-10">
                  <h3 className="text-headline-sm font-bold text-on-surface mb-2">Apariencia</h3>
                  <p className="text-body-md text-on-surface-variant mb-8 pb-6 border-b border-outline-variant/50">
                    Ajustes visuales de la plataforma (Manejo de tema oscuro).
                  </p>
                  <p className="text-body-md text-on-surface-variant italic">
                    Utiliza el botón de Sol y Luna en el menú lateral principal para alternar rápidamente entre modo claro y oscuro.
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
