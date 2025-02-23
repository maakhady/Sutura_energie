import ResetPassword from "../../components/auth/ResetPassword";
import "../../styles/LoginPages.css";

const ResetPasswordPage = () => {
  return (
    <div className="login-page">
      <div className="login-container fancy-border-radius">
        <ResetPassword setPage={() => {}} />
      </div>
    </div>
  );
};

export default ResetPasswordPage;
