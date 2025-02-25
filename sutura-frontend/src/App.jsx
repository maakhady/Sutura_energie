import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import Sidebar from "./components/Sidebar";
import LoginPage from "./pages/auth/LoginPage";
import FirstLoginPage from "./pages/auth/FirstLoginPage";
import ForgotPasswordPage from "./pages/auth/ForgotPasswordPage";
import ResetPasswordPage from "./pages/auth/ResetPasswordPage";
import NotFoundPage from "./pages/NotFoundPage";
import DashboardPage from "./pages/DashboardPages"; // Utilisation de DashboardPage
import AppareilsPage from "./pages/AppareilsPage";
import ProtectedRoute from "./components/auth/ProtectedRoute"; // Importez votre composant ProtectedRoute

const App = () => {
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
                  <Route path="/utilisateurs" element={<Dashboard />} />
                </Routes>
              </div>
            </div>
          }
        />
      </Routes>
    </Router>
  );
};

export default App;
