import { useState, useEffect } from "react";
import { Row, Col, Button } from "react-bootstrap";
import { Plus } from "lucide-react";
import CardStat from "../components/CardStat";
import MiniRightPanel from "../components/MiniRightPanel";
import RoomCard from "../components/pieces/RoomCard";
import AddRoomModal from "../components/pieces/AddRoomModal";
import PieceService from "../services/PieceService";
import AppareilService from "../services/AppareilService";
import Swal from "sweetalert2";
import "../styles/Appareils.css";

const AppareilsPage = () => {
  const [rooms, setRooms] = useState([]);
  const [showAddRoomModal, setShowAddRoomModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const roomsPerPage = 2;

  const handleAddRoom = async (roomName) => {
    try {
      const newRoom = {
        nom_piece: roomName,
        actif: true,
      };
      setRooms([...rooms, newRoom]);

      Swal.fire({
        title: "Succès!",
        text: `La pièce "${roomName}" a été ajoutée avec succès.`,
        icon: "success",
        confirmButtonText: "OK",
      });
    } catch (error) {
      console.error("Erreur lors de l'ajout de la pièce :", error);
      Swal.fire({
        title: "Erreur!",
        text: "Une erreur est survenue lors de l'ajout de la pièce.",
        icon: "error",
        confirmButtonText: "OK",
      });
    }
  };

  const handleDeleteRoom = async (roomId) => {
    Swal.fire({
      title: "Êtes-vous sûr?",
      text: "Vous ne pourrez pas revenir en arrière!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Oui, supprimez-le!",
      cancelButtonText: "Annuler",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await PieceService.supprimerPiece(roomId);
          setRooms(rooms.filter((room) => room._id !== roomId));
          Swal.fire({
            title: "Supprimé!",
            text: "La pièce a été supprimée.",
            icon: "success",
          });
        } catch (error) {
          Swal.fire({
            title: "Erreur!",
            text: "Une erreur est survenue lors de la suppression de la pièce.",
            icon: "error",
          });
          console.error("Erreur lors de la suppression de la pièce :", error);
        }
      }
    });
  };

  const handleUpdateRoom = async (roomId, newName) => {
    try {
      const updatedRoom = await PieceService.mettreAJourPiece(roomId, {
        nom_piece: newName,
      });
      setRooms(rooms.map((room) => (room._id === roomId ? updatedRoom : room)));
    } catch (error) {
      console.error("Erreur lors de la mise à jour de la pièce :", error);
    }
  };

  const handleAddDevice = async (roomId, appareilData) => {
    try {
      const newDevice = await AppareilService.creerAppareil({
        pieces_id: roomId,
        nom_app: appareilData.nom_app,
      });
  
      const updatedRooms = rooms.map((room) => {
        if (room._id === roomId) {
          return { ...room, devices: [...room.devices, newDevice] };
        }
        return room;
      });
      setRooms(updatedRooms);
    } catch (error) {
      console.error("Erreur lors de l'ajout de l'appareil :", error);
      Swal.fire({
        title: "Erreur!",
        text: "Une erreur est survenue lors de l'ajout de l'appareil.",
        icon: "error",
      });
    }
  };
  

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      const pieces = await PieceService.obtenirToutesPieces();
      const formattedRooms = pieces.map((item) => ({
        ...item.piece,
        devices: item.appareils,
      }));
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
    { title: "Appareils Actifs", value: 10, icon: "light" },
    { title: "Appareils Inactifs", value: 7, icon: "device" },
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
            handleAddRoom={handleAddRoom}
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
                        handleDeleteRoom={handleDeleteRoom}
                        handleEditRoom={handleUpdateRoom}
                        handleAddDevice={handleAddDevice} // Passer handleAddDevice ici
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
