import { Users, User, Monitor } from 'lucide-react';
import '../styles/CardStat.css';

const CardStat = ({ stats }) => {
  // Rendu des icônes pour les statistiques
  const renderIcon = (iconType) => {
    switch(iconType) {
      case 'users':
        return <Users size={24} />;
      case 'user':
        return <User size={24} />;
      case 'device':
        return <Monitor size={24} />;
      default:
        return null;
    }
  };

  return (
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
  );
};

export default CardStat;