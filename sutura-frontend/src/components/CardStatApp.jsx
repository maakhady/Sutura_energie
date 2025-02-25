import { Lightbulb, Tv, Cog } from "lucide-react";

const CardStatApp = ({ stats }) => {
  // Rendu des icônes pour les statistiques
  const renderIcon = (iconType) => {
    switch (iconType) {
      case "light":
        return <Lightbulb size={24} />;
      case "tv":
        return <Tv size={24} />;
      case "device":
        return <Cog size={24} />;
      default:
        return null;
    }
  };

  return (
    <div className="stats-cards">
      {stats.map((stat, index) => (
        <div className="stat-card" key={index}>
          <div className="stat-icon">{renderIcon(stat.icon)}</div>
          <div className="stat-info">
            <p className="stat-title">{stat.title}</p>
            <h2 className="stat-value">{stat.value}</h2>
          </div>
        </div>
      ))}
    </div>
  );
};

export default CardStatApp;
