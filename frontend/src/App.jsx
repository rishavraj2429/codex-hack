import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Landing from './pages/Landing/Landing';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import DashboardLayout from './layouts/DashboardLayout/DashboardLayout';
import Overview from './pages/Overview/Overview';
import HeatMap from './pages/HeatMap/HeatMap';
import SimulationLab from './pages/SimulationLab/SimulationLab';
import AIAssistant from './pages/AIAssistant/AIAssistant';
import Settings from './pages/Settings/Settings';
import './index.css';

function ProtectedRoute({ children }) {
  const token = localStorage.getItem('gaia_token');
  if (!token) return <Navigate to="/login" replace />;
  return children;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Overview />} />
          <Route path="heatmap" element={<HeatMap />} />
          <Route path="simulation" element={<SimulationLab />} />
          <Route path="assistant" element={<AIAssistant />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
