import { useState } from "react";
import PropTypes from "prop-types";
import { Card, Button, Modal } from "react-bootstrap";
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
import {
  faCalendarAlt,
  faEllipsisV,
  faEdit,
  faTrash,
  faBolt,
} from "@fortawesome/free-solid-svg-icons";
import Swal from "sweetalert2";
import AppareilService from "../../services/AppareilService";
import EditDeviceModal from "./EditDeviceModal"; // ✅ Import du modal d'édition
import ScheduleDeviceModal from "./ScheduleDeviceModal";

const DeviceCard = ({ device, rooms, setRooms, handleModeAllumage,  }) => {
  const [status, setStatus] = useState(device.actif); // Utiliser device.actif directement au lieu de device.status
  const [showModal, setShowModal] = useState(false); // État du modal des options
  const [showEditModal, setShowEditModal] = useState(false); // État du modal d'édition
  const [showScheduleModal, setShowScheduleModal] = useState(false);

  // 🟢 Activer/Désactiver l'appareil
  const handleToggle = async () => {
    try {
      const newStatus = !status; // Inverser le statut
      await AppareilService.activerDesactiverAppareil(device._id, newStatus); // Appel API pour mettre à jour le statut
      setStatus(newStatus); // Met à jour le statut localement
    } catch (error) {
      console.error("Erreur lors de l'activation/désactivation :", error);
      Swal.fire({
        title: "Erreur",
        text: "L'appareil n'a pas pu être activé/désactivé. Essayez à nouveau.",
        icon: "error",
      });
    }
  };

  // 🔴 Suppression avec confirmation
  const handleDeleteClick = async () => {
    Swal.fire({
      title: "Êtes-vous sûr ?",
      text: "Cette action est irréversible !",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#6c757d",
      confirmButtonText: "Oui, supprimer !",
      cancelButtonText: "Annuler",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await AppareilService.supprimerAppareil(device._id);

          // ✅ Mise à jour de l'UI après suppression
          const updatedRooms = rooms.map((room) => ({
            ...room,
            devices: room.devices.filter((d) => d._id !== device._id),
          }));
          setRooms(updatedRooms);

          Swal.fire("Supprimé !", "L'appareil a été supprimé.", "success");
          setShowModal(false);
        } catch (error) {
          console.error("Erreur lors de la suppression :", error);
          Swal.fire("Erreur", "Impossible de supprimer l'appareil.", "error");
        }
      }
    });
  };

  // 🟡 Récupérer l'icône de l'appareil en fonction de son nom
  const getDeviceIcon = (nom_app) => {
    const devices = [
      { keywords: ["télévision", "télé", "tv"], icon: <Tv size={24} /> },
      {
        keywords: ["ordinateur", "ordi", "computer"],
        icon: <Computer size={24} />,
      },
      { keywords: ["ventilateur", "ventilo", "fan"], icon: <Fan size={24} /> },
      { keywords: ["lampe", "light"], icon: <Lightbulb size={24} /> },
      { keywords: ["climatiseur", "clime"], icon: <AirVent size={24} /> },
      {
        keywords: ["lave-linge", "machine à laver", "lavage"],
        icon: <WashingMachine size={24} />,
      },
      { keywords: ["micro-ondes", "four"], icon: <Heater size={24} /> },
    ];

    const nom_normalise = nom_app.toLowerCase();
    for (let device of devices) {
      if (device.keywords.some((keyword) => nom_normalise.includes(keyword))) {
        return device.icon;
      }
    }
    return <Lightbulb size={24} />;
  };

  return (
    <>
      {/* 📌 Carte de l'appareil */}
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
                  checked={status} // Bind le switch à l'état 'actif' ou 'inactif'
                  onChange={handleToggle} // Lors de l'activation/désactivation, on appelle la fonction handleToggle
                />
              </div>
              <Button
                variant="light"
                size="sm"
                className="device-btn"
                onClick={() => setShowScheduleModal(true)}
              >
                <FontAwesomeIcon
                  icon={faCalendarAlt}
                  className="text-secondary"
                />
              </Button>

              <Button
                variant="light"
                size="sm"
                className="device-btn"
                onClick={() => setShowModal(true)}
              >
                <FontAwesomeIcon
                  icon={faEllipsisV}
                  className="text-secondary"
                />
              </Button>
            </div>
          </div>
          <p className="device-name">{device.nom_app}</p>
          <p className="device-conso">
            Conso:{" "}
            <span className="text-warning">{device.conso || "0 kWh"}</span>
          </p>
        </Card.Body>
      </Card>

      {/* 📌 Modal des options */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Options pour {device.nom_app}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Vous avez trois options pour cet appareil :</p>
          <Button
            variant="primary"
            className="w-100 mb-2"
            onClick={() => {
              setShowEditModal(true);
              setShowModal(false);
            }}
          >
            <FontAwesomeIcon icon={faEdit} className="me-2" /> Modifier
          </Button>

          <Button
            variant="danger"
            className="w-100 mb-2"
            onClick={handleDeleteClick}
          >
            <FontAwesomeIcon icon={faTrash} className="me-2" /> Supprimer
          </Button>
          <Button
            variant="warning"
            className="w-100"
            onClick={() => {
              handleModeAllumage(device._id);
              setShowModal(false);
            }}
          >
            <FontAwesomeIcon icon={faBolt} className="me-2" /> Définir un mode
            de fonctionnement
          </Button>
        </Modal.Body>
      </Modal>

      <ScheduleDeviceModal
        show={showScheduleModal}
        handleClose={() => setShowScheduleModal(false)}
        device={device}
      />

      {/* 📌 Modal de modification */}
      <EditDeviceModal
        show={showEditModal}
        handleClose={() => setShowEditModal(false)}
        device={device}
        rooms={rooms}
        setRooms={setRooms} // ✅ Bien passé ici
      />
    </>
  );
};

DeviceCard.propTypes = {
  device: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    nom_app: PropTypes.string.isRequired,
    conso: PropTypes.string,
    status: PropTypes.string.isRequired,
    icon: PropTypes.string.isRequired,
    keywords: PropTypes.string.isRequired,
    actif: PropTypes.string.isRequired,
  }).isRequired,
  rooms: PropTypes.array.isRequired,
  setRooms: PropTypes.func.isRequired,
  handleModeAllumage: PropTypes.func.isRequired,
};

export default DeviceCard;
