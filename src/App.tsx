import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './application/contexts/AuthContext';
import { ThemeProvider } from './application/contexts/ThemeContext';
import { ProtectedRoute } from './presentation/components/templates/ProtectedRoute';
import { MainLayout } from './presentation/components/templates/MainLayout';
import Login from './presentation/pages/Login';
import Dashboard from './presentation/pages/Dashboard';
import Clustering from './presentation/pages/Clustering';
import ValidacionTareas from './presentation/pages/ValidacionTareas';
import Materias from './presentation/pages/Materias';
import ProjectsList from './presentation/pages/ProjectsList';
import InferenceHistory from './presentation/pages/InferenceHistory';

// Helper for redirecting authenticated users away from public routes like /login
function PublicRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isInitializing } = useAuth();
  if (isInitializing) return null;
  if (isAuthenticated) return <Navigate to="/" replace />;
  return <>{children}</>;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
      
      <Route element={<ProtectedRoute />}>
        <Route element={<MainLayout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/clustering" element={<Clustering />} />
          <Route path="/proyectos" element={<ProjectsList />} />
          <Route path="/tareas" element={<ValidacionTareas />} />
          <Route path="/materias" element={<Materias />} />
          <Route path="/inferencias" element={<InferenceHistory />} />
        </Route>
      </Route>
      
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <AppRoutes />
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
