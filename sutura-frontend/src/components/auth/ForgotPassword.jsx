import { useState } from "react";
import PropTypes from "prop-types";
import { authService } from "../../services/authService"; // Assure-toi d'importer ton service
import "../../styles/LoginPages.css";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Appeler le service pour demander la réinitialisation
      const response = await authService.demanderReinitialisation(email);

      if (response.success) {
        setMessage("Un email de réinitialisation a été envoyé.");
        setError("");
      } else {
        setError(response.message || "Erreur lors de l'envoi de l'email.");
      }
    } catch (error) {
      setError("Erreur lors de l'envoi de l'email. Veuillez réessayer.");
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

          <h4 className="text-center mb-4 primary-text">Mot de passe oublié</h4>
          <p className="text-center mb-1">Renseignez votre Email</p>

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label primary-text">Email</label>
              <div className="input-group">
                <span className="input-group-text">@</span>
                <input
                  type="email"
                  className="form-control border-primary"
                  placeholder="Entrez votre email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            {message && (
              <div className="alert alert-success mt-3" role="alert">
                {message}
              </div>
            )}
            {error && <div className="text-danger small mb-3">{error}</div>}

            <button type="submit" className="btn btn-primary w-100 py-2">
              Envoyer
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

ForgotPassword.propTypes = {
  setPage: PropTypes.func.isRequired,
};

export default ForgotPassword;
