import { useState } from "react";
import { Modal, Button, Form, Row, Col } from "react-bootstrap";
import PropTypes from "prop-types";
import AppareilService from "../../services/AppareilService";
import Swal from "sweetalert2";

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
  const handleSchedule = async () => {
    if (
      !schedule.allumageDate ||
      !schedule.extinctionDate ||
      !schedule.allumageTime ||
      !schedule.extinctionTime
    ) {
      Swal.fire({
        icon: "warning",
        title: "Champs manquants",
        text: "Veuillez remplir tous les champs avant de programmer l'intervalle.",
      });
      return;
    }

    const intervalleData = {
      intervalle: {
        debut_periode: `${schedule.allumageDate}T00:00:00Z`,
        fin_periode: `${schedule.extinctionDate}T00:00:00Z`,
        heure_debut: schedule.allumageTime,
        heure_fin: schedule.extinctionTime,
      },
    };

    try {
      await AppareilService.creerIntervalle(device._id, intervalleData);

      // ✅ Message de succès
      Swal.fire({
        icon: "success",
        title: "Programmation réussie",
        text: `L'intervalle pour ${device.nom_app} a été enregistré avec succès !`,
        timer: 3000,
        showConfirmButton: false,
      });

      handleClose(); // Fermer la modal après succès
    } catch (error) {
      console.error("Erreur lors de la programmation :", error);

      // ❌ Message d'erreur
      Swal.fire({
        icon: "error",
        title: "Erreur",
        text: "Une erreur est survenue lors de la programmation. Veuillez réessayer.",
      });
    }
  };

  return (
    <Modal show={show} onHide={handleClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>Programmer un cycle pour {device.nom_app}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          {/* Période d'allumage */}
          <h5>Période où l{"'"}appareil sera actif </h5>
          <Form.Group className="mt-3">
            <Form.Label>Du ... au ...</Form.Label>
            <Row>
              <Col>
                <Form.Control
                  type="date"
                  name="allumageDate"
                  value={schedule.allumageDate}
                  onChange={handleChange}
                  min={today}
                />
              </Col>
              <Col>
                <Form.Control
                  type="date"
                  name="extinctionDate"
                  value={schedule.extinctionDate}
                  onChange={handleChange}
                  min={today}
                />
              </Col>
            </Row>
          </Form.Group>

          {/* Heure d'allumage et extinction */}
          <Form.Group className="mt-3">
            <Form.Label>De ... à ...</Form.Label>
            <Row>
              <Col>
                <Form.Control
                  type="time"
                  name="allumageTime"
                  value={schedule.allumageTime}
                  onChange={handleChange}
                />
              </Col>
              <Col>
                <Form.Control
                  type="time"
                  name="extinctionTime"
                  value={schedule.extinctionTime}
                  onChange={handleChange}
                />
              </Col>
            </Row>
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
