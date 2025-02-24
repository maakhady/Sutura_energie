import { useState, useEffect } from 'react';
import '../styles/RightPanel.css';

const RightPanel = () => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [showAlertDetails, setShowAlertDetails] = useState(false);
  const [selectedAlert, setSelectedAlert] = useState(null);
  


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

  // Gestion de la touche Échap pour fermer le modal
  useEffect(() => {
    const handleEscKey = (event) => {
      if (event.key === 'Escape') {
        setShowAlertDetails(false);
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
    console.log("Modifier profil");
    setShowDropdown(false);
  };

  const handleDesactiverCarte = () => {
    console.log("Désactiver carte");
    setShowDropdown(false);
  };

  const handleModifierMotDePasse = () => {
    console.log("Modifier mot de passe");
    setShowDropdown(false);
  };

  const handleViewDetails = (alertType) => {
    setSelectedAlert(alertType);
    setShowAlertDetails(true);
  };

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
                  <h4>Bamba Thiam</h4>
                  <p>Administrateur</p>
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

      {/* Modal des détails d'alerte */}
      {showAlertDetails && <AlertDetailsModal />}
    </div>
  );
};

export default RightPanel;