import { useState } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import PropTypes from "prop-types";

const ScheduleDeviceModal = ({ show, handleClose, device }) => {
  const [schedule, setSchedule] = useState({
    allumageDate: "",
    allumageTime: "",
    extinctionDate: "",
    extinctionTime: "",
  });

  const today = new Date().toISOString().split("T")[0];

  // Fonction pour gérer le changement des inputs
  const handleChange = (e) => {
    const { name, value } = e.target;
    setSchedule((prevSchedule) => ({
      ...prevSchedule,
      [name]: value,
    }));
  };

  // Fonction pour enregistrer la programmation (ajouter une API si nécessaire)
  const handleSchedule = () => {
    const allumage = `${schedule.allumageDate}T${schedule.allumageTime}`;
    const extinction = `${schedule.extinctionDate}T${schedule.extinctionTime}`;
    console.log("Programmation enregistrée :", { allumage, extinction });
    handleClose(); // Fermer le modal après validation
  };

  return (
    <Modal show={show} onHide={handleClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>Programmer un cycle pour {device.nom_app}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group>
            <Form.Label>Date d{"'"}allumage</Form.Label>
            <Form.Control
              type="date"
              name="allumageDate"
              value={schedule.allumageDate}
              onChange={handleChange}
              min={today}
            />
          </Form.Group>
          <Form.Group className="mt-3">
            <Form.Label>Heure d{"'"}allumage</Form.Label>
            <Form.Control
              type="time"
              name="allumageTime"
              value={schedule.allumageTime}
              onChange={handleChange}
            />
          </Form.Group>
          <Form.Group className="mt-3">
            <Form.Label>Date d{"'"}extinction</Form.Label>
            <Form.Control
              type="date"
              name="extinctionDate"
              value={schedule.extinctionDate}
              onChange={handleChange}
              min={today}
            />
          </Form.Group>
          <Form.Group className="mt-3">
            <Form.Label>Heure d{"'"}extinction</Form.Label>
            <Form.Control
              type="time"
              name="extinctionTime"
              value={schedule.extinctionTime}
              onChange={handleChange}
            />
          </Form.Group>
          <Button
            variant="primary"
            className="w-100 mt-4"
            style={{ backgroundColor: "#274c77", borderColor: "#274c77" }}
            onClick={handleSchedule}
          >
            Programmer
          </Button>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

ScheduleDeviceModal.propTypes = {
  show: PropTypes.bool.isRequired,
  handleClose: PropTypes.func.isRequired,
  device: PropTypes.object.isRequired,
};

export default ScheduleDeviceModal;
