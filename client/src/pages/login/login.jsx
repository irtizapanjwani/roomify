import { useContext, useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import axios from "../../utils/axios";
import "./login.css";

const Login = () => {
  const [credentials, setCredentials] = useState({
    username: undefined,
    password: undefined,
  });

  const { loading, error, dispatch } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const handleChange = (e) => {
    setCredentials((prev) => ({ ...prev, [e.target.id]: e.target.value }));
  };

  const handleClick = async (e) => {
    e.preventDefault();
    try {
      dispatch({ type: "LOGIN_START" });
      console.log("Attempting login with:", credentials);

      const res = await axios.post("/auth/login", credentials);
      console.log("Login response:", res.data);

      // Access the data from the response
      const { data: userData } = res.data;
      if (!userData || !userData.access_token) {
        throw new Error("Invalid response from server - no token received");
      }

      // Store auth data
      localStorage.setItem("access_token", userData.access_token);

      // Remove access_token from user data before storing
      const { access_token, ...userDataWithoutToken } = userData;
      localStorage.setItem("user", JSON.stringify(userDataWithoutToken));

      // Update context with the user data (without token)
      dispatch({ type: "LOGIN_SUCCESS", payload: userDataWithoutToken });

      // Get the redirect path from state or default to home
      const redirectPath = location.state?.from || '/';
      navigate(redirectPath);
    } catch (err) {
      dispatch({
        type: "LOGIN_FAILURE",
        payload: err.response?.data?.message || "Login failed",
      });
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
          autoComplete="username"
        />
        <input
          type="password"
          placeholder="password"
          id="password"
          onChange={handleChange}
          className="lInput"
          autoComplete="current-password"
        />
        <button
          disabled={loading}
          onClick={handleClick}
          className="lButton"
        >
          {loading ? "Logging in..." : "Login"}
        </button>
        {error && <span className="error-message">{error}</span>}
        <div className="registerLink">
          Don't have an account? <Link to="/register">Click here to register</Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
