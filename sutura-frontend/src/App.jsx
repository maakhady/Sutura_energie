import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import './App.css'
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap/dist/js/bootstrap.bundle.min.js'
import Sidebar from './components/Sidebar'
import Dashboard from './pages/Dashboard'
import DashboardListes from './pages/dashboard-listes'


function App() {
  return (
    <Router>
      <Routes>
        {/* Route pour la page de connexion */}
        
        {/* Route pour le dashboard et autres pages protégées */}
        <Route
          path="/*"
          element={
            <div className="d-flex">
              <Sidebar />
              <div className="flex-grow-1">
                <Routes>
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/appareils" element={<Dashboard />} />
                  <Route path="/historiques" element={<Dashboard />} />
                  <Route path="/utilisateurs" element={<DashboardListes />} />
                </Routes>
              </div>
            </div>
          }
        />
      </Routes>
    </Router>
  )
}

export default App