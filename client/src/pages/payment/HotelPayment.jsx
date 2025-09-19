import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState, useContext } from "react";
import axios from "../../utils/axios";
import Navbar from "../../components/navbar/Navbar";
import Footer from "../../components/footer/Footer";
import "./hotelPayment.css";
import { AuthContext } from "../../context/AuthContext";
import { Alert, Snackbar } from "@mui/material";

import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

const CheckoutForm = ({ reservationId, totalAmount }) => {
  const navigate = useNavigate();
  const stripe = useStripe();
  const elements = useElements();
  const { user } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [amount, setAmount] = useState(0);
  const [clientSecret, setClientSecret] = useState("");
  const [error, setError] = useState("");
  const [processing, setProcessing] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");
  const [formData, setFormData] = useState({
    email: "",
    cardholderName: "",
    firstName: "",
    lastName: "",
  });

  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const isSharedPayment = searchParams.get('type') === 'shared';

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError("");

        // Fetch reservation details based on type
        let response;
        let amountInCents;
        
        if (isSharedPayment) {
          response = await axios.get(`/api/shared-reservations/${reservationId}`);
          const sharedReservation = response.data.data;
          const myShare = sharedReservation.participants.find(p => p.userId._id === user._id);
          
          if (!myShare) {
            throw new Error("You are not a participant in this shared reservation");
          }
          
          if (myShare.hasPaid) {
            throw new Error("You have already paid your share");
          }

          amountInCents = Math.max(Math.round(myShare.amountToPay * 100), 50); // Ensure minimum $0.50
        } else {
          response = await axios.get(`/api/reservations/${reservationId}`);
          amountInCents = Math.max(Math.round(response.data.totalPrice * 100), 50); // Ensure minimum $0.50
        }

        setAmount(amountInCents);

        // Create payment intent with the calculated amount
        const intentResponse = await axios.post("/api/stripe/create-payment-intent", {
          amount: amountInCents
        });
        setClientSecret(intentResponse.data.clientSecret);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError(err.response?.data?.message || "Failed to load payment details");
      } finally {
        setLoading(false);
      }
    };

    if (reservationId) {
      fetchData();
    }
  }, [reservationId, user?._id, isSharedPayment]);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements || !clientSecret) return;

    try {
      setError("");
      setProcessing(true);

      const result = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement),
          billing_details: {
            name: formData.cardholderName,
            email: formData.email,
          },
        },
      });

      if (result.error) {
        setError(result.error.message);
        console.error("Stripe error:", result.error.message);
      } else if (result.paymentIntent.status === "succeeded") {
        try {
          console.log("Payment succeeded. Updating reservation status...");
          
          if (isSharedPayment) {
            await axios.put(`/api/shared-reservations/payment/${reservationId}`);
            navigate("/connections");
          } else {
            await axios.put(`/api/reservations/${reservationId}/pay`);
            navigate("/reservation");
          }

          setSnackbarMessage("Payment successful!");
          setSnackbarSeverity("success");
          setSnackbarOpen(true);
        } catch (err) {
          console.error("Status update failed:", err);
          setError("Payment succeeded, but failed to update status. Please contact support.");
        }
      } else {
        setError("Payment did not complete. Please try again.");
        console.warn("Payment intent status:", result.paymentIntent.status);
      }
    } catch (err) {
      console.error("Payment processing error:", err);
      setError("Failed to process payment. Please try again.");
    } finally {
      setProcessing(false);
    }
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  if (loading) {
    return <div>Loading payment details...</div>;
  }

  return (
    <>
      <Snackbar 
        open={snackbarOpen} 
        autoHideDuration={6000} 
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert onClose={handleSnackbarClose} severity={snackbarSeverity}>
          {snackbarMessage}
        </Alert>
      </Snackbar>

      <form className="hotel-payment-form" onSubmit={handleSubmit}>
        {error && <div className="error-message">{error}</div>}
        
        <div className="form-group">
          <label>Email</label>
          <input
            type="email"
            name="email"
            required
            value={formData.email}
            onChange={handleChange}
            placeholder="Enter your email"
          />
        </div>

        <div className="form-group">
          <label>Cardholder Name</label>
          <input
            type="text"
            name="cardholderName"
            required
            value={formData.cardholderName}
            onChange={handleChange}
            placeholder="Name on card"
          />
        </div>

        <div className="form-group">
          <label>First Name</label>
          <input
            type="text"
            name="firstName"
            required
            value={formData.firstName}
            onChange={handleChange}
            placeholder="Your first name"
          />
        </div>

        <div className="form-group">
          <label>Last Name</label>
          <input
            type="text"
            name="lastName"
            required
            value={formData.lastName}
            onChange={handleChange}
            placeholder="Your last name"
          />
        </div>

        <div className="form-group">
          <label>Card Details</label>
          <CardElement 
            className="stripe-card-element"
            options={{
              style: {
                base: {
                  fontSize: '16px',
                  color: '#424770',
                  '::placeholder': {
                    color: '#aab7c4',
                  },
                },
                invalid: {
                  color: '#9e2146',
                },
              },
            }}
          />
        </div>

        <div className="amount-display">
          <span>Total Amount:</span>
          <span className="amount">${amount / 100}</span>
        </div>

        <button 
          type="submit" 
          disabled={!stripe || !clientSecret || processing}
          className="submit-button"
        >
          {processing ? "Processing..." : `Pay $${amount / 100}`}
        </button>
      </form>
    </>
  );
};

const HotelPayment = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useContext(AuthContext);
  const [reservation, setReservation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const searchParams = new URLSearchParams(location.search);
  const isSharedPayment = searchParams.get('type') === 'shared';

  useEffect(() => {
    const fetchReservation = async () => {
      if (!user) {
        navigate("/login", { state: { from: `/payment/${id}` } });
        return;
      }

      try {
        setLoading(true);
        let response;
        if (isSharedPayment) {
          response = await axios.get(`/api/shared-reservations/${id}`);
          const sharedReservation = response.data.data;
          const myShare = sharedReservation.participants.find(p => p.userId._id === user._id);
          
          if (!myShare) {
            throw new Error("You are not a participant in this shared reservation");
          }
          
          if (myShare.hasPaid) {
            throw new Error("You have already paid your share");
          }

          setReservation({
            ...sharedReservation.reservationId,
            totalPrice: sharedReservation.amountPerUser,
            isShared: true
          });
        } else {
          response = await axios.get(`/api/reservations/${id}`);
          
          // Verify that the reservation belongs to the logged-in user
          if (response.data.userId !== user._id) {
            setError("You are not authorized to access this reservation");
            setLoading(false);
            return;
          }
          
          setReservation(response.data);
        }
      } catch (err) {
        console.error("Error fetching reservation:", err);
        if (err.response?.status === 403) {
          setError("You are not authorized to access this reservation");
        } else if (err.response?.status === 404) {
          setError("Reservation not found");
        } else {
          setError(err.message || "Failed to load reservation details. Please try again.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchReservation();
  }, [id, user, navigate, isSharedPayment]);

  if (loading) {
    return (
      <div>
        <Navbar />
        <div className="hotel-payment-container">
          <h2>Loading payment details...</h2>
        </div>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <Navbar />
        <div className="hotel-payment-container">
          <h2 className="error-message">{error}</h2>
          <button 
            onClick={() => navigate("/reservation")} 
            className="back-button"
          >
            Back to Reservations
          </button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div>
      <Navbar />
      <div className="hotel-payment-container">
        <h2>Complete Your Hotel Payment</h2>
        <div className="reservation-summary">
          <h3>Reservation Summary</h3>
          <div className="summary-details">
            <p><strong>Hotel:</strong> {reservation.hotelId?.name}</p>
            <p><strong>Check-in:</strong> {new Date(reservation.dates[0]).toLocaleDateString()}</p>
            <p><strong>Check-out:</strong> {new Date(reservation.dates[1]).toLocaleDateString()}</p>
            <p><strong>Room Numbers:</strong> {reservation.roomNumbers.join(", ")}</p>
            <p><strong>Total Amount:</strong> ${reservation.totalPrice}</p>
          </div>
        </div>
        <Elements stripe={stripePromise}>
          <CheckoutForm reservationId={id} totalAmount={reservation.totalPrice} />
        </Elements>
      </div>
      <Footer />
    </div>
  );
};

export default HotelPayment; 