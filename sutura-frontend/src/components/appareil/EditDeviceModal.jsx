import { useState } from "react";
import PropTypes from "prop-types";
import { Modal, Form, Button } from "react-bootstrap";
import Swal from "sweetalert2";
import AppareilService from "../../services/AppareilService";

const EditDeviceModal = ({
  show,
  handleClose,
  device,
  rooms = [],
  setRooms,
}) => {
  const [deviceName, setDeviceName] = useState(device?.nom_app || "");
  const [loading, setLoading] = useState(false);

  console.log("DeviceCard rendu avec:", device.nom_app);

  // ✅ Empêcher l'erreur si `rooms` est undefined
  if (!rooms) {
    console.error("⚠️ rooms est undefined dans EditDeviceModal");
    return null;
  }

  // 🛠️ Fonction de modification
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const updatedDevice = await AppareilService.modifierAppareil(device._id, {
        nom_app: deviceName,
      });

      // Vérification si setRooms est une fonction
      if (typeof setRooms === "function") {
        const updatedRooms = rooms.map((room) => ({
          ...room,
          devices: room.devices.map((d) =>
            d._id === device._id ? { ...d, nom_app: updatedDevice.nom_app } : d
          ),
        }));
        setRooms([...updatedRooms]); // 🔥 Crée une nouvelle référence pour forcer le re-render
      } else {
        console.error("setRooms n'est pas une fonction");
      }

      handleClose();
      Swal.fire({
        title: "Succès!",
        text: "L'appareil a été modifié.",
        icon: "success",
        timer: 700,
      });
    } catch (error) {
      console.error("Erreur de modification :", error);
      Swal.fire("Erreur!", "Impossible de modifier l'appareil.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal show={show} onHide={handleClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>Modifier Appareil</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleSubmit}>
          <Form.Group controlId="formDeviceName">
            <Form.Label>Nouveau Nom</Form.Label>
            <Form.Control
              type="text"
              value={deviceName}
              onChange={(e) => setDeviceName(e.target.value)}
              required
            />
          </Form.Group>
          <Button
            variant="primary"
            type="submit"
            className="w-100 mt-3"
            disabled={loading}
          >
            {loading ? "Modification..." : "Modifier"}
          </Button>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

EditDeviceModal.propTypes = {
  show: PropTypes.bool.isRequired,
  handleClose: PropTypes.func.isRequired,
  device: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    nom_app: PropTypes.string.isRequired,
  }).isRequired,
  rooms: PropTypes.array, // ❗ Ajout de la valeur par défaut
  setRooms: PropTypes.func.isRequired,
};

export default EditDeviceModal;
