import Featured from "../../components/featured/Featured";
import Footer from "../../components/footer/Footer";
import ReservationHeader from "../../components/reservationHeader/reservationHeader";
import MailList from "../../components/mailList/MailList";
import Navbar from "../../components/navbar/Navbar";
import "./Reservation.css";
import { AuthContext } from "../../context/AuthContext";
import useFetch from "../../hooks/useFetch";
import { useContext, useEffect, useState } from "react";
import Button from 'react-bootstrap/Button';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Popover from 'react-bootstrap/Popover';
import axios from "../../utils/axios";
import { useNavigate, useLocation } from "react-router-dom";
import { Alert, Dialog, DialogTitle, DialogContent, DialogActions, Typography, Snackbar } from "@mui/material";
import ShareReservationModal from "../../components/reservation/ShareReservationModal";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faShare } from '@fortawesome/free-solid-svg-icons';
import { formatUSD } from "../../utils/currencyConverter";

const Reservation = () => {
  const { user } = useContext(AuthContext);
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const [showShareModal, setShowShareModal] = useState(false);
  const [selectedReservationId, setSelectedReservationId] = useState(null);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [reservationToCancel, setReservationToCancel] = useState(null);
  const [refundMessage, setRefundMessage] = useState("");
  const [showRefundMessage, setShowRefundMessage] = useState(false);
  const [countdowns, setCountdowns] = useState({});

  useEffect(() => {
    if (!user) {
      navigate("/login", { state: { from: location.pathname } });
      return;
    }

    const fetchReservations = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await axios.get(`/api/users/${user._id}`);
        
        if (response.data.success) {
          const reservationData = response.data.data.reservations || [];
          console.log("Fetched reservations:", reservationData);
          
          // Initialize countdowns for each reservation
          const initialCountdowns = {};
          reservationData.forEach(reservation => {
            // Use the reservation's createdAt timestamp
            const bookingTime = new Date(reservation.reservation.createdAt || new Date());
            initialCountdowns[reservation._id] = bookingTime;
          });
          setCountdowns(initialCountdowns);
          
          // Filter out past reservations
          const currentDate = new Date();
          const activeReservations = reservationData.filter(reservation => {
            const endDate = new Date(reservation.reservation.dateEnd);
            return endDate >= currentDate;
          });
          
          setReservations(activeReservations);
        } else {
          setError("Failed to fetch reservations");
        }
      } catch (err) {
        console.error("Error fetching reservations:", err);
        setError(err.response?.data?.message || "Failed to fetch reservations");
      } finally {
        setLoading(false);
      }
    };

    fetchReservations();
  }, [user, navigate, location.pathname]);

  // Update countdowns every second
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setCountdowns(prev => {
        const updated = { ...prev };
        Object.keys(updated).forEach(id => {
          // Keep the original booking time
          const bookingTime = updated[id];
          if (bookingTime) {
            updated[id] = bookingTime;
          }
        });
        return updated;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const getTimeRemaining = (bookingTime) => {
    if (!bookingTime) return { type: "none", timeLeft: "No refund available" };
    
    const now = new Date();
    const timeDiff = now - bookingTime;
    
    // Convert to positive numbers for display
    const totalHoursLeft = 24 - Math.floor(timeDiff / (1000 * 60 * 60));
    
    if (totalHoursLeft <= 0) {
      const daysLeft = 6 - Math.floor(timeDiff / (1000 * 60 * 60 * 24));
      if (daysLeft > 0) {
        return { type: "80%", timeLeft: `${daysLeft}d remaining for 80% refund` };
      }
      return { type: "none", timeLeft: "No refund available" };
    }
    
    const hoursLeft = totalHoursLeft;
    const minutesLeft = 59 - Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
    const secondsLeft = 59 - Math.floor((timeDiff % (1000 * 60)) / 1000);
    
    return {
      type: "100%",
      timeLeft: `${String(hoursLeft).padStart(2, '0')}:${String(minutesLeft).padStart(2, '0')}:${String(secondsLeft).padStart(2, '0')} for 100% refund`
    };
  };

  const handlePayment = (reservationId) => {
    navigate(`/payment/${reservationId}`);
  };

  const handleCancelClick = (reservationId) => {
    setReservationToCancel(reservationId);
    setShowCancelDialog(true);
  };

  const handleCancelConfirm = async () => {
    try {
      const bookingTime = countdowns[reservationToCancel];
      const { type } = getTimeRemaining(bookingTime);
      
      // Get the reservation details before deleting
      const reservation = reservations.find(res => res._id === reservationToCancel);
      
      // Delete the reservation - this will also update room availability
      await axios.delete(`/api/reservations/${reservationToCancel}`, {
        data: { userId: user._id } // Send userId in the request body
      });
      
      // Show appropriate refund message
      if (type === "100%") {
        setRefundMessage("Your 100% discount has been transferred to your account!");
      } else if (type === "80%") {
        setRefundMessage("Your 80% discount has been transferred to your account!");
      } else {
        setRefundMessage("Your reservation has been cancelled.");
      }
      
      setShowRefundMessage(true);
      setTimeout(() => {
        setShowRefundMessage(false);
        setReservations(prev => prev.filter(res => res._id !== reservationToCancel));
      }, 6000);
      
      setShowCancelDialog(false);
    } catch (err) {
      console.error("Error during cancellation:", err);
      setError("Failed to cancel reservation. Please try again.");
    }
  };

  const handleCancelDialogClose = () => {
    setShowCancelDialog(false);
    setReservationToCancel(null);
  };

  const handleShare = (reservationId) => {
    setSelectedReservationId(reservationId);
    setShowShareModal(true);
  };

  const getStatusColor = (status, paymentStatus) => {
    if (paymentStatus === "pending") return "#f39c12"; // Orange for pending payment
    if (status === "Cancelled") return "#e74c3c"; // Red for cancelled
    if (status === "Completed") return "#2980b9"; // Blue for completed
    if (status === "Confirmed" && paymentStatus === "paid") return "#27ae60"; // Green for confirmed and paid
    return "#f39c12"; // Orange for any other state
  };

  const getStatusText = (status, paymentStatus) => {
    if (paymentStatus === "pending") return "Payment Required";
    if (status === "Cancelled") return "Cancelled";
    if (status === "Completed") return "Completed";
    if (status === "Confirmed" && paymentStatus === "paid") return "Confirmed";
    return "Payment Required";
  };

  if (loading) {
    return (
      <div>
        <Navbar />
        <div className="reservationContainer">
          <h1>Loading reservations...</h1>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <Navbar />
        <div className="reservationContainer">
          <h1>Error: {error}</h1>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Navbar />
      <ShareReservationModal
        show={showShareModal}
        onClose={() => setShowShareModal(false)}
        reservationId={selectedReservationId}
      />
      
      {/* Cancel Confirmation Dialog */}
      <Dialog
        open={showCancelDialog}
        onClose={handleCancelDialogClose}
        aria-labelledby="cancel-dialog-title"
        aria-describedby="cancel-dialog-description"
      >
        <DialogTitle id="cancel-dialog-title">
          Cancel Reservation
        </DialogTitle>
        <DialogContent>
          <Typography id="cancel-dialog-description">
            Are you sure you want to cancel this reservation? 
            {reservationToCancel && countdowns[reservationToCancel] && (
              <div style={{ marginTop: '10px', color: '#1976d2' }}>
                {getTimeRemaining(countdowns[reservationToCancel]).timeLeft}
              </div>
            )}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelDialogClose} color="primary">
            No, Keep Reservation
          </Button>
          <Button onClick={handleCancelConfirm} color="error" variant="contained">
            Yes, Cancel Reservation
          </Button>
        </DialogActions>
      </Dialog>

      {/* Refund Message Snackbar */}
      <Snackbar
        open={showRefundMessage}
        message={refundMessage}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        sx={{
          '& .MuiSnackbarContent-root': {
            backgroundColor: '#4caf50',
            color: 'white',
            fontSize: '1.1rem'
          }
        }}
      />

      <ReservationHeader />
      <div className="reservationContainer">
        <h1 className="reservationTitle">
          {(reservations && reservations.length)
            ? "Your Upcoming Trips"
            : "You have no upcoming trips. Start your journey by making a reservation :)"
          }
        </h1>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {reservations && reservations.length > 0 ? (
          reservations.map((item) => (
            <div className="searchItem" key={item._id}>
              <img
                src={item.reservation.hotelPhoto || "https://cf.bstatic.com/static/img/theme-index/carousel_320x240/card-image-villas_300/dd0d7f8202676306a661aa4f0cf1ffab31286211.jpg"}
                alt=""
                className="siImg"
              />
              <div className="reservationCard">
                <div className="reservationInfo">
                  <h3>{item.reservation.hotelName}</h3>
                  <p>Check-in: {new Date(item.reservation.dateStart).toLocaleDateString()}</p>
                  <p>Check-out: {new Date(item.reservation.dateEnd).toLocaleDateString()}</p>
                  <p>Room: {item.reservation.roomType}</p>
                  <p>Price: {formatUSD(item.totalPrice || item.reservation.totalPrice || 0)}</p>
                  <p>Status: <span style={{ color: getStatusColor(item.status, item.paymentStatus) }}>
                    {getStatusText(item.status, item.paymentStatus)}</span></p>
                  {/* Only show countdown timer if payment is completed */}
                  {item.paymentStatus === "paid" && countdowns[item._id] && (
                    <p style={{ color: '#1976d2', fontWeight: 'bold' }}>
                      {getTimeRemaining(countdowns[item._id]).timeLeft}
                    </p>
                  )}
                </div>
                <div className="reservationActions">
                  <Button variant="outline-primary" onClick={() => handleShare(item._id)}>
                    <FontAwesomeIcon icon={faShare} /> Share
                  </Button>
                  {(item.paymentStatus === "pending" || !item.paymentStatus) && item.status !== "Cancelled" && (
                    <Button
                      variant="primary"
                      className="mb-2"
                      onClick={() => handlePayment(item._id)}
                    >
                      Pay Now
                    </Button>
                  )}
                  {/* Only show cancel button if payment is completed */}
                  {item.paymentStatus === "paid" && item.status !== "Cancelled" && item.status !== "Completed" && (
                    <Button
                      variant="danger"
                      onClick={() => handleCancelClick(item._id)}
                    >
                      Cancel
                    </Button>
                  )}
                </div>
              </div>
              <div className="siDesc">
                <span className="siSubtitle">
                  Room Numbers:
                  {Array.isArray(item.reservation.roomNum) && item.reservation.roomNum.length > 0 ? (
                    <b> {item.reservation.roomNum.join(", ")} </b>
                  ) : (
                    <b> Room number will be assigned at check-in </b>
                  )}
                </span>
                <span className="siFeatures">{item.desc}</span>
                <span className="siCancelOp">Travel Period</span>
                <span className="siCancelOpSubtitle">
                  Start Date: {new Date(item.reservation.dateStart).toLocaleDateString()}
                </span>
                <span className="siCancelOpSubtitle">
                  End Date: {new Date(item.reservation.dateEnd).toLocaleDateString()}
                </span>
                <span className="siPrice">
                  Total Price: {formatUSD(item.totalPrice || item.reservation.totalPrice || 0)}
                </span>
              </div>
              <div className="siDetails">
                <div className="siDetailTexts">
                  <OverlayTrigger
                    trigger="click"
                    placement="right"
                    overlay={
                      <Popover id="popover-basic">
                        <Popover.Header as="h3">Hotel Info</Popover.Header>
                        <Popover.Body>
                          <div>Location: {item.reservation.location}</div>
                          <div>City: {item.reservation.city}</div>
                        </Popover.Body>
                      </Popover>
                    }
                  >
                    <Button variant="success" className="mb-2">Details</Button>
                  </OverlayTrigger>
                </div>
              </div>
            </div>
          ))
        ) : (
          <p>No reservations found.</p>
        )}
      </div>
      <MailList />
      <Footer />
    </div>
  );
};

export default Reservation;
