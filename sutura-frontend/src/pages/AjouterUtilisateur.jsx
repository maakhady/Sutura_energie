import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Upload, AlertCircle, Check } from 'lucide-react';
import CardStat from '../components/CardStat';
import '../styles/AjouterUtilisateur.css';
import { utilisateurService } from '../services/utilisateurService';
import Swal from 'sweetalert2';
import { useEffect } from 'react';

const AjouterUtilisateur = () => {
  const navigate = useNavigate();
  

  //convertir la photo en string 

  // États pour gérer les données du formulaire
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    email: '',
    telephone: '',
    photo: null,
    role: ''
  });
  
  // État pour les erreurs de validation
  const [errors, setErrors] = useState({
    nom: '',
    prenom: '',
    email: '',
    telephone: '',
    photo: '',
    role: ''
  });
  
  // État pour les champs valides
  const [validFields, setValidFields] = useState({
    nom: false,
    prenom: false,
    email: false,
    telephone: false,
    photo: false,
    role: false
  });

  //stat pour les card de statistiques
  const [totalUsers, setTotalUsers] = useState(0);
  const [activeUsers, setActiveUsers] = useState(0);
  const [assignedCards, setAssignedCards] = useState(0);


  // Dans AjouterUtilisateur.jsx, ajoutez cet effet pour charger les statistiques au chargement du composant
useEffect(() => {
  const fetchStats = async () => {
    try {
      // Utiliser le même service mais nous avons juste besoin des stats, pas de la pagination
      const data = await utilisateurService.obtenirTousUtilisateurs(1, 1000);
      
      if (data && data.success) {
        // Définir le nombre total d'utilisateurs
        setTotalUsers(data.count || 0);
        
        // Si nous avons des données d'utilisateur, calculer les autres statistiques
        if (Array.isArray(data.data)) {
          const usersArray = data.data;
          
          // Calculer les stats
          const actifs = usersArray.filter(user => user.actif).length;
          const cartes = usersArray.filter(user => user.cardActive).length;
          
          // Mettre à jour les états
          setActiveUsers(actifs);
          setAssignedCards(cartes);
        }
      }
    } catch (error) {
      console.error("Erreur lors de la récupération des statistiques:", error);
      // Optionnel: afficher une notification d'erreur
    }
  };
  
  fetchStats();
}, []); // Dépendance vide pour n'exécuter qu'au montage du composant
 
  // État pour l'aperçu de l'image
  const [photoPreview, setPhotoPreview] = useState(null);
  
  // Données pour les cartes de statistiques
  const stats = [
    { title: 'Utilisateurs Totaux', value: totalUsers, icon: 'users' },
    { title: 'Utilisateurs Actifs', value: activeUsers, icon: 'user' },
    { title: 'Cartes Assignées', value: assignedCards, icon: 'device' }
  ];
  
  // Validation du numéro de téléphone sénégalais
  const validatePhone = (phone) => {
    // Format: 77XXXXXXX, 78XXXXXXX, etc.
    const phoneRegex = /^(70|75|76|77|78)[0-9]{7}$/;
    
    if (!phone) {
      return "Le numéro de téléphone est requis";
    }
    
    if (!phoneRegex.test(phone)) {
      return "Format invalide. Entrez un numéro sénégalais valide (7X-XXX-XX-XX)";
    }
    
    return "";
  };
  
  // Validation de l'email
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.(com|fr|sn|net|org|edu)$/i;
    
    if (!email) {
      return "L'email est requis";
    }
    
    if (!emailRegex.test(email)) {
      return "Format d'email invalide (.com, .fr, .sn, etc.)";
    }
    
    return "";
  };
  
  // Formater le numéro de téléphone pour l'affichage
  const formatPhoneNumber = (value) => {
    if (!value) return '';
    
    // Supprimer tout sauf les chiffres
    const cleaned = value.replace(/\D/g, '');
    
    // Appliquer le formatage
    let formatted = '';
    
    // Premier groupe: 2 chiffres
    if (cleaned.length > 0) {
      formatted += cleaned.substring(0, Math.min(2, cleaned.length));
    }
    
    // Deuxième groupe: 3 chiffres
    if (cleaned.length > 2) {
      formatted += '-' + cleaned.substring(2, Math.min(5, cleaned.length));
    }
    
    // Troisième groupe: 2 chiffres
    if (cleaned.length > 5) {
      formatted += '-' + cleaned.substring(5, Math.min(7, cleaned.length));
    }
    
    // Quatrième groupe: 2 chiffres
    if (cleaned.length > 7) {
      formatted += '-' + cleaned.substring(7, Math.min(9, cleaned.length));
    }
    
    return formatted;
  };
  
  // Vérifier si le formulaire est vide
  const isFormEmpty = () => {
    // Vérifier si tous les champs requis sont remplis
    return !formData.nom || 
           !formData.prenom || 
           !formData.email || 
           !formData.telephone || 
           !formData.role;
  };

  // Vérifier si le formulaire est valide
  const isFormValid = () => {
    // Vérifier qu'il n'y a pas d'erreurs et que tous les champs requis sont valides
    return !Object.values(errors).some(error => error !== '') && 
           validFields.nom && 
           validFields.prenom && 
           validFields.email && 
           validFields.telephone && 
           validFields.role;
  };
  
  // Gérer les changements dans le formulaire
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Traitement spécial pour le téléphone
    if (name === 'telephone') {
      // Obtenir seulement les chiffres de la valeur saisie
      const digitsOnly = value.replace(/\D/g, '');
      
      // Limiter à 9 chiffres maximum
      const limitedDigits = digitsOnly.substring(0, 9);
      
      setFormData({
        ...formData,
        [name]: limitedDigits
      });
      
      // Valider le téléphone
      const phoneError = validatePhone(limitedDigits);
      setErrors({
        ...errors,
        [name]: phoneError
      });
      
      // Marquer comme valide si pas d'erreur et on a 9 chiffres
      setValidFields({
        ...validFields,
        [name]: !phoneError && limitedDigits.length === 9
      });
    } 
    // Traitement spécial pour l'email
    else if (name === 'email') {
      setFormData({
        ...formData,
        [name]: value
      });
      
      // Valider l'email
      const emailError = validateEmail(value);
      setErrors({
        ...errors,
        [name]: emailError
      });
      
      // Marquer comme valide si pas d'erreur
      setValidFields({
        ...validFields,
        [name]: !emailError && value.length > 0
      });
    }
    // Traitement pour les autres champs
    else {
      setFormData({
        ...formData,
        [name]: value
      });
      
      // Validation basique pour les champs requis
      if (['nom', 'prenom', 'role'].includes(name)) {
        const fieldError = value ? '' : `Le champ ${name} est requis`;
        setErrors({
          ...errors,
          [name]: fieldError
        });
        
        // Marquer comme valide si pas d'erreur
        setValidFields({
          ...validFields,
          [name]: !fieldError && value.length > 0
        });
      }
    }
  };
  
  // Gérer l'upload de photo 
const handlePhotoChange = (e) => {
  if (e.target.files && e.target.files[0]) {
    const file = e.target.files[0];
    
    // Vérifier la taille du fichier (max 5 MB)
    if (file.size > 5 * 1024 * 1024) {
      setErrors({
        ...errors,
        photo: "La taille de l'image ne doit pas dépasser 5 MB"
      });
      setValidFields({
        ...validFields,
        photo: false
      });
      return;
    }
    
    // Vérifier le type de fichier
    const validTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    if (!validTypes.includes(file.type)) {
      setErrors({
        ...errors,
        photo: "Seuls les formats JPG et PNG sont acceptés"
      });
      setValidFields({
        ...validFields,
        photo: false
      });
      return;
    }
    
    // Convertir le fichier en chaîne Base64
    const reader = new FileReader();
    
    reader.onloadend = () => {
      // reader.result contient l'image en Base64 (data:image/jpeg;base64,/9j/4AAQ...)
      const base64String = reader.result;
      
      // Mettre à jour le state avec la chaîne Base64
      setFormData({
        ...formData,
        photo: base64String
      });
      
      // Définir également cette chaîne comme aperçu de l'image
      setPhotoPreview(base64String);
      
      setErrors({
        ...errors,
        photo: ''
      });
      
      setValidFields({
        ...validFields,
        photo: true
      });
    };
    
    // Lire le fichier en tant que URL de données Base64
    reader.readAsDataURL(file);
  }
};
  
  // Valider tout le formulaire
  const validateForm = () => {
    const newErrors = {
      nom: formData.nom ? '' : 'Le nom est requis',
      prenom: formData.prenom ? '' : 'Le prénom est requis',
      email: validateEmail(formData.email),
      telephone: validatePhone(formData.telephone),
      role: formData.role ? '' : 'Le rôle doit être sélectionné'
    };
    
    setErrors(newErrors);
    
    // Mettre à jour les champs valides
    const newValidFields = {
      nom: !newErrors.nom && formData.nom.length > 0,
      prenom: !newErrors.prenom && formData.prenom.length > 0,
      email: !newErrors.email && formData.email.length > 0,
      telephone: !newErrors.telephone && formData.telephone.length === 9,
      role: !newErrors.role && formData.role.length > 0,
      photo: validFields.photo // Garder l'état actuel pour la photo
    };
    
    setValidFields(newValidFields);
    
    // Vérifier s'il y a des erreurs
    return !Object.values(newErrors).some(error => error);
  };
  
  // Gérer la soumission du formulaire
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Valider le formulaire avant de soumettre
    if (validateForm()) {
      // Préparer les données pour l'API
      const dataToSend = {
        ...formData,
        telephone: `+221${formData.telephone}` // Ajouter l'indicatif du Sénégal
      };
      
      try {
        // Appel à l'API
        const response = await utilisateurService.creerUtilisateur(dataToSend);
        // gestion des erreurs avec SweetAlert2
        if (response && response.success) {
          Swal.fire({
            icon: 'success',
            title: 'Utilisateur ajouté avec succès!',
            showConfirmButton: false,
            timer: 1500
          });
          // Rediriger vers la liste des utilisateurs
          setTimeout(() => {
            navigate('/utilisateurs');
          }, 1500);
        } else {
          // Gérer les erreurs retournées par l'API
          Swal.fire({
            icon: 'error',
            title: 'Erreur',
            text: response?.message || 'Une erreur est survenue'
          });
        }
      } catch (error) {
        console.error('Erreur lors de l\'ajout:', error);
        Swal.fire({
          icon: 'error',
          title: 'Erreur',
          text: error.response?.data?.message || 'Une erreur est survenue'  
        });
      }
    } else {  
      console.log('Le formulaire contient des erreurs');
    }
  };
  
  return (
    <div className="ajouter-utilisateur-page">
      {/* Cartes de statistiques */}
      <CardStat stats={stats} />
      
      {/* Formulaire d'ajout d'utilisateur */}
      <div className="form-container">
        <div className="form-header">
          <h2>Ajouter un utilisateur</h2>
          <button 
            className="btn-retour" 
            onClick={() => navigate(-1)}
          >
            <ArrowLeft size={18} /> Retour
          </button>
        </div>
        
        <form onSubmit={handleSubmit} noValidate>
          <div className="form-grid">
            {/* Nom */}
            <div className="form-group">
              <label htmlFor="nom">Nom</label>
              <input
                type="text"
                id="nom"
                name="nom"
                placeholder="Entrez le nom"
                value={formData.nom}
                onChange={handleChange}
                className={`${errors.nom ? 'input-error' : ''} ${validFields.nom ? 'input-valid' : ''}`}
                required
              />
              {errors.nom && (
                <div className="error-message">
                  <AlertCircle size={14} />
                  <span>{errors.nom}</span>
                </div>
              )}
              {validFields.nom && !errors.nom && (
                <div className="valid-message">
                  <Check size={14} />
                  <span>Nom valide</span>
                </div>
              )}
            </div>
            
            {/* Prénom */}
            <div className="form-group">
              <label htmlFor="prenom">Prénom</label>
              <input
                type="text"
                id="prenom"
                name="prenom"
                placeholder="Entrez le prénom"
                value={formData.prenom}
                onChange={handleChange}
                className={`${errors.prenom ? 'input-error' : ''} ${validFields.prenom ? 'input-valid' : ''}`}
                required
              />
              {errors.prenom && (
                <div className="error-message">
                  <AlertCircle size={14} />
                  <span>{errors.prenom}</span>
                </div>
              )}
              {validFields.prenom && !errors.prenom && (
                <div className="valid-message">
                  <Check size={14} />
                  <span>Prénom valide</span>
                </div>
              )}
            </div>
            
            {/* Email */}
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                placeholder="exemple@domaine.com"
                value={formData.email}
                onChange={handleChange}
                className={`${errors.email ? 'input-error' : ''} ${validFields.email ? 'input-valid' : ''}`}
                required
              />
              {errors.email && (
                <div className="error-message">
                  <AlertCircle size={14} />
                  <span>{errors.email}</span>
                </div>
              )}
              {validFields.email && !errors.email && (
                <div className="valid-message">
                  <Check size={14} />
                  <span>Email valide</span>
                </div>
              )}
            </div>
            
            {/* Téléphone - Version avec validation verte */}
            <div className="form-group">
              <label htmlFor="telephone">Téléphone</label>
              <div className="phone-input-container">
                <div className="phone-prefix">+221</div>
                <input
                  type="text"
                  id="telephone"
                  name="telephone"
                  placeholder="7X-XXX-XX-XX"
                  value={formatPhoneNumber(formData.telephone)}
                  onChange={handleChange}
                  className={`${errors.telephone ? 'input-error' : ''} ${validFields.telephone ? 'input-valid' : ''}`}
                  required
                  maxLength={12} // Pour tenir compte des tirets: XX-XXX-XX-XX
                />
              </div>
              {errors.telephone ? (
                <div className="error-message">
                  <AlertCircle size={14} />
                  <span>{errors.telephone}</span>
                </div>
              ) : validFields.telephone ? (
                <div className="valid-message">
                  <Check size={14} />
                  <span>Numéro valide</span>
                </div>
              ) : (
                <div className="helper-text">Format: 7X-XXX-XX-XX (numéro sénégalais)</div>
              )}
            </div>
            
            {/* Photo */}
            <div className="form-group">
              <label htmlFor="photo">Photo</label>
              <div className="photo-input-container">
                <input
                  type="file"
                  id="photo"
                  name="photo"
                  accept="image/jpeg, image/png"
                  onChange={handlePhotoChange}
                  className={`photo-input ${errors.photo ? 'input-error' : ''} ${validFields.photo ? 'input-valid' : ''}`}
                />
                <div className={`photo-input-ui ${validFields.photo ? 'input-valid' : ''}`}>
                  <span>{photoPreview ? 'Changer la photo' : 'Sélectionnez une photo'}</span>
                  <Upload size={18} />
                </div>
                {photoPreview && (
                  <div className="photo-preview">
                    <img src={photoPreview} alt="Aperçu" />
                  </div>
                )}
              </div>
              {errors.photo ? (
                <div className="error-message">
                  <AlertCircle size={14} />
                  <span>{errors.photo}</span>
                </div>
              ) : validFields.photo ? (
                <div className="valid-message">
                  <Check size={14} />
                  <span>Photo valide</span>
                </div>
              ) : (
                <div className="helper-text">JPG ou PNG, 5 MB max.</div>
              )}
            </div>
            
            {/* Rôle */}
            <div className="form-group">
              <label htmlFor="role">Rôle</label>
              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleChange}
                className={`${errors.role ? 'input-error' : ''} ${validFields.role ? 'input-valid' : ''}`}
                required
              >
                <option value="">Sélectionnez le rôle</option>
                <option value="admin">Administrateur</option>
                <option value="utilisateur">Utilisateur</option>
              </select>
              {errors.role && (
                <div className="error-message">
                  <AlertCircle size={14} />
                  <span>{errors.role}</span>
                </div>
              )}
              {validFields.role && !errors.role && (
                <div className="valid-message">
                  <Check size={14} />
                  <span>Rôle sélectionné</span>
                </div>
              )}
            </div>
          </div>
          
          {/* Bouton de soumission avec état dynamique */}
          <div className="form-submit">
            <button 
              type="submit" 
              className="btn-ajouter"
              disabled={isFormEmpty() || !isFormValid()}
              style={{
                backgroundColor: isFormValid() ? '#274C77' : '#E5E7EB',
                color: isFormValid() ? 'white' : '#9CA3AF',
                cursor: isFormValid() ? 'pointer' : 'not-allowed'
              }}
            >
              Ajouter
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AjouterUtilisateur;