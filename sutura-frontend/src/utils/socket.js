import { io } from "socket.io-client";

// Create a singleton socket instance
export const socket = io("http://localhost:2500");

// Keep track of emergency status
let emergencyStatus = null;

// Function to get current emergency status
export const getEmergencyStatus = () => emergencyStatus;

// Function to set emergency status
export const setEmergencyStatus = (status) => {
  emergencyStatus = status;
};

// Setup emergency listener
socket.on("emergency_shutdown", (data) => {
  setEmergencyStatus(data);
});
