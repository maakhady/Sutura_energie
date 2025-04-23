// src/config.js
const ENV = import.meta.env.MODE || 'development';

const config = {
  development: {
    apiBaseURL: 'http://localhost:2500',
    cameraURL: 'http://192.168.1.147:7000/video_feed', // URL locale

  },
  production: {
    apiBaseURL: 'https://sutura-energie.onrender.com',
    cameraURL: 'http://192.168.1.147:7000/video_feed', // URL locale

  }
};

export default config[ENV];