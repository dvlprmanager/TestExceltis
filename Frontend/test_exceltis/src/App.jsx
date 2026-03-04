import { Navigate, Route, Routes } from 'react-router-dom'
import NavbarExameple from './components/NavBar'
import DashboardPage from './pages/DashboardPage'
import VentasPage from './pages/VentasPage'
import VisitasMedicasPage from './pages/VisitasMedicasPage'

function App() {
  return (
    <div className="min-h-screen bg-white text-slate-900">
      <NavbarExameple />
      <Routes>
        <Route path="/" element={<Navigate to="/visitas-medicas" replace />} />
        <Route path="/visitas-medicas" element={<VisitasMedicasPage />} />
        <Route path="/ventas" element={<VentasPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
      </Routes>
    </div>
  )
}

export default App
