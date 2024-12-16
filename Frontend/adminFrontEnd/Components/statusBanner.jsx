// StatusBanner.jsx
import React from "react";

const StatusBanner = ({ status }) => {
  // Define styles or classes for different statuses
  const getStatusStyle = (status) => {
    switch (status) {
      case "OrderPlaced":
        return { backgroundColor: "#f0ad4e", color: "#fff" }; // Yellow
      case "PaymentConfirmed":
        return { backgroundColor: "#5bc0de", color: "#fff" }; // Blue
      case "OrderProcessing":
        return { backgroundColor: "#0275d8", color: "#fff" }; // Dark Blue
      case "Shipped":
        return { backgroundColor: "#5cb85c", color: "#fff" }; // Green
      case "OutForDelivery":
        return { backgroundColor: "#f0ad4e", color: "#fff" }; // Yellow
      case "Delivered":
        return { backgroundColor: "#5cb85c", color: "#fff" }; // Green
      case "Completed":
        return { backgroundColor: "#292b2c", color: "#fff" }; // Gray
      default:
        return { backgroundColor: "#d9534f", color: "#fff" }; // Red (error/unknown)
    }
  };

  return (
    <div
      style={{
        ...getStatusStyle(status),
        padding: "10px",
        borderRadius: "5px 5px 0 0", // Rounded top corners
        textAlign: "center",
        fontWeight: "bold",
        fontSize: "1.2rem",
      }}
    >
      {status}
    </div>
  );
};

export default StatusBanner;
