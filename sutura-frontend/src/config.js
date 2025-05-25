// src/config.js
const ENV = import.meta.env.MODE || 'development';

const config = {
  development: {
    apiBaseURL: 'http://localhost:2500',
    cameraURL: 'http://192.168.1.7:7000/video_feed', // URL locale

  },
  production: {
    apiBaseURL: 'https://energie-sutura.onrender.com',
    // cameraURL: 'http://192.168.1.7:7000/video_feed', // URL locale
    cameraURL: 'https://df5d-41-82-241-32.ngrok-free.app/video_feed', // URL locale


  }
};

export default config[ENV];