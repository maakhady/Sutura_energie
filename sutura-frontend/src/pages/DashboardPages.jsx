import { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import "../styles/dashboard.css";
import RightPanel from "../components/RightPanel";

import PieceService from "../services/PieceService";
import {
  Lightbulb,
  Tv,
  Computer,
  Fan,
  AirVent,
  WashingMachine,
  Heater,
} from "lucide-react";
import Swal from "sweetalert2";
import AppareilService from "../services/AppareilService";

const DashboardPage = () => {
  const [rooms, setRooms] = useState([]);
  const [activeRoomId, setActiveRoomId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const devicesPerPage = 4;

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      const pieces = await PieceService.obtenirToutesPieces();
      const formattedRooms = pieces.map((item) => {
        const devicesWithStatus = item.appareils.map((device) => ({
          ...device,
          status: device.actif ? "Actif" : "Inactif",
          isOn: device.actif,
        }));

        return {
          ...item.piece,
          devices: devicesWithStatus,
        };
      });

      setRooms(formattedRooms);
      if (formattedRooms.length > 0) {
        setActiveRoomId(formattedRooms[0]._id);
      }
    } catch (error) {
      console.error("Erreur lors de la récupération des pièces :", error);
    }
  };

  const handleToggleDevice = async (deviceId, currentStatus) => {
    try {
      if (!deviceId) {
        throw new Error("L'ID de l'appareil est manquant");
      }

      // 🔍 Trouver l'appareil correspondant
      const device = rooms
        .flatMap((room) => room.devices)
        .find((d) => d._id === deviceId);

      if (!device) {
        throw new Error("Appareil non trouvé");
      }

      // ❌ Vérifier si l'appareil est en mode automatique
      if (device.automatique) {
        Swal.fire({
          title: "Action impossible",
          text: "Impossible d'activer/désactiver l'appareil manuellement, car il est en mode automatique.",
          icon: "warning",
          timer: 2000,
        });
        return; // Stoppe l'exécution de la fonction
      }

      const newStatus = !currentStatus;

      await AppareilService.activerDesactiverAppareil(deviceId, newStatus);

      // ✅ Mise à jour de l'état des appareils dans les pièces
      setRooms((prevRooms) =>
        prevRooms.map((room) =>
          room._id === activeRoomId
            ? {
                ...room,
                devices: room.devices.map((d) =>
                  d._id === deviceId
                    ? {
                        ...d,
                        isOn: newStatus,
                        status: newStatus ? "Actif" : "Inactif",
                      }
                    : d
                ),
              }
            : room
        )
      );
    } catch (error) {
      console.error("Erreur lors de l'activation/désactivation :", error);
      Swal.fire({
        title: "Erreur",
        text:
          error.message ||
          "L'appareil n'a pas pu être activé/désactivé. Essayez à nouveau.",
        icon: "error",
      });
    }
  };

  const [consumptionData] = useState([
    { time: "Lundi", value: 30 },
    { time: "Mardi", value: 42 },
    { time: "Mercredi", value: 28 },
    { time: "Jeudi", value: 45 },
    { time: "Vendredi", value: 32 },
    { time: "Samedi", value: 35 },
    { time: "Dimanche", value: 30 },
  ]);

  const getDeviceIcon = (nom_app) => {
    switch (nom_app.toLowerCase()) {
      case "télévision":
      case "tv":
        return <Tv size={24} />;
      case "ordinateur":
      case "computer":
        return <Computer size={24} />;
      case "ventilateur":
      case "fan":
        return <Fan size={24} />;
      case "lampe":
      case "light":
        return <Lightbulb size={24} />;
      case "climatiseur":
      case "clime":
        return <AirVent size={24} />;
      case "lave-linge":
      case "machine à laver":
        return <WashingMachine size={24} />;
      case "micro-ondes":
      case "four":
        return <Heater size={24} />;
      default:
        return <Lightbulb size={24} />;
    }
  };

  const handlePagination = (direction) => {
    setCurrentPage((prevPage) =>
      direction === "next" ? prevPage + 1 : prevPage > 1 ? prevPage - 1 : 1
    );
  };

  const currentDevices = rooms
    .find((room) => room._id === activeRoomId)
    ?.devices.slice(
      (currentPage - 1) * devicesPerPage,
      currentPage * devicesPerPage
    );

  const totalPages = Math.ceil(
    (rooms.find((room) => room._id === activeRoomId)?.devices?.length || 0) /
      devicesPerPage
  );

  return (
    <div className="dashboard">
      <div className="content-wrapper">
        <div className="main-content">
          <div className="titre-appareil">
            <h3>Appareils</h3>
          </div>
          <div className="appareils">
            <div className="rooms">
              {rooms.map((room) => (
                <button
                  key={room._id}
                  className={`room-btn ${
                    activeRoomId === room._id ? "active" : ""
                  }`}
                  onClick={() => setActiveRoomId(room._id)}
                >
                  {room.nom_piece}
                </button>
              ))}
            </div>

            <div className="devices-container" style={{ overflowX: "auto" }}>
              {currentDevices?.map((device) => (
                <div
                  key={device._id}
                  className={`device-card ${
                    device.isOn ? "device-on" : "device-off"
                  }`}
                >
                  <div className="device-info">
                    <div className="device-icon">
                      {getDeviceIcon(device.nom_app)}
                    </div>
                    <div className="device-text">
                      <h3>{device.nom_app}</h3>
                      <span className="power">{device.power}</span>
                    </div>
                  </div>
                  <label className="switch">
                    <input
                      type="checkbox"
                      checked={device.isOn}
                      onChange={() =>
                        handleToggleDevice(device._id, device.isOn)
                      }
                    />
                    <span className="slider"></span>
                  </label>
                </div>
              ))}
            </div>

            {/* Pagination avec des flèches */}
            <div className="pagination">
              {/* Flèche précédente */}
              <button
                onClick={() => handlePagination("prev")}
                disabled={currentPage === 1}
                className="pagination-arrow"
              >
                ←
              </button>

              {/* Affichage de la page courante et du total */}
              <div className="pagination-info">
                <span>{currentPage}</span> / <span>{totalPages}</span>
              </div>

              {/* Flèche suivante */}
              <button
                onClick={() => handlePagination("next")}
                disabled={currentPage === totalPages}
                className="pagination-arrow"
              >
                →
              </button>
            </div>
          </div>

          <div className="titre-graphe">
            <h3>Graphe </h3>
          </div>
          <div className="graphe">
            <h4>Consommation journalière </h4>
            <div className="graph-container">
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={consumptionData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#eee"
                    opacity={0.1}
                  />
                  <XAxis
                    dataKey="time"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#666", fontSize: 12 }}
                  />
                  <YAxis
                    domain={[0, 60]}
                    ticks={[0, 15, 30, 45, 60]}
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#666", fontSize: 12 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="#FFB800"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <RightPanel />
      </div>
    </div>
  );
};

export default DashboardPage;
