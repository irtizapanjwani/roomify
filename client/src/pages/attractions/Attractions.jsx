import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import useFetch from "../../hooks/useFetch";
import Navbar from "../../components/navbar/Navbar";
import Header from "../../components/header/Header";
import Footer from "../../components/footer/Footer";
import DateSelectionModal from "../../components/dateSelectionModal/DateSelectionModal";
import { SearchContext } from "../../context/SearchContext";
import "./attractions.css";

// Array of random beautiful city/hotel images
const randomCityImages = [
  "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1571896349842-33c89424de2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1445019980597-93fa8acb246c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1444201983204-c43cbd584d93?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1562790351-d273a961e0e9?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1564501049412-61c2a3083791?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
];

const getRandomImage = () => {
  const randomIndex = Math.floor(Math.random() * randomCityImages.length);
  return randomCityImages[randomIndex];
};

const Attractions = () => {
  const navigate = useNavigate();
  const { data: hotels, loading, error } = useFetch("/api/hotels");
  const [cities, setCities] = useState([]);
  const [selectedCity, setSelectedCity] = useState(null);
  const { dispatch } = useContext(SearchContext);

  useEffect(() => {
    if (hotels) {
      // Get unique cities and their hotel counts
      const cityData = hotels.reduce((acc, hotel) => {
        if (!acc[hotel.city]) {
          acc[hotel.city] = {
            count: 0,
            photo: hotel.photos?.[0] || getRandomImage(),
            hotels: []
          };
        }
        acc[hotel.city].count += 1;
        acc[hotel.city].hotels.push(hotel);
        return acc;
      }, {});

      // Convert to array and sort by hotel count
      const sortedCities = Object.entries(cityData)
        .map(([name, data]) => ({
          name,
          count: data.count,
          photo: data.photo,
          hotels: data.hotels
        }))
        .sort((a, b) => b.count - a.count);

      setCities(sortedCities);
    }
  }, [hotels]);

  const handleCityClick = (city) => {
    setSelectedCity(city);
  };

  const handleDateSelect = ({ startDate, endDate }) => {
    setSelectedCity(null);
    const nights = Math.ceil((new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24));
    const cheapestPrice = Math.min(...selectedCity.hotels.map(h => h.cheapestPrice));
    const totalPrice = nights * cheapestPrice;
    
    const dateRange = [{
      startDate,
      endDate,
      key: "selection"
    }];

    const options = {
      adult: 1,
      children: 0,
      room: 1
    };

    // Update SearchContext
    dispatch({ 
      type: "NEW_SEARCH", 
      payload: { 
        destination: selectedCity.name,
        dates: dateRange,
        options 
      }
    });
    
    navigate("/hotels", { 
      state: { 
        destination: selectedCity.name,
        dates: dateRange,
        options,
        nights,
        totalPrice,
        selectedDates: {
          startDate,
          endDate
        }
      } 
    });
  };

  return (
    <div>
      <Navbar />
      <Header type="list" />
      <div className="attractionsContainer">
        <h1 className="attractionsTitle">Explore Hotels by City</h1>
        <div className="citiesGrid">
          {loading ? (
            <div className="loading">Loading cities...</div>
          ) : error ? (
            <div className="error">Error loading cities</div>
          ) : (
            cities.map((city) => (
              <div 
                className="cityBox" 
                key={city.name}
                onClick={() => handleCityClick(city)}
              >
                <div className="cityImageContainer">
                  <img 
                    src={city.photo}
                    alt={city.name}
                    className="cityImage"
                    onError={(e) => {
                      e.target.src = getRandomImage(); // Fallback to random image if loading fails
                    }}
                  />
                </div>
                <div className="cityOverlay">
                  <div className="cityInfo">
                    <h2>{city.name}</h2>
                    <p>{city.count} {city.count === 1 ? 'Hotel' : 'Hotels'}</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
      <Footer />

      {selectedCity && (
        <DateSelectionModal
          hotel={{
            name: selectedCity.name,
            photos: [selectedCity.photo],
            city: selectedCity.name,
            rating: null,
            cheapestPrice: Math.min(...selectedCity.hotels.map(h => h.cheapestPrice))
          }}
          onClose={() => setSelectedCity(null)}
          onDateSelect={handleDateSelect}
          maxNights={30}
        />
      )}
    </div>
  );
};

export default Attractions; 