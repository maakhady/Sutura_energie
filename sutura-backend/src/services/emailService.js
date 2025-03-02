const nodemailer = require("nodemailer");
const emailConfig = require("../config/emailConfig");

/**
 * Service d'envoi d'emails pour l'application Sutura Énergie
 */
const emailService = {
  /**
   * Initialise et retourne un transporteur Nodemailer
   * @returns {object} Transporteur Nodemailer configuré
   */
  getTransporter: function () {
    return nodemailer.createTransport({
      service: emailConfig.service,
      host: emailConfig.host,
      port: emailConfig.port,
      secure: emailConfig.secure,
      auth: emailConfig.auth,
    });
  },

  /**
   * Envoie un email générique
   * @param {object} options - Options de l'email
   * @returns {Promise<object>} Résultat de l'envoi
   */
  envoyerEmail: async function (options) {
    try {
      const transporter = this.getTransporter();

      const message = {
        from: emailConfig.from,
        to: options.to,
        subject: options.subject,
        text: options.text || "",
        html: options.html || "",
      };

      const info = await transporter.sendMail(message);
      console.log("Email envoyé: %s", info.messageId);
      return info;
    } catch (error) {
      console.error("Erreur lors de l'envoi de l'email:", error);
      throw error;
    }
  },

  /**
   * Envoie un email de bienvenue avec les identifiants lors de la création de compte et un lien pour définir le mot de passe
   * @param {object} utilisateur - Utilisateur destinataire
   * @param {string} token - Token pour définir le mot de passe
   * @returns {Promise<object>} Résultat de l'envoi
   */
  envoyerIdentifiants: async function (utilisateur, token) {
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
    const definirMdpUrl = `${frontendUrl}/firstlogin/definir-mot-de-passe/${token}`;

    const sujet =
      "Bienvenue sur Sutura Énergie - Vos identifiants de connexion";

    const texte = `
      Bonjour ${utilisateur.prenom} ${utilisateur.nom},

      Bienvenue sur la plateforme Sutura Énergie !

      Vos identifiants de connexion sont les suivants :
      Nom: ${utilisateur.nom}
      Prénom: ${utilisateur.prenom}
      Téléphone: ${utilisateur.telephone}
      Email: ${utilisateur.email}

      Pour finaliser la création de votre compte, veuillez définir votre mot de passe en cliquant sur le lien suivant:
      ${definirMdpUrl}

      Ce lien est valide pendant 24 heures.

      Merci de garder ces informations confidentielles.

      L'équipe Sutura Énergie
    `;

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 5px;">
        <h2 style="color: #274C77;">Bienvenue sur Sutura Énergie</h2>
        <p>Bonjour <strong>${utilisateur.prenom} ${utilisateur.nom}</strong>,</p>
        <p>Bienvenue sur la plateforme Sutura Énergie !</p>
        <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #333;">Vos informations</h3>
          <p><strong>Nom:</strong> ${utilisateur.nom}</p>
          <p><strong>Prénom:</strong> ${utilisateur.prenom}</p>
          <p><strong>Téléphone:</strong> ${utilisateur.telephone}</p>
          <p><strong>Email:</strong> ${utilisateur.email}</p>
        </div>
        <p style="color: #e74c3c; font-weight: bold;">Pour finaliser la création de votre compte, veuillez définir votre mot de passe:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${definirMdpUrl}" style="background-color: #274C77; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">Définir mon mot de passe</a>
        </div>
        <p>Merci de garder ces informations confidentielles.</p>
        <p style="margin-top: 30px; color: #666;">L'équipe Sutura Énergie</p>
      </div>
    `;

    return await this.envoyerEmail({
      to: utilisateur.email,
      subject: sujet,
      text: texte,
      html: html,
    });
  },

  /**
   * Envoie une notification de confirmation après la définition du mot de passe avec le code de connexion
   * @param {object} utilisateur - Utilisateur destinataire
   * @returns {Promise<object>} Résultat de l'envoi
   */
  envoyerConfirmationMotDePasse: async function (utilisateur) {
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
    const loginUrl = `${frontendUrl}/`;

    const sujet = "Confirmation - Votre compte est actif - Sutura Énergie";

    const texte = `
      Bonjour ${utilisateur.prenom} ${utilisateur.nom},

      Nous vous confirmons que votre mot de passe a été défini avec succès et que votre compte est maintenant actif.

      Voici vos options de connexion:
      - Option 1: Connectez-vous avec votre email (${utilisateur.email}) et votre mot de passe
      - Option 2: Connectez-vous simplement avec votre code: ${utilisateur.code}

      Pour vous connecter, rendez-vous sur: ${loginUrl}

      Merci de garder ces informations confidentielles.

      L'équipe Sutura Énergie
    `;

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 5px;">
        <h2 style="color: #274C77;">Confirmation d'activation de compte</h2>
        <p>Bonjour <strong>${utilisateur.prenom} ${utilisateur.nom}</strong>,</p>
        <p>Nous vous confirmons que votre mot de passe a été défini avec succès et que votre compte est maintenant actif.</p>
        <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #333;">Vos options de connexion:</h3>
          <p><strong>Option 1:</strong> Connectez-vous avec votre email et votre mot de passe</p>
          <p><strong>Email:</strong> ${utilisateur.email}</p>
          <p style="margin-top: 15px;"><strong>Option 2:</strong> Connectez-vous simplement avec votre code</p>
          <p><strong>Code:</strong> <span style="font-size: 1.2em; color: #274C77; font-weight: bold;">${utilisateur.code}</span></p>
        </div>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${loginUrl}" style="background-color: #274C77; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">Se connecter à la plateforme</a>
        </div>
        <p>Merci de garder ces informations confidentielles.</p>
        <p style="margin-top: 30px; color: #666;">L'équipe Sutura Énergie</p>
      </div>
    `;

    return await this.envoyerEmail({
      to: utilisateur.email,
      subject: sujet,
      text: texte,
      html: html,
    });
  },

  /**
   * Envoie un email avec le lien de réinitialisation du mot de passe
   * @param {object} utilisateur - Utilisateur destinataire
   * @param {string} token - Token de réinitialisation
   * @param {string} frontendUrl - URL de base du frontend
   * @returns {Promise<object>} Résultat de l'envoi
   */
  envoyerLienReinitialisation: async function (
    utilisateur,
    token,
    frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173"
  ) {
    const resetURL = `${frontendUrl}/reinitialiser-mot-de-passe/${token}`;

    const sujet = "Réinitialisation de votre mot de passe - Sutura Énergie";

    const texte = `
      Bonjour ${utilisateur.prenom} ${utilisateur.nom},

      Vous avez demandé la réinitialisation de votre mot de passe.

      Veuillez cliquer sur le lien suivant pour réinitialiser votre mot de passe :
      ${resetURL}

      Ce lien est valide pendant 1 heure.

      Si vous n'avez pas demandé cette réinitialisation, veuillez ignorer cet email.

      L'équipe Sutura Énergie
    `;

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 5px;">
        <h2 style="color: #274C77 ">Réinitialisation de votre mot de passe</h2>
        <p>Bonjour <strong>${utilisateur.prenom} ${utilisateur.nom}</strong>,</p>
        <p>Vous avez demandé la réinitialisation de votre mot de passe.</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetURL}" style="background-color: #274C77; color: white; padding: 12px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">Réinitialiser mon mot de passe</a>
        </div>
        <p style="color: #666;">Ce lien est valide pendant 5 minutes.</p>
        <p style="color: #e74c3c;">Si vous n'avez pas demandé cette réinitialisation, veuillez ignorer cet email.</p>
        <p style="margin-top: 30px; color: #666;">L'équipe Sutura Énergie</p>
      </div>
    `;

    return await this.envoyerEmail({
      to: utilisateur.email,
      subject: sujet,
      text: texte,
      html: html,
    });
  },

  /**
   * Envoie une notification de confirmation après la réinitialisation du mot de passe
   * @param {object} utilisateur - Utilisateur destinataire
   * @returns {Promise<object>} Résultat de l'envoi
   */
  envoyerConfirmationReinitialisation: async function (utilisateur) {
    const sujet =
      "Confirmation - Votre mot de passe a été réinitialisé - Sutura Énergie";

    const texte = `
      Bonjour ${utilisateur.prenom} ${utilisateur.nom},

      Nous vous confirmons que votre mot de passe a été réinitialisé avec succès.

      Si vous n'êtes pas à l'origine de cette action, veuillez contacter immédiatement notre équipe de support.

      L'équipe Sutura Énergie
    `;

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 5px;">
        <h2 style="color: #274C77;">Confirmation de réinitialisation</h2>
        <p>Bonjour <strong>${utilisateur.prenom} ${utilisateur.nom}</strong>,</p>
        <p>Nous vous confirmons que votre mot de passe a été réinitialisé avec succès.</p>
        <p style="color: #e74c3c; font-weight: bold;">Si vous n'êtes pas à l'origine de cette action, veuillez contacter immédiatement notre équipe de support.</p>
        <p style="margin-top: 30px; color: #666;">L'équipe Sutura Énergie</p>
      </div>
    `;

    return await this.envoyerEmail({
      to: utilisateur.email,
      subject: sujet,
      text: texte,
      html: html,
    });
  },
};

module.exports = emailService;
