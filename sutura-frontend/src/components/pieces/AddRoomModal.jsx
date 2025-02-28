import { useState } from "react";
import { Modal, Form, Button } from "react-bootstrap";
import PropTypes from "prop-types";
import PieceService from "../../services/PieceService"; // Importez le service

const AddRoomModal = ({ show, handleClose, handleAddRoom }) => {
  const [roomName, setRoomName] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      console.log("Création d'une nouvelle pièce avec le nom :", roomName);
      await PieceService.creerPiece({ nom_piece: roomName });
      console.log("Nouvelle pièce créée avec le nom :", roomName);
      handleAddRoom(roomName); // Passez uniquement le nom de la pièce
      setRoomName("");
      handleClose();
    } catch (error) {
      console.error("Erreur lors de la création de la pièce :", error);
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
          <Button variant="primary" type="submit" className="w-100 mt-3">
            Ajouter
          </Button>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

AddRoomModal.propTypes = {
  show: PropTypes.bool.isRequired,
  handleClose: PropTypes.func.isRequired,
  handleAddRoom: PropTypes.func.isRequired,
};

export default AddRoomModal;
