import { useNavigate } from "react-router-dom";
import { authService } from "../services/authService"; // Importez votre service d'authentification

const DashboarPage = () => {
  const navigate = useNavigate();

  // Fonction pour gérer la déconnexion
  const handleLogout = async () => {
    try {
      await authService.logout(); // Appelez la fonction de déconnexion
      navigate("/"); // Redirigez l'utilisateur vers la page de connexion
    } catch (error) {
      console.error("Erreur lors de la déconnexion:", error);
    }
  };

  return (
    <div>
      <h1>Bienvenue</h1>
      <p>Page de bienvenue.</p>
      {/* Bouton de déconnexion */}
      <button
        onClick={handleLogout}
        style={{
          padding: "10px 20px",
          backgroundColor: "#ff4444",
          color: "white",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer",
        }}
      >
        Déconnexion
      </button>
    </div>
  );
};

export default DashboarPage;
