import { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { authService } from "../../services/authService"; // Importez votre service d'authentification

const ProtectedRoute = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false); // État pour vérifier l'authentification
  const [isLoading, setIsLoading] = useState(true); // État pour gérer le chargement

  useEffect(() => {
    // Fonction asynchrone pour vérifier l'authentification
    const checkAuth = async () => {
      try {
        const profile = await authService.getMyProfile(); // Vérifiez l'authentification
        setIsAuthenticated(!!profile); // Mettez à jour l'état d'authentification
      } catch (error) {
        console.error(
          "Erreur lors de la vérification de l'authentification:",
          error
        );
        setIsAuthenticated(false); // En cas d'erreur, considérez l'utilisateur comme non authentifié
      } finally {
        setIsLoading(false); // Arrêtez le chargement une fois la vérification terminée
      }
    };

    checkAuth(); // Appelez la fonction de vérification
  }, []);

  // Si le chargement est en cours, affichez un indicateur de chargement ou rien
  if (isLoading) {
    return <div>Chargement...</div>; // ou un spinner de chargement
  }

  // Si l'utilisateur n'est pas authentifié, redirigez-le vers la page de connexion
  if (!isAuthenticated) {
    return <Navigate to="/" />;
  }

  // Si l'utilisateur est authentifié, affichez la route protégée
  return <Outlet />;
};

export default ProtectedRoute;
