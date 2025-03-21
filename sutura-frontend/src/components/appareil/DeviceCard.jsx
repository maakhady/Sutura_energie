import { useEffect, useState } from "react";
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
import { EnergieService } from "../../services/EnergieService";
import EditDeviceModal from "./EditDeviceModal"; // ✅ Import du modal d'édition
import ScheduleDeviceModal from "./ScheduleDeviceModal";

const DeviceCard = ({ device, rooms, setRooms }) => {
  const [showModal, setShowModal] = useState(false); // État du modal des options
  const [showEditModal, setShowEditModal] = useState(false); // État du modal d'édition
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [consommation, setConsommation] = useState(device.conso || "0 kWh");

  // 🟢 Activer/Désactiver l'appareil
  const handleToggle = async () => {
    try {
      if (device.automatique) {
        Swal.fire({
          title: "Action impossible",
          text: "Impossible d'activer/désactiver l'appareil manuellement, car il est en mode automatique.",
          icon: "warning",
          timer: 2000,
        });
        return; // ❌ Empêche l'exécution du reste du code
      }

      const newStatus = !device.actif; // ⚡ Inverser l’état de l’appareil
      await AppareilService.activerDesactiverAppareil(device._id, newStatus); // API call

      // ✅ Met à jour la liste des pièces et appareils
      setRooms((prevRooms) =>
        prevRooms.map((room) => ({
          ...room,
          devices: room.devices.map((d) =>
            d._id === device._id
              ? { ...d, actif: newStatus, isOn: newStatus }
              : d
          ),
        }))
      );
    } catch (error) {
      console.error("Erreur lors de l'activation/désactivation :", error);
      Swal.fire({
        title: "Erreur",
        text: "L'appareil n'a pas pu être activé/désactivé. Essayez à nouveau.",
        icon: "error",
        timer: 1000,
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

          Swal.fire({
            title: "Supprimé !",
            text: "L'appareil a été supprimé.",
            icon: "success",
            timer: 700,
          });

          setShowModal(false);
        } catch (error) {
          console.error("Erreur lors de la suppression :", error);
          Swal.fire("Erreur", "Impossible de supprimer l'appareil.", "error");
        }
      }
    });
  };

  const handleModeAllumage = async (deviceId, automatique) => {
    const newMode = !automatique; // On inverse l'état actuel

    const result = await Swal.fire({
      title: `Voulez-vous ${
        newMode ? "activer" : "désactiver"
      } le mode automatique ?`,
      text: `L'appareil passera en mode ${newMode ? "automatique" : "manuel"}.`,
      icon: "question",

      showCancelButton: true,
      confirmButtonText: newMode ? "Oui, activer" : "Oui, désactiver",

      cancelButtonText: "Annuler",
    });

    if (result.isConfirmed) {
      try {
        const response = await AppareilService.definirMode(deviceId, newMode);

        if (response) {
          //  Mise à jour immédiate du state
          setRooms((prevRooms) =>
            prevRooms.map((room) => ({
              ...room,
              devices: room.devices.map((device) =>
                device._id === deviceId
                  ? { ...device, automatique: newMode }
                  : device
              ),
            }))
          );

          Swal.fire({
            title: "Succès",
            text: `Le mode automatique a été ${
              newMode ? "activé" : "désactivé"
            } avec succès.`,
            timer: 700,
            icon: "success",
          });
        }
      } catch (error) {
        console.error("Erreur lors de la modification du mode :", error);
        Swal.fire(
          "Erreur",
          "Impossible de changer le mode automatique.",
          "error"
        );
      }
    }
  };

  //  Récupérer l'icône de l'appareil en fonction de son nom
  const getDeviceIcon = (nom_app) => {
    const devices = [
      { keywords: ["télévision", "télé", "tv"], icon: <Tv size={24} /> },
      {
        keywords: ["ordinateur", "ordi", "computer"],
        icon: <Computer size={24} />,
      },
      { keywords: ["ventilateur", "ventilo", "fan"], icon: <Fan size={24} /> },
      { keywords: ["lampe", "light"], icon: <Lightbulb size={24} /> },
      {
        keywords: ["climatiseur", "clime", "clim"],
        icon: <AirVent size={24} />,
      },
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

  useEffect(() => {
    const handleUpdateConso = (data) => {
      if (data.app_id === device._id) {
        setConsommation(`${data.consom_energie.toFixed(3)} kWh`);
      }
    };

    EnergieService.onUpdateConsommationAppareil(handleUpdateConso);

    return () => {
      EnergieService.stopListening();
    };
  }, [device._id]); // ✅ Ajout de 'device._id' dans les dépendances

  return (
    <>
      {/*  Carte de l'appareil */}
      <Card
        className={`device-card ${device.actif ? "device-on" : "device-off"}`}
      >
        <Card.Body className="device-card-body">
          <div className="device-header">
            <div
              className={`device-icon ${device.actif ? "icon-on" : "icon-off"}`}
            >
              {getDeviceIcon(device.nom_app)}
            </div>
            <div className="device-controls">
              <div className="form-check form-switch me-1">
                <input
                  className="form-check-input"
                  type="checkbox"
                  role="switch"
                  checked={device.actif}
                  onChange={handleToggle}
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
            Conso: <span className="text-warning">{consommation}</span>
          </p>
        </Card.Body>
      </Card>

      {/*  Modal des options */}
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
              handleModeAllumage(device._id, device.automatique);
              setShowModal(false);
            }}
          >
            <FontAwesomeIcon icon={faBolt} className="me-2" /> Mode Automatique
          </Button>
        </Modal.Body>
      </Modal>

      <ScheduleDeviceModal
        show={showScheduleModal}
        handleClose={() => setShowScheduleModal(false)}
        device={device}
      />

      {/*  Modal de modification */}
      <EditDeviceModal
        show={showEditModal}
        handleClose={() => setShowEditModal(false)}
        device={device}
        rooms={rooms}
        setRooms={setRooms}
      />
    </>
  );
};

DeviceCard.propTypes = {
  device: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    nom_app: PropTypes.string.isRequired,
    conso: PropTypes.string,
    automatique: PropTypes.string.isRequired,
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
