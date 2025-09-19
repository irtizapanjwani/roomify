import {
    faBed,
    faCar,
    faMapLocationDot
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import "./taxiReservationHeader.css";
import { useContext } from "react";
import { Link, useLocation } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";

const TaxiReservationHeader = ({ type }) => {
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
                      <span>My Reservation</span>
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
                      <FontAwesomeIcon icon={faCar} />
                      <span>Taxi</span>
                    </Link>
                  </div>
                </>
              )}
            </div>
            {type !== "list" && (
              <>
                <h1 className="headerTitle">
                  My Taxi Reservation
                </h1>
                <p className="headerDesc">
                  Hi, <strong>{user.username}</strong>! Ready for your ride?
                </p>
              </>
            )}
          </div>
        </div>
    );
};

export default TaxiReservationHeader;
