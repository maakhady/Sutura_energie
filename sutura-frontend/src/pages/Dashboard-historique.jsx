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
import { FileUpIcon, LineChartIcon, LogsIcon } from "lucide-react";

const DashboardHistorique = () => {
  const [utilisateur, setUtilisateur] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("consommation");
  const [selectedPeriod, setSelectedPeriod] = useState("semaine");
  const [activityLogs, setActivityLogs] = useState([]); // 🔹 Stocke les logs récupérés
  const [loadingLogs, setLoadingLogs] = useState(true); // 🔹 Indicateur de chargement des logs
  const [currentPage, setCurrentPage] = useState(1);
  const logsPerPage = 5;

  const indexOfLastLog = currentPage * logsPerPage;
  const indexOfFirstLog = indexOfLastLog - logsPerPage;
  const currentLogs = activityLogs.slice(indexOfFirstLog, indexOfLastLog);
  const totalPages = Math.ceil(activityLogs.length / logsPerPage);

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
    } catch (error) {
      console.error("Erreur lors de la récupération des logs :", error);
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
        // Première lettre en majuscule pour tout autre rôle
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
    const interval = setInterval(fetchLogs, 10000); // 🔄 Rafraîchit toutes les 10 sec
    return () => clearInterval(interval); // ✅ Nettoie l'intervalle quand le composant est démonté
  }, []);

  // Données de consommation par période
  const weeklyData = [
    { time: "Lundi", value: 25 },
    { time: "Mardi", value: 37 },
    { time: "Mercredi", value: 22 },
    { time: "Jeudi", value: 45 },
    { time: "Vendredi", value: 32 },
    { time: "Samedi", value: 37 },
    { time: "Dimanche", value: 28 },
  ];

  const monthlyData = [
    { time: "Jan", value: 32 },
    { time: "Fév", value: 38 },
    { time: "Mar", value: 30 },
    { time: "Avr", value: 35 },
    { time: "Mai", value: 28 },
    { time: "Juin", value: 40 },
    { time: "Juil", value: 45 },
    { time: "Août", value: 48 },
    { time: "Sep", value: 37 },
    { time: "Oct", value: 30 },
    { time: "Nov", value: 25 },
    { time: "Déc", value: 35 },
  ];

  // Fonction pour obtenir les données selon la période sélectionnée
  const getConsumptionData = () => {
    return selectedPeriod === "semaine" ? weeklyData : monthlyData;
  };

  // Fonction pour obtenir la configuration Y selon la période
  const getYAxisConfig = () => {
    if (selectedPeriod === "semaine") {
      return {
        domain: [0, 50],
        ticks: [0, 10, 20, 30, 40, 50],
      };
    } else {
      // Configuration pour les données mensuelles
      return {
        domain: [0, 50],
        ticks: [0, 10, 20, 30, 40, 50],
      };
    }
  };

  // Logs d'activité fictifs
  /*   const activityLogs = [
    {
      id: 1,
      device: "Lampe Salon",
      action: "Allumée",
      time: "17/02/2025 13:20",
      user: "Utilisateur",
    },
    {
      id: 2,
      device: "Climatiseur",
      action: "Éteint",
      time: "17/02/2025 12:45",
      user: "Système",
    },
    {
      id: 3,
      device: "Télévision",
      action: "Allumée",
      time: "17/02/2025 11:30",
      user: "Utilisateur",
    },
    {
      id: 4,
      device: "Panneau solaire",
      action: "Mode économie activé",
      time: "17/02/2025 10:15",
      user: "Système",
    },
    {
      id: 5,
      device: "Porte d'entrée",
      action: "Verrouillée",
      time: "17/02/2025 09:00",
      user: "Utilisateur",
    },
  ]; */

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
                {/*chart avec lucide react*/}
                <LineChartIcon size={20} />
                Consommation
              </button>
              <button
                className={`tab-btn ${activeTab === "logs" ? "active" : ""}`}
                onClick={() => setActiveTab("logs")}
              >
                {/*logs avec lucide react*/}
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
                <div className="chart-container">
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart
                      data={getConsumptionData()}
                      margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
                    >
                      <CartesianGrid vertical={false} horizontal={false} />
                      <XAxis
                        dataKey="time"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: "#666", fontSize: 12 }}
                        dy={10}
                        interval={
                          selectedPeriod === "mois" ? 0 : "preserveStart"
                        }
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
              </div>
            ) : (
              <div className="activity-logs">
                <div className="logs-header">
                  <h3>Journal d{"'"}activités</h3>
                  <button className="export-btn">
                    <FileUpIcon size={20} />
                    Exporter
                  </button>
                </div>
                <div className="logs-table-container">
                  <table className="logs-table">
                    <thead>
                      <tr>
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
                            <td>{log.nom_appareil}</td>
                            <td>{log.type_operation}</td>
                            <td>{new Date(log.createdAt).toLocaleString()}</td>
                            <td>
                              {log.user
                                ? `${log.user.prenom} ${log.user.nom}`
                                : "Système"}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="4">Aucun log trouvé.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                  <div className="pagination">
                    <button onClick={prevPage} disabled={currentPage === 1}>
                      ◀ Précédent
                    </button>
                    <span>
                      Page {currentPage} sur {totalPages}
                    </span>
                    <button
                      onClick={nextPage}
                      disabled={currentPage === totalPages}
                    >
                      Suivant ▶
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
