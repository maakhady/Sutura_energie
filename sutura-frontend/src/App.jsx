import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import './App.css'
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap/dist/js/bootstrap.bundle.min.js'
import Sidebar from './components/Sidebar'
import Dashboard from './pages/Dashboard'
import DashboardListes from './pages/dashboard-listes'
import AjouterUtilisateur from './pages/AjouterUtilisateur'
import ModifierUtilisateur from './pages/ModifierUtilisateur'



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
                  <Route path="/ajouter-utilisateur" element={<AjouterUtilisateur />} />
                  <Route path="/modifier-utilisateur/:id" element={<ModifierUtilisateur />} />
                  <Route path="/modifier-utilisateur/" element={<ModifierUtilisateur />} />

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