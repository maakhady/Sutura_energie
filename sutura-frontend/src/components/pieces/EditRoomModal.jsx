import { useState, useEffect } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import PropTypes from "prop-types";
import PieceService from "../../services/PieceService";
import Swal from "sweetalert2";

const EditRoomModal = ({ show, handleClose, room, onRoomUpdated }) => {
  const [roomName, setRoomName] = useState("");

  // 🔥 Met à jour le nom dans la modale quand `room` change
  useEffect(() => {
    if (room) {
      setRoomName(room.nom_piece);
    }
  }, [room]);

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!roomName.trim()) return;

    setLoading(true);
    try {
      console.log("Mise à jour de la pièce :", room._id, "→", roomName);
      const updatedRoom = await PieceService.mettreAJourPiece(room._id, {
        nom_piece: roomName,
      });

      console.log("Pièce mise à jour :", updatedRoom);

      // Notifier `RoomCard` que la pièce a été mise à jour
      onRoomUpdated(updatedRoom);

      Swal.fire({
        title: "Succès!",
        text: `La pièce a été mise à jour avec succès.`,
        icon: "success",
        confirmButtonText: "OK",
        timer: 700,
      });

      handleClose();
    } catch (error) {
      console.error("Erreur lors de la mise à jour de la pièce :", error);
      Swal.fire({
        title: "Erreur!",
        text: "Une erreur est survenue lors de la modification de la pièce.",
        icon: "error",
        timer: 700,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal show={show} onHide={handleClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>Modifier la Pièce</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleSubmit}>
          <Form.Group controlId="formRoomName">
            <Form.Label>Nom de la pièce</Form.Label>
            <Form.Control
              type="text"
              placeholder="Entrer le nom de la pièce"
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
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

EditRoomModal.propTypes = {
  show: PropTypes.bool.isRequired,
  handleClose: PropTypes.func.isRequired,
  room: PropTypes.object.isRequired,
  onRoomUpdated: PropTypes.func.isRequired, // Nouvelle fonction
};

export default EditRoomModal;
