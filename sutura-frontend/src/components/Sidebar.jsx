// src/components/Sidebar.jsx
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, Grid, Clock, Users, LogOut } from 'lucide-react';
import '../styles/sidebar.css';

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    navigate('/login');
  };

  return (
    <div className="sidebar">
      {/* Logo */}
      <div className="sidebar-logo">
        <div className="logo-container">
          <img src="/Sutura_Energie.png"  className="logo-img" />
        </div>
      </div>

      {/* Navigation Items */}
      <nav className="sidebar-nav">
        <Link 
          to="/dashboard" 
          className={`nav-item ${location.pathname === '/dashboard' ? 'active' : ''}`}
        >
          <Home size={24} />
          <span className="nav-text">Dashboard</span>
        </Link>

        <Link 
          to="/appareils" 
          className={`nav-item ${location.pathname === '/appareils' ? 'active' : ''}`}
        >
          <Grid size={24} />
          <span className="nav-text">Appareils</span>
        </Link>

        <Link 
          to="/historiques" 
          className={`nav-item ${location.pathname === '/historiques' ? 'active' : ''}`}
        >
          <Clock size={24} />
          <span className="nav-text">Historiques</span>
        </Link>

        <Link 
          to="/utilisateurs" 
          className={`nav-item ${location.pathname === '/utilisateurs' ? 'active' : ''}`}
        >
          <Users size={24} />
          <span className="nav-text">Utilisateurs</span>
        </Link>
      </nav>

      {/* Déconnexion */}
      <div className="sidebar-footer">
        <button className="deconnexion-btn" onClick={handleLogout}>
          <LogOut size={24} />
          <span className="nav-text">Déconnexion</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;