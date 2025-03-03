import { useState, useEffect } from "react";
import { Row, Col, Button } from "react-bootstrap";
import { Plus } from "lucide-react";
import CardStat from "../components/CardStat";
import MiniRightPanel from "../components/MiniRightPanel";
import RoomCard from "../components/pieces/RoomCard";
import AddRoomModal from "../components/pieces/AddRoomModal";
import PieceService from "../services/PieceService";
import "../styles/Appareils.css";

const AppareilsPage = () => {
  const [rooms, setRooms] = useState([]);
  const [showAddRoomModal, setShowAddRoomModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const roomsPerPage = 2;

  const handleNewRoomAdded = (newRoom) => {
    const updatedRooms = [...rooms, newRoom]; // Ajouter la nouvelle pièce
    setRooms(updatedRooms);

    // Calculer la nouvelle page où elle doit être affichée
    const totalRooms = updatedRooms.length;
    const newPage = Math.ceil(totalRooms / roomsPerPage);
    setCurrentPage(newPage); // Aller directement à la nouvelle page
  };

  const handleUpdateRoom = (updatedRoom) => {
    setRooms((prevRooms) =>
      prevRooms.map((room) =>
        room._id === updatedRoom._id
          ? { ...room, nom_piece: updatedRoom.nom_piece }
          : room
      )
    );
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      const pieces = await PieceService.obtenirToutesPieces();
      const formattedRooms = pieces.map((item) => {
        const devicesWithStatus = item.appareils.map((device) => ({
          ...device,
          status: device.actif ? "Actif" : "Inactif", // Ajout du statut de l'appareil
        }));

        return {
          ...item.piece,
          devices: devicesWithStatus,
        };
      });

      setRooms(formattedRooms);
    } catch (error) {
      console.error("Erreur lors de la récupération des pièces :", error);
    }
  };

  const indexOfLastRoom = currentPage * roomsPerPage;
  const indexOfFirstRoom = indexOfLastRoom - roomsPerPage;
  const currentRooms = rooms.slice(indexOfFirstRoom, indexOfLastRoom);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const stats = [
    { title: "Pièces Totales", value: rooms.length, icon: "device" },
    {
      title: "Appareils Actifs",
      value: rooms.reduce(
        (count, room) =>
          count + room.devices.filter((device) => device.actif).length,
        0
      ),
      icon: "light",
    },
    {
      title: "Appareils Inactifs",
      value: rooms.reduce(
        (count, room) =>
          count + room.devices.filter((device) => !device.actif).length,
        0
      ),
      icon: "device",
    },
  ];

  return (
    <div className="appareil">
      <div className="content-wrapper2">
        <div className="main-content2">
          <div className="stats-cards">
            <Row>
              <Col>
                <CardStat stats={stats} />
              </Col>
            </Row>
          </div>

          <div className="appareil-header">
            <h5 className="section-title">Gestion des Appareils par Pièce</h5>
            <Button
              variant="primary"
              className="add-button rounded px-3 py-2"
              onClick={() => setShowAddRoomModal(true)}
            >
              <Plus size={16} className="me-1" />
              Ajouter une Pièce
            </Button>
          </div>

          <AddRoomModal
            show={showAddRoomModal}
            handleClose={() => setShowAddRoomModal(false)}
            onRoomAdded={handleNewRoomAdded} // On passe la nouvelle fonction
          />

          <div className="rooms-liste">
            {rooms.length === 0 ? (
              <div className="text-center">
                <p>Aucune pièce actuellement</p>
              </div>
            ) : (
              <>
                <Row className="g-4">
                  {currentRooms.map((room, roomIndex) => (
                    <Col key={roomIndex} md={6} className="mb-4">
                      <RoomCard
                        room={room}
                        roomIndex={roomIndex}
                        toggleDevice={() => {}} // Supposons qu'elle soit gérée ailleurs
                        handleEditRoom={handleUpdateRoom}
                        rooms={rooms} // Nouvelle prop
                        setRooms={setRooms} // Nouvelle prop
                        currentPage={currentPage} // Nouvelle prop
                        setCurrentPage={setCurrentPage} // Nouvelle prop
                        roomsPerPage={roomsPerPage} // Nouvelle prop
                      />
                    </Col>
                  ))}
                </Row>

                <div className="pagination-container">
                  <Button
                    variant="outline-primary"
                    className="pagination-btn"
                    onClick={() => paginate(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    ← Précédent
                  </Button>
                  <div className="pagination-numbers">
                    {[...Array(Math.ceil(rooms.length / roomsPerPage))].map(
                      (_, i) => (
                        <Button
                          key={i}
                          variant={currentPage === i + 1 ? "primary" : "light"}
                          className="pagination-item"
                          onClick={() => paginate(i + 1)}
                        >
                          {i + 1}
                        </Button>
                      )
                    )}
                  </div>
                  <Button
                    variant="outline-primary"
                    className="pagination-btn"
                    onClick={() => paginate(currentPage + 1)}
                    disabled={
                      currentPage === Math.ceil(rooms.length / roomsPerPage)
                    }
                  >
                    Suivant →
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>

        <MiniRightPanel />
      </div>
    </div>
  );
};

export default AppareilsPage;
