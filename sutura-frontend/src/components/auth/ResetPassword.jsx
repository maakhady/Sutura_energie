import { useState } from "react";
import { Lock, Eye, EyeClosed } from "lucide-react";
import PropTypes from "prop-types";
import { useNavigate, useParams } from "react-router-dom"; // Utiliser useSearchParams au lieu de useParams
import { authService } from "../../services/authService";

const ResetPassword = () => {
  // const [searchParams] = useSearchParams(); // Récupérer les paramètres de l'URL
  // const token = searchParams.get('token'); // Récupérer le token depuis les paramètres de requête
  const { token } = useParams(); // ✅ à ajouter
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
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
      // Vérifier si le token est disponible
      if (!token) {
        setError("Token de réinitialisation manquant ou invalide.");
        return;
      }

      // Appeler le service pour réinitialiser le mot de passe
      const response = await authService.reinitialiserMotDePasse(token, {
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
              src="/images/Sutura-Énergie.png" // Ajout du / initial pour chemin absolu
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
                Nouveau mot de passe
              </label>
              <div className="input-group">
                <span className="input-group-text">
                  <Lock size={16} />
                </span>
                <input
                  type={showNewPassword ? "text" : "password"}
                  className="form-control border-primary"
                  placeholder="Entrez votre nouveau mot de passe"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                >
                  {showNewPassword ? (
                    <Eye size={16} />
                  ) : (
                    <EyeClosed size={16} />
                  )}
                </button>
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
                  type={showConfirmPassword ? "text" : "password"}
                  className="form-control border-primary"
                  placeholder="Confirmez votre mot de passe"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <Eye size={16} />
                  ) : (
                    <EyeClosed size={16} />
                  )}
                </button>
              </div>
            </div>

            {message && (
              <div className="alert alert-success mt-3" role="alert">
                {message}
              </div>
            )}
            {error && (
              <div className="alert alert-danger mt-3" role="alert">
                {error}
              </div>
            )}

            <button type="submit" className="btn btn-primary w-100 py-2">
              Confirmer
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

// Modification des PropTypes - setPage n'est pas utilisé, donc le rendre optionnel
ResetPassword.propTypes = {
  setPage: PropTypes.func
};

export default ResetPassword;