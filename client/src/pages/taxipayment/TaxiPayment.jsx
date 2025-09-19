import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "../../utils/axios"; // Use our custom axios instance
import Navbar from "../../components/navbar/Navbar";
import Footer from "../../components/footer/Footer";
import "./taxipayment.css";

import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";

console.log("Stripe Key:", import.meta.env.VITE_STRIPE_PUBLIC_KEY);
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

const CheckoutForm = ({ reservationId }) => {
  const navigate = useNavigate();
  const stripe = useStripe();
  const elements = useElements();
  const [amount, setAmount] = useState(0);
  const [clientSecret, setClientSecret] = useState("");
  const [error, setError] = useState("");
  const [processing, setProcessing] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    cardholderName: "",
    firstName: "",
    lastName: "",
  });

  useEffect(() => {
    const fetchReservationAndInitPayment = async () => {
      try {
        // First fetch the reservation details to get the service type
        const reservationResponse = await axios.get(`/api/taxi/reservations/${reservationId}`);
        const serviceType = reservationResponse.data.serviceType;
        
        // Calculate amount based on service type
        let amountInCents;
        switch (serviceType) {
          case 'Basic':
            amountInCents = 1500; // $15.00
            break;
          case 'Standard':
            amountInCents = 2500; // $25.00
            break;
          case 'Premium':
            amountInCents = 4000; // $40.00
            break;
          default:
            amountInCents = 1500; // Default to Basic price
        }
        
        setAmount(amountInCents);

        // Create payment intent with the calculated amount
        const paymentResponse = await axios.post("/api/stripe/create-payment-intent", {
          amount: amountInCents
        });
        setClientSecret(paymentResponse.data.clientSecret);
      } catch (err) {
        console.error("Failed to get client secret:", err);
        setError("Failed to initialize payment. Please try again.");
      }
    };

    fetchReservationAndInitPayment();
  }, [reservationId]);

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
          const token = localStorage.getItem("access_token");
          
          const response = await axios.put(
            `/api/taxi/reservations/${reservationId}/pay`,
            { paymentStatus: "paid" },
            {
              headers: {
                Authorization: `Bearer ${token}`
              }
            }
          );

          console.log("Reservation updated:", response.data);
          alert("Payment successful!");
          navigate("/taxi/reserve");
        } catch (err) {
          console.error("Reservation update failed:", err);
          setError("Payment succeeded, but failed to update reservation. Please contact support.");
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

  return (
    <form className="taxi-payment-form" onSubmit={handleSubmit}>
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
  );
};

const TaxiPayment = () => {
  const { id } = useParams(); // Reservation ID

  return (
    <div>
      <Navbar />
      <div className="taxi-payment-container">
        <h2>Complete Your Payment</h2>
        <Elements stripe={stripePromise}>
          <CheckoutForm reservationId={id} />
        </Elements>
      </div>
      <Footer />
    </div>
  );
};

export default TaxiPayment;
