import { useState } from "react";
import PropTypes from "prop-types";
import { Card, Button } from "react-bootstrap";
import {
  Lightbulb,
  Tv,
  Computer,
  Fan,
  AirVent,
  WashingMachine,
  Heater,
} from "lucide-react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCalendarAlt, faEllipsisV } from "@fortawesome/free-solid-svg-icons";
import AppareilService from "../../services/AppareilService";

const DeviceCard = ({ device }) => {
  const [status, setStatus] = useState(device.status === "on"); // État local

  // Fonction pour activer/désactiver l'appareil
  const handleToggle = async () => {
    try {
      const newStatus = !status; // Inverse l'état actuel
      await AppareilService.activerDesactiverAppareil(device._id); // Appel API
      setStatus(newStatus); // Met à jour l'état après succès
    } catch (error) {
      console.error("Erreur lors de l'activation/désactivation :", error);
    }
  };

  const getDeviceIcon = (nom_app) => {
    switch (nom_app.toLowerCase()) {
      case "télévision":
      case "tv":
        return <Tv size={24} />;
      case "ordinateur":
      case "computer":
        return <Computer size={24} />;
      case "ventilateur":
      case "fan":
        return <Fan size={24} />;
      case "lampe":
      case "light":
        return <Lightbulb size={24} />;
      case "climatiseur":
      case "clime":
        return <AirVent size={24} />;
      case "lave-linge":
      case "machine à laver":
        return <WashingMachine size={24} />;
      case "micro-ondes":
      case "four":
        return <Heater size={24} />;
      default:
        return <Lightbulb size={24} />;
    }
  };

  return (
    <Card className={`device-card ${status ? "device-on" : "device-off"}`}>
      <Card.Body className="device-card-body">
        <div className="device-header">
          <div className={`device-icon ${status ? "icon-on" : "icon-off"}`}>
            {getDeviceIcon(device.nom_app)}
          </div>
          <div className="device-controls">
            <div className="form-check form-switch me-1">
              <input
                className="form-check-input"
                type="checkbox"
                role="switch"
                checked={status}
                onChange={handleToggle} // 🔥 Appel de la fonction
              />
            </div>
            <Button variant="light" size="sm" className="device-btn">
              <FontAwesomeIcon
                icon={faCalendarAlt}
                className="text-secondary"
              />
            </Button>
            <Button variant="light" size="sm" className="device-btn">
              <FontAwesomeIcon icon={faEllipsisV} className="text-secondary" />
            </Button>
          </div>
        </div>
        <p className="device-name">{device.nom_app}</p>
        <p className="device-conso">
          Conso: <span className="text-warning">{device.conso || "0 kWh"}</span>
        </p>
      </Card.Body>
    </Card>
  );
};

DeviceCard.propTypes = {
  device: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    nom_app: PropTypes.string.isRequired,
    conso: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired,
    status: PropTypes.string.isRequired,
  }).isRequired,
};

export default DeviceCard;
