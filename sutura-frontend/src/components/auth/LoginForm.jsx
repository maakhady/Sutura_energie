import { useState } from "react";
import { Mail, Lock, Eye, EyeClosed, LayoutGrid } from "lucide-react";
import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom"; // Importez useNavigate pour la redirection
import { authService } from "../../services/authService"; // Importez le service d'authentification

const LoginForm = ({ setPage }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate(); // Utilisez useNavigate pour la redirection

  const handleLoginSubmit = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      setError("L'email et le mot de passe sont requis");
      return;
    }

    setError("");

    try {
      // Appel au service d'authentification pour se connecter
      const response = await authService.loginWithEmail(email, password);

      if (response.success) {
        // Stocker le token dans le localStorage
        localStorage.setItem("token", response.token);

        if (response.passwordChangeRequired) {
          // Rediriger vers la page de changement de mot de passe initial
          navigate("/firstlogin");
        } else {
          // Rediriger vers le tableau de bord
          navigate("/dashboard");
        }
      }
    } catch (error) {
      setError(error.response?.data?.message || "Échec de la connexion");
    }
  };

  return (
    <div className="container">
      <div
        className="card shadow-lg mx-auto mt-5"
        style={{ maxWidth: "400px" }}
      >
        <div className="card-body">
          <div className="text-center mb-4">
            <img
              src="images/Sutura-Énergie.png"
              alt="Sutura-Énergie"
              className="img-fluid"
              style={{ width: "100px", height: "100px", borderRadius: "20%" }}
            />
          </div>

          <h4 className="text-center mb-4 primary-text">
            Bienvenue sur Sutura Énergie
          </h4>

          <div className="d-flex gap-2 mb-4">
            <button
              className={`btn flex-grow-1 d-flex align-items-center justify-content-center gap-2 btn-primary`}
              onClick={() => setPage("login")}
            >
              <Mail size={16} />
              Email
            </button>
            <button
              className={`btn flex-grow-1 d-flex align-items-center justify-content-center gap-2 btn-outline-secondary`}
              onClick={() => setPage("code")}
            >
              <LayoutGrid size={16} />
              Code
            </button>
          </div>

          <form onSubmit={handleLoginSubmit}>
            <div className="mb-3">
              <label className="form-label primary-text">Email</label>
              <div className="input-group">
                <span className="input-group-text">@</span>
                <input
                  type="email"
                  className="form-control border-primary"
                  placeholder="--------@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                />
              </div>
            </div>

            <div className="mb-3">
              <label className="form-label primary-text">Mot de passe</label>
              <div className="input-group">
                <span className="input-group-text">
                  <Lock size={16} />
                </span>
                <input
                  type={showPassword ? "text" : "password"}
                  className="form-control border-primary"
                  placeholder="Entrez votre mot de passe"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <Eye size={16} /> : <EyeClosed size={16} />}
                </button>
              </div>
            </div>

            {/* Affichage des erreurs */}
            {error && (
              <div className="alert alert-danger mt-3" role="alert">
                {error}
              </div>
            )}

            <div className="text-end mb-3">
              <button
                type="button"
                className="btn btn-link p-0"
                style={{ color: "#274c77" }}
                onClick={() => setPage("forgot-password")}
              >
                Mot de passe oublié
              </button>
            </div>
            <button
              type="submit"
              className="btn btn-primary w-100 py-2"
              disabled={!email || !password}
            >
              Se connecter
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

LoginForm.propTypes = {
  setPage: PropTypes.func.isRequired, // setPage est une fonction et est obligatoire
};

export default LoginForm;
