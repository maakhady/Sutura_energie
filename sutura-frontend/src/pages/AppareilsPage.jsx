import { useState } from "react";
import { Container, Row, Col, Card, Button } from "react-bootstrap";
import { Lightbulb, Tv, Cog, Plus } from "lucide-react";
import CardStat from "../components/CardStat";
import MiniRightPanel from "../components/MiniRightPanel";

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

  // Données fictives pour les statistiques
  const stats = [
    { title: "Pièces Totales", value: rooms.length, icon: "device" },
    { title: "Appareils Actifs", value: 8, icon: "light" },
    { title: "Appareils Inactifs", value: 3, icon: "tv" },
  ];

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
          <CardStat stats={stats} />
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

      {/* MiniRightPanel */}
      <MiniRightPanel />
    </Container>
  );
};

// Composant RoomCard (inchangé)
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

// Composant DeviceCard (inchangé)
const DeviceCard = ({ device, onToggle }) => {
  const getDeviceIcon = (type) => {
    switch (type) {
      case "light":
        return <Lightbulb size={24} />;
      case "tv":
        return <Tv size={24} />;
      case "fan":
        return <Cog size={24} />;
      default:
        return <Lightbulb size={24} />;
    }
  };

  return (
    <Card
      className={`border-0 h-100 ${
        device.status === "on" ? "bg-blue-100" : "bg-light"
      }`}
      style={{ borderRadius: "10px", width: "200px" }}
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
          </div>
        </div>
        <p className="text-gray-700 mb-1 mt-2">{device.name}</p>
        <p className="text-gray-500 mb-0 small">
          Conso: <span className="text-warning">{device.conso}</span>
        </p>
      </Card.Body>
    </Card>
  );
};

export default AppareilsPage;
