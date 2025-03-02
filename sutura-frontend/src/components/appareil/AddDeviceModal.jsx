import { useState } from "react";
import { Modal, Form, Button } from "react-bootstrap";
import PropTypes from "prop-types";
import AppareilService from "../../services/AppareilService"; // Import du service API
import Swal from "sweetalert2"; // Pour afficher les alertes

const AddDeviceModal = ({ show, handleClose, roomId, rooms, setRooms }) => {
  const [deviceName, setDeviceName] = useState("");
  const [loading, setLoading] = useState(false); // Indicateur de chargement

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const newDevice = await AppareilService.creerAppareil({
        pieces_id: roomId,
        nom_app: deviceName,
      });

      // Mettre à jour la liste des pièces avec le nouvel appareil
      const updatedRooms = rooms.map((room) =>
        room._id === roomId
          ? { ...room, devices: [...(room.devices || []), newDevice] } // ✅ Assure que devices est un tableau
          : room
      );

      setRooms(updatedRooms);
      setDeviceName("");
      handleClose();

      Swal.fire({
        title: "Succès!",
        text: "L'appareil a été ajouté avec succès.",
        icon: "success",
      });
    } catch (error) {
      console.error("Erreur lors de l'ajout de l'appareil :", error);
      Swal.fire({
        title: "Erreur!",
        text: "Impossible d'ajouter l'appareil.",
        icon: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal show={show} onHide={handleClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>Ajouter un Appareil</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleSubmit}>
          <Form.Group controlId="formDeviceName">
            <Form.Label>Nom de appareil à Ajouter</Form.Label>
            <Form.Control
              type="text"
              placeholder="Entrer le nom de l'appareil"
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
            {loading ? "Ajout en cours..." : "Ajouter"}
          </Button>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

AddDeviceModal.propTypes = {
  show: PropTypes.bool.isRequired,
  handleClose: PropTypes.func.isRequired,
  roomId: PropTypes.string.isRequired,
  rooms: PropTypes.array.isRequired,
  setRooms: PropTypes.func.isRequired,
};

export default AddDeviceModal;
