import { useContext, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import axios from "../../utils/axios";
import "./Register.css";

const Register = () => {
  const [credentials, setCredentials] = useState({
    username: undefined,
    email: undefined,
    password: undefined,
  });

  const [registerError, setRegisterError] = useState(null);
  const { loading, error, dispatch } = useContext(AuthContext);

  const navigate = useNavigate();

  const handleChange = (e) => {
    setCredentials((prev) => ({ ...prev, [e.target.id]: e.target.value }));
  };

  const handleClick = async (e) => {
    e.preventDefault();
    setRegisterError(null);

    // Validate inputs
    if (!credentials.username || !credentials.email || !credentials.password) {
      setRegisterError("Please fill in all fields");
      return;
    }

    try {
      const res = await axios.post("/auth/register", {
        username: credentials.username,
        email: credentials.email,
        password: credentials.password
      });
      
      if (res.data) {
        // Registration successful, show success message and redirect to login
        alert("Registration successful! Please login.");
        navigate("/login");
      }
    } catch (err) {
      console.error("Registration error:", err);
      if (err.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        setRegisterError(err.response.data.message || err.response.data || "Registration failed");
      } else if (err.request) {
        // The request was made but no response was received
        setRegisterError("No response from server. Please try again later.");
      } else {
        // Something happened in setting up the request that triggered an Error
        setRegisterError("An error occurred. Please try again.");
      }
    }
  };

  return (
    <div className="login">
      <div className="lContainer">
        <h1 className="roomifyTitle">ROOMIFY</h1>
        <input
          type="text"
          placeholder="username"
          id="username"
          onChange={handleChange}
          className="lInput"
        />
        <input
          type="email"
          placeholder="email"
          id="email"
          onChange={handleChange}
          className="lInput"
        />
        <input
          type="password"
          placeholder="password"
          id="password"
          onChange={handleChange}
          className="lInput"
        />
        <button disabled={loading} onClick={handleClick} className="lButton">
          Register
        </button>
        {registerError && <span className="error-message">{registerError}</span>}
        <div className="loginLink">
          Already have an account? <Link to="/login">Click here to login</Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
