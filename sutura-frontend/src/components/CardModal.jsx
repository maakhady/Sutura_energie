import { X, CreditCard, Fingerprint } from 'lucide-react';
import '../styles/CardModal.css';

const CardModal = ({ isOpen, onClose, user, onAssignCard, onRegisterFingerprint }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="card-modal">
        <div className="modal-header">
          <h2>Contrôle D'Accès - {user.prenom} {user.nom}</h2>
          <button className="close-button" onClick={onClose}>
            <X size={24} />
          </button>
        </div>
        
        <div className="modal-buttons">
          <button className="card-button" onClick={() => onAssignCard(user.id)}>
            <CreditCard size={20} />
            Assigner une carte
          </button>
          
          <button className="fingerprint-button" onClick={() => onRegisterFingerprint(user.id)}>
            <Fingerprint size={20} />
            Enregistrer une Empreinte
          </button>
        </div>
      </div>
    </div>
  );
};

export default CardModal;