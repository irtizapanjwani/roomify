import { useLocation, useNavigate } from "react-router-dom";
import { Alert, Snackbar } from "@mui/material";
import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import { SearchContext } from "../../context/SearchContext";
import axios from "../../utils/axios";
import Navbar from "../../components/navbar/Navbar";
import Footer from "../../components/footer/Footer";
import "./profile.css";

const Profile = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, dispatch: authDispatch } = useContext(AuthContext);
  const { dispatch: searchDispatch } = useContext(SearchContext);
  const [showMessage, setShowMessage] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [formData, setFormData] = useState({
    city: user?.city || "",
    country: user?.country || "",
    phone: user?.phone || "",
  });
  
  // Log the incoming state for debugging
  useEffect(() => {
    console.log("Location State:", location.state);
  }, [location.state]);

  const message = location.state?.message;
  const returnPath = location.state?.returnPath;
  const isReservation = location.state?.isReservation;
  const reservationData = location.state?.reservationData;

  useEffect(() => {
    if (message) {
      setAlertMessage(message);
      setShowMessage(true);
    }
  }, [message]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      console.log("Submitting profile update...");
      const response = await axios.put(`/api/users/${user._id}`, formData);
      
      if (response.data.success) {
        console.log("Profile update successful");
        // Update the user context with new data
        authDispatch({ 
          type: "UPDATE_USER", 
          payload: { ...user, ...formData }
        });

        setAlertMessage("Profile updated successfully! Redirecting...");
        setShowMessage(true);

        // Log navigation data
        console.log("Navigation data:", {
          isReservation,
          returnPath,
          reservationData
        });

        // If coming from reservation, update search context and navigate back
        if (isReservation && returnPath && reservationData) {
          console.log("Preparing to redirect to reservation");
          // Update search context with saved dates and options
          if (reservationData.dates) {
            searchDispatch({
              type: "NEW_SEARCH",
              payload: {
                dates: [reservationData.dates],
                options: reservationData.options || {}
              },
            });
          }

          // Immediate navigation with a slight delay
          setTimeout(() => {
            console.log("Executing navigation to:", returnPath);
            navigate(returnPath, {
              state: {
                openReserve: true,
                reservationData: reservationData
              },
              replace: true // Use replace to avoid back button issues
            });
          }, 1500);
        } else if (returnPath) {
          console.log("Redirecting to return path:", returnPath);
          setTimeout(() => {
            navigate(returnPath, { replace: true });
          }, 1500);
        } else {
          console.log("No return path specified");
        }
      }
    } catch (err) {
      console.error("Error updating profile:", err);
      setAlertMessage(err.response?.data?.message || "Error updating profile");
      setShowMessage(true);
    }
  };

  return (
    <div>
      <Navbar />
      <div className="profileContainer">
        <h1>Update Profile</h1>
        <form onSubmit={handleSubmit} className="profileForm">
          <div className="formGroup">
            <label>City:</label>
            <input
              type="text"
              name="city"
              value={formData.city}
              onChange={handleChange}
              required
            />
          </div>
          <div className="formGroup">
            <label>Country:</label>
            <input
              type="text"
              name="country"
              value={formData.country}
              onChange={handleChange}
              required
            />
          </div>
          <div className="formGroup">
            <label>Phone:</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              required
            />
          </div>
          <button type="submit" className="updateButton">
            Update Profile
          </button>
        </form>

        <Snackbar 
          open={showMessage} 
          autoHideDuration={6000} 
          onClose={() => setShowMessage(false)}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        >
          <Alert severity="warning" sx={{ width: '100%' }}>
            {alertMessage}
          </Alert>
        </Snackbar>
      </div>
      <Footer />
    </div>
  );
};

export default Profile; 