import { useState, useEffect } from 'react';
import '../styles/MiniRightPanel.css';

const MiniRightPanel = () => {
  const [showDropdown, setShowDropdown] = useState(false);
  
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

  return (
    <div className="mini-right-panel">
      <div className="mini-user-avatar-container">
        <div className="mini-user-avatar" onClick={toggleDropdown}>
          <img src="/avatar.png" alt="User" />
        </div>
        {showDropdown && (
          <div className="mini-avatar-dropdown">
            <div className="mini-dropdown-header">
              <img src="/avatar.png" alt="User" className="mini-dropdown-avatar" />
              <div className="mini-dropdown-user-info">
                <h4>Bamba Thiam</h4>
                <p>Administrateur</p>
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
    </div>
  );
};

export default MiniRightPanel;