import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../application/contexts/AuthContext';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { CorvusLogo } from '../components/atoms/CorvusLogo';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const { login, isLoading } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    if (!email || !password) return;
    try {
      await login(email, password, rememberMe);
      navigate('/');
    } catch (err: any) {
      const backendMessage = err.response?.data?.error || err.response?.data?.message;
      let finalMsg = (typeof backendMessage === 'string' && backendMessage.trim() !== '')
        ? backendMessage 
        : 'Credenciales inválidas o error de conexión al servidor';
      
      if (finalMsg.toLowerCase() === 'invalid credentials') {
        finalMsg = 'Correo electrónico o contraseña incorrectos.';
      }
      
      setErrorMsg(finalMsg);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-background">
      {}
      <div className="hidden md:flex md:w-1/2 bg-primary items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(#ffffff33_1px,transparent_1px)] [background-size:24px_24px] opacity-20"></div>
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="z-10 text-white max-w-lg"
        >
          <div className="bg-white/10 p-4 rounded-2xl inline-flex mb-8 backdrop-blur-sm border border-white/20">
            <CorvusLogo className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-display-lg font-bold mb-6">Innovación Académica</h1>
          <p className="text-body-lg text-primary-fixed-dim">
            Plataforma avanzada para la gestión, clustering semántico y validación de proyectos universitarios.
          </p>
        </motion.div>
        
        {}
        <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-primary-fixed/20 rounded-full blur-3xl"></div>
        <div className="absolute top-20 right-20 w-64 h-64 bg-secondary-container/20 rounded-full blur-3xl"></div>
      </div>

      {}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md glass-panel p-8 sm:p-12 rounded-3xl"
        >
          <div className="flex justify-center mb-6">
            <div className="bg-surface-container p-3 rounded-xl">
              <CorvusLogo className="w-8 h-8 text-primary" />
            </div>
          </div>
          
          <div className="text-center mb-8">
            <h2 className="text-headline-md font-bold text-on-surface mb-2">Bienvenido a AcadeRAG</h2>
            <p className="text-body-md text-on-surface-variant">
              Inicia sesión para acceder a tus investigaciones y proyectos.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-label-md text-on-surface mb-2">Correo electrónico</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-outline" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-surface-container-low border border-outline-variant rounded-xl text-body-md focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                  placeholder="investigador@universidad.edu"
                  required
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-label-md text-on-surface">Contraseña</label>
                <a href="#" className="text-label-md text-primary font-semibold hover:underline">¿Olvidaste tu contraseña?</a>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-outline" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-3 bg-surface-container-low border border-outline-variant rounded-xl text-body-md focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                  placeholder="••••••••"
                  required
                />
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-outline hover:text-on-surface-variant transition-colors" />
                  ) : (
                    <Eye className="h-5 w-5 text-outline hover:text-on-surface-variant transition-colors" />
                  )}
                </button>
              </div>
            </div>

            {errorMsg && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }} 
                animate={{ opacity: 1, y: 0 }} 
                className="text-error text-label-md font-medium px-2"
              >
                * {errorMsg}
              </motion.div>
            )}

            <div className="flex items-center">
              <input
                id="remember-me"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-4 w-4 text-primary focus:ring-primary border-outline-variant rounded cursor-pointer"
              />
              <label htmlFor="remember-me" className="ml-2 block text-body-md text-on-surface-variant cursor-pointer">
                Recordarme por 30 días
              </label>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 bg-primary text-white rounded-xl font-label-md text-[16px] interactive-element hover:bg-primary/90 flex justify-center items-center"
            >
              {isLoading ? (
                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                'Iniciar sesión'
              )}
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
