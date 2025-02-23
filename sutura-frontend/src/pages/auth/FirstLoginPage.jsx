import FirstLogin from "../../components/auth/FirstLogin";
import "../../styles/LoginPages.css";

const FirstLoginPage = () => {
  return (
    <div className="login-page">
      <div className="login-container fancy-border-radius">
        <FirstLogin setPage={() => {}} />
      </div>
    </div>
  );
};

export default FirstLoginPage;
