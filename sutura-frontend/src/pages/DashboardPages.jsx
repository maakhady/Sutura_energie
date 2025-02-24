import  { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';
import '../styles/dashboard.css';
import RightPanel from '../components/RightPanel'

const DashboarPage = () => {
  const [consumptionData] = useState([
    { time: 'Lundi', value: 30 },
    { time: 'Mardi', value: 42 },
    { time: 'Mercredi', value: 28 },
    { time: 'Jeudi', value: 45 },
    { time: 'Vendredi', value: 32 },
    { time: 'Samedi', value: 35 },
    { time: 'Dimanche', value: 30 }
  ]);

  const [activeRoom, setActiveRoom] = useState('Salon');
  const rooms = ['Salon', 'Chambre 1', 'Chambre 2', 'Péron'];

  const devices = [
    { id: 1, name: 'Lampe 1', power: '9W', room: 'Salon', isOn: true },
    { id: 2, name: 'clim', power: '25W', room: 'Salon', isOn: false},
    { id: 3, name: 'Lampe 2', power: '9W', room: 'Salon', isOn: true },
    { id: 4, name: 'Lampe', power: '9W', room: 'Chambre 1', isOn: false },    
    { id: 5, name: 'Ventilo', power: '15W', room: 'Péron', isOn: false }
  ];

  return (
    <div className="dashboard">
      {/* Welcome Section */}
      <div className="welcome-section">
        <div className="user-profile">
          <div className="user-info">
            <h1>Bonjour Bamba !</h1>
            <p>Administrateur</p>
          </div>
        </div>
      </div>

      <div className="content-wrapper">
        <div className="main-content">
          {/* Appareils */}
          <div className="titre-appareil">
          <h3>Appareils</h3>
          </div>
          <div className="appareils">
            <div className="rooms">
              {rooms.map(room => (
                <button
                  key={room}
                  className={`room-btn ${activeRoom === room ? 'active' : ''}`}
                  onClick={() => setActiveRoom(room)}
                >
                  {room}
                </button>
              ))}
            </div>

            <div className="devices">
              {devices
                .filter(device => device.room === activeRoom)
                .map(device => (
                  <div key={device.id} className={`device-card ${device.isOn ? 'active' : ''}`}>
                    <div className="device-info">
                      <div className="device-icon">
                        {device.name === 'Lampe' ? (
                          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                            <path d="M14 19h-4c-.55 0-1 .45-1 1s.45 1 1 1h4c.55 0 1-.45 1-1s-.45-1-1-1zm-8-7h12v2H6zm0-4h12v2H6zm3-4h6v2H9z" fill="currentColor"/>
                          </svg>
                        ) : (
                          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                            <path d="M12 5c-3.87 0-7 3.13-7 7s3.13 7 7 7 7-3.13 7-7-3.13-7-7-7zm0 12c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5z" fill="currentColor"/>
                          </svg>
                        )}
                      </div>
                      <div className="device-text">
                        <h3>{device.name}</h3>
                        <span className="power">{device.power}</span>
                      </div>
                    </div>
                    <label className="switch">
                      <input type="checkbox" checked={device.isOn} onChange={() => {}} />
                      <span className="slider"></span>
                    </label>
                  </div>
                ))}
            </div>
          </div>

          {/* Graphe */}
          <div className="titre-graphe">
          <h3>Graphe </h3>
          </div>
          <div className="graphe">
            <h4>Consommation journalière </h4>
            <div className="graph-container">
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={consumptionData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#eee" opacity={0.1} />
                  <XAxis 
                    dataKey="time" 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#666', fontSize: 12 }}
                  />
                  <YAxis 
                    domain={[0, 60]}
                    ticks={[0, 15, 30, 45, 60]}
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#666', fontSize: 12 }}
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

        {/* Right Panel */}
        <RightPanel />

      </div>
    </div>
  );
};


export default DashboarPage;
