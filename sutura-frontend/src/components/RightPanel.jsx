import { useState, useEffect } from 'react';
import '../styles/RightPanel.css';
import { utilisateurService } from "../services/utilisateurService";
import { authService } from '../services/authService';

const RightPanel = () => {
  // Fonction pour formatter le rôle
  const formatterRole = (role) => {
    if (!role) return '';
    
    switch(role.toLowerCase()) {
      case 'admin':
        return 'Administrateur';
      case 'utilisateur':
        return 'Utilisateur';
      default:
        // Première lettre en majuscule pour tout autre rôle
        return role.charAt(0).toUpperCase() + role.slice(1);
    }
  };
  const [showDropdown, setShowDropdown] = useState(false);
  const [showAlertDetails, setShowAlertDetails] = useState(false);
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModifierMotDePasse, setShowModifierMotDePasse] = useState(false);
  const [passwordData, setPasswordData] = useState({
    actuelPassword: '',
    nouveauPassword: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

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
      } catch (err) {
        console.error("Erreur lors de la récupération du profil:", err);
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, []);

  // Gestion de la fermeture du dropdown lors d'un clic à l'extérieur
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showDropdown && !event.target.closest('.user-avatar-container')) {
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
      if (event.key === 'Escape') {
        setShowAlertDetails(false);
        setShowModifierMotDePasse(false);
      }
    };

    document.addEventListener('keydown', handleEscKey);
    return () => {
      document.removeEventListener('keydown', handleEscKey);
    };
  }, []);

  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
  };

  const handleModifierProfil = () => {
    console.log("Fonction de modification de profil");
    setShowDropdown(false);
  };

  const handleDesactiverCarte = async () => {
    try {
      setError('');
      setSuccess('');
      await utilisateurService.desactiverMaCarteRFID();
      setSuccess('Votre carte RFID a été désactivée avec succès.');
      // Mettre à jour les infos utilisateur
      const userData = await authService.getMyProfile();
      setUser(userData);
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de la désactivation de la carte RFID');
    }
    setShowDropdown(false);
  };

  const handleModifierMotDePasse = () => {
    setShowModifierMotDePasse(true);
    setShowDropdown(false);
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    try {
      setError('');
      setSuccess('');
      
      // Vérifier que les mots de passe correspondent
      if (passwordData.nouveauPassword !== passwordData.confirmPassword) {
        setError('Les mots de passe ne correspondent pas.');
        return;
      }
      
      await utilisateurService.changerMotDePasse(
        passwordData.actuelPassword,
        passwordData.nouveauPassword,
        passwordData.confirmPassword
      );
      
      setSuccess('Mot de passe modifié avec succès.');
      setPasswordData({
        actuelPassword: '',
        nouveauPassword: '',
        confirmPassword: ''
      });
      setTimeout(() => setShowModifierMotDePasse(false), 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de la modification du mot de passe');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setPasswordData({
      ...passwordData,
      [name]: value
    });
  };

  const handleViewDetails = (alertType) => {
    setSelectedAlert(alertType);
    setShowAlertDetails(true);
  };

  // Modal de changement de mot de passe
  const PasswordChangeModal = () => {
    return (
      <div className="modal-overlay" onClick={() => setShowModifierMotDePasse(false)}>
        <div className="modal-content" onClick={e => e.stopPropagation()}>
          <h3>Modifier mon mot de passe </h3>
          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">{success}</div>}
          <form onSubmit={handleChangePassword} className="password-form">
            <div className="form-group">
              <label htmlFor="actuelPassword">Mot de passe actuel</label>
              <input 
                type="password" 
                id="actuelPassword" 
                name="actuelPassword" 
                value={passwordData.actuelPassword}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="nouveauPassword">Nouveau mot de passe</label>
              <input 
                type="password" 
                id="nouveauPassword" 
                name="nouveauPassword" 
                value={passwordData.nouveauPassword}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="confirmPassword">Confirmer le mot de passe</label>
              <input 
                type="password" 
                id="confirmPassword" 
                name="confirmPassword" 
                value={passwordData.confirmPassword}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="form-buttons">
              <button type="submit" className="submit-btn">Modifier</button>
              <button type="button" className="cancel-btn" onClick={() => setShowModifierMotDePasse(false)}>
                Annuler
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  // Modal des détails d'alerte
  const AlertDetailsModal = () => {
    const renderAlertContent = () => {
      switch (selectedAlert) {
        case 'consumption':
          return (
            <div className="alert-details-content">
              <h3>⚡ Consommation</h3>
              <div className="detail-row">
                <span className="detail-label">Pièce:</span>
                <span className="detail-value">Salon</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Usage:</span>
                <span className="detail-value">46.5 W</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Moyenne:</span>
                <span className="detail-value">35 W</span>
              </div>
            </div>
          );
        case 'security':
          return (
            <div className="alert-details-content">
              <h3 className="alert-security-title">🔒 Alerte Sécurité:</h3>
              <div className="security-alert-message">
                Système mise sous hors tension
              </div>
              <div className="detail-row">
                <span className="detail-label">Cause:</span>
                <span className="detail-value critical">Incendie</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">État:</span>
                <span className="detail-value critical">Critique</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">État Système:</span>
                <span className="detail-value">Coupé</span>
              </div>
            </div>
          );
        case 'equipment':
          return (
            <div className="alert-details-content">
              <h3>🔧 Équipement</h3>
              <div className="detail-row">
                <span className="detail-label">Pièce:</span>
                <span className="detail-value">Salon 2</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Appareil:</span>
                <span className="detail-value">Ventilateur</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Temps:</span>
                <span className="detail-value">18h</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Énergie:</span>
                <span className="detail-value">35W</span>
              </div>
            </div>
          );
        default:
          return null;
      }
    };

    return (
      <div className="modal-overlay" onClick={() => setShowAlertDetails(false)}>
        <div className="modal-content" onClick={e => e.stopPropagation()}>
          {renderAlertContent()}
          <button className="retour-btn" onClick={() => setShowAlertDetails(false)}>
            RETOUR
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="right-panel">
      {/* Widget Consommation */}
      <div className="consumption-widget">
        <div className="user-avatar-container">
          <div className="user-avatar" onClick={toggleDropdown}>
            <img src="/avatar.png" alt="User" />
          </div>
          {showDropdown && (
            <div className="avatar-dropdown">
              <div className="dropdown-header">
                <img src="/avatar.png" alt="User" className="dropdown-avatar" />
                <div className="dropdown-user-info">
                  <h4>{user ? `${user.prenom} ${user.nom}` : 'Chargement...'}</h4>
                  <p>{user ? formatterRole(user.role) : ''}</p>
                </div>
              </div>
              <div className="dropdown-divider"></div>
              <button className="dropdown-item" onClick={handleModifierProfil}>
                <span className="item-icon">✏️</span>
                Modifier profil
              </button>
              <button className="dropdown-item" onClick={handleDesactiverCarte}>
                <span className="item-icon">🔒</span>
                Désactiver Carte
              </button>
              <button className="dropdown-item" onClick={handleModifierMotDePasse}>
                <span className="item-icon">🔑</span>
                Modifier mot de passe
              </button>
            </div>
          )}
        </div>
        <h3>Consommation Actuel</h3>
        <div className="consumption-value">50 kWh</div>
        <div className="consumption-date">Lundi 17/2/2025 13:45</div>
        
        {/* Messages de succès ou d'erreur */}
        {error && !showModifierMotDePasse && <div className="error-message floating">{error}</div>}
        {success && !showModifierMotDePasse && <div className="success-message floating">{success}</div>}
      </div>

      {/* Widget Alertes sécurité */}
      <div className="security-alerts">
        <div className="alerts-header">
          <h3 className="title-alert">Alertes sécurité</h3>
          <div className="alerts-icons">
            <span className="time-icon">⏰</span>
            <span className="alert-count">3 ALERTES</span>
          </div>
        </div>

        <div className="alert-list">
          <div className="alert-item">
            <div className="alert-icon consumption">⚡</div>
            <div className="alert-content">
              <div className="alert-title">Consommation</div>
              <div className="alert-subtitle">TV - Usage - Salon +25%</div>
              <button 
                className="view-details"
                onClick={() => handleViewDetails('consumption')}
              >
                Voir détails
              </button>
            </div>
          </div>

          <div className="alert-item">
            <div className="alert-icon security">🔒</div>
            <div className="alert-content">
              <div className="alert-title">Alerte Sécurité</div>
              <div className="alert-subtitle">Système mise sous hors Tension</div>
              <div className="status-line">
                <span className="status-dot"></span>
                <span>Terminal source active - 85%</span>
              </div>
              <button 
                className="view-details"
                onClick={() => handleViewDetails('security')}
              >
                Voir détails
              </button>
            </div>
          </div>

          <div className="alert-item">
            <div className="alert-icon equipment">🔧</div>
            <div className="alert-content">
              <div className="alert-title">Équipement</div>
              <div className="alert-subtitle">Clim - Allumée - Salon 2</div>
              <button 
                className="view-details"
                onClick={() => handleViewDetails('equipment')}
              >
                Voir détails
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Widget Caméra */}
      <div className="camera-widget">
        <h3>Caméra</h3>
        <div className="camera-feed">
          <span className="live-badge">LIVE</span>
          <img src="/camera-feed.jpg" alt="Camera Feed" className="camera-image" />
        </div>
      </div>

      {/* Modals */}
      {showAlertDetails && <AlertDetailsModal />}
      {showModifierMotDePasse && <PasswordChangeModal />}
    </div>
  );
};

export default RightPanel;