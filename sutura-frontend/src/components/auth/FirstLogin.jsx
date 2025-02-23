import { useState, useEffect, useCallback } from "react";
import { Lock, Eye, EyeClosed, Info } from "lucide-react";
import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";
import { authService } from "../../services/authService";

const FirstLogin = () => {
  const [defaultPassword, setDefaultPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordRules, setPasswordRules] = useState({
    minLength: false,
    hasUppercase: false,
    hasLowercase: false,
    hasNumber: false,
    hasSpecialChar: false,
  });
  const [showPasswordRules, setShowPasswordRules] = useState(false); // État pour afficher/cacher les règles
  const [isFormValid, setIsFormValid] = useState(false);
  const navigate = useNavigate();

  // Validation des règles de complexité du mot de passe
  const validatePasswordComplexity = useCallback((password) => {
    const rules = {
      minLength: password.length >= 8,
      hasUppercase: /[A-Z]/.test(password),
      hasLowercase: /[a-z]/.test(password),
      hasNumber: /\d/.test(password),
      hasSpecialChar: /[@$!%*?&]/.test(password),
    };
    setPasswordRules(rules);
    return Object.values(rules).every((rule) => rule);
  }, []);

  // Validation globale des mots de passe
  const validatePasswords = useCallback(() => {
    setError(""); // Réinitialiser l'erreur

    // Vérifier si le mot de passe par défaut est saisi
    if (!defaultPassword) {
      setError("Veuillez saisir votre mot de passe par défaut.");
      return false;
    }

    // Vérifier si les nouveaux mots de passe correspondent
    if (newPassword !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas.");
      return false;
    }

    // Vérifier la complexité du mot de passe
    if (!validatePasswordComplexity(newPassword)) {
      setError("Le mot de passe ne respecte pas les règles de complexité.");
      return false;
    }

    return true; // Si tout est valide
  }, [
    defaultPassword,
    newPassword,
    confirmPassword,
    validatePasswordComplexity,
  ]);

  // Utiliser useEffect pour valider les mots de passe lorsque les valeurs changent
  useEffect(() => {
    setIsFormValid(validatePasswords());
  }, [defaultPassword, newPassword, confirmPassword, validatePasswords]);

  // Gestion de la soumission du formulaire
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isFormValid) {
      return; // Ne pas soumettre si les validations échouent
    }

    try {
      // Récupérer le token temporaire depuis le localStorage
      const token = localStorage.getItem("token");

      if (!token) {
        setError("Session invalide. Veuillez vous reconnecter.");
        return;
      }

      // Appeler le service pour changer le mot de passe
      const response = await authService.changeInitialPassword(
        {
          newPassword: newPassword,
          confirmPassword: confirmPassword,
        },
        token
      );

      if (response.success) {
        localStorage.removeItem("token"); // Supprimer le token temporaire
        navigate("/"); // Rediriger vers la page de connexion
      } else {
        setError(
          response.message || "Erreur lors de la modification du mot de passe."
        );
      }
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Erreur lors de la modification du mot de passe."
      );
    }
  };

  // Vérifier l'expiration du token toutes les secondes
  useEffect(() => {
    const checkTokenExpiration = setInterval(() => {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/"); // Rediriger si le token est expiré ou absent
      }
    }, 1000); // Vérifier toutes les secondes

    return () => clearInterval(checkTokenExpiration); // Nettoyer l'intervalle
  }, [navigate]);

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

          <h4 className="text-center mb-4 primary-text">Première connexion</h4>
          <p className="text-center mb-4">
            Veuillez modifier votre mot de passe par défaut.
          </p>

          <form onSubmit={handleSubmit}>
            {/* Mot de passe par défaut */}
            <div className="mb-3">
              <label className="form-label primary-text">
                Mot de passe par défaut
              </label>
              <div className="input-group">
                <span className="input-group-text">
                  <Lock size={16} />
                </span>
                <input
                  type="password"
                  className="form-control border-primary"
                  placeholder="Entrez votre mot de passe par défaut"
                  value={defaultPassword}
                  onChange={(e) => setDefaultPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Nouveau mot de passe */}
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
              {/* Bouton pour afficher les règles de complexité */}
              <button
                type="button"
                className="btn btn-link p-0 mt-2"
                onClick={() => setShowPasswordRules(!showPasswordRules)}
              >
                <Info size={16} /> Afficher les règles de complexité
              </button>
              {/* Règles de complexité (cachées par défaut) */}
              {showPasswordRules && (
                <div className="mt-2 small text-muted">
                  <p>Le mot de passe doit contenir :</p>
                  <ul>
                    <li
                      className={
                        passwordRules.minLength ? "text-success" : "text-danger"
                      }
                    >
                      Au moins 8 caractères
                    </li>
                    <li
                      className={
                        passwordRules.hasUppercase
                          ? "text-success"
                          : "text-danger"
                      }
                    >
                      Une majuscule
                    </li>
                    <li
                      className={
                        passwordRules.hasLowercase
                          ? "text-success"
                          : "text-danger"
                      }
                    >
                      Une minuscule
                    </li>
                    <li
                      className={
                        passwordRules.hasNumber ? "text-success" : "text-danger"
                      }
                    >
                      Un chiffre
                    </li>
                    <li
                      className={
                        passwordRules.hasSpecialChar
                          ? "text-success"
                          : "text-danger"
                      }
                    >
                      Un caractère spécial (@$!%*?&)
                    </li>
                  </ul>
                </div>
              )}
            </div>

            {/* Confirmer le nouveau mot de passe */}
            <div className="mb-3">
              <label className="form-label primary-text">
                Confirmer le nouveau mot de passe
              </label>
              <div className="input-group">
                <span className="input-group-text">
                  <Lock size={16} />
                </span>
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  className="form-control border-primary"
                  placeholder="Confirmez votre nouveau mot de passe"
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

            {/* Affichage des erreurs */}
            {error && (
              <div className="alert alert-danger mt-3" role="alert">
                {error}
              </div>
            )}

            {/* Bouton de modification */}
            <button
              type="submit"
              className="btn btn-primary w-100 py-2 mt-3"
              disabled={!isFormValid}
            >
              Modifier
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

FirstLogin.propTypes = {
  setPage: PropTypes.func.isRequired,
};

export default FirstLogin;
