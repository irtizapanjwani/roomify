import {
    faBed,
    faPlane,
    faMapLocationDot
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import "./reservationHeader.css";
import { useContext } from "react";
import { Link, useLocation } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";

const ReservationHeader = ({ type }) => {
    const { user } = useContext(AuthContext);
    const location = useLocation();

    // Function to check if a path is active
    const isActive = (path) => {
      return location.pathname === path;
    };

    return (
        <div className="header">
          <div
            className={
              type === "list" ? "headerContainer listMode" : "headerContainer"
            }
          >
            <div className="headerList">
              <div className={`headerListItem ${isActive('/') ? 'active' : ''}`}>
                <Link to='/' style={{ color: "inherit", textDecoration: "none" }}>
                  <FontAwesomeIcon icon={faBed} />
                  <span>Stays</span>
                </Link>
              </div>
              {user && (
                <>
                  <div className={`headerListItem ${isActive('/reservation') ? 'active' : ''}`}>
                    <Link to='/reservation' style={{ color: "inherit", textDecoration: "none" }}>
                      <FontAwesomeIcon icon={faBed} />
                      <span>My Reservations</span>
                    </Link>
                  </div>
                  <div className={`headerListItem ${isActive('/attractions') ? 'active' : ''}`}>
                    <Link to='/attractions' style={{ color: "inherit", textDecoration: "none" }}>
                      <FontAwesomeIcon icon={faMapLocationDot} />
                      <span>Attractions</span>
                    </Link>
                  </div>
                  <div className={`headerListItem ${isActive('/taxi') ? 'active' : ''}`}>
                    <Link to='/taxi' style={{ color: "inherit", textDecoration: "none" }}>
                      <FontAwesomeIcon icon={faPlane} />
                      <span>Taxi</span>
                    </Link>
                  </div>
                </>
              )}
            </div>
            {type !== "list" && (
              <>
                <h1 className="headerTitle">
                  {isActive('/reservation') ? 'My Hotel Reservations' : 
                   isActive('/taxi') ? 'Taxi Service' : 
                   'My Reservations'}
                </h1>
                <p className="headerDesc">
                  Hi, <strong>{user?.username}</strong>! Good to see you back!
                </p>
              </>
            )}
          </div>
        </div>
    );
};

export default ReservationHeader;
