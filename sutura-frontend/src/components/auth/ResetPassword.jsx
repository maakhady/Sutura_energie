import { useState} from "react";
import { Lock } from "lucide-react";
import PropTypes from "prop-types";
import { useNavigate, useParams } from "react-router-dom"; // Utiliser useParams pour récupérer le token
import { authService } from "../../services/authService"; // Assure-toi d'importer ton service

const ResetPassword = () => {
  const { token } = useParams(); // Récupérer le token depuis l'URL
  const [actuelPassword, setActuelPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      setError("Les nouveaux mots de passe ne correspondent pas.");
      return;
    }

    try {
      // Appeler le service pour réinitialiser le mot de passe
      const response = await authService.reinitialiserMotDePasse(token, {
        actuelPassword,
        nouveauPassword: newPassword,
        confirmPassword,
      });

      if (response.success) {
        setMessage("Mot de passe réinitialisé avec succès.");
        setError("");
        setTimeout(() => {
          navigate("/"); // Rediriger vers la page de connexion après succès
        }, 2000);
      } else {
        setError(response.message || "Erreur lors de la réinitialisation.");
      }
    } catch (error) {
      setError("Erreur lors de la réinitialisation. Veuillez réessayer.");
      console.error("Erreur:", error);
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
            Réinitialiser votre mot de passe
          </h4>

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label primary-text">
                Mot de passe actuel
              </label>
              <div className="input-group">
                <span className="input-group-text">
                  <Lock size={16} />
                </span>
                <input
                  type="password"
                  className="form-control border-primary"
                  placeholder="Entrez votre mot de passe actuel"
                  value={actuelPassword}
                  onChange={(e) => setActuelPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="mb-3">
              <label className="form-label primary-text">
                Nouveau mot de passe
              </label>
              <div className="input-group">
                <span className="input-group-text">
                  <Lock size={16} />
                </span>
                <input
                  type="password"
                  className="form-control border-primary"
                  placeholder="Entrez votre nouveau mot de passe"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="mb-3">
              <label className="form-label primary-text">
                Confirmer mot de passe
              </label>
              <div className="input-group">
                <span className="input-group-text">
                  <Lock size={16} />
                </span>
                <input
                  type="password"
                  className="form-control border-primary"
                  placeholder="Confirmez votre mot de passe"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            {message && (
              <div className="text-success small mb-3">{message}</div>
            )}
            {error && <div className="text-danger small mb-3">{error}</div>}

            <button type="submit" className="btn btn-primary w-100 py-2">
              Confirmer
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

ResetPassword.propTypes = {
  setPage: PropTypes.func.isRequired,
};

export default ResetPassword;