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
import DashboardPage from "./pages/DashboardPages";
import AppareilsPage from "./pages/AppareilsPage";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import DashboardListes from "./pages/dashboard-listes";
import AjouterUtilisateur from "./pages/AjouterUtilisateur";
import ModifierUtilisateur from "./pages/ModifierUtilisateur";
import DashboardHistorique from "./pages/Dashboard-historique";

const App = () => {
  return (
    <Router>
      <div className="min-h-screen flex flex-col items-center bg-gray-100">
        <Routes>
          {/* Route publique */}
          <Route path="/" element={<LoginPage />} />
          
          {/* Routes modifiées pour utiliser des paramètres de requête */}
          <Route
            path="/firstlogin/definir-mot-de-passe"
            element={<FirstLoginPage />}
          />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route
            path="/reinitialiser-mot-de-passe"
            element={<ResetPasswordPage />}
          />

          {/* Route protégée */}
          <Route element={<ProtectedRoute />}>
            <Route
              path="/*"
              element={
                <div className="d-flex">
                  <Sidebar />
                  <div className="flex-grow-1">
                    <Routes>
                      <Route path="/dashboard" element={<DashboardPage />} />
                      <Route path="/appareils" element={<AppareilsPage />} />
                      <Route path="/historiques" element={<DashboardHistorique />} />
                      <Route
                        path="/utilisateurs"
                        element={<DashboardListes />}
                      />
                      <Route
                        path="/ajouter-utilisateur"
                        element={<AjouterUtilisateur />}
                      />
                      <Route
                        path="/modifier-utilisateur/:id"
                        element={<ModifierUtilisateur />}
                      />
                    </Routes>
                  </div>
                </div>
              }
            />
          </Route>

          {/* Route 404 */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;