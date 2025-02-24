import { useState } from 'react';
import '../styles/dashboard.css';
import '../styles/dashboard-liste.css'; // Vous devrez créer ce fichier CSS
import MiniRightPanel from '../components/MiniRightPanel';

const DashboardListe = () => {
  // États pour les données des utilisateurs et la pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUsers, setSelectedUsers] = useState([]);
  
  // Données fictives pour les statistiques
  const stats = [
    { title: 'Utilisateurs Totales', value: 9, icon: 'users' },
    { title: 'Utilisateurs Actifs', value: 6, icon: 'user' },
    { title: 'Boîtes Assignés', value: 3, icon: 'device' }
  ];
  
  // Données fictives pour les utilisateurs
  const [users] = useState([
    { 
      id: 1, 
      initials: 'CW', 
      photo: null, 
      nom: 'Fallou', 
      prenom: 'Thiam', 
      telephone: '77 123 45 67', 
      email: 'fallou@unitiledu.com', 
      status: 'actif' 
    },
    { 
      id: 2, 
      initials: '', 
      photo: '/assets/profile-1.jpg', 
      nom: 'Hinata', 
      prenom: 'Hyuga', 
      telephone: '77 123 45 67', 
      email: 'natali@unitiledu.com', 
      status: 'actif' 
    },
    { 
      id: 3, 
      initials: 'OD', 
      photo: null, 
      nom: 'Lahate', 
      prenom: 'Thiem', 
      telephone: '77 123 45 67', 
      email: 'draw@unitiledu.com', 
      status: 'actif' 
    },
    { 
      id: 4, 
      initials: '', 
      photo: '/assets/profile-2.jpg', 
      nom: 'Oumame', 
      prenom: 'Thiem', 
      telephone: '77 123 45 67', 
      email: 'andi@unitiledu.com', 
      status: 'inactif' 
    },
    { 
      id: 5, 
      initials: '', 
      photo: '/assets/profile-3.jpg', 
      nom: 'Serigne', 
      prenom: 'Thiem', 
      telephone: '77 123 45 67', 
      email: 'andi@unitiledu.com', 
      status: 'inactif' 
    },
    { 
      id: 6, 
      initials: 'AL', 
      photo: null, 
      nom: 'Andi Lane', 
      prenom: 'Thiem', 
      telephone: '77 123 45 67', 
      email: 'andi@unitiledu.com', 
      status: 'inactif' 
    }
  ]);

  // Gérer la sélection/désélection de tous les utilisateurs
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedUsers(users.map(user => user.id));
    } else {
      setSelectedUsers([]);
    }
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

  // Générer les numéros de page pour la pagination
  const pages = [1, 2, 3, '...', 8, 9, 10];

  // Filtrer les utilisateurs selon la recherche
  const filteredUsers = users.filter(user => 
    user.nom.toLowerCase().includes(searchQuery.toLowerCase()) || 
    user.prenom.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Rendu des icônes pour les statistiques
  const renderIcon = (iconType) => {
    switch(iconType) {
      case 'users':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
        );
      case 'user':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
        );
      case 'device':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
            <line x1="8" y1="21" x2="16" y2="21" />
            <line x1="12" y1="17" x2="12" y2="21" />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <div className="dashboard">
      {/* Welcome Section */}
      {/* <div className="welcome-section">
        <div className="user-profile">
          <div className="user-info">
            <h1>Bonjour Bamba !</h1>
            <p>Administrateur</p>
          </div>
        </div>
      </div> */}

      <div className="content-wrapper">
        <div className="main-content">
          {/* Stats Cards */}
          <div className="stats-cards">
            {stats.map((stat, index) => (
              <div className="stat-card" key={index}>
                <div className="stat-icon">
                  {renderIcon(stat.icon)}
                </div>
                <div className="stat-info">
                  <p className="stat-title">{stat.title}</p>
                  <h2 className="stat-value">{stat.value}</h2>
                </div>
              </div>
            ))}
          </div>

          {/* Liste des utilisateurs */}
          <div className="users-list-container">
            <div className="users-list-header">
              <h2>Liste des utilisateurs</h2>
              <button className="create-user-btn">
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
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                </button>
              </div>
              <button className="filters-btn">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="4" y1="21" x2="4" y2="14" />
                  <line x1="4" y1="10" x2="4" y2="3" />
                  <line x1="12" y1="21" x2="12" y2="12" />
                  <line x1="12" y1="8" x2="12" y2="3" />
                  <line x1="20" y1="21" x2="20" y2="16" />
                  <line x1="20" y1="12" x2="20" y2="3" />
                  <line x1="1" y1="14" x2="7" y2="14" />
                  <line x1="9" y1="8" x2="15" y2="8" />
                  <line x1="17" y1="16" x2="23" y2="16" />
                </svg>
                Filtres
              </button>
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
                        checked={selectedUsers.length === users.length && users.length > 0}
                      />
                    </th>
                    <th>Photo</th>
                    <th>Nom</th>
                    <th>Prénom</th>
                    <th>Téléphone</th>
                    <th>Email</th>
                    <th>Statut</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map(user => (
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
                      <td>
                        <span className={`status-badge ${user.status}`}>
                          {user.status === 'actif' ? 'Actif' : 'Inactif'}
                        </span>
                      </td>
                      <td className="action-buttons">
                        <button className="action-btn delete-btn" title="Supprimer">
                          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="3 6 5 6 21 6" />
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                          </svg>
                        </button>
                        <button className="action-btn edit-btn" title="Éditer">
                          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                          </svg>
                        </button>
                        <button className="action-btn message-btn" title="Message">
                          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                            <polyline points="22,6 12,13 2,6" />
                          </svg>
                        </button>
                        <button className="action-btn lock-btn" title="Verrouiller">
                          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                          </svg>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="pagination">
              <button className="pagination-btn prev" onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="15 18 9 12 15 6" />
                </svg>
                Précédent
              </button>
              <div className="page-numbers">
                {pages.map((page, index) => (
                  <button 
                    key={index}
                    className={`page-number ${currentPage === page ? 'active' : ''}`}
                    onClick={() => typeof page === 'number' && handlePageChange(page)}
                  >
                    {page}
                  </button>
                ))}
              </div>
              <button className="pagination-btn next" onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === 10}>
                Suivant
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Right Panel */}
        <MiniRightPanel />
      </div>
    </div>
  );
};

export default DashboardListe;