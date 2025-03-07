Cahier des Charges - Sutura Énergie : Réinventons la Consommation Énergétique grâce à l'IoT
1. Introduction
1.1 Contexte et Enjeux
Le Sénégal fait face aujourd'hui à un défi majeur : la gestion efficace de l'énergie. Dans un contexte où les ressources énergétiques sont précieuses, où la demande ne cesse de croître et où les coûts augmentent continuellement, il devient impératif de repenser notre manière de consommer l’électricité. L'optimisation de la consommation devient alors un enjeu crucial pour les foyers et les entreprises.

1.2 Présentation de Sutura Énergie
Sutura Énergie est une solution innovante et intelligente exploitant les capacités de l'Internet des Objets (IoT) pour transformer la gestion énergétique. Grâce à un système avancé de surveillance et d'optimisation, elle permet aux foyers et entreprises de suivre leur consommation en temps réel, d'identifier les sources de gaspillage et d'automatiser l'usage des appareils électriques pour une efficacité accrue. Avec une approche axée sur la simplicité et la performance, Sutura Énergie favorise une utilisation responsable et économique de l’électricité.

2. Objectifs du Projet
Réduction de la consommation énergétique : Permettre aux foyers et aux entreprises de surveiller et d’optimiser leur consommation d’énergie afin de réduire les coûts et d’éviter le gaspillage.
Automatisation et gestion intelligente : Offrir une interface intuitive permettant de programmer et de contrôler à distance l’usage des appareils électriques en fonction des besoins spécifiques des utilisateurs.
Sécurisation des installations : Intégrer des dispositifs de détection (fumée, incendie, mouvement) pour renforcer la sécurité des locaux et prévenir les incidents.
Accessibilité et simplicité d’utilisation : Concevoir une solution adaptée au contexte sénégalais, facile à installer et à utiliser, même pour des personnes ayant peu de compétences techniques.
Impact écologique : Contribuer à la réduction de l’empreinte carbone en favorisant une consommation énergétique plus responsable et durable.

3. Architecture Générale
3.1 Composants Matériels
Capteurs de consommation électrique (ACS712), Tensiomètre , Panneau solaire 
Capteurs de température et humidité (DHT11)
Photorésistances (LDR) pour la gestion de l'éclairage automatique
Capteurs ultrasoniques pour détecter la présence et optimiser l'utilisation des équipements
Détecteurs de fumée et d'incendie
Caméras intelligentes avec détection de mouvement
3.2 Composants Logiciels
Modules ESP8266
Les modules ESP8266 permettent la transmission sans fil des données des capteurs vers le Raspberry Pi. Ils assurent une connectivité Wi-Fi stable et rapide.
Raspberry Pi 4
Le Raspberry Pi 4 sert de serveur central, collectant, traitant les données, et exécutant des tâches d'automatisation via la plateforme Sutura Énergie. Il permet une gestion optimisée des dispositifs connectés.
Protocole HTTP
Le protocole HTTP est utilisé pour la communication sécurisée et fluide entre les capteurs, le Raspberry Pi, et la plateforme. Il garantit une intégration simple et fiable des données.
Plateforme Sutura Énergie
La plateforme Sutura Énergie centralise les données et fournit une interface intuitive pour le suivi en temps réel, l’analyse et l’optimisation de la consommation énergétique.

4. Fonctionnalités du Système
4.1 Surveillance en Temps Réel
Mesure et affichage de la consommation électrique
Historique et statistiques pour optimiser l'utilisation de l'énergie
4.2 Automatisation et Contrôle
Programmation des appareils électriques selon les besoins
Activation/désactivation à distance via l’interface web
Modes de fonctionnement (jour, nuit, absence, économie)
4.3 Sécurité
Alerte en cas de consommation anormale ou d'équipement oublié allumé
Détection de fumée et incendie avec notifications instantanées
Surveillance vidéo avec détection de mouvement
5. Connexion et Contrôle
Plateforme Sutura Énergie :
Connexion sécurisée via Google, email/mot de passe, ou code unique.
Interface utilisateur intuitive pour la gestion de la consommation énergétique, la programmation des appareils, et la surveillance en temps réel.
Gestion des utilisateurs : Chaque utilisateur disposera d'un compte avec les informations suivantes : nom, prénom, email, téléphone et mot de passe.


Contrôle Domotique :
Ouverture de la porte via RFID pour un accès sécurisé.
Allumage et extinction des lampes et appareils électriques via l’interface web.
Intégration d'une intelligence artificielle (IA) pour optimiser la consommation énergétique en fonction des habitudes de l'utilisateur.




6. Conclusion
Sutura Énergie est une solution complète qui intègre gestion énergétique, domotique et sécurité pour un avenir durable au Sénégal. En alliant technologies avancées et interface intuitive, elle permet à chaque utilisateur de reprendre le contrôle de sa consommation énergétique tout en garantissant un environnement plus sûr et plus économique.
