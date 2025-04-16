import { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import "../styles/historique.css";
import RightPanel from "../components/RightPanel";
import { authService } from "../services/authService";
import { HistoriqueService } from "../services/HistoriqueService";
import { EnergieService } from "../services/EnergieService";
import { socket, getEmergencyStatus } from "../utils/socket";
import Swal from "sweetalert2";
import {
  FileUpIcon,
  LineChartIcon,
  LogsIcon,
  ArrowLeftToLine,
  ArrowRightToLine,
} from "lucide-react";

const DashboardHistorique = () => {
  const [utilisateur, setUtilisateur] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("consommation");
  const [selectedPeriod, setSelectedPeriod] = useState("semaine");
  const [activityLogs, setActivityLogs] = useState([]);
  const [loadingLogs, setLoadingLogs] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const logsPerPage = 5;

  // Variables d'état pour la consommation
  const [consommationData, setConsommationData] = useState([]);
  const [loadingConsommation, setLoadingConsommation] = useState(true);
  const [errorConsommation, setErrorConsommation] = useState(null);

  const indexOfLastLog = currentPage * logsPerPage;
  const indexOfFirstLog = indexOfLastLog - logsPerPage;
  const currentLogs = activityLogs.slice(indexOfFirstLog, indexOfLastLog);
  const totalPages = Math.ceil(activityLogs.length / logsPerPage);

  useEffect(() => {
    // Check for existing emergency status
    const currentEmergency = getEmergencyStatus();
    if (currentEmergency) {
      Swal.fire({
        title: "🚨 Alerte de Sécurité !",
        text: currentEmergency.message,
        icon: "warning",
        confirmButtonText: "Compris",
        confirmButtonColor: "#274c77",
        background: "#fff",
        customClass: {
          popup: "emergency-alert",
        },
      });
    }

    // Listen for emergency updates
    const handleEmergency = (data) => {
      console.log("🚨 Arrêt d'urgence reçu:", data);

      Swal.fire({
        title: "🚨 Alerte de Sécurité !",
        text: data.message,
        icon: "warning",
        confirmButtonText: "Compris",
        confirmButtonColor: "#274c77",
        background: "#fff",
        customClass: {
          popup: "emergency-alert",
        },
      });
    };

    socket.on("emergency_shutdown", handleEmergency);

    return () => {
      socket.off("emergency_shutdown", handleEmergency);
    };
  }, []);

  // Ordre chronologique des mois pour l'affichage
  const monthsOrder = [
    { id: 1, label: "jan" },
    { id: 2, label: "fév" },
    { id: 3, label: "mar" },
    { id: 4, label: "avr" },
    { id: 5, label: "mai" },
    { id: 6, label: "jui" },
    { id: 7, label: "jul" },
    { id: 8, label: "aoû" },
    { id: 9, label: "sep" },
    { id: 10, label: "oct" },
    { id: 11, label: "nov" },
    { id: 12, label: "déc" },
  ];

  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const fetchLogs = async () => {
    try {
      const logsData = await HistoriqueService.voirLogsAppareil();
      setActivityLogs(logsData);
      setLoadingLogs(false);
    } catch (error) {
      console.error("Erreur lors de la récupération des logs :", error);
      setLoadingLogs(false);
    }
  };

  // Fonction pour formater les données mensuelles avec des numéros comme clés
  const formatMonthlyData = (data) => {
    if (!data || (!data.mois && !Array.isArray(data))) return [];

    // Récupérer les données dans le bon format
    const monthsData = data.mois || data;

    // Créer un objet pour stocker les données par mois
    const monthDataMap = {};

    // Initialiser tous les mois avec des valeurs à 0
    monthsOrder.forEach((month) => {
      monthDataMap[month.id] = {
        monthId: month.id,
        monthLabel: month.label,
        value: 0,
      };
    });

    // Remplir avec les données réelles
    monthsData.forEach((item) => {
      const date = new Date(item.date);
      const month = item.mois_numero || date.getMonth() + 1;

      if (monthDataMap[month]) {
        monthDataMap[month].value = item.total_consommation;
      }
    });

    // Convertir l'objet en tableau trié par id de mois
    return Object.values(monthDataMap).sort((a, b) => a.monthId - b.monthId);
  };

  // Fonction pour récupérer les données de consommation
  // Add this new formatData function
  const formatData = (rawData) => {
    if (!Array.isArray(rawData)) return [];

    return rawData.map((item) => {
      const date = item.date
        ? new Date(item.date)
        : item._id && item._id.year
        ? new Date(item._id.year, item._id.month - 1, item._id.day)
        : new Date();

      return {
        time: date.toLocaleDateString("fr-FR", { weekday: "long" }),
        value: Number(item.total_consommation?.toFixed(2)) || 0,
      };
    });
  };

  // Update the fetchConsommationData function
  const fetchConsommationData = async () => {
    try {
      setLoadingConsommation(true);
      setErrorConsommation(null);

      let response;
      if (selectedPeriod === "semaine") {
        response = await EnergieService.getConsommationSemaine();

        if (response && response.data) {
          const formattedData = formatData(response.data);
          setConsommationData(formattedData);
        } else {
          setConsommationData([]);
        }
      } else {
        response = await EnergieService.getConsommationMois();

        if (response && response.data) {
          const formattedData = formatMonthlyData(response.data);
          setConsommationData(formattedData);
        } else {
          setConsommationData([]);
        }
      }

      if (consommationData.length === 0) {
        setErrorConsommation("Aucune donnée disponible pour cette période.");
      }
    } catch (error) {
      console.error(
        `Erreur lors de la récupération des données de consommation ${selectedPeriod}:`,
        error
      );
      setErrorConsommation(
        `Impossible de charger les données de consommation pour la ${selectedPeriod}`
      );
      setConsommationData([]);
    } finally {
      setLoadingConsommation(false);
    }
  };

  // Fonction pour formatter le rôle
  const formatterRole = (role) => {
    if (!role) return "";

    switch (role.toLowerCase()) {
      case "admin":
        return "Administrateur";
      case "utilisateur":
        return "Utilisateur";
      default:
        return role.charAt(0).toUpperCase() + role.slice(1);
    }
  };

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await authService.getMyProfile();
        if (response && response.success) {
          setUtilisateur(response.data);
        }
      } catch (error) {
        console.error("Erreur lors de la récupération du profil:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
    fetchLogs();

    const interval = setInterval(fetchLogs, 10000);
    return () => clearInterval(interval);
  }, []);

  // Effet pour charger les données de consommation quand la période change
  useEffect(() => {
    fetchConsommationData();
  }, [selectedPeriod]);

  // Fonction pour obtenir la configuration Y selon les données
  const getYAxisConfig = () => {
    if (consommationData.length === 0)
      return { domain: [0, 50], ticks: [0, 10, 20, 30, 40, 50] };

    // Calculer le max pour définir le domaine de l'axe Y
    const maxValue = Math.max(...consommationData.map((item) => item.value));
    const roundedMax = Math.ceil(maxValue / 10) * 10; // Arrondi à la dizaine supérieure

    // Générer les graduations
    const tickCount = 5;
    const tickStep = roundedMax / tickCount;
    const ticks = Array.from({ length: tickCount + 1 }, (_, i) => i * tickStep);

    return {
      domain: [0, roundedMax],
      ticks: ticks,
    };
  };

  // Fonction pour déterminer la clé à utiliser pour l'affichage dans le graphique
  const getTimeDisplayKey = () => {
    return selectedPeriod === "mois" ? "monthLabel" : "time";
  };

  return (
    <div className="dashboard2">
      {/* Welcome Section avec formatage du rôle */}
      <div className="welcome-section">
        <div className="user-profile">
          <div className="user-info">
            {loading ? (
              <p>Chargement...</p>
            ) : (
              <>
                <h1>
                  Bonjour{" "}
                  {utilisateur
                    ? `${utilisateur.prenom} ${utilisateur.nom}`
                    : "Utilisateur"}{" "}
                  !
                </h1>
                <p>
                  {utilisateur
                    ? formatterRole(utilisateur.role)
                    : "Non connecté"}
                </p>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="content-wrapper">
        <div className="main-content2">
          {/* Historique et Activités */}
          <div className="historique-header">
            <h2>Historique et Activités</h2>
            <p>Visualisez et analysez votre consommation énergétique </p>
          </div>

          {/* Sélecteur de période et onglets */}
          <div className="historique-controls">
            <div className="period-selector">
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="period-dropdown"
              >
                <option value="semaine">Semaine</option>
                <option value="mois">Mois</option>
              </select>
            </div>

            <div className="tabs">
              <button
                className={`tab-btn ${
                  activeTab === "consommation" ? "active" : ""
                }`}
                onClick={() => setActiveTab("consommation")}
              >
                <LineChartIcon size={20} />
                Consommation
              </button>
              <button
                className={`tab-btn ${activeTab === "logs" ? "active" : ""}`}
                onClick={() => setActiveTab("logs")}
              >
                <LogsIcon size={20} />
                Logs d{"'"}activité
              </button>
            </div>
          </div>

          {/* Contenu principal */}
          <div className="historique-content">
            {activeTab === "consommation" ? (
              <div className="consumption-chart">
                <div className="chart-header">
                  <h3 style={{ color: "#274c77" }}>Consommation courante</h3>{" "}
                  <span className="chart-type">Électricité</span>
                </div>
                {loadingConsommation ? (
                  <div className="loading-indicator">
                    Chargement des données...
                  </div>
                ) : errorConsommation ? (
                  <div className="error-message">{errorConsommation}</div>
                ) : consommationData.length === 0 ? (
                  <div className="no-data-message">
                    Aucune donnée de consommation disponible
                  </div>
                ) : (
                  <div className="chart-container">
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart
                        data={consommationData}
                        margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
                      >
                        <CartesianGrid vertical={false} horizontal={false} />
                        <XAxis
                          dataKey={getTimeDisplayKey()}
                          axisLine={false}
                          tickLine={false}
                          tick={{ fill: "#666", fontSize: 12 }}
                          dy={10}
                          interval={0}
                          type="category"
                        />
                        <YAxis
                          domain={getYAxisConfig().domain}
                          ticks={getYAxisConfig().ticks}
                          axisLine={false}
                          tickLine={false}
                          tick={{ fill: "#666", fontSize: 12 }}
                          tickFormatter={(value) => `${value}kWh`}
                          dx={-5}
                        />
                        <Line
                          type="natural"
                          dataKey="value"
                          stroke="#FFB800"
                          strokeWidth={2}
                          dot={false}
                          isAnimationActive={false}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>
            ) : (
              <div className="activity-logs">
                <div className="logs-header">
                  <h3>Journal d{"'"}activités des Appareils</h3>
                  <button className="export-btn">
                    <FileUpIcon size={20} />
                    Exporter
                  </button>
                </div>
                <div className="logs-table-container">
                  {loadingLogs ? (
                    <div className="loading-indicator">
                      Chargement des logs...
                    </div>
                  ) : (
                    <table className="logs-table">
                      <thead>
                        <tr>
                          <th>Pieces</th>
                          <th>Appareil</th>
                          <th>Action</th>
                          <th>Date/Heure</th>
                          <th>Utilisateur</th>
                        </tr>
                      </thead>
                      <tbody>
                        {currentLogs.length > 0 ? (
                          currentLogs.map((log) => (
                            <tr key={log._id}>
                              <td>{log.nom_piece || "Non définie"}</td>
                              <td>{log.nom_app}</td>
                              <td>{log.type_operation}</td>
                              <td>
                                {new Date(log.createdAt).toLocaleString()}
                              </td>
                              <td>
                                {log.user
                                  ? `${log.user.prenom} ${log.user.nom}`
                                  : "Système"}
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan="5">Aucun log trouvé.</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  )}
                  <div className="pagination">
                    <button onClick={prevPage} disabled={currentPage === 1}>
                      <ArrowLeftToLine size={18} />
                      Précédent
                    </button>
                    <span>
                      Page {currentPage} sur {totalPages}
                    </span>
                    <button
                      onClick={nextPage}
                      disabled={currentPage === totalPages}
                    >
                      Suivant
                      <ArrowRightToLine size={18} />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Panel */}
        <RightPanel />
      </div>
    </div>
  );
};

export default DashboardHistorique;
