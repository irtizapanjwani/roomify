import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../../context/AuthContext";
import Navbar from "../../components/navbar/Navbar";
import Footer from "../../components/footer/Footer";
import axios from "../../utils/axios";
import "./bookingHistory.css";
import { useNavigate } from "react-router-dom";
import { formatUSD } from "../../utils/currencyConverter";

const BookingHistory = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [hotelBookings, setHotelBookings] = useState([]);
  const [taxiBookings, setTaxiBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    const fetchBookingHistory = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch hotel bookings
        const hotelResponse = await axios.get(`/api/users/${user._id}`);
        console.log("Hotel Response:", hotelResponse.data); // Debug log

        if (hotelResponse.data.success) {
          const reservationData = hotelResponse.data.data.reservations || [];
          console.log("All Reservations:", reservationData); // Debug log
          
          // Show all paid/completed reservations
          const completedBookings = reservationData.filter(reservation => {
            return reservation.paymentStatus === "paid" || reservation.status === "Completed";
          });
          
          console.log("Completed Bookings:", completedBookings); // Debug log
          setHotelBookings(completedBookings);
        }

        // Fetch taxi bookings with context
        const taxiResponse = await axios.get("/api/taxi/reservations?context=all");
        console.log("Taxi Response:", taxiResponse.data); // Debug log
        
        // No need to filter since we're getting all reservations
        setTaxiBookings(taxiResponse.data);

      } catch (err) {
        console.error("Error fetching booking history:", err);
        setError(err.response?.data?.message || "Failed to fetch booking history");
      } finally {
        setLoading(false);
      }
    };

    fetchBookingHistory();
  }, [user, navigate]);

  // Function to mask card number
  const maskCardNumber = (cardNumber) => {
    if (!cardNumber) return "****";
    return `****${cardNumber.slice(-4)}`;
  };

  if (loading) {
    return (
      <div>
        <Navbar />
        <div className="bookingHistoryContainer">
          <h1>Loading booking history...</h1>
        </div>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <Navbar />
        <div className="bookingHistoryContainer">
          <h1>Error: {error}</h1>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div>
      <Navbar />
      <div className="bookingHistoryContainer">
        <h1 className="bookingHistoryTitle">Booking History</h1>
        
        <div className="bookingHistoryContent">
          {/* Hotel Bookings */}
          <div className="bookingSection hotelSection">
            <h2>Hotel Stays</h2>
            {hotelBookings.length > 0 ? (
              hotelBookings.map((booking) => (
                <div className="bookingCard" key={booking._id}>
                  <img
                    src={booking.reservation.hotelPhoto || "https://cf.bstatic.com/static/img/theme-index/carousel_320x240/card-image-villas_300/dd0d7f8202676306a661aa4f0cf1ffab31286211.jpg"}
                    alt=""
                    className="bookingImage"
                  />
                  <div className="bookingInfo">
                    <h3>{booking.reservation.hotelName}</h3>
                    <p><strong>City:</strong> {booking.reservation.city}</p>
                    <p><strong>Stay Period:</strong></p>
                    <p>{new Date(booking.reservation.dateStart).toLocaleDateString()} - {new Date(booking.reservation.dateEnd).toLocaleDateString()}</p>
                    <p><strong>Room Numbers:</strong> {booking.reservation.roomNum.join(", ")}</p>
                    <p><strong>Payment Status:</strong> {booking.paymentStatus}</p>
                    <p><strong>Amount Paid:</strong> {formatUSD(booking.totalPrice || booking.reservation.totalPrice)}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="noBookings">No completed hotel stays</p>
            )}
          </div>

          {/* Taxi Bookings */}
          <div className="bookingSection taxiSection">
            <h2>Taxi Services</h2>
            {taxiBookings.length > 0 ? (
              taxiBookings.map((booking) => (
                <div className="bookingCard" key={booking._id}>
                  <div className="bookingInfo">
                    <h3>{booking.serviceType}</h3>
                    <p><strong>Date:</strong> {new Date(booking.pickupDate).toLocaleDateString()}</p>
                    <p><strong>Time:</strong> {booking.pickupTime}</p>
                    <p><strong>Pickup Location:</strong> {booking.pickupAddress}</p>
                    <p><strong>Driver:</strong> {booking.driverName || "Not assigned"}</p>
                    <p><strong>Payment Status:</strong> {booking.paymentStatus}</p>
                    <p><strong>Amount Paid:</strong> ${booking.amount}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="noBookings">No completed taxi services</p>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default BookingHistory; 