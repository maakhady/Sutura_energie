import { useState } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import PropTypes from "prop-types";

const EditRoomModal = ({ show, handleClose, room, handleUpdateRoom }) => {
  const [roomName, setRoomName] = useState(room.nom_piece);

  const handleSubmit = (e) => {
    e.preventDefault();
    handleUpdateRoom(room._id, roomName);
    handleClose();
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
          <Button variant="primary" type="submit" className="w-100 mt-3">
            Modifier
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
  handleUpdateRoom: PropTypes.func.isRequired,
};

export default EditRoomModal;
