// pages/VerifyEmail.jsx
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";

const VerifyEmail = () => {
  const [message, setMessage] = useState("Verifying your email...");
  const location = useLocation();

  useEffect(() => {
    const query = new URLSearchParams(location.search);
    const token = query.get("token");

    if (token) {
      axios
        .post("http://localhost:8800/api/auth/verify-email", { token }) // replace with your base URL
        .then((res) => {
          setMessage(res.data);
        })
        .catch((err) => {
          setMessage(err.response?.data || "Invalid or expired link.");
        });
    } else {
      setMessage("No verification token found.");
    }
  }, [location.search]);

  return (
    <div style={{ textAlign: "center", padding: "50px" }}>
      <h2>{message}</h2>
    </div>
  );
};

export default VerifyEmail;
