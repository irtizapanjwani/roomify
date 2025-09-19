import "./adminNav.css";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useContext, useState } from "react";
import { AuthContext } from "../../context/AuthContext";

const AdminNav = () => {
  const { user, dispatch } = useContext(AuthContext);
  const [showDropdown, setShowDropdown] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch({ type: "LOGOUT" });
    navigate("/login");
  };

  // Function to check if a link is active
  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <div className="adminNav">
      <div className="adminNavContainer">
        <Link to="/admin" className="logo">
          Admin Dashboard
        </Link>
        <div className="adminNavItems">
          <Link 
            to="/admin/hotels" 
            className={`adminNavLink ${isActive('/admin/hotels') ? 'active' : ''}`}
          >
            Hotels
          </Link>
          <Link 
            to="/admin/reservations" 
            className={`adminNavLink ${isActive('/admin/reservations') ? 'active' : ''}`}
          >
            Reservations
          </Link>
          <Link 
            to="/admin/users" 
            className={`adminNavLink ${isActive('/admin/users') ? 'active' : ''}`}
          >
            Users
          </Link>
          <div className="adminNavUserContainer">
            <span 
              className="adminNavUser"
              onClick={() => setShowDropdown(!showDropdown)}
            >
              Welcome, {user?.username || 'Admin'}
            </span>
            {showDropdown && (
              <div className="adminNavDropdown">
                <Link to="/admin/profile" className="dropdownItem">
                  Profile
                </Link>
                <button onClick={handleLogout} className="dropdownItem">
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminNav; 