import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Upload, AlertCircle, Check } from 'lucide-react';
import CardStat from '../components/CardStat';
import '../styles/AjouterUtilisateur.css';
import Swal from 'sweetalert2';
import { utilisateurService } from '../services/utilisateurService';

const ModifierUtilisateur = () => {
  const navigate = useNavigate();
  const { id } = useParams(); // Récupérer l'ID de l'utilisateur depuis l'URL
  
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
    photo: true, // Par défaut à true car la photo est optionnelle
    role: false
  });
  
  // États pour les statistiques
const [totalUsers, setTotalUsers] = useState(0);
const [activeUsers, setActiveUsers] = useState(0);
const [assignedCards, setAssignedCards] = useState(0);

// Données pour les statistiques
const stats = [
  { title: 'Utilisateurs Totaux', value: totalUsers, icon: 'users' },
  { title: 'Utilisateurs Actifs', value: activeUsers, icon: 'user' },
  { title: 'Cartes Assignées', value: assignedCards, icon: 'device' }
];
  // État pour l'aperçu de l'image
  const [photoPreview, setPhotoPreview] = useState(null);
  
  // État pour le chargement des données
  const [loading, setLoading] = useState(true);
  
  
  // Récupérer les données de l'utilisateur à modifier et les statistiques
useEffect(() => {
  const fetchUserData = async () => {
    try {
      setLoading(true);
      
      // Récupérer les données réelles de l'utilisateur depuis votre API
      const response = await utilisateurService.obtenirUtilisateur(id);
      
      // Récupérer tous les utilisateurs pour les statistiques
      const statsData = await utilisateurService.obtenirTousUtilisateurs(1, 1000);
      
      // Traiter les données de l'utilisateur
      if (response && response.success) {
        // Prétraiter les données pour les adapter au formulaire
        const userData = response.data;
        
        // Convertir le téléphone en string s'il est un nombre
        if (userData.telephone) {
          // Convertir en chaîne si c'est un nombre
          const telephoneStr = String(userData.telephone);
          
          // Vérifier si c'est un numéro complet avec l'indicatif du pays
          if (telephoneStr.startsWith('221')) {
            // Enlever le 221 pour ne garder que les 9 chiffres du numéro
            userData.telephone = telephoneStr.substring(3);
          } else if (telephoneStr.startsWith('+221')) {
            // Enlever le +221
            userData.telephone = telephoneStr.replace('+221', '');
          } else {
            userData.telephone = telephoneStr;
          }
        }
        
        // Mettre à jour le formulaire avec les données de l'utilisateur
        setFormData(userData);
        
        // Initialiser les champs comme valides puisque les données sont préchargées
        setValidFields({
          nom: true,
          prenom: true,
          email: true,
          telephone: true,
          photo: true,
          role: true
        });
        
        // Si l'utilisateur a une photo, définir l'aperçu
        if (userData.photo) {
          setPhotoPreview(userData.photo);
        }
      } else {
        throw new Error("Erreur lors de la récupération des données");
      }
      
      // Traiter les statistiques
      if (statsData && statsData.success) {
        // Définir le nombre total d'utilisateurs
        setTotalUsers(statsData.count || 0);
        
        // Si nous avons des données d'utilisateur, calculer les autres statistiques
        if (Array.isArray(statsData.data)) {
          const usersArray = statsData.data;
          
          // Calculer les stats
          const actifs = usersArray.filter(user => user.actif).length;
          const cartes = usersArray.filter(user => user.cardActive).length;
          
          // Mettre à jour les états
          setActiveUsers(actifs);
          setAssignedCards(cartes);
        }
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Erreur lors de la récupération des données:', error);
      setLoading(false);
      // Rediriger vers la liste en cas d'erreur avec SweetAlert2
      Swal.fire({
        icon: 'error',
        title: 'Erreur',
        text: error.response?.data?.message || error.message || 'Erreur lors de la récupération des données',
        confirmButtonColor: '#274C77'
      }).then(() => {
        navigate('/utilisateurs');
      });
    }
  };
  
  fetchUserData();
}, [id, navigate]);

  // Vérifier si le formulaire est vide
  const isFormEmpty = () => {
    return !formData.nom || 
           !formData.prenom || 
           !formData.email || 
           !formData.telephone || 
           !formData.role;
  };

  // Vérifier si le formulaire est valide
  const isFormValid = () => {
    return !Object.values(errors).some(error => error !== '') && 
           validFields.nom && 
           validFields.prenom && 
           validFields.email && 
           validFields.telephone && 
           validFields.role;
  };
  
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
  
  // Valider le nom et prénom
  const validateNameField = (value, fieldName) => {
    if (!value) {
      return `Le ${fieldName} est requis`;
    } 
    if (value.length < 2) {
      return `Le ${fieldName} doit contenir au moins 2 caractères`;
    }
    if (!/^[A-Za-zÀ-ÖØ-öø-ÿ\s-]+$/.test(value)) {
      return `Le ${fieldName} ne doit contenir que des lettres, espaces et tirets`;
    }
    return '';
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
    // Validation pour nom et prénom
    else if (name === 'nom' || name === 'prenom') {
      setFormData({
        ...formData,
        [name]: value
      });
      
      const nameError = validateNameField(value, name === 'nom' ? 'nom' : 'prénom');
      setErrors({
        ...errors,
        [name]: nameError
      });
      
      // Marquer comme valide si pas d'erreur
      setValidFields({
        ...validFields,
        [name]: !nameError && value.length > 0
      });
    } 
    // Traitement pour les autres champs
    else {
      setFormData({
        ...formData,
        [name]: value
      });
      
      // Validation pour le rôle
      if (name === 'role') {
        const roleError = value ? '' : 'Le rôle est requis';
        setErrors({
          ...errors,
          [name]: roleError
        });
        
        // Marquer comme valide si pas d'erreur
        setValidFields({
          ...validFields,
          [name]: !roleError && value.length > 0
        });
      }
    }
  };
  
// Gérer l'upload de photo 
const handlePhotoChange = (e) => {
  if (e.target.files && e.target.files[0]) {
    const file = e.target.files[0];
    
    // Vérifier la taille du fichier (max 5 MB)
    if (file.size > 5 * 1024 * 1024 ) {
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
      nom: validateNameField(formData.nom, 'nom'),
      prenom: validateNameField(formData.prenom, 'prénom'),
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
      try {
        // Préparer les données pour l'API
        const dataToSend = {
          ...formData,
          telephone: `+221${formData.telephone}` // Ajouter l'indicatif du Sénégal
        };
        
        // Appel à l'API pour mettre à jour l'utilisateur
        const response = await utilisateurService.mettreAJourUtilisateur(id, dataToSend);
        
        if (response && response.success) {
          // Afficher un message de succès avec SweetAlert2 timeout 3s pas de confirButton
          Swal.fire({
            icon: 'success',
            title: 'Succès !',
            text: 'Utilisateur modifié avec succès',
            showConfirmButton: false,
            timer: 2000
          }).then(() => {
            navigate('/utilisateurs'); // Rediriger vers la liste des utilisateurs
          });
        } else {
          throw new Error(response?.message || 'Erreur lors de la mise à jour');
        }
      } catch (error) {
        console.error('Erreur lors de la modification de l\'utilisateur:', error);

        // Afficher un message d'erreur avec SweetAlert2
        Swal.fire({
          icon: 'error',
          title: 'Erreur',
          text: error.response?.data?.message || error.message || 'Erreur lors de la modification de l\'utilisateur',
          showConfirmButton: false,
          timer: 2000
        });
      }
    } else {
      console.log('Le formulaire contient des erreurs');


      // Afficher un message d'erreur avec SweetAlert2
      Swal.fire({
        icon: 'warning',
        title: 'Formulaire incomplet',
        text: 'Veuillez corriger les erreurs dans le formulaire avant de soumettre',
        showConfirmButton: false,
        timer: 2000
      });
    }
  };

  // Afficher un indicateur de chargement pendant la récupération des données
  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Chargement des données...</p>
      </div>
    );
  }
  
  return (
    <div className="ajouter-utilisateur-page">
      {/* Cartes de statistiques */}
      <CardStat stats={stats} />
      
      {/* Formulaire de modification d'utilisateur */}
      <div className="form-container">
        <div className="form-header">
          <h2>Modifier un utilisateur</h2>
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
            
            {/* Téléphone */}
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
                  maxLength={12}
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
                  className={`photo-input ${errors.photo ? 'input-error' : ''} ${validFields.photo && photoPreview ? 'input-valid' : ''}`}
                />
                <div className={`photo-input-ui ${validFields.photo && photoPreview ? 'input-valid' : ''}`}>
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
              ) : validFields.photo && photoPreview ? (
                <div className="valid-message">
                  <Check size={14} />
                  <span>Photo valide</span>
                </div>
              ) : (
                <div className="helper-text">JPG ou PNG, 5 MB max. Optionnel.</div>
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
              Modifier
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ModifierUtilisateur;