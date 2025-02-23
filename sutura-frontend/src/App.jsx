import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LoginPage from "./pages/auth/LoginPage";
import FirstLoginPage from "./pages/auth/FirstLoginPage";
import ForgotPasswordPage from "./pages/auth/ForgotPasswordPage";
import ResetPasswordPage from "./pages/auth/ResetPasswordPage";
import NotFoundPage from "./pages/NotFoundPage";
import DashboarPage from "./pages/DashboardPages";

const App = () => {
  return (
    <Router>
      <div className="min-h-screen flex flex-col items-center bg-gray-100">
        <Routes>
          <Route path="/dashboard" element={<DashboarPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/firstlogin" element={<FirstLoginPage />} />
          <Route
            path="/reinitialiser-mot-de-passe/:token"
            element={<ResetPasswordPage />}
          />
          <Route path="/" element={<LoginPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
