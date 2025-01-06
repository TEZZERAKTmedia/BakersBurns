import React from "react";
import { useNavigate } from "react-router-dom";

const CheckoutOptions = () => {
  const navigate = useNavigate();

  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h2>Checkout Options</h2>
      <p>How would you like to proceed?</p>
      <div style={{ marginTop: "20px" }}>
        <button
          style={{
            padding: "10px 20px",
            margin: "10px",
            background: "linear-gradient(to right, #007bff, #0056b3)",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
          }}
          onClick={() => navigate("/guest-checkout")}
        >
          Guest Checkout
        </button>
        <button
          style={{
            padding: "10px 20px",
            margin: "10px",
            background: "linear-gradient(to right, #ffc107, #e0a800)",
            color: "black",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
          }}
          onClick={() => navigate("/sign-up")}
        >
          Sign-Up
        </button>
        <button
          style={{
            padding: "10px 20px",
            margin: "10px",
            background: "linear-gradient(to right, #28a745, #218838)",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
          }}
          onClick={() => navigate("/login")}
        >
          Login
        </button>
      </div>
    </div>
  );
};

export default CheckoutOptions;
