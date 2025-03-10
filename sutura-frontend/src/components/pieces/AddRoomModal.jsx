import { useState } from "react";
import { Modal, Form, Button } from "react-bootstrap";
import PropTypes from "prop-types";
import PieceService from "../../services/PieceService";
import Swal from "sweetalert2";

const AddRoomModal = ({ show, handleClose, onRoomAdded }) => {
  const [roomName, setRoomName] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!roomName.trim()) return;

    setLoading(true);
    try {
      console.log("Création d'une nouvelle pièce :", roomName);
      const newRoom = await PieceService.creerPiece({ nom_piece: roomName });
      console.log("Nouvelle pièce créée :", newRoom);

      // Notifier `AppareilsPage` qu'une nouvelle pièce est ajoutée
      onRoomAdded(newRoom);

      Swal.fire({
        title: "Succès!",
        text: `La pièce "${roomName}" a été ajoutée avec succès.`,
        icon: "success",
        confirmButtonText: "OK",
        timer: 700,
      });

      setRoomName("");
      handleClose();
    } catch (error) {
      console.error("Erreur lors de la création de la pièce :", error);
      Swal.fire({
        title: "Erreur!",
        text: "Une erreur est survenue lors de l'ajout de la pièce.",
        icon: "error",
        confirmButtonText: "OK",
        timer: 700,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal show={show} onHide={handleClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>Ajouter une nouvelle Pièce</Modal.Title>
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
            {loading ? "Ajout..." : "Ajouter"}
          </Button>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

AddRoomModal.propTypes = {
  show: PropTypes.bool.isRequired,
  handleClose: PropTypes.func.isRequired,
  onRoomAdded: PropTypes.func.isRequired, // Nouvelle fonction
};

export default AddRoomModal;
