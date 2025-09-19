// pages/Taxi.jsx
import { useNavigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import Navbar from "../../components/navbar/Navbar";
import TaxiReservationHeader from "../../components/TaxiReservationHeader/TaxiReservationHeader";
import Footer from "../../components/footer/Footer";
import "./taxi.css";

const Taxi = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const handleSelect = (service) => {
    if (!user) {
      navigate("/login", { 
        state: { 
          from: "/taxi/reserve",
          service: service
        } 
      });
      return;
    }
    navigate("/taxi/reserve", { state: { service } });
  };

  return (
    <div className="taxiPage">
      <Navbar />
      <TaxiReservationHeader />

      <div className="taxiWrapper">
        <h1 className="taxiTitle">Select Your Taxi Service</h1>
        <p className="taxiDesc">Choose the ride that suits your needs</p>

        <div className="taxiCardContainer">
          <TaxiCard
            title="Basic"
            description="Ideal for solo travelers or short city rides"
            features={[
              "Up to 10 km coverage all over the city",
              "Extra charges apply beyond 10 km",
              "Standard sedan vehicle",
              "Air conditioning"
            ]}
            price="$15"
            extraInfo="$1.5/km for extra distance"
            onSelect={() => handleSelect("Basic")}
          />
          <TaxiCard
            title="Standard"
            description="Best for families or small groups (up to 4 passengers)"
            features={[
              "Up to 20 km coverage all over the city",
              "Extra charges apply beyond 20 km",
              "Spacious SUV/Sedan",
              "Premium air conditioning",
              "Water bottles included"
            ]}
            price="$25"
            extraInfo="$2/km for extra distance"
            onSelect={() => handleSelect("Standard")}
          />
          <TaxiCard
            title="Premium"
            description="Luxury rides for business or special occasions"
            features={[
              "Up to 35 km coverage all over the city",
              "Extra charges apply beyond 35 km",
              "Luxury vehicle",
              "Premium amenities",
              "Professional chauffeur",
              "Complimentary refreshments"
            ]}
            price="$40"
            extraInfo="$3/km for extra distance"
            onSelect={() => handleSelect("Premium")}
          />
        </div>
      </div>

      <Footer />
    </div>
  );
};

const TaxiCard = ({ title, description, features, price, extraInfo, onSelect }) => (
  <div className="taxiCard">
    <div className="taxiCardHeader">
      <h3>{title}</h3>
      <span className="priceTag">{price}</span>
    </div>
    <p className="taxiCardDesc">{description}</p>
    <ul className="taxiFeatures">
      {features.map((feature, index) => (
        <li key={index}>{feature}</li>
      ))}
    </ul>
    <div className="taxiExtraInfo">
      <span>{extraInfo}</span>
    </div>
    <button className="bookNowButton" onClick={onSelect}>
      Book Now
    </button>
  </div>
);

export default Taxi;
