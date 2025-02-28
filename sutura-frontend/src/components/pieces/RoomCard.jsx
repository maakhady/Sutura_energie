import PropTypes from "prop-types";
import { Card, Button } from "react-bootstrap";
import { Plus, Pencil, Trash } from "lucide-react";
import DeviceCard from "../appareil/DeviceCard";
import EditRoomModal from "./EditRoomModal";
import AddDeviceModal from "../appareil/AddDeviceModal";
import { useState } from "react";

const RoomCard = ({
  room,
  roomIndex,
  toggleDevice,
  handleAddDevice,
  handleEditRoom,
  handleDeleteRoom,
}) => {
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddDeviceModal, setShowAddDeviceModal] = useState(false);

  return (
    <>
      <Card.Body className="room-card-body">
        <div className="room-header">
          <h5 className="fw-bold text-gray-800">{room.nom_piece}</h5>
          <div className="room-actions">
            <Button
              variant="light"
              size="sm"
              className="action-btn"
              onClick={() => setShowAddDeviceModal(true)}
            >
              <Plus size={18} />
            </Button>
            <Button
              variant="light"
              size="sm"
              className="action-btn"
              onClick={() => setShowEditModal(true)}
            >
              <Pencil size={18} />
            </Button>
            <Button
              variant="light"
              size="sm"
              className="action-btn"
              onClick={() => handleDeleteRoom(room._id)}
            >
              <Trash size={18} />
            </Button>
          </div>
        </div>

        <div className="room-energy">
          <span className="energy-icon">⚡</span>
          <h5 className="energy-value">{room.energy || "0 kWh"}</h5>
        </div>

        <div className="device-container">
          {Array.isArray(room.devices) && room.devices.length > 0 ? (
            room.devices.map((device, deviceIndex) => (
              <div key={deviceIndex} className="device-item">
                <DeviceCard
                  device={device}
                  onToggle={() => toggleDevice(roomIndex, deviceIndex)}
                />
              </div>
            ))
          ) : (
            <div className="no-devices-message">Aucun Appareil</div>
          )}
        </div>
      </Card.Body>

      <AddDeviceModal
        show={showAddDeviceModal}
        handleClose={() => setShowAddDeviceModal(false)}
        handleAddDevice={handleAddDevice} // Passez la fonction ici
        roomId={room._id}
      />

      <EditRoomModal
        show={showEditModal}
        handleClose={() => setShowEditModal(false)}
        room={room}
        handleUpdateRoom={handleEditRoom}
      />
    </>
  );
};

RoomCard.propTypes = {
  room: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    nom_piece: PropTypes.string.isRequired,
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
  handleAddDevice: PropTypes.func.isRequired,
  handleEditRoom: PropTypes.func.isRequired,
  handleDeleteRoom: PropTypes.func.isRequired,
};

export default RoomCard;
