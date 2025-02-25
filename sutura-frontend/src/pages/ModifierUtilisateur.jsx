import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Upload, AlertCircle } from 'lucide-react';
import CardStat from '../components/CardStat';
import '../styles/AjouterUtilisateur.css';

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
  
  // État pour l'aperçu de l'image
  const [photoPreview, setPhotoPreview] = useState(null);
  
  // État pour le chargement des données
  const [loading, setLoading] = useState(true);
  
  // Données pour les cartes de statistiques
  const stats = [
    { title: 'Utilisateurs Totales', value: 9, icon: 'users' },
    { title: 'Utilisateurs Actifs', value: 6, icon: 'user' },
    { title: 'Cartes Assignés', value: 3, icon: 'device' }
  ];
  
  // Récupérer les données de l'utilisateur à modifier
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        
        // Simuler une requête API pour récupérer les données de l'utilisateur
        // Remplacez cette partie par votre appel API réel
        // Exemple: const response = await utilisateurService.obtenirUtilisateur(id);
        
        // Pour la démonstration, on utilise des données fictives
        const userData = {
          nom: 'Thiam',
          prenom: 'Fallou',
          email: 'fallou@unitiledu.com',
          telephone: '771234567', // Sans le préfixe +221
          role: 'utilisateur',
          photo: null // Pas de photo dans cet exemple
        };
        
        // Mettre à jour le formulaire avec les données de l'utilisateur
        setFormData(userData);
        
        // Si l'utilisateur a une photo, définir l'aperçu
        if (userData.photo) {
          setPhotoPreview(userData.photo);
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Erreur lors de la récupération des données de l\'utilisateur:', error);
        setLoading(false);
        // Rediriger vers la liste en cas d'erreur
        navigate('/utilisateurs');
      }
    };
    
    fetchUserData();
  }, [id, navigate]);
  
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
    
    // Limiter à 9 chiffres (format sénégalais)
    const limited = cleaned.substring(0, 9);
    
    // Formater XX-XXX-XX-XX (format sénégalais)
    if (limited.length >= 2) {
      let formatted = limited.substring(0, 2);
      
      if (limited.length >= 5) {
        formatted += '-' + limited.substring(2, 5);
        
        if (limited.length >= 7) {
          formatted += '-' + limited.substring(5, 7);
          
          if (limited.length >= 9) {
            formatted += '-' + limited.substring(7, 9);
          }
        }
      }
      return formatted;
    }
    
    return limited;
  };
  
  // Gérer les changements dans le formulaire
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Traitement spécial pour le téléphone
    if (name === 'telephone') {
      // Supprimer les tirets pour le stockage
      const rawValue = value.replace(/-/g, '');
      
      setFormData({
        ...formData,
        [name]: rawValue
      });
      
      // Valider le téléphone
      const phoneError = validatePhone(rawValue);
      setErrors({
        ...errors,
        [name]: phoneError
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
    }
    // Validation pour nom et prénom
    else if (name === 'nom' || name === 'prenom') {
      setFormData({
        ...formData,
        [name]: value
      });
      
      const nameError = validateNameField(value, name);
      setErrors({
        ...errors,
        [name]: nameError
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
        setErrors({
          ...errors,
          [name]: value ? '' : 'Le rôle est requis'
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
        return;
      }
      
      // Vérifier le type de fichier
      const validTypes = ['image/jpeg', 'image/png', 'image/jpg'];
      if (!validTypes.includes(file.type)) {
        setErrors({
          ...errors,
          photo: "Seuls les formats JPG et PNG sont acceptés"
        });
        return;
      }
      
      // Si tout est OK, mettre à jour l'état
      setFormData({
        ...formData,
        photo: file
      });
      
      setErrors({
        ...errors,
        photo: ''
      });
      
      // Créer un aperçu de l'image
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result);
      };
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
        
        // Ici, vous pouvez ajouter la logique pour envoyer les données au backend
        // Exemple: await utilisateurService.mettreAJourUtilisateur(id, dataToSend);
        console.log('Données du formulaire soumises pour modification:', dataToSend);
        
        // Simulation de succès et redirection
        alert('Utilisateur modifié avec succès!');
        navigate('/utilisateurs'); // Rediriger vers la liste des utilisateurs
      } catch (error) {
        console.error('Erreur lors de la modification de l\'utilisateur:', error);
        alert('Erreur lors de la modification de l\'utilisateur');
      }
    } else {
      console.log('Le formulaire contient des erreurs');
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
                className={errors.nom ? 'input-error' : ''}
                required
              />
              {errors.nom && (
                <div className="error-message">
                  <AlertCircle size={14} />
                  <span>{errors.nom}</span>
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
                className={errors.prenom ? 'input-error' : ''}
                required
              />
              {errors.prenom && (
                <div className="error-message">
                  <AlertCircle size={14} />
                  <span>{errors.prenom}</span>
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
                className={errors.email ? 'input-error' : ''}
                required
              />
              {errors.email && (
                <div className="error-message">
                  <AlertCircle size={14} />
                  <span>{errors.email}</span>
                </div>
              )}
            </div>
            
            {/* Téléphone */}
            <div className="form-group">
              <label htmlFor="telephone">Téléphone</label>
              <div className="phone-input-container">
                <div className="phone-prefix">+221</div>
                <input
                  type="tel"
                  id="telephone"
                  name="telephone"
                  placeholder="7X-XXX-XX-XX"
                  value={formatPhoneNumber(formData.telephone)}
                  onChange={handleChange}
                  className={errors.telephone ? 'input-error' : ''}
                  required
                />
              </div>
              {errors.telephone ? (
                <div className="error-message">
                  <AlertCircle size={14} />
                  <span>{errors.telephone}</span>
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
                  className={`photo-input ${errors.photo ? 'input-error' : ''}`}
                />
                <div className="photo-input-ui">
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
                className={errors.role ? 'input-error' : ''}
                required
              >
                <option value="">Sélectionnez le rôle</option>
                <option value="admin">Admin</option>
                <option value="utilisateur">Utilisateur</option>
              </select>
              {errors.role && (
                <div className="error-message">
                  <AlertCircle size={14} />
                  <span>{errors.role}</span>
                </div>
              )}
            </div>
          </div>
          
          {/* Bouton de soumission */}
          <div className="form-submit">
            <button 
              type="submit" 
              className="btn-ajouter"
              disabled={Object.values(errors).some(error => error !== '')}
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