import ForgotPassword from "../../components/auth/ForgotPassword";
import ResetPassword from "../../components/auth/ResetPassword";
import { useState } from "react";
import "../../styles/LoginPages.css";

const ForgotPasswordPage = () => {
  const [page, setPage] = useState("forgot-password");

  return (
    <div className="login-page">
      <div className="login-container fancy-border-radius">
        {page === "forgot-password" ? (
          <ForgotPassword setPage={setPage} />
        ) : (
          <ResetPassword setPage={setPage} />
        )}
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
