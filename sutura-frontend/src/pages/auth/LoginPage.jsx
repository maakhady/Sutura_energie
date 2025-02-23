import { useState } from "react";
import LoginForm from "../../components/auth/LoginForm";
import CodeForm from "../../components/auth/CodeForm";
import ForgotPassword from "../../components/auth/ForgotPassword"; // Importez le composant ForgotPassword
import "../../styles/LoginPages.css";

const LoginPage = () => {
  const [page, setPage] = useState("login"); // "login", "code", ou "forgot-password"

  return (
    <div className="login-page">
      <div className="login-container fancy-border-radius">
        {page === "login" ? (
          <LoginForm setPage={setPage} />
        ) : page === "code" ? (
          <CodeForm setPage={setPage} />
        ) : (
          <ForgotPassword setPage={setPage} /> // Afficher ForgotPassword si page === "forgot-password"
        )}
      </div>
    </div>
  );
};

export default LoginPage;
