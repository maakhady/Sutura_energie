import { useState } from "react";
import PropTypes from "prop-types";
import { Container, Row, Col, Card, Button } from "react-bootstrap";
import { Lightbulb, Tv, Cog, Plus, Users } from "lucide-react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCalendarAlt, faEllipsisV } from "@fortawesome/free-solid-svg-icons";

const AppareilsPage = () => {
  const [rooms, setRooms] = useState([
    {
      name: "Salon",
      energy: "60kWh",
      devices: [
        { name: "Lampe 1", conso: "9W", type: "light", status: "on" },
        { name: "Lampe 2", conso: "9W", type: "light", status: "on" },
        { name: "Ventilateur", conso: "9W", type: "fan", status: "off" },
        { name: "Télévision", conso: "15W", type: "tv", status: "on" },
      ],
    },
    {
      name: "Chambre 1",
      energy: "23kWh",
      devices: [
        { name: "Lampe 1", conso: "9W", type: "light", status: "on" },
        { name: "Lampe 2", conso: "9W", type: "light", status: "on" },
        { name: "Climatiseur", conso: "15W", type: "ac", status: "on" },
      ],
    },
  ]);

  const toggleDevice = (roomIndex, deviceIndex) => {
    const updatedRooms = [...rooms];
    const newStatus =
      updatedRooms[roomIndex].devices[deviceIndex].status === "on"
        ? "off"
        : "on";
    updatedRooms[roomIndex].devices[deviceIndex].status = newStatus;
    setRooms(updatedRooms);
  };

  return (
    <Container fluid className="p-4 bg-light min-vh-100">
      {/* En-tête des statistiques */}
      <Row className="mb-4">
        <Col>
          <Card className="shadow-sm rounded-lg">
            <Card.Body className="py-4">
              <Row>
                <StatCard
                  icon={<Users size={24} />}
                  label="Pièces Totales"
                  value="4"
                />
                <StatCard
                  icon={<Lightbulb size={24} />}
                  label="Appareils Actifs"
                  value="8"
                />
                <StatCard
                  icon={<Lightbulb size={24} />}
                  label="Appareils Inactifs"
                  value="3"
                />
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Section du titre et bouton d'ajout */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h5 className="text-gray-700 mb-0">Gestion des Appareils par Pièce</h5>
        <Button variant="primary" className="rounded px-3 py-2">
          <Plus size={16} className="me-1" />
          Ajouter une Pièce
        </Button>
      </div>

      {/* Liste des pièces */}
      <Row className="g-4 mb-4">
        {rooms.map((room, roomIndex) => (
          <Col key={roomIndex} md={6} className="mb-4">
            <RoomCard
              room={room}
              roomIndex={roomIndex}
              toggleDevice={toggleDevice}
            />
          </Col>
        ))}
      </Row>

      {/* Pagination */}
      <div className="d-flex justify-content-between align-items-center mt-4">
        <Button variant="outline-primary" className="px-3">
          ← Précédent
        </Button>
        <div className="d-flex gap-2">
          {[1, 2, 3, "...", 8, 9, 10].map((page, i) => (
            <Button
              key={`page-${i}`}
              variant={page === 1 ? "primary" : "light"}
              className="rounded-circle"
              style={{ width: "40px", height: "40px" }}
            >
              {page}
            </Button>
          ))}
        </div>
        <Button variant="outline-primary" className="px-3">
          Suivant →
        </Button>
      </div>
    </Container>
  );
};

// Composant StatCard
const StatCard = ({ icon, label, value }) => (
  <Col md={4} className="text-center">
    <div className="d-flex justify-content-center mb-2">{icon}</div>
    <div>
      <h4 className="fw-bold mb-0">{value}</h4>
      <p className="text-muted small">{label}</p>
    </div>
  </Col>
);

StatCard.propTypes = {
  icon: PropTypes.element.isRequired,
  label: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
};

// Composant RoomCard
const RoomCard = ({ room, roomIndex, toggleDevice }) => {
  return (
    <Card className="shadow-sm border-0 h-100">
      <Card.Body className="p-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h5 className="fw-bold text-gray-800">{room.name}</h5>
          <div className="d-flex gap-2">
            <Button variant="light" size="sm" className="rounded-circle p-1">
              <Plus size={18} />
            </Button>
            <Button variant="light" size="sm" className="rounded-circle p-1">
              <Cog size={18} />
            </Button>
          </div>
        </div>

        <div className="d-flex align-items-center mb-4">
          <span className="text-warning me-2">⚡</span>
          <h5 className="text-warning mb-0">{room.energy}</h5>
        </div>

        <Row className="g-3">
          {room.devices.map((device, deviceIndex) => (
            <Col key={deviceIndex} xs={6} className="mb-3">
              <DeviceCard
                device={device}
                onToggle={() => toggleDevice(roomIndex, deviceIndex)}
              />
            </Col>
          ))}
        </Row>
      </Card.Body>
    </Card>
  );
};

RoomCard.propTypes = {
  room: PropTypes.shape({
    name: PropTypes.string.isRequired,
    energy: PropTypes.string.isRequired,
    devices: PropTypes.arrayOf(
      PropTypes.shape({
        name: PropTypes.string.isRequired,
        conso: PropTypes.string.isRequired,
        type: PropTypes.string.isRequired,
        status: PropTypes.string.isRequired,
      })
    ).isRequired,
  }).isRequired,
  roomIndex: PropTypes.number.isRequired,
  toggleDevice: PropTypes.func.isRequired,
};

// Composant DeviceCard
const DeviceCard = ({ device, onToggle }) => {
  const getDeviceIcon = (type) => {
    switch (type) {
      case "light":
        return <Lightbulb size={24} />;
      case "tv":
        return <Tv size={24} />;
      case "fan":
        return (
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M12 5C12 3.34 10.66 2 9 2C7.34 2 6 3.34 6 5C6 6.66 7.34 8 9 8H12V5Z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M19 12C20.66 12 22 10.66 22 9C22 7.34 20.66 6 19 6C17.34 6 16 7.34 16 9V12H19Z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M12 19C12 20.66 10.66 22 9 22C7.34 22 6 20.66 6 19C6 17.34 7.34 16 9 16H12V19Z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M5 12C3.34 12 2 10.66 2 9C2 7.34 3.34 6 5 6C6.66 6 8 7.34 8 9V12H5Z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        );
      case "ac":
        return (
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <rect
              x="2"
              y="6"
              width="20"
              height="12"
              rx="2"
              stroke="currentColor"
              strokeWidth="2"
            />
            <path
              d="M6 10H18"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <path
              d="M7 14H9"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <path
              d="M12 14H14"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        );
      default:
        return <Lightbulb size={24} />;
    }
  };

  const getConsoColor = (wattage) => {
    if (wattage.includes("15")) return "text-warning";
    return "text-warning";
  };

  return (
    <Card
      className={`border-0 h-100 ${
        device.status === "on" ? "bg-blue-100" : "bg-light"
      }`}
      style={{ borderRadius: "10px" }}
    >
      <Card.Body className="p-3">
        <div className="d-flex justify-content-between align-items-center mb-2">
          <div
            className={
              device.status === "on" ? "text-primary" : "text-secondary"
            }
          >
            {getDeviceIcon(device.type)}
          </div>
          <div className="d-flex align-items-center">
            <div className="form-check form-switch me-1">
              <input
                className="form-check-input"
                type="checkbox"
                role="switch"
                checked={device.status === "on"}
                onChange={onToggle}
              />
            </div>
            <Button variant="light" size="sm" className="p-0 me-1">
              <FontAwesomeIcon
                icon={faCalendarAlt}
                className="text-secondary"
              />
            </Button>
            <Button variant="light" size="sm" className="p-0">
              <FontAwesomeIcon icon={faEllipsisV} className="text-secondary" />
            </Button>
          </div>
        </div>
        <p className="text-gray-700 mb-1 mt-2">{device.name}</p>
        <p className="text-gray-500 mb-0 small">
          Conso:{" "}
          <span className={getConsoColor(device.conso)}>{device.conso}</span>
        </p>
      </Card.Body>
    </Card>
  );
};

DeviceCard.propTypes = {
  device: PropTypes.shape({
    name: PropTypes.string.isRequired,
    conso: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired,
    status: PropTypes.string.isRequired,
  }).isRequired,
  onToggle: PropTypes.func.isRequired,
};

export default AppareilsPage;
