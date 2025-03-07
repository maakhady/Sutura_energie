import { useState, useEffect, useRef, memo } from 'react';
import '../styles/MiniRightPanel.css';
import { utilisateurService } from "../services/utilisateurService";
import { authService } from "../services/authService";
import { Eye, EyeOff } from "lucide-react";
import MemoizedProfileEditModal from "./ProfileEditModal";
import Swal from "sweetalert2";
import PropTypes from 'prop-types';

// Définir le composant PasswordChangeModal en dehors du composant principal
const PasswordChangeModal = ({
  passwordData,
  showPasswords,
  error,
  success,
  actuelPasswordRef,
  nouveauPasswordRef,
  confirmPasswordRef,
  modalRef,
  setShowModifierMotDePasse,
  handleInputChange,
  handleChangePassword,
  togglePasswordVisibility,
  handleModalContentClick,
}) => {
  // Vérifie si les mots de passe correspondent
  const passwordsMatch =
    passwordData.nouveauPassword &&
    passwordData.confirmPassword &&
    passwordData.nouveauPassword === passwordData.confirmPassword;

  // Vérifie si les mots de passe ne correspondent pas
  const passwordsDontMatch =
    passwordData.nouveauPassword &&
    passwordData.confirmPassword &&
    passwordData.nouveauPassword !== passwordData.confirmPassword;

  return (
    <div
      className="modal-overlay"
      onClick={() => setShowModifierMotDePasse(false)}
    >
      <div
        className="modal-content"
        onClick={handleModalContentClick}
        ref={modalRef}
      >
        <h3>Modifier mon mot de passe</h3>
        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}
        <form onSubmit={handleChangePassword} className="password-form">
          <div className="form-group">
            <label htmlFor="actuelPassword">Mot de passe actuel</label>
            <div className="password-input-container">
              <input
                type={showPasswords.actuelPassword ? "text" : "password"}
                id="actuelPassword"
                name="actuelPassword"
                value={passwordData.actuelPassword}
                onChange={handleInputChange}
                autoComplete="current-password"
                required
                ref={actuelPasswordRef}
              />
              <button
                type="button"
                className="toggle-password-btn"
                onMouseDown={(e) => {
                  e.preventDefault(); // Critique pour maintenir le focus
                }}
                onClick={(e) => togglePasswordVisibility("actuelPassword", e)}
                tabIndex="-1"
              >
                {showPasswords.actuelPassword ? (
                  <Eye size={16} />
                ) : (
                  <EyeOff size={16} />
                )}
              </button>
            </div>
          </div>
          <div className="form-group">
            <label htmlFor="nouveauPassword">Nouveau mot de passe</label>
            <div className="password-input-container">
              <input
                type={showPasswords.nouveauPassword ? "text" : "password"}
                id="nouveauPassword"
                name="nouveauPassword"
                value={passwordData.nouveauPassword}
                onChange={handleInputChange}
                autoComplete="new-password"
                required
                ref={nouveauPasswordRef}
              />
              <button
                type="button"
                className="toggle-password-btn"
                onMouseDown={(e) => {
                  e.preventDefault(); // Critique pour maintenir le focus
                }}
                onClick={(e) => togglePasswordVisibility("nouveauPassword", e)}
                tabIndex="-1"
              >
                {showPasswords.nouveauPassword ? (
                  <Eye size={16} />
                ) : (
                  <EyeOff size={16} />
                )}
              </button>
            </div>
          </div>
          <div className="form-group">
            <label htmlFor="confirmPassword">Confirmer le mot de passe</label>
            <div className="password-input-container">
              <input
                type={showPasswords.confirmPassword ? "text" : "password"}
                id="confirmPassword"
                name="confirmPassword"
                value={passwordData.confirmPassword}
                onChange={handleInputChange}
                autoComplete="new-password"
                required
                className={
                  passwordsDontMatch
                    ? "password-mismatch"
                    : passwordsMatch
                    ? "password-match"
                    : ""
                }
                ref={confirmPasswordRef}
              />
              <button
                type="button"
                className="toggle-password-btn"
                onMouseDown={(e) => {
                  e.preventDefault(); // Critique pour maintenir le focus
                }}
                onClick={(e) => togglePasswordVisibility("confirmPassword", e)}
                tabIndex="-1"
              >
                {showPasswords.confirmPassword ? (
                  <Eye size={16} />
                ) : (
                  <EyeOff size={16} />
                )}
              </button>
            </div>
            {passwordsDontMatch && (
              <p className="password-validation-message error">
                Les mots de passe ne correspondent pas
              </p>
            )}
            {passwordsMatch && (
              <p className="password-validation-message success">
                Les mots de passe correspondent
              </p>
            )}
          </div>
          <div className="form-buttons">
            <button
              type="submit"
              className="submit-btn"
              disabled={passwordsDontMatch}
            >
              Modifier
            </button>
            <button
              type="button"
              className="cancel-btn"
              onClick={() => setShowModifierMotDePasse(false)}
            >
              Annuler
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

PasswordChangeModal.propTypes = {
  passwordData: PropTypes.shape({
    actuelPassword: PropTypes.string,
    nouveauPassword: PropTypes.string,
    confirmPassword: PropTypes.string
  }).isRequired,
  showPasswords: PropTypes.shape({
    actuelPassword: PropTypes.bool,
    nouveauPassword: PropTypes.bool,
    confirmPassword: PropTypes.bool
  }).isRequired,
  error: PropTypes.string,
  success: PropTypes.string,
  actuelPasswordRef: PropTypes.object,
  nouveauPasswordRef: PropTypes.object,
  confirmPasswordRef: PropTypes.object,
  modalRef: PropTypes.object,
  setShowModifierMotDePasse: PropTypes.func.isRequired,
  handleInputChange: PropTypes.func.isRequired,
  handleChangePassword: PropTypes.func.isRequired,
  togglePasswordVisibility: PropTypes.func.isRequired,
  handleModalContentClick: PropTypes.func.isRequired
};

const MemoizedPasswordChangeModal = memo(PasswordChangeModal);

const MiniRightPanel = () => {
  // Fonction pour formatter le rôle
  const formatterRole = (role) => {
    if (!role) return "";

    switch (role.toLowerCase()) {
      case "admin":
        return "Administrateur";
      case "utilisateur":
        return "Utilisateur";
      default:
        // Première lettre en majuscule pour tout autre rôle
        return role.charAt(0).toUpperCase() + role.slice(1);
    }
  };

  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [showModifierMotDePasse, setShowModifierMotDePasse] = useState(false);
  const [showModifierProfil, setShowModifierProfil] = useState(false);
  const [passwordData, setPasswordData] = useState({
    actuelPassword: "",
    nouveauPassword: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  // État pour l'affichage/masquage des mots de passe
  const [showPasswords, setShowPasswords] = useState({
    actuelPassword: false,
    nouveauPassword: false,
    confirmPassword: false,
  });

  // Références pour maintenir le focus
  const actuelPasswordRef = useRef(null);
  const nouveauPasswordRef = useRef(null);
  const confirmPasswordRef = useRef(null);
  const modalRef = useRef(null);
  const profileModalRef = useRef(null);

  // Récupérer les informations de l'utilisateur connecté
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setLoading(true);
        const response = await authService.getMyProfile();
        if (response && response.success) {
          setUser(response.data);
        }
        setLoading(false);
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, []);

  // Mettre le focus sur le premier champ quand le modal s'ouvre
  useEffect(() => {
    if (showModifierMotDePasse && actuelPasswordRef.current) {
      setTimeout(() => {
        actuelPasswordRef.current.focus();
      }, 100);
    }
  }, [showModifierMotDePasse]);

  // Gestion de la fermeture du dropdown lors d'un clic à l'extérieur
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showDropdown && !event.target.closest('.mini-user-avatar-container')) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDropdown]);

  // Gestion de la touche Échap pour fermer les modals
  useEffect(() => {
    const handleEscKey = (event) => {
      if (event.key === "Escape") {
        setShowModifierMotDePasse(false);
        setShowModifierProfil(false);
      }
    };

    document.addEventListener("keydown", handleEscKey);
    return () => {
      document.removeEventListener("keydown", handleEscKey);
    };
  }, []);

  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
  };

  const handleModifierProfil = () => {
    // Réinitialiser les messages d'erreur et de succès
    setError("");
    setSuccess("");
    setShowModifierProfil(true);
    setShowDropdown(false);
  };

  const handleDesactiverCarte = async () => {
    try {
      // Afficher la confirmation Swal avant de procéder
      const result = await Swal.fire({
        title: "Désactiver la carte",
        text: "Êtes-vous sûr de vouloir désactiver votre carte RFID?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Oui, désactiver",
        cancelButtonText: "Annuler",
      });

      // Vérifier si l'utilisateur a confirmé
      if (!result.isConfirmed) {
        setShowDropdown(false);
        return;
      }

      setError("");
      setSuccess("");
      await utilisateurService.desactiverMaCarteRFID();

      // Afficher un message de succès avec Swal
      Swal.fire({
        icon: "success",
        title: "Désactivée!",
        text: "Votre carte RFID a été désactivée avec succès.",
        timer: 2000,
        showConfirmButton: false,
      });

      // Mettre à jour les infos utilisateur
      const userData = await authService.getMyProfile();
      if (userData && userData.success) {
        setUser(userData.data);
      } else {
        setUser(userData);
      }
    } catch (err) {
      // Afficher un message d'erreur avec Swal
      Swal.fire({
        icon: "error",
        title: "Erreur!",
        text:
          err.response?.data?.message ||
          "Erreur lors de la désactivation de la carte RFID",
        timer: 2000,
        showConfirmButton: false,
      });
      setError(
        err.response?.data?.message ||
          "Erreur lors de la désactivation de la carte RFID"
      );
    }
    setShowDropdown(false);
  };

  const handleModifierMotDePasse = () => {
    // Réinitialiser tous les états avant d'ouvrir le modal
    setPasswordData({
      actuelPassword: "",
      nouveauPassword: "",
      confirmPassword: "",
    });
    setShowPasswords({
      actuelPassword: false,
      nouveauPassword: false,
      confirmPassword: false,
    });
    setError("");
    setSuccess("");
    setShowModifierMotDePasse(true);
    setShowDropdown(false);
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    try {
      setError("");
      setSuccess("");

      // Vérifier que les mots de passe correspondent
      if (passwordData.nouveauPassword !== passwordData.confirmPassword) {
        setError("Les mots de passe ne correspondent pas.");
        return;
      }

      await utilisateurService.changerMotDePasse(
        passwordData.actuelPassword,
        passwordData.nouveauPassword,
        passwordData.confirmPassword
      );

      setSuccess("Mot de passe modifié avec succès.");
      setPasswordData({
        actuelPassword: "",
        nouveauPassword: "",
        confirmPassword: "",
      });
      setTimeout(() => setShowModifierMotDePasse(false), 2000);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Erreur lors de la modification du mot de passe"
      );
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setPasswordData({
      ...passwordData,
      [name]: value,
    });
  };

  // Fonction pour basculer l'affichage d'un mot de passe
  const togglePasswordVisibility = (field, e) => {
    // Important: empêcher la propagation ET le comportement par défaut
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    setShowPasswords((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));

    // Utiliser requestAnimationFrame pour rétablir le focus après le re-rendu
    requestAnimationFrame(() => {
      // Rétablir le focus sur l'élément qui l'avait avant
      if (field === "actuelPassword" && actuelPasswordRef.current) {
        actuelPasswordRef.current.focus();
      } else if (field === "nouveauPassword" && nouveauPasswordRef.current) {
        nouveauPasswordRef.current.focus();
      } else if (field === "confirmPassword" && confirmPasswordRef.current) {
        confirmPasswordRef.current.focus();
      }
    });
  };

  // Empêcher la fermeture du modal sur clic à l'intérieur
  const handleModalContentClick = (e) => {
    e.stopPropagation();
  };

  return (
    <div className="mini-right-panel">
      <div className="mini-user-avatar-container">
        <div className="mini-user-avatar" onClick={toggleDropdown}>
          {user && user.photo ? (
            <img src={user.photo} alt={`${user.prenom} ${user.nom}`} />
          ) : (
            <div className="mini-user-initials">
              {user ? `${user.prenom?.[0] || ""}${user.nom?.[0] || ""}` : ""}
            </div>
          )}
        </div>
        {showDropdown && (
          <div className="mini-avatar-dropdown">
            <div className="mini-dropdown-header">
              {user && user.photo ? (
                <img
                  src={user.photo}
                  alt={`${user.prenom} ${user.nom}`}
                  className="mini-dropdown-avatar"
                />
              ) : (
                <div className="mini-dropdown-avatar mini-user-initials">
                  {user
                    ? `${user.prenom?.[0] || ""}${user.nom?.[0] || ""}`
                    : ""}
                </div>
              )}
              <div className="mini-dropdown-user-info">
                <h4>
                  {user ? `${user.prenom} ${user.nom}` : "Chargement..."}
                </h4>
                <p>{user ? formatterRole(user.role) : ""}</p>
              </div>
            </div>
            <div className="mini-dropdown-divider"></div>
            <button className="mini-dropdown-item" onClick={handleModifierProfil}>
              <span className="mini-item-icon">✏️</span>
              Modifier profil
            </button>
            <button className="mini-dropdown-item" onClick={handleDesactiverCarte}>
              <span className="mini-item-icon">🔒</span>
              Désactiver Carte
            </button>
            <button className="mini-dropdown-item" onClick={handleModifierMotDePasse}>
              <span className="mini-item-icon">🔑</span>
              Modifier mot de passe
            </button>
          </div>
        )}
      </div>

      {/* Modal de modification de mot de passe */}
      {showModifierMotDePasse && (
        <MemoizedPasswordChangeModal
          passwordData={passwordData}
          showPasswords={showPasswords}
          error={error}
          success={success}
          actuelPasswordRef={actuelPasswordRef}
          nouveauPasswordRef={nouveauPasswordRef}
          confirmPasswordRef={confirmPasswordRef}
          modalRef={modalRef}
          setShowModifierMotDePasse={setShowModifierMotDePasse}
          handleInputChange={handleInputChange}
          handleChangePassword={handleChangePassword}
          togglePasswordVisibility={togglePasswordVisibility}
          handleModalContentClick={handleModalContentClick}
        />
      )}

      {/* Modal de modification de profil */}
      {showModifierProfil && (
        <MemoizedProfileEditModal
          user={user}
          setUser={setUser}
          modalRef={profileModalRef}
          setShowModifierProfil={setShowModifierProfil}
          handleModalContentClick={handleModalContentClick}
          setError={setError}
          setSuccess={setSuccess}
          userId={user._id}
        />
      )}
    </div>
  );
};

export default MiniRightPanel;