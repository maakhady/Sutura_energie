import { useState } from "react";
import { Modal, Form, Button } from "react-bootstrap";
import PropTypes from "prop-types";

const AddDeviceModal = ({ show, handleClose, handleAddDevice, roomId }) => {
  const [deviceName, setDeviceName] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    handleAddDevice(roomId, {
      nom_app: deviceName,
    });
    setDeviceName("");
    handleClose();
  };

  return (
    <Modal show={show} onHide={handleClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>Ajouter un Appareil</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleSubmit}>
          <Form.Group controlId="formDeviceName">
            <Form.Label>Nom de lappareil</Form.Label>
            <Form.Control
              type="text"
              placeholder="Entrer le nom de l'appareil"
              value={deviceName}
              onChange={(e) => setDeviceName(e.target.value)}
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

AddDeviceModal.propTypes = {
  show: PropTypes.bool.isRequired,
  handleClose: PropTypes.func.isRequired,
  handleAddDevice: PropTypes.func.isRequired,
  roomId: PropTypes.string.isRequired,
};

export default AddDeviceModal;
