import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { 
  Pencil, 
  Trash2, 
  IdCard, 
  LockKeyholeOpen, 
  Search, 
  SlidersHorizontal,
  ArrowLeftToLine, 
  ArrowRightToLine,
  ChevronDown
} from 'lucide-react';
import '../styles/dashboard-liste.css';
import MiniRightPanel from '../components/MiniRightPanel';
import CardStat from '../components/CardStat';
import CardModal from '../components/CardModal'; // Importez le composant modal

const DashboardListe = () => {
  const navigate = useNavigate();

  // États pour les données des utilisateurs et la pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [roleFilter, setRoleFilter] = useState('');
  
  // État pour le modal d'assignation de carte
  const [cardModalOpen, setCardModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  
  const filterRef = useRef(null);

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
  
  // Données fictives pour les statistiques
  const stats = [
    { title: 'Utilisateurs Totales', value: 6, icon: 'users' },
    { title: 'Utilisateurs Actifs', value: 3, icon: 'user' },
    { title: 'Cartes Assignées', value: 3, icon: 'device' }
  ];
  
  // Données fictives pour les utilisateurs
  const [users] = useState([
    { 
      id: 1, 
      initials: 'CW', 
      photo: 'avatar.png', 
      nom: 'Fallou', 
      prenom: 'Thiam', 
      role: 'Utilisateur',
      telephone: '77 123 45 67', 
      email: 'fallou@unitiledu.com', 
      status: 'actif' 
    },
    { 
      id: 2, 
      initials: 'HH', 
      photo: 'avatar.png', 
      nom: 'Hinata', 
      prenom: 'Hyuga', 
      role: 'Utilisateur', 
      telephone: '77 123 45 67', 
      email: 'natali@unitiledu.com', 
      status: 'actif' 
    },
    { 
      id: 3, 
      initials: 'OD', 
      photo: 'avatar.png', 
      nom: 'Lahate', 
      prenom: 'Thiam', 
      role: 'Utilisateur',
      telephone: '77 123 45 67', 
      email: 'draw@unitiledu.com', 
      status: 'actif' 
    },
    { 
      id: 4, 
      initials: 'OT', 
      photo: 'avatar.png', 
      nom: 'Ousmame', 
      prenom: 'Thiam', 
      role: 'Utilisateur',
      telephone: '77 123 45 67', 
      email: 'andi@unitiledu.com', 
      status: 'inactif' 
    },
    { 
      id: 5, 
      initials: 'ST', 
      photo: 'avatar.png', 
      nom: 'Serigne', 
      prenom: 'Thiam', 
      role: 'Admin',
      telephone: '77 123 45 67', 
      email: 'andi@unitiledu.com', 
      status: 'inactif' 
    },
    { 
      id: 6, 
      initials: 'AL', 
      photo: 'avatar.png', 
      nom: 'Andi Lane', 
      prenom: 'Thiem', 
      role: 'Admin',
      telephone: '77 123 45 67', 
      email: 'andi@unitiledu.com', 
      status: 'inactif' 
    }
  ]);

  // Gérer la sélection/désélection de tous les utilisateurs
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedUsers(currentUsers.map(user => user.id));
    } else {
      setSelectedUsers([]);
    }
  };

  // Gestion de la redirection vers la page d'ajout d'utilisateur
  const handleAddUser = () => {
    navigate('/ajouter-utilisateur');
  };
  
  // Gestion de la redirection vers la page de modification d'utilisateur
  const handleEditUser = (id) => {
    navigate(`/modifier-utilisateur/${id}`);
  };

  // Gestion de la suppression d'un utilisateur avec sweetalert
  const handleDeleteUser = (id) => {
    Swal.fire({
      title: 'Êtes-vous sûr?',
      text: "Êtes-vous sûr de vouloir supprimer cet utilisateur?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Oui, supprimez!',
      cancelButtonText: 'Annuler',
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire({
            icon: 'success',
            title: 'Modifié!',
            text: 'L\'utilisateur a été modifiée.',
            timer: 2000, // 2 secondes
            showConfirmButton: false
        });
      }
    });
  };

  // Gestion active/inactive d'un utilisateur à partir du bouton status
  const handleToggleStatus = (id) => {
    Swal.fire({
      title: 'Êtes-vous sûr?',
      text: "Êtes-vous sûr de vouloir activer/désactiver cet utilisateur?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Oui, activer/désactiver',
      cancelButtonText: 'Annuler',
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire({
            icon: 'success',
            title: 'Modifié!',
            text: 'L\'utilisateur a été modifiée.',
            timer: 2000, // 2 secondes
            showConfirmButton: false
         });
      }
    });
  };

  // Ouvrir le modal d'assignation de carte
  const handleOpenCardModal = (user) => {
    setSelectedUser(user);
    setCardModalOpen(true);
  };
  
  // Fermer le modal d'assignation de carte
  const handleCloseCardModal = () => {
    setCardModalOpen(false);
    setSelectedUser(null);
  };

  // Gestion désactivé/activé la carte RFID d'un utilisateur
  const handleToggleCard = (id) => {
    Swal.fire({
      title: 'Êtes-vous sûr?',
      text: "Êtes-vous sûr de vouloir activer/désactiver la carte RFID de cet utilisateur?",  
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Oui, activer/désactiver',      
      cancelButtonText: 'Annuler',
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire({
          icon: 'success',
          title: 'Modifié!',
          text: 'La carte RFID de l\'utilisateur a été modifiée.',
          timer: 2000, // 2 secondes
          showConfirmButton: false
       });
      }
    });
  };

  // Gestion assigner une carte RFID à un utilisateur
  const handleAssignCard = (id) => {
    handleCloseCardModal(); // Fermer le modal
    
    Swal.fire({
        title: 'Assigner une carte RFID',
        text: "Veuillez placer la carte RFID sur le lecteur",
        icon: 'info',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Assigner',
        cancelButtonText: 'Annuler',
      }).then((result) => {
        if (result.isConfirmed) {
          // Afficher une alerte de chargement pendant 3 secondes
          Swal.fire({
            title: 'Lecture de la carte en cours...',
            text: 'Veuillez patienter',
            timer: 3000, // 3 secondes
            timerProgressBar: true,
            didOpen: () => {
              Swal.showLoading();
            }
          }).then(() => {
            // Après 3 secondes, afficher le message de succès
            Swal.fire({
              icon: 'success',
              title: 'Assigné!',
              text: 'La carte RFID a été assignée.',
              timer: 2000, // 2 secondes
              showConfirmButton: false
            });
          });
        }
      });
    };

  // Gestion enregistrer une empreinte digitale pour un utilisateur
  const handleSaveFingerprint = (id) => {
    handleCloseCardModal(); // Fermer le modal
    
    Swal.fire({
        title: 'Enregistrer une empreinte digitale',
        text: "Veuillez placer votre doigt sur le capteur d'empreintes digitales",
        icon: 'info',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Enregistrer',
        cancelButtonText: 'Annuler',
      }).then((result) => {
        if (result.isConfirmed) {
          // Afficher une alerte de chargement pendant 3 secondes
          Swal.fire({
            title: 'Lecture de l\'empreinte en cours...',
            text: 'Veuillez maintenir votre doigt sur le capteur',
            timer: 3000, // 3 secondes
            timerProgressBar: true,
            didOpen: () => {
              Swal.showLoading();
            }
          }).then(() => {
            // Après 3 secondes, afficher le message de succès pendant 2 secondes
            Swal.fire({
              icon: 'success',
              title: 'Enregistré!',
              text: 'L\'empreinte digitale a été enregistrée.',
              timer: 2000, // 2 secondes
              showConfirmButton: false
            });
          });
        }
      });
    };


  // Gérer la sélection/désélection d'un utilisateur
  const handleSelectUser = (userId) => {
    if (selectedUsers.includes(userId)) {
      setSelectedUsers(selectedUsers.filter(id => id !== userId));
    } else {
      setSelectedUsers([...selectedUsers, userId]);
    }
  };

  // Gérer le changement de page
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // Filtrer les utilisateurs selon la recherche et le rôle
  const filteredUsers = users.filter(user => {
    // Filtre de recherche
    const matchesSearch = 
      user.nom.toLowerCase().includes(searchQuery.toLowerCase()) || 
      user.prenom.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Filtre de rôle
    const matchesRole = roleFilter ? user.role === roleFilter : true;
    
    return matchesSearch && matchesRole;
  });

  // Calculer l'index de début et de fin pour les utilisateurs à afficher
  const indexOfLastUser = currentPage * itemsPerPage;
  const indexOfFirstUser = indexOfLastUser - itemsPerPage;
  
  // Utilisateurs affichés sur la page actuelle
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);

  // Calculer le nombre total de pages
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);

  // Réinitialiser la page actuelle lorsque les filtres changent
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, roleFilter]);

  // Générer les boutons de pagination dynamiquement
  const getPaginationButtons = () => {
    const buttons = [];
    
    // Toujours afficher la première page
    buttons.push(1);
    
    // Logique pour afficher les points de suspension et les pages pertinentes
    if (currentPage > 3) {
      buttons.push('...');
    }
    
    // Pages autour de la page courante
    for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
      buttons.push(i);
    }
    
    // Autre point de suspension si nécessaire
    if (currentPage < totalPages - 2 && totalPages > 3) {
      buttons.push('...');
    }
    
    // Toujours afficher la dernière page si elle existe et est différente de 1
    if (totalPages > 1) {
      buttons.push(totalPages);
    }
    
    return buttons;
  };

  // Formater le texte du bouton de filtre
  const getFilterButtonText = () => {
    if (roleFilter === '') {
      return 'Tous les rôles';
    }
    return `Rôle: ${roleFilter}`;
  };

  return (
    <div className="dashboard">
      <div className="content-wrapper">
        <div className="main-content">
          {/* Cartes de statistiques */}
          <CardStat stats={stats} />

          {/* Liste des utilisateurs */}
          <div className="users-list-container">
            <div className="users-list-header">
              <h2>Liste des utilisateurs</h2>
              <button className="create-user-btn" onClick={handleAddUser}>
                <span>+</span> Créer un Utilisateur 
              </button>
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
                      className={`filter-option ${roleFilter === '' ? 'active' : ''}`}
                      onClick={() => {
                        setRoleFilter('');
                        setShowFilterDropdown(false);
                      }}
                    >
                      Tous les rôles
                    </div>
                    <div 
                      className={`filter-option ${roleFilter === 'Admin' ? 'active' : ''}`}
                      onClick={() => {
                        setRoleFilter('Admin');
                        setShowFilterDropdown(false);
                      }}
                    >
                      Admin
                    </div>
                    <div 
                      className={`filter-option ${roleFilter === 'Utilisateur' ? 'active' : ''}`}
                      onClick={() => {
                        setRoleFilter('Utilisateur');
                        setShowFilterDropdown(false);
                      }}
                    >
                      Utilisateur
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
                        checked={currentUsers.length > 0 && selectedUsers.length >= currentUsers.length}
                      />
                    </th>
                    <th>Photo</th>
                    <th>Nom</th>
                    <th>Prénom</th>
                    <th>Téléphone</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Statut</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {currentUsers.length > 0 ? (
                    currentUsers.map(user => (
                      <tr key={user.id}>
                        <td>
                          <input 
                            type="checkbox" 
                            checked={selectedUsers.includes(user.id)}
                            onChange={() => handleSelectUser(user.id)}
                          />
                        </td>
                        <td>
                          {user.photo ? (
                            <img src={user.photo} alt={`${user.prenom} ${user.nom}`} className="user-photo" />
                          ) : (
                            <div className="user-initials">{user.initials}</div>
                          )}
                        </td>
                        <td>{user.nom}</td>
                        <td>{user.prenom}</td>
                        <td>{user.telephone}</td>
                        <td>{user.email}</td>
                        <td>{user.role}</td>
                        <td>
                          <span className={`status-badge ${user.status}`} onClick={() => handleToggleStatus(user.id)}>
                            {user.status === 'actif' ? 'Actif' : 'Inactif' }
                          </span>
                        </td>
                        <td className="action-buttons">
                          <button className="buton" title="Supprimer" onClick={() => handleDeleteUser(user.id)}>
                            <Trash2 size={18} />
                          </button>
                          <button className="buton" title="Éditer" onClick={() => handleEditUser(user.id)}>
                            <Pencil size={18} />
                          </button>
                          <button className="buton" title="Carte" onClick={() => handleOpenCardModal(user)}>
                            <IdCard size={18} />
                          </button>
                          <button className="buton" title="Déverrouiller" onClick={() => handleToggleCard(user.id)}>
                            <LockKeyholeOpen size={18} />
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="9" className="no-results">
                        Aucun utilisateur trouvé
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {filteredUsers.length > 0 && (
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
                      className={`page-number ${currentPage === page ? 'active' : ''}`}
                      onClick={() => typeof page === 'number' && handlePageChange(page)}
                    >
                      {page}
                    </button>
                  ))}
                </div>
                <button 
                  className="pagination-btn next" 
                  onClick={() => handlePageChange(currentPage + 1)} 
                  disabled={currentPage === totalPages}
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
      
      {/* Modal pour l'assignation de carte */}
      {selectedUser && (
        <CardModal 
          isOpen={cardModalOpen}
          onClose={handleCloseCardModal}
          user={selectedUser}
          onAssignCard={handleAssignCard}
          onRegisterFingerprint={handleSaveFingerprint}
        />
      )}
    </div>
  );
};


export default DashboardListe;