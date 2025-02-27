import { useState, useRef, memo, useEffect } from 'react';
import { Upload, AlertCircle, Check } from 'lucide-react';
import { utilisateurService } from "../services/utilisateurService";
import { authService } from "../services/authService";
import Swal from 'sweetalert2';
import PropTypes from 'prop-types';

// Composant Modal pour la modification du profil
const ProfileEditModal = ({
  user,
  setUser,
  modalRef,
  setShowModifierProfil,
  handleModalContentClick,
  setSuccess,
  setError,
  userId // Ajoutez l'ID de l'utilisateur ici
}) => {
  // Fonction pour formater le numéro de téléphone initial
  const formatInitialPhone = (phone) => {
    if (!phone) return '';

    // Convertir en chaîne de caractères
    const phoneStr = String(phone);

    // Si le numéro commence par 221 ou +221, le supprimer
    if (phoneStr.startsWith('221')) {
      return phoneStr.substring(3);
    } else if (phoneStr.startsWith('+221')) {
      return phoneStr.substring(4);
    }

    return phoneStr;
  };

  // Formater le numéro de téléphone pour l'affichage
  const formatPhoneNumber = (value) => {
    if (!value) return '';

    // S'assurer que la valeur est une chaîne de caractères
    const valueStr = String(value);

    // Supprimer tout sauf les chiffres
    const cleaned = valueStr.replace(/\D/g, '');

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

  // Initialiser l'état avec les données utilisateur
  const initialPhone = formatInitialPhone(user?.telephone || '');

  const [profileData, setProfileData] = useState({
    nom: user?.nom || '',
    prenom: user?.prenom || '',
    email: user?.email || '',
    telephone: initialPhone
  });

  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(user?.photo || null);
  const [loading, setLoading] = useState(false);

  // États pour la validation des champs
  const [errors, setErrors] = useState({
    nom: '',
    prenom: '',
    email: '',
    telephone: '',
    photo: ''
  });

  // État pour les champs valides - initialiser comme valides si les données existent déjà
  const [validFields, setValidFields] = useState({
    nom: user?.nom && user.nom.length >= 2,
    prenom: user?.prenom && user.prenom.length >= 2,
    email: user?.email && user.email.includes('@'),
    telephone: initialPhone && initialPhone.length === 9,
    photo: true // La photo est facultative
  });

  // Référence pour l'input de téléchargement de fichier
  const fileInputRef = useRef(null);

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

  // Valider tous les champs au chargement
  useEffect(() => {
    if (user) {
      validateForm();
    }
  }, [user]);

  // Gérer le changement des champs de texte
  const handleInputChange = (e) => {
    const { name, value } = e.target;

    // Traitement spécial pour le téléphone
    if (name === 'telephone') {
      // Obtenir seulement les chiffres de la valeur saisie
      const digitsOnly = value.replace(/\D/g, '');

      // Limiter à 9 chiffres maximum
      const limitedDigits = digitsOnly.substring(0, 9);

      setProfileData({
        ...profileData,
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
      setProfileData({
        ...profileData,
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
      setProfileData({
        ...profileData,
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
  };

  // Gérer le téléchargement de la photo de profil
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

      setPhotoFile(file);

      // Créer une URL pour la prévisualisation
      const reader = new FileReader();
      reader.onloadend = () => {
        // reader.result contient l'image en Base64
        setPhotoPreview(reader.result);

        setErrors({
          ...errors,
          photo: ''
        });

        setValidFields({
          ...validFields,
          photo: true
        });
      };
      reader.readAsDataURL(file);
    }
  };

  // Vérifier si le formulaire est valide - SIMPLIFIÉ
  const isFormValid = () => {
    return validFields.nom &&
           validFields.prenom &&
           validFields.email &&
           validFields.telephone;
    // Pas besoin de vérifier validFields.photo car c'est optionnel
  };

  // Vérifier si le formulaire est vide
  const isFormEmpty = () => {
    return !profileData.nom ||
           !profileData.prenom ||
           !profileData.email ||
           !profileData.telephone;
  };

  // Valider le formulaire avant de soumettre
  const validateForm = () => {
    const newErrors = {
      nom: validateNameField(profileData.nom, 'nom'),
      prenom: validateNameField(profileData.prenom, 'prénom'),
      email: validateEmail(profileData.email),
      telephone: validatePhone(profileData.telephone),
      photo: errors.photo // Conserver l'erreur photo actuelle
    };

    setErrors(newErrors);

    // Mettre à jour les champs valides
    const newValidFields = {
      nom: !newErrors.nom && profileData.nom.length > 0,
      prenom: !newErrors.prenom && profileData.prenom.length > 0,
      email: !newErrors.email && profileData.email.length > 0,
      telephone: !newErrors.telephone && profileData.telephone.length === 9,
      photo: validFields.photo // Garder l'état actuel pour la photo
    };

    setValidFields(newValidFields);

    // Vérifier s'il y a des erreurs
    return !Object.values(newErrors).some(error => error !== '');
  };

  // Soumettre le formulaire
  const handleSubmit = async (e) => {
    e.preventDefault();

    console.log("Soumission du formulaire");
    console.log("Form Data:", profileData);
    console.log("isFormValid:", isFormValid());
    console.log("formValidation:", validateForm());

    if (validateForm()) {
      setLoading(true);
      setError('');
      setSuccess('');

      try {
        // Créer un FormData pour envoyer les données et le fichier
        const formData = new FormData();
        formData.append('nom', profileData.nom);
        formData.append('prenom', profileData.prenom);
        formData.append('email', profileData.email);
        formData.append('telephone', `+221${profileData.telephone}`);

        if (photoFile) {
          formData.append('photo', photoFile);
        }

        console.log("Envoi des données au serveur");

        // Appeler le service pour mettre à jour le profil
        const response = await utilisateurService.mettreAJourUtilisateur(userId, formData);
        console.log("Réponse du serveur:", response);

        if (response && response.success) {
          setSuccess('Profil mis à jour avec succès');

          // Mettre à jour les données de l'utilisateur dans le state parent
          const updatedUser = await authService.getMyProfile();
          if (updatedUser && updatedUser.success) {
            setUser(updatedUser.data);
          }

          // Fermer le modal après 2 secondes
          setTimeout(() => {
            setShowModifierProfil(false);
          }, 2000);

          // Afficher un message de succès avec SweetAlert2
          Swal.fire({
            icon: 'success',
            title: 'Succès !',
            text: 'Profil mis à jour avec succès',
            showConfirmButton: false,
            timer: 2000
          });
        } else {
          throw new Error(response?.message || "Erreur lors de la mise à jour du profil");
        }
      } catch (err) {
        console.error("Erreur:", err);
        setError(err.response?.data?.message || err.message || "Erreur lors de la mise à jour du profil");

        // Afficher un message d'erreur avec SweetAlert2
        Swal.fire({
          icon: 'error',
          title: 'Erreur',
          text: err.response?.data?.message || err.message || "Erreur lors de la mise à jour du profil",
          showConfirmButton: false,
          timer: 2000
        });
      } finally {
        setLoading(false);
      }
    } else {
      console.log("Le formulaire n'est pas valide");

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

  return (
    <div className="modal-overlay" onClick={() => setShowModifierProfil(false)}>
      <div
        className="modal-content profile-edit-modal"
        onClick={handleModalContentClick}
        ref={modalRef}
      >
        <h3>Modifier mon profil</h3>

        <form onSubmit={handleSubmit} className="profile-form" noValidate>
          <div className="form-grid">
            {/* Nom */}
            <div className="form-group">
              <label htmlFor="nom">Nom</label>
              <input
                type="text"
                id="nom"
                name="nom"
                placeholder="Entrez le nom"
                value={profileData.nom}
                onChange={handleInputChange}
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
                value={profileData.prenom}
                onChange={handleInputChange}
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
                value={profileData.email}
                onChange={handleInputChange}
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
                  value={formatPhoneNumber(profileData.telephone)}
                  onChange={handleInputChange}
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
                  ref={fileInputRef}
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
          </div>

          {/* Boutons */}
          <div className="form-buttons">
            <button
              type="submit"
              className="submit-btn"
              // Simplifier les conditions d'activation du bouton
              disabled={isFormEmpty() || loading}
              style={{
                backgroundColor: (!isFormEmpty()) ? '#274C77' : '#E5E7EB',
                color: (!isFormEmpty()) ? 'white' : '#9CA3AF',
                cursor: (!isFormEmpty() && !loading) ? 'pointer' : 'not-allowed'
              }}
            >
              {loading ? 'Modification en cours...' : 'Modifier'}
            </button>
            <button
              type="button"
              className="cancel-btn"
              onClick={() => setShowModifierProfil(false)}
            >
              Annuler
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Application de memo au composant
const MemoizedProfileEditModal = memo(ProfileEditModal);
ProfileEditModal.propTypes = {
  user: PropTypes.object.isRequired,
  setUser: PropTypes.func.isRequired,
  modalRef: PropTypes.object.isRequired,
  setShowModifierProfil: PropTypes.func.isRequired,
  handleModalContentClick: PropTypes.func.isRequired,
  setSuccess: PropTypes.func.isRequired,
  setError: PropTypes.func.isRequired,
  userId: PropTypes.string.isRequired
};

export default MemoizedProfileEditModal;
