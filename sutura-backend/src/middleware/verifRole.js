/**
 * Middleware pour vérifier les rôles des utilisateurs
 * Restreint l'accès aux routes en fonction du rôle
 * @param {string[]} roles - Tableau des rôles autorisés
 * @returns {function} Middleware
 */


const verifRole = (roles) => {
    return (req, res, next) => {
        try {
            if (!req.user) {
                return res.status(401).json({
                    success: false,
                    message: 'Authentification requise'
                });
            }

            if (!roles.includes(req.user.role)) {
                return res.status(403).json({
                    success: false,
                    message: 'Accès non autorisé pour votre rôle'
                });
            }

            next();
        } catch (error) {
            console.error('Erreur middleware verifRole:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur lors de la vérification des droits'
            });
        }
    };
};

module.exports = verifRole;