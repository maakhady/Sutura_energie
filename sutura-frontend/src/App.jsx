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
import ProtectedRoute from "./components/auth/ProtectedRoute"; // Importez votre composant ProtectedRoute

const App = () => {
  return (
    <Router>
      <div className="min-h-screen flex flex-col items-center bg-gray-100">
        <Routes>
          {/* Route publique */}
          <Route path="/" element={<LoginPage />} />
          <Route path="/firstlogin" element={<FirstLoginPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route
            path="/reinitialiser-mot-de-passe/:token"
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
                      <Route path="/appareils" element={<DashboardPage />} />
                      <Route path="/historiques" element={<DashboardPage />} />
                      <Route path="/utilisateurs" element={<DashboardPage />} />
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
