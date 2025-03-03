import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import {
  Pencil,
  Trash2,
  IdCard,
  LockKeyholeOpen,
  Search,
  SlidersHorizontal,
  ArrowLeftToLine,
  ArrowRightToLine,
  ChevronDown,
  Fingerprint,
  LockIcon,
  
} from "lucide-react";
import "../styles/dashboard-liste.css";
import MiniRightPanel from "../components/MiniRightPanel";
import CardStat from "../components/CardStat";
import { utilisateurService } from "../services/utilisateurService";
import {
  AccessControlModal,
  CardAssignmentModal,
  FingerprintModal,
} from "../components/AccessModals";

const DashboardListe = () => {
  const navigate = useNavigate();

  // États pour les données des utilisateurs et la pagination
  const [users, setUsers] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);

  // Nouvel état pour les filtres combinés
  const [filters, setFilters] = useState({
    role: "", // '', 'admin', 'utilisateur'
    status: "", // '', 'actif', 'inactif'
  });

  // Nouvel état pour stocker les informations de pagination du serveur
  const [serverPagination, setServerPagination] = useState({
    total: 0,
    page: 1,
    pages: 0,
  });

  const [totalUsers, setTotalUsers] = useState(0);
  const [activeUsers, setActiveUsers] = useState(0);
  const [assignedCards, setAssignedCards] = useState(0);

  // États pour les modales
  const [accessModalOpen, setAccessModalOpen] = useState(false);
  const [cardModalOpen, setCardModalOpen] = useState(false);
  const [fingerprintModalOpen, setFingerprintModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const filterRef = useRef(null);

  // Débogage - Afficher l'état des utilisateurs
  useEffect(() => {
    console.log("État actuel des utilisateurs:", users);
  }, [users]);

  // Débogage - Afficher l'état de la pagination
  useEffect(() => {
    console.log("Pagination serveur:", serverPagination);
    console.log("Page courante:", currentPage);
    console.log("Nombre total de pages:", serverPagination.pages);
  }, [serverPagination, currentPage]);

  // Fermer le dropdown de filtre si on clique ailleurs
  useEffect(() => {
    function handleClickOutside(event) {
      if (filterRef.current && !filterRef.current.contains(event.target)) {
        setShowFilterDropdown(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [filterRef]);

  // Chargement des utilisateurs avec pagination
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        console.log("Fetching users...");
        const data = await utilisateurService.obtenirTousUtilisateurs(
          currentPage,
          itemsPerPage,
          {
            actif:
              filters.status === "actif"
                ? true
                : filters.status === "inactif"
                ? false
                : undefined,
            role: filters.role || undefined,
            recherche: searchQuery || undefined,
          }
        );

        console.log("Data received from API:", data);

        if (data && data.success && Array.isArray(data.data)) {
          const usersArray = data.data.map((user) => {
            if (user._id && !user.id) {
              return { ...user, id: user._id };
            }
            return user;
          });

          console.log("Utilisateurs après mappage:", usersArray);

          // Mettre à jour l'état avec les données extraites
          setUsers(usersArray);
          setTotalUsers(data.count || usersArray.length);

          // Stocker les informations de pagination du serveur
          setServerPagination({
            total: data.count || 0,
            page: currentPage,
            pages:
              data.pagination?.pages ||
              Math.ceil((data.count || 0) / itemsPerPage),
          });

          // Calculer les stats à partir du nouveau tableau obtenu
          const actifs = usersArray.filter((user) => user.actif).length;
          const cartes = usersArray.filter((user) => user.cardActive).length;

          setActiveUsers(actifs);
          setAssignedCards(cartes);
        } else {
          console.error("Format de données inattendu:", data);
        }
      } catch (error) {
        console.error("Erreur détaillée:", error);
        Swal.fire({
          icon: "error",
          title: "Erreur!",
          text:
            "Une erreur s'est produite lors de la récupération des utilisateurs: " +
            (error.message || error),
          timer: 2000,
          showConfirmButton: false,
        });
      }
    };

    fetchUsers();
  }, [currentPage, itemsPerPage, searchQuery, filters]);

  // Données pour les statistiques
  const stats = [
    { title: "Utilisateurs Totaux", value: totalUsers, icon: "users" },
    { title: "Utilisateurs Actifs", value: activeUsers, icon: "user" },
    { title: "Cartes Assignées", value: assignedCards, icon: "device" },
  ];

  // Gérer la sélection/désélection de tous les utilisateurs
  const handleSelectAll = () => {
    if (selectedUsers.length === currentUsers.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(currentUsers.map((user) => user.id || user._id));
    }
  };

  // Gérer la sélection/désélection d'un utilisateur
  const handleSelectUser = (id) => {
    if (selectedUsers.includes(id)) {
      setSelectedUsers(selectedUsers.filter((userId) => userId !== id));
    } else {
      setSelectedUsers([...selectedUsers, id]);
    }
  };

  // Gestion de la redirection vers la page d'ajout d'utilisateur
  const handleAddUser = () => {
    navigate("/ajouter-utilisateur");
  };

  // Gestion de la redirection vers la page de modification d'utilisateur
  const handleEditUser = (id) => {
    navigate(`/modifier-utilisateur/${id}`);
  };

  // Gestion de la suppression d'un utilisateur ou de plusieurs utilisateurs par rapport au service utilisateur
  const handleDeleteUser = (id) => {
    if (!id) {
      console.error("ID utilisateur manquant pour la suppression!");
      return;
    }
    // Pour déboguer
    console.log("Suppression de l'utilisateur ID:", id);
    Swal.fire({
      title: "Êtes-vous sûr?",
      text: "Êtes-vous sûr de vouloir supprimer cet utilisateur?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Oui, supprimez!",
      cancelButtonText: "Annuler",
    }).then((result) => {
      if (result.isConfirmed) {
        // Envoyer un tableau d'IDs comme attendu par le service
        utilisateurService
          .supprimerUtilisateurs([id])
          .then(() => {
            // Mettre à jour le state en retirant l'utilisateur supprimé
            setUsers(users.filter((user) => (user.id || user._id) !== id));
            Swal.fire({
              icon: "success",
              title: "Supprimé!",
              text: "L'utilisateur a été supprimé.",
              timer: 2000,
              showConfirmButton: false,
            });
          })
          .catch((error) => {
            console.error("Erreur suppression:", error);
            Swal.fire({
              icon: "error",
              title: "Erreur!",
              text:
                "Une erreur s'est produite lors de la suppression: " +
                (error.response?.data?.message ||
                  error.message ||
                  "Erreur inconnue"),
              timer: 2000,
              showConfirmButton: false,
            });
          });
      }
    });
  };

  // Gestion de la suppression multiple d'utilisateurs
  const handleDeleteMultiple = (ids) => {
    if (!ids || ids.length < 2) {
      console.error(
        "Au moins deux IDs d'utilisateurs sont requis pour la suppression multiple!"
      );
      return;
    }

    Swal.fire({
      title: "Êtes-vous sûr?",
      text: `Êtes-vous sûr de vouloir supprimer ces ${ids.length} utilisateurs?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Oui, supprimer tout!",
      cancelButtonText: "Annuler",
    }).then((result) => {
      if (result.isConfirmed) {
        utilisateurService
          .supprimerUtilisateurs(ids)
          .then(() => {
            // Mettre à jour le state en retirant les utilisateurs supprimés
            setUsers(
              users.filter((user) => !ids.includes(user.id || user._id))
            );
            // Vider la sélection
            setSelectedUsers([]);

            Swal.fire({
              icon: "success",
              title: "Supprimés!",
              text: `${ids.length} utilisateurs ont été supprimés.`,
              timer: 2000,
              showConfirmButton: false,
            });
          })
          .catch((error) => {
            console.error("Erreur suppression multiple:", error);
            Swal.fire({
              icon: "error",
              title: "Erreur!",
              text:
                "Une erreur s'est produite lors de la suppression multiple: " +
                (error.response?.data?.message ||
                  error.message ||
                  "Erreur inconnue"),
              timer: 2000,
              showConfirmButton: false,
            });
          });
      }
    });
  };

  // Gestion active/inactive d'un utilisateur
  const handleToggleStatus = (id) => {
    console.log("Toggle statut pour l'utilisateur ID:", id); // Pour déboguer

    if (!id) {
      console.error("ID utilisateur manquant!");
      Swal.fire({
        icon: "error",
        title: "Erreur!",
        text: "ID utilisateur non valide.",
        timer: 2000,
        showConfirmButton: false,
      });
      return;
    }

    // Déterminer si on va activer ou désactiver
    const userToUpdate = users.find((u) => (u.id || u._id) === id);
    if (!userToUpdate) {
      console.error("Utilisateur non trouvé!");
      return;
    }

    const isCurrentlyActive = userToUpdate.actif;
    const actionText = isCurrentlyActive ? "désactiver" : "activer";

    Swal.fire({
      title: "Êtes-vous sûr?",
      text: `Êtes-vous sûr de vouloir ${actionText} cet utilisateur?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: `Oui, ${actionText}`,
      cancelButtonText: "Annuler",
    }).then((result) => {
      if (result.isConfirmed) {
        utilisateurService
          .toggleStatutUtilisateur(id)
          .then(() => {
            // Mettre à jour le state avec le nouveau statut
            const updatedUsers = users.map((u) => {
              if ((u.id || u._id) === id) {
                return { ...u, actif: !u.actif };
              }
              return u;
            });
            setUsers(updatedUsers);

            // Mettre à jour les statistiques
            const actifs = updatedUsers.filter((user) => user.actif).length;
            setActiveUsers(actifs);

            Swal.fire({
              icon: "success",
              title: "Modifié!",
              text: `L'utilisateur a été ${
                isCurrentlyActive ? "désactivé" : "activé"
              } avec succès.`,
              timer: 2000,
              showConfirmButton: false,
            });
          })
          .catch((error) => {
            console.error("Erreur toggle statut:", error);
            Swal.fire({
              icon: "error",
              title: "Erreur!",
              text:
                "Une erreur s'est produite lors de la modification du statut: " +
                (error.response?.data?.message ||
                  error.message ||
                  "Erreur inconnue"),
              timer: 2000,
              showConfirmButton: false,
            });
          });
      }
    });
  };

  // Ajoutez cette fonction après handleDesassignerCarte dans votre composant
  const handleDesactiverCarte = (id) => {
    if (!id) return;

    Swal.fire({
      title: "Désactiver la carte",
      text: "Êtes-vous sûr de vouloir désactiver la carte RFID de cet utilisateur?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Oui, désactiver",
      cancelButtonText: "Annuler",
    }).then((result) => {
      if (result.isConfirmed) {
        utilisateurService
          .desactiverCarteRFIDParAdmin(id)
          .then(() => {
            // Mettre à jour l'état des utilisateurs
            const updatedUsers = users.map((u) => {
              if ((u.id || u._id) === id) {
                return { ...u, cardActive: false };
              }
              return u;
            });
            setUsers(updatedUsers);

            // Mettre à jour le compteur de cartes assignées
            const cartes = updatedUsers.filter(
              (user) => user.cardActive
            ).length;
            setAssignedCards(cartes);

            Swal.fire({
              icon: "success",
              title: "Désactivée!",
              text: "La carte RFID a été désactivée avec succès.",
              timer: 2000,
              showConfirmButton: false,
            });
          })
          .catch((error) => {
            console.error("Erreur lors de la désactivation:", error);
            Swal.fire({
              icon: "error",
              title: "Erreur!",
              text:
                "Une erreur s'est produite lors de la désactivation: " +
                (error.response?.data?.message ||
                  error.message ||
                  "Erreur inconnue"),
              timer: 2000,
              showConfirmButton: false,
            });
          });
      }
    });
  };

  // Fonction pour réactiver une carte RFID
  const handleReactiverCarte = (id) => {
    if (!id) return;

    Swal.fire({
      title: "Réactiver la carte",
      text: "Êtes-vous sûr de vouloir réactiver la carte RFID de cet utilisateur?",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Oui, réactiver",
      cancelButtonText: "Annuler",
    }).then((result) => {
      if (result.isConfirmed) {
        utilisateurService
          .reactiverCarteRFID(id)
          .then(() => {
            // Mettre à jour l'état des utilisateurs
            const updatedUsers = users.map((u) => {
              if ((u.id || u._id) === id) {
                return { ...u, cardActive: true };
              }
              return u;
            });
            setUsers(updatedUsers);

            // Mettre à jour le compteur de cartes assignées
            const cartes = updatedUsers.filter(
              (user) => user.cardActive
            ).length;
            setAssignedCards(cartes);

            Swal.fire({
              icon: "success",
              title: "Réactivée!",
              text: "La carte RFID a été réactivée avec succès.",
              timer: 2000,
              showConfirmButton: false,
            });
          })
          .catch((error) => {
            console.error("Erreur lors de la réactivation:", error);
            Swal.fire({
              icon: "error",
              title: "Erreur!",
              text:
                "Une erreur s'est produite lors de la réactivation: " +
                (error.response?.data?.message ||
                  error.message ||
                  "Erreur inconnue"),
              timer: 2000,
              showConfirmButton: false,
            });
          });
      }
    });
  };

  // Gestion des modales
  const handleOpenAccessModal = (user) => {
    setSelectedUser(user);
    setAccessModalOpen(true);
  };

  const handleOpenCardModal = () => {
    setAccessModalOpen(false);
    setCardModalOpen(true);
  };

  const handleOpenFingerprintModal = () => {
    setAccessModalOpen(false);
    setFingerprintModalOpen(true);
  };

  const handleCloseModals = () => {
    setAccessModalOpen(false);
    setCardModalOpen(false);
    setFingerprintModalOpen(false);
    setSelectedUser(null);
  };

  // Gestion de carte RFID (désassignation)
  const handleDesassignerCarte = () => {
    if (!selectedUser) return;

    const id = selectedUser.id || selectedUser._id;
    handleCloseModals();

    Swal.fire({
      title: "Êtes-vous sûr?",
      text: `Êtes-vous sûr de vouloir désassigner la carte RFID de cet utilisateur?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Oui, désassignée",
      cancelButtonText: "Annuler",
    }).then((result) => {
      if (result.isConfirmed) {
        utilisateurService
          .desassignerCarteRFID(id)
          .then(() => {
            // Mettre à jour l'utilisateur dans le state
            const updatedUsers = users.map((u) => {
              if ((u.id || u._id) === id) {
                return { ...u, cardActive: false };
              }
              return u;
            });
            setUsers(updatedUsers);

            // Mettre à jour le compteur de cartes assignées
            const cartes = updatedUsers.filter(
              (user) => user.cardActive
            ).length;
            setAssignedCards(cartes);

            Swal.fire({
              icon: "success",
              title: "Désagnisée!",
              text: `La carte RFID a été Désagnisée.`,
              timer: 2000,
              showConfirmButton: false,
            });
          })
          .catch((error) => {
            console.error(`Erreur lors de la désassignation:`, error);
            Swal.fire({
              icon: "error",
              title: "Erreur!",
              text: `Une erreur s'est produite: ${
                error.response?.data?.message ||
                error.message ||
                "Erreur inconnue"
              }`,
              timer: 2000,
              showConfirmButton: false,
            });
          });
      }
    });
  };

  const handleSupprimerEmpreinte = () => {
    if (!selectedUser) return;

    const id = selectedUser.id || selectedUser._id;
    handleCloseModals();

    Swal.fire({
      title: "Êtes-vous sûr?",
      text: `Êtes-vous sûr de vouloir supprimer l'empreinte digitale de cet utilisateur?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Oui, supprimer",
      cancelButtonText: "Annuler",
    }).then((result) => {
      if (result.isConfirmed) {
        utilisateurService
          .desassignerEmpreinte(id)
          .then(() => {
            // Mettre à jour l'utilisateur dans le state
            const updatedUsers = users.map((u) => {
              if ((u.id || u._id) === id) {
                return { ...u, empreinteID: null };
              }
              return u;
            });
            setUsers(updatedUsers);

            Swal.fire({
              icon: "success",
              title: "Supprimée!",
              text: `L'empreinte digitale a été supprimée.`,
              timer: 2000,
              showConfirmButton: false,
            });
          })
          .catch((error) => {
            console.error(`Erreur lors de la suppression:`, error);
            Swal.fire({
              icon: "error",
              title: "Erreur!",
              text: `Une erreur s'est produite: ${
                error.response?.data?.message ||
                error.message ||
                "Erreur inconnue"
              }`,
              timer: 2000,
              showConfirmButton: false,
            });
          });
      }
    });
  };

  // Gestion assignation d'une carte RFID
  const handleAssignCard = () => {
    if (!selectedUser) return;
  };

  // Gestion de l'enregistrement d'empreinte digitale
  const handleSaveFingerprint = () => {
    if (!selectedUser) return;
  };

  // Gérer le changement de page
  const handlePageChange = (page) => {
    console.log("Changement de page vers:", page);
    setCurrentPage(page);
  };

  // Filtrer les utilisateurs selon la recherche, le rôle et le statut
  const filteredUsers = Array.isArray(users)
    ? users.filter((user) => {
        if (!user) return false;

        // Filtre de recherche
        const matchesSearch = searchQuery
          ? (user.nom
              ? user.nom.toLowerCase().includes(searchQuery.toLowerCase())
              : false) ||
            (user.prenom
              ? user.prenom.toLowerCase().includes(searchQuery.toLowerCase())
              : false) ||
            (user.email
              ? user.email.toLowerCase().includes(searchQuery.toLowerCase())
              : false)
          : true;

        // Filtre de rôle
        const matchesRole = filters.role ? user.role === filters.role : true;

        // Filtre de statut
        const matchesStatus = filters.status
          ? filters.status === "actif"
            ? user.actif === true
            : user.actif === false
          : true;

        return matchesSearch && matchesRole && matchesStatus;
      })
    : [];

  // Utilisateurs affichés sur la page actuelle
  const currentUsers = Array.isArray(filteredUsers) ? filteredUsers : [];

  // Utiliser le nombre total de pages du serveur
  const totalPages = serverPagination.pages;
  console.log("Nombre total de pages:", totalPages);

  // Réinitialiser la page actuelle lorsque les filtres changent
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filters]);

  // Générer les boutons de pagination dynamiquement
  const getPaginationButtons = () => {
    const buttons = [];
    console.log(
      "Génération des boutons de pagination. Total pages:",
      totalPages
    );

    // Si pas de pages, retourner un tableau vide
    if (totalPages <= 0) return buttons;

    // Toujours afficher la première page
    buttons.push(1);

    // Logique pour afficher les points de suspension et les pages pertinentes
    if (currentPage > 3) {
      buttons.push("...");
    }

    // Pages autour de la page courante
    for (
      let i = Math.max(2, currentPage - 1);
      i <= Math.min(totalPages - 1, currentPage + 1);
      i++
    ) {
      if (i > 1 && i < totalPages) {
        buttons.push(i);
      }
    }

    // Autre point de suspension si nécessaire
    if (currentPage < totalPages - 2 && totalPages > 3) {
      buttons.push("...");
    }

    // Toujours afficher la dernière page si elle existe et est différente de 1
    if (totalPages > 1) {
      buttons.push(totalPages);
    }

    console.log("Boutons de pagination générés:", buttons);
    return buttons;
  };

  // Formater le texte du bouton de filtre
  const getFilterButtonText = () => {
    if (filters.role === "" && filters.status === "") {
      return "Tous les utilisateurs";
    }

    let text = "";

    // Ajouter le rôle s'il est défini
    if (filters.role === "admin") {
      text += "Administrateurs";
    } else if (filters.role === "utilisateur") {
      text += "Utilisateurs";
    } else {
      text += "Tous";
    }

    // Ajouter le statut s'il est défini
    if (filters.status === "actif") {
      text += " actifs";
    } else if (filters.status === "inactif") {
      text += " inactifs";
    }

    return text;
  };
  return (
    <div className="dashboard1">
      <div className="content-wrapper1">
        <div className="main-content1">
          {/* Cartes de statistiques */}
          <CardStat stats={stats} />

          {/* Liste des utilisateurs */}
          <div className="users-list-container">
            <div className="users-list-header">
              <h2>Liste des utilisateurs</h2>

              <div className="header-buttons">
                {selectedUsers.length >= 2 && (
                  <button
                    className="delete-selected-btn"
                    onClick={() => handleDeleteMultiple(selectedUsers)}
                  >
                    <Trash2 size={16} /> Supprimer sélection (
                    {selectedUsers.length})
                  </button>
                )}
                <button className="create-user-btn" onClick={handleAddUser}>
                  <span>+</span> Créer un Utilisateur
                </button>
              </div>
            </div>

            {/* Search and Filters */}
            <div className="search-filter-container">
              <div className="search-box">
                <input
                  type="text"
                  placeholder="Rechercher..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <button className="search-btn">
                  <Search size={18} />
                </button>
              </div>

              <div className="filter-dropdown-container" ref={filterRef}>
                <button
                  className="filters-btn"
                  onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                >
                  <SlidersHorizontal size={18} />
                  {getFilterButtonText()}
                  <ChevronDown size={16} className="ml-2" />
                </button>

                {showFilterDropdown && (
                  <div className="filter-dropdown">
                    <div
                      className={`filter-option ${
                        filters.role === "" && filters.status === ""
                          ? "active"
                          : ""
                      }`}
                      onClick={() => {
                        setFilters({ role: "", status: "" });
                        setShowFilterDropdown(false);
                      }}
                    >
                      Tous les utilisateurs
                    </div>
                    {/* Combinaisons rôle + statut */}
                    <div
                      className={`filter-option ${
                        filters.role === "admin" && filters.status === "actif"
                          ? "active"
                          : ""
                      }`}
                      onClick={() => {
                        setFilters({ role: "admin", status: "actif" });
                        setShowFilterDropdown(false);
                      }}
                    >
                      Administrateurs actifs
                    </div>
                    <div
                      className={`filter-option ${
                        filters.role === "admin" && filters.status === "inactif"
                          ? "active"
                          : ""
                      }`}
                      onClick={() => {
                        setFilters({ role: "admin", status: "inactif" });
                        setShowFilterDropdown(false);
                      }}
                    >
                      Administrateurs inactifs
                    </div>
                    <div
                      className={`filter-option ${
                        filters.role === "utilisateur" &&
                        filters.status === "actif"
                          ? "active"
                          : ""
                      }`}
                      onClick={() => {
                        setFilters({ role: "utilisateur", status: "actif" });
                        setShowFilterDropdown(false);
                      }}
                    >
                      Utilisateurs actifs
                    </div>
                    <div
                      className={`filter-option ${
                        filters.role === "utilisateur" &&
                        filters.status === "inactif"
                          ? "active"
                          : ""
                      }`}
                      onClick={() => {
                        setFilters({ role: "utilisateur", status: "inactif" });
                        setShowFilterDropdown(false);
                      }}
                    >
                      Utilisateurs inactifs
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Users Table */}
            <div className="users-table-container">
              <table className="users-table">
                <thead>
                  <tr>
                    <th>
                      <input
                        type="checkbox"
                        onChange={handleSelectAll}
                        checked={
                          currentUsers.length > 0 &&
                          selectedUsers.length >= currentUsers.length
                        }
                      />
                    </th>
                    <th>Photo</th>
                    <th>Nom</th>
                    <th>Prénom</th>
                    <th>Téléphone</th>
                    <th>Email</th>
                    <th>Rôle</th>
                    <th>Statut</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {currentUsers.length > 0 ? (
                    currentUsers.map((user) => (
                      <tr key={user.id || user._id}>
                        <td>
                          <input
                            type="checkbox"
                            checked={selectedUsers.includes(
                              user.id || user._id
                            )}
                            onChange={() =>
                              handleSelectUser(user.id || user._id)
                            }
                          />
                        </td>
                        <td>
                          {user.photo ? (
                            <img
                              src={user.photo}
                              alt={`${user.prenom} ${user.nom}`}
                              className="user-photo"
                            />
                          ) : (
                            <div className="user-initials">
                              {user.nom && user.prenom
                                ? `${user.prenom[0]}${user.nom[0]}`
                                : "NU"}
                            </div>
                          )}
                        </td>
                        <td>{user.nom || "-"}</td>
                        <td>{user.prenom || "-"}</td>
                        <td>{user.telephone || "-"}</td>
                        <td>{user.email || "-"}</td>
                        <td>
                          {user.role === "admin"
                            ? "Administrateur"
                            : user.role === "utilisateur"
                            ? "Utilisateur"
                            : user.role || "-"}
                        </td>
                        <td>
                          <label className="switch1">
                            <input
                              type="checkbox"
                              checked={user.actif}
                              onChange={() =>
                                handleToggleStatus(user.id || user._id)
                              }
                            />
                            <span className="slider1"></span>
                          </label>
                        </td>
                        <td className="action-buttons">
                          <button
                            className="buton"
                            title="Supprimer"
                            onClick={() =>
                              handleDeleteUser(user.id || user._id)
                            }
                          >
                            <Trash2 size={18} />
                          </button>
                          <button
                            className="buton"
                            title="Éditer"
                            onClick={() => handleEditUser(user.id || user._id)}
                          >
                            <Pencil size={18} />
                          </button>
                          <button
                            className="buton"
                            title="Contrôle d'accès"
                            onClick={() => handleOpenAccessModal(user)}
                          >
                            <IdCard size={18} />
                          </button>
                          <button
                            className="buton"
                            title={user.cardActive ? "Désactiver carte" : "Activer carte"}
                            onClick={() => user.cardActive 
                              ? handleDesactiverCarte(user.id  user._id) 
                              : handleReactiverCarte(user.id  user._id)
                            }
                          >
                            {user.cardActive ? (
                              <LockKeyholeOpen size={18} />
                            ) : (
                              <LockIcon size={18} />
                            )}
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="9" className="no-results"></td>
                      <td colSpan="9" className="no-results">
                        Aucun utilisateur trouvé
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination - Utilise maintenant les informations de pagination du serveur */}
            {serverPagination.pages > 0 && (
              <div className="pagination">
                <button
                  className="pagination-btn prev"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  <ArrowLeftToLine size={18} />
                  Précédent
                </button>
                <div className="page-numbers">
                  {getPaginationButtons().map((page, index) => (
                    <button
                      key={index}
                      className={`page-number ${
                        currentPage === page ? "active" : ""
                      }`}
                      onClick={() =>
                        typeof page === "number" && handlePageChange(page)
                      }
                    >
                      {page}
                    </button>
                  ))}
                </div>
                <button
                  className="pagination-btn next"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={
                    currentPage === serverPagination.pages ||
                    serverPagination.pages === 0
                  }
                >
                  Suivant
                  <ArrowRightToLine size={18} />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Panel */}
        <MiniRightPanel />
      </div>

      {/* Modales d'accès */}
      {selectedUser && (
        <>
          {/* Modale principale de contrôle d'accès */}
          <AccessControlModal
            isOpen={accessModalOpen}
            onClose={handleCloseModals}
            user={selectedUser}
            onOpenCardModal={handleOpenCardModal}
            onOpenFingerprintModal={handleOpenFingerprintModal}
            onDesassignerCarte={handleDesassignerCarte}
            onSupprimerEmpreinte={handleSupprimerEmpreinte}
          />

          {/* Modale d'assignation de carte */}
          <CardAssignmentModal
            isOpen={cardModalOpen}
            onClose={handleCloseModals}
            user={selectedUser}
            onAssignCard={handleAssignCard}
          />

          {/* Modale d'empreinte digitale */}
          <FingerprintModal
            isOpen={fingerprintModalOpen}
            onClose={handleCloseModals}
            user={selectedUser}
            onSaveFingerprint={handleSaveFingerprint}
          />
        </>
      )}
    </div>
  );
};

export default DashboardListe;
