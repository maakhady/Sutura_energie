const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UtilisateurSchema = new mongoose.Schema({
  nom: {
    type: String,
    required: [true, 'Le nom est requis'],
    trim: true
  },
  prenom: {
    type: String,
    required: [true, 'Le prénom est requis'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'L\'email est requis'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Veuillez fournir un email valide'
    ]
  },
  code: {
    type: String,
    required: [true, 'Le code est requis'],
    unique: true,
    match: [
      /^[0-9]{4}$/,
      'Le code doit être composé exactement de 4 chiffres'
    ]
  },
  password: {
    type: String,
    required: [true, 'Le mot de passe est requis'],
    minlength: [8, 'Le mot de passe doit comporter au moins 8 caractères'],
    select: false // Ne pas inclure dans les requêtes par défaut
  },
  photo: {
    type: String
  },
  cardActive: {
    type: Boolean,
    default: true
  },
  role: {
    type: String,
    enum: {
      values: ['utilisateur', 'admin'],
      message: 'Le rôle doit être utilisateur ou admin'
    },
    default: 'utilisateur'
  },
  telephone: {
    type: Number,
    required: [true, 'Le numéro de téléphone est requis'],
    unique: true
  },
  cardId: {
    type: String,
    unique: true,
    sparse: true // Permet des valeurs nulles tout en maintenant l'unicité
  },
  empreinteID: {
    type: String,
    unique: true,
    sparse: true
  },
  actif: {
    type: Boolean,
    default: true
  },
  date_creation: {
    type: Date,
    default: Date.now
  },
  date_modif: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: false // Désactive les champs createdAt et updatedAt automatiques
});

// Middleware pour hacher le mot de passe avant la sauvegarde
UtilisateurSchema.pre('save', async function(next) {
  // Mettre à jour la date de modification à chaque sauvegarde
  this.date_modif = Date.now();
  
  // Ne hacher le mot de passe que s'il a été modifié
  if (!this.isModified('password')) {
    return next();
  }
  
  try {
    // Générer un sel
    const salt = await bcrypt.genSalt(10);
    // Hacher le mot de passe avec le sel
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Middleware pour mettre à jour la date de modification avant findOneAndUpdate
UtilisateurSchema.pre('findOneAndUpdate', function(next) {
  this.set({ date_modif: Date.now() });
  next();
});

// Méthode pour comparer les mots de passe
UtilisateurSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Méthode pour générer un code utilisateur unique à 4 chiffres
UtilisateurSchema.statics.generateUniqueCode = async function() {
  // Générer un nombre à 4 chiffres
  const code = Math.floor(1000 + Math.random() * 9999).toString();
  
  // Vérifier si le code existe déjà
  const existingUser = await this.findOne({ code });
  if (existingUser) {
    // Récursion pour générer un nouveau code si celui-ci existe déjà
    return this.generateUniqueCode();
  }
  
  return code;
};

const Utilisateur = mongoose.model('Utilisateur', UtilisateurSchema);

module.exports = Utilisateur;