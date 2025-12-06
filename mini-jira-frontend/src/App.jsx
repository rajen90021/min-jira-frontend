import './App.css';
import { Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import Login from './pages/auth/Login';
import DashboardPage from './pages/DashboardPage';
import ProfilePage from './pages/ProfilePage';
import DevelopersPage from './pages/DevelopersPage';
import ProjectsPage from './pages/ProjectsPage';
import TicketsPage from './pages/TicketsPage';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <Routes>
      {/* Auth routes - no Drawer */}
      <Route path="/login" element={<Login />} />

      {/* Main application area with Drawer layout */}
      <Route path="/app" element={<ProtectedRoute />}>
        <Route element={<MainLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="projects" element={<ProjectsPage />} />
          <Route path="tickets" element={<TicketsPage />} />
          <Route path="developers" element={<DevelopersPage />} />
          <Route path="profile" element={<ProfilePage />} />
        </Route>
      </Route>

      {/* Default and fallback redirects */}
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default App;
