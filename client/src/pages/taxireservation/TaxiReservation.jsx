import { useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect, useContext } from "react";
import axios from "../../utils/axios";
import Navbar from "../../components/navbar/Navbar";
import TaxiReservationHeader from "../../components/TaxiReservationHeader/TaxiReservationHeader";
import Footer from "../../components/footer/Footer";
import "./taxireservation.css";
import { AuthContext } from "../../context/AuthContext";
import { Alert, Snackbar, Dialog, DialogTitle, DialogContent, DialogActions, Button } from "@mui/material";
import ProfileUpdateModal from "../../components/profileUpdate/ProfileUpdateModal";

const TaxiReservation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, dispatch } = useContext(AuthContext);

  const [pickupTime, setPickupTime] = useState("");
  const [pickupDate, setPickupDate] = useState("");
  const [pickupAddress, setPickupAddress] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [reservations, setReservations] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showProfileAlert, setShowProfileAlert] = useState(false);
  const [pendingReservation, setPendingReservation] = useState(null);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [cancelReservationId, setCancelReservationId] = useState(null);
  const [showCancelSuccess, setShowCancelSuccess] = useState(false);

  const serviceType = location.state?.service;

  const checkProfileComplete = () => {
    // Get the latest user data from context
    const currentUser = JSON.parse(localStorage.getItem("user"));
    if (!currentUser?.city || !currentUser?.country || !currentUser?.phone) {
      return false;
    }
    return true;
  };

  const fetchReservations = async () => {
    try {
      setLoading(true);
      setError("");
      
      const token = localStorage.getItem("access_token");
      if (!token) {
        throw new Error("No authentication token found");
      }

      const res = await axios.get("/api/taxi/reservations", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      setReservations(res.data || []);
      setLoading(false);
    } catch (err) {
      console.error("Failed to fetch taxi reservations:", err);
      setError("Failed to load your reservations. Please try again later.");
      setLoading(false);
      throw err;
    }
  };

  useEffect(() => {
    fetchReservations();
  }, []);

  const createReservation = async () => {
    try {
      setError("");
      const token = localStorage.getItem("access_token");
      
      await axios.post("/api/taxi/reserve", {
        serviceType,
        pickupTime,
        pickupDate,
        pickupAddress,
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      setIsSubmitted(true);
      await fetchReservations();
      // Reset form
      setPickupTime("");
      setPickupDate("");
      setPickupAddress("");
      setPendingReservation(null);
      setTimeout(() => setIsSubmitted(false), 3000);
    } catch (err) {
      console.error("Reservation error:", err);
      if (err.response?.status === 401) {
        // Clear invalid token
        localStorage.removeItem("access_token");
        localStorage.removeItem("user");
        navigate("/login", { 
          state: { 
            from: location.pathname,
            service: serviceType
          } 
        });
      } else {
        setError(err.response?.data?.message || "Failed to create reservation.");
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      navigate("/login", { 
        state: { 
          from: location.pathname,
          service: serviceType
        } 
      });
      return;
    }

    if (!serviceType) {
      setError("Please select a service type first.");
      return;
    }

    // Store the reservation details
    const reservationDetails = {
      serviceType,
      pickupTime,
      pickupDate,
      pickupAddress,
    };

    if (!checkProfileComplete()) {
      setPendingReservation(reservationDetails);
      setShowProfileAlert(true);
      setShowProfileModal(true);
      return;
    }
    
    await createReservation();
  };

  const handleProfileUpdateSuccess = async (updatedUserData) => {
    // Update the user context with new data
    dispatch({ 
      type: "UPDATE_USER", 
      payload: updatedUserData
    });
    
    setShowProfileModal(false);
    setShowProfileAlert(false);

    // If there's a pending reservation, create it
    if (pendingReservation) {
      await createReservation();
    }
  };

  const handleCancelClick = (reservationId) => {
    setShowCancelDialog(true);
    setCancelReservationId(reservationId);
  };

  const handleCancelConfirm = async () => {
    try {
      setError("");
      await axios.post(`/api/taxi/reservations/${cancelReservationId}/cancel`);
      setShowCancelDialog(false);
      setShowCancelSuccess(true);
      
      // Immediately remove the cancelled reservation from state
      setReservations(prevReservations => 
        prevReservations.filter(reservation => reservation._id !== cancelReservationId)
      );
      
      // Auto-hide success message after 4 seconds
      setTimeout(() => {
        setShowCancelSuccess(false);
      }, 4000);
    } catch (err) {
      console.error("Failed to cancel reservation:", err);
      setError(err.response?.data?.message || "Failed to cancel reservation. Please try again later.");
    }
  };

  const handleCancelDialogClose = () => {
    setShowCancelDialog(false);
    setCancelReservationId(null);
  };

  // If not authenticated, return null and let useEffect handle redirect
  if (!user) {
    return null;
  }

  return (
    <div>
      <Navbar />
      <TaxiReservationHeader />
      <div className="taxi-reservation-container">
        <h2>Reserve Your {serviceType || "Taxi"}</h2>
        {error && <div className="error-message">{error}</div>}
        
        <form className="taxi-reservation-form" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="pickupDate">Pickup Date</label>
            <input
              type="date"
              id="pickupDate"
              required
              value={pickupDate}
              onChange={(e) => setPickupDate(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="pickupTime">Pickup Time</label>
            <input
              type="time"
              id="pickupTime"
              required
              value={pickupTime}
              onChange={(e) => setPickupTime(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="pickupAddress">Pickup Address</label>
            <input
              type="text"
              id="pickupAddress"
              placeholder="Enter your pickup location"
              required
              value={pickupAddress}
              onChange={(e) => setPickupAddress(e.target.value)}
            />
          </div>
          <button type="submit">Confirm Reservation</button>
        </form>

        {isSubmitted && (
          <div className="reservation-success">
            <Alert severity="success" sx={{ width: '100%', marginBottom: '10px' }}>
              Your taxi reservation has been created successfully!
            </Alert>
            <Alert severity="info" sx={{ width: '100%' }}>
              To proceed with your reservation, please complete the payment in the "Your Reservations" section below.
            </Alert>
          </div>
        )}

        <div className="reservations-list">
          <h3>Your Reservations</h3>
          {loading ? (
            <p>Loading your reservations...</p>
          ) : reservations.length > 0 ? (
            <div className="reservations-grid">
              {reservations.map((reservation) => (
                <div key={reservation._id} className="reservation-card">
                  <h4>{reservation.serviceType} Service</h4>
                  <p>Date: {new Date(reservation.pickupDate).toLocaleDateString()}</p>
                  <p>Time: {reservation.pickupTime}</p>
                  <p>Address: {reservation.pickupAddress}</p>
                  <p>Status: {reservation.paymentStatus}</p>
                  {reservation.paymentStatus === "pending" && (
                    <button
                      onClick={() => navigate(`/taxipayment/${reservation._id}`, {
                        state: { reservation }
                      })}
                      className="payment-button"
                    >
                      Pay Now
                    </button>
                  )}
                  {reservation.paymentStatus === "paid" && (
                    <div className="button-group">
                      <button
                        onClick={() => navigate(`/tracktaxi/${reservation._id}`)}
                        className="track-button"
                      >
                        Track Driver
                      </button>
                      <button
                        onClick={() => handleCancelClick(reservation._id)}
                        className="cancel-button"
                      >
                        Cancel & Refund
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p>No reservations found.</p>
          )}
        </div>
      </div>
      <Footer />

      {/* Profile Update Modal */}
      {showProfileModal && (
        <ProfileUpdateModal
          setOpen={setShowProfileModal}
          onUpdateSuccess={handleProfileUpdateSuccess}
        />
      )}

      {/* Cancellation Confirmation Dialog */}
      <Dialog
        open={showCancelDialog}
        onClose={handleCancelDialogClose}
        aria-labelledby="cancel-dialog-title"
      >
        <DialogTitle id="cancel-dialog-title">
          Cancel Reservation
        </DialogTitle>
        <DialogContent>
          Are you sure you want to cancel this reservation? The amount will be refunded to your bank account.
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelDialogClose} color="primary">
            No
          </Button>
          <Button onClick={handleCancelConfirm} color="primary" variant="contained">
            Yes
          </Button>
        </DialogActions>
      </Dialog>

      {/* Profile Alert */}
      <Snackbar 
        open={showProfileAlert} 
        autoHideDuration={3000} 
        onClose={() => setShowProfileAlert(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert severity="warning" sx={{ width: '100%' }}>
          Please complete your profile information before making a reservation.
        </Alert>
      </Snackbar>

      {/* Cancellation Success Message */}
      <Snackbar
        open={showCancelSuccess}
        autoHideDuration={4000}
        onClose={() => setShowCancelSuccess(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert severity="success" sx={{ width: '100%' }}>
          Your reservation has been cancelled and refund has been given to your bank account.
        </Alert>
      </Snackbar>
    </div>
  );
};

export default TaxiReservation;
