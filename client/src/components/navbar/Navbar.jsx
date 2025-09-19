import "./navbar.css"
import { Link } from "react-router-dom"
import { AuthContext } from "../../context/AuthContext";
import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Menu, MenuItem } from "@mui/material";
import AccountCircleIcon from '@mui/icons-material/AccountCircle';

const Navbar = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const { dispatch } = useContext(AuthContext);
  const [anchorEl, setAnchorEl] = useState(null);

  const handleLogout = () => {
    dispatch({ type: "LOGOUT" });
    navigate("/");
  };

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  return (
    <div className="navbar">
      <div className="navContainer">
        <Link to='/' style={{color:"inherit", textDecoration:"none"}}>
          <span className="logo">Roomify</span>
        </Link>
        {user ? (
          <div className="navItem">
            {user.isAdmin && (
              <Link to="/admin" className="navButton">
                Admin Dashboard
              </Link>
            )}
            <Button
              color="inherit"
              onClick={handleMenuOpen}
              startIcon={<AccountCircleIcon />}
            >
              {user.username}
            </Button>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'right',
              }}
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
            >
              <MenuItem onClick={() => {
                handleMenuClose();
                navigate('/profile');
              }}>
                My Profile
              </MenuItem>
              <MenuItem onClick={() => {
                handleMenuClose();
                navigate('/connections');
              }}>
                Connections
              </MenuItem>
              <MenuItem onClick={() => {
                handleMenuClose();
                navigate('/booking-history');
              }}>
                Booking History
              </MenuItem>
              <MenuItem onClick={() => {
                handleMenuClose();
                handleLogout();
              }}>
                Logout
              </MenuItem>
            </Menu>
          </div>
        ) : (
          <div className="navItems">
            <Link to="/register" className="navButton">Register</Link>
            <Link to="/login" className="navButton">Login</Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Navbar;