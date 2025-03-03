import PropTypes from "prop-types";
import { Card, Button } from "react-bootstrap";
import { Plus, Pencil, Trash } from "lucide-react";
import DeviceCard from "../appareil/DeviceCard";
import EditRoomModal from "./EditRoomModal";
import AddDeviceModal from "../appareil/AddDeviceModal";
import { useState } from "react";
import Swal from "sweetalert2"; // Import de Swal
import PieceService from "../../services/PieceService"; // Import du service API

const RoomCard = ({
  room,
  handleEditRoom,
  rooms,
  setRooms,
  currentPage,
  setCurrentPage,
  roomsPerPage,
}) => {
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddDeviceModal, setShowAddDeviceModal] = useState(false);

  // 🗑️ Fonction pour supprimer une pièce
  const handleDeleteRoom = async (roomId) => {
    Swal.fire({
      title: "Êtes-vous sûr?",
      text: "Vous ne pourrez pas revenir en arrière!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Oui, supprimez-la!",
      cancelButtonText: "Annuler",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await PieceService.supprimerPiece(roomId);

          // Met à jour la liste des pièces après suppression
          const updatedRooms = rooms.filter((room) => room._id !== roomId);
          setRooms(updatedRooms);

          // Vérifie si la page actuelle est vide après suppression
          const totalPages = Math.ceil(updatedRooms.length / roomsPerPage);
          if (currentPage > totalPages && totalPages > 0) {
            setCurrentPage(totalPages); // Revient à la dernière page disponible
          }

          Swal.fire({
            title: "Supprimé!",
            text: "La pièce a été supprimée.",
            icon: "success",
          });
        } catch (error) {
          Swal.fire({
            title: "Erreur!",
            text: "Une erreur est survenue lors de la suppression de la pièce.",
            icon: error,
          });
          console.error("Erreur lors de la suppression de la pièce :", error);
        }
      }
    });
  };

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
              onClick={() => handleDeleteRoom(room._id)} // 🔥 Appel de la fonction de suppression
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
                  rooms={rooms}
                  setRooms={setRooms} // ✅ Ajoute ceci pour corriger le problème
                  status={device.actif ? "Actif" : "Inactif"} // Affichage de l'état
                  handleModeAllumage={(deviceId) =>
                    console.log("Mode allumage", deviceId)
                  }
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
        roomId={room._id}
        rooms={rooms} // On passe la liste des pièces
        setRooms={setRooms} // Pour mettre à jour l'état après l'ajout d'un appareil
      />

      <EditRoomModal
        show={showEditModal}
        handleClose={() => setShowEditModal(false)}
        room={room}
        onRoomUpdated={handleEditRoom}
      />
    </>
  );
};

RoomCard.propTypes = {
  room: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    nom_piece: PropTypes.string.isRequired,
    energy: PropTypes.string,
    devices: PropTypes.arrayOf(
      PropTypes.shape({
        name: PropTypes.string,
        conso: PropTypes.string,
        type: PropTypes.string,
        status: PropTypes.string,
      })
    ),
  }).isRequired,
  roomIndex: PropTypes.number.isRequired,
  toggleDevice: PropTypes.func.isRequired,
  handleAddDevice: PropTypes.func.isRequired,
  handleEditRoom: PropTypes.func.isRequired,
  rooms: PropTypes.array.isRequired, // Ajout pour gérer les pièces
  setRooms: PropTypes.func.isRequired, // Ajout pour mettre à jour l'état
  currentPage: PropTypes.number.isRequired, // Ajout pour gérer la pagination
  setCurrentPage: PropTypes.func.isRequired, // Ajout pour naviguer après suppression
  roomsPerPage: PropTypes.number.isRequired, // Ajout pour recalculer la pagination
};

export default RoomCard;
