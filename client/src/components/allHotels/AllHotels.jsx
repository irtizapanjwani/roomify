import { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import useFetch from "../../hooks/useFetch";
import DateSelectionModal from "../dateSelectionModal/DateSelectionModal";
import axios from "../../utils/axios";
import "./allHotels.css";
import { SearchContext } from "../../context/SearchContext";

const AllHotels = () => {
  const { data, loading, error } = useFetch("/api/hotels");
  const [hotels, setHotels] = useState([]);
  const [selectedHotel, setSelectedHotel] = useState(null);
  const navigate = useNavigate();
  const { dispatch } = useContext(SearchContext);

  // Array of random hotel images
  const randomImages = [
    "https://images.unsplash.com/photo-1566073771259-6a8506099945",
    "https://images.unsplash.com/photo-1582719508461-905c673771fd",
    "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb",
    "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4",
    "https://images.unsplash.com/photo-1455587734955-081b22074882",
    "https://images.unsplash.com/photo-1564501049412-61c2a3083791",
    "https://images.unsplash.com/photo-1571896349842-33c89424de2d",
    "https://images.unsplash.com/photo-1584132967334-10e028bd69f7"
  ];

  // Function to calculate available nights based on room bookings
  const calculateAvailability = (rooms) => {
    if (!rooms || !Array.isArray(rooms) || rooms.length === 0) return { availableNights: 0, hasAvailableRooms: false };

    const today = new Date();
    let maxAvailableNights = 30; // Default max booking window
    let hasAvailableRooms = false;
    let allRoomsBooked = true;

    rooms.forEach(room => {
      if (!room.roomNumbers || room.roomNumbers.length === 0) return;

      room.roomNumbers.forEach(rn => {
        // Check if this room number has any availability
        if (!rn.unavailableDates || rn.unavailableDates.length === 0) {
          hasAvailableRooms = true;
          allRoomsBooked = false;
          return; // This room is completely available
        }

        // Check for partial availability
        const sortedDates = rn.unavailableDates
          .map(date => new Date(date))
          .sort((a, b) => a - b);

        // Find the first unavailable date that's after today
        const nextBooking = sortedDates.find(date => date > today);
        
        // Check if all dates for next 30 days are booked
        const next30Days = new Date(today);
        next30Days.setDate(next30Days.getDate() + 30);
        
        const isFullyBooked = sortedDates.some(date => {
          return date >= today && date <= next30Days;
        });

        if (!isFullyBooked) {
          allRoomsBooked = false;
        }

        if (!nextBooking) {
          // If no future bookings, room is available
          hasAvailableRooms = true;
          allRoomsBooked = false;
          return;
        }

        // Calculate nights until next booking
        const nightsUntilBooking = Math.floor((nextBooking - today) / (1000 * 60 * 60 * 24));
        if (nightsUntilBooking > 0) {
          hasAvailableRooms = true;
          allRoomsBooked = false;
          maxAvailableNights = Math.min(maxAvailableNights, nightsUntilBooking);
        }
      });
    });

    return {
      availableNights: allRoomsBooked ? 0 : (hasAvailableRooms ? maxAvailableNights : 0),
      hasAvailableRooms: !allRoomsBooked && hasAvailableRooms
    };
  };

  useEffect(() => {
    const fetchHotelsWithRooms = async () => {
      if (data) {
        // Sort hotels by rating
        const sortedHotels = [...data].sort((a, b) => {
          if (!a.rating) return 1;
          if (!b.rating) return -1;
          return b.rating - a.rating;
        });

        // Fetch room data for each hotel
        const hotelsWithAvailability = await Promise.all(
          sortedHotels.map(async (hotel) => {
            try {
              const response = await axios.get(`/api/hotels/room/${hotel._id}`);
              const roomData = response.data;
              const availability = calculateAvailability(roomData.data);
              
              return {
                ...hotel,
                photos: hotel.photos?.length > 0 
                  ? hotel.photos 
                  : [randomImages[Math.floor(Math.random() * randomImages.length)]],
                availableNights: availability.availableNights,
                hasAvailableRooms: availability.hasAvailableRooms
              };
            } catch (err) {
              // Silently handle 404 errors for hotels without rooms
              if (err.response?.status !== 404) {
                console.error(`Error fetching rooms for hotel ${hotel._id}:`, err);
              }
              return {
                ...hotel,
                photos: hotel.photos?.length > 0 
                  ? hotel.photos 
                  : [randomImages[Math.floor(Math.random() * randomImages.length)]],
                availableNights: 0,
                hasAvailableRooms: false,
                noRoomsConfigured: true
              };
            }
          })
        );

        setHotels(hotelsWithAvailability);
      }
    };

    fetchHotelsWithRooms();
  }, [data]);

  const handleHotelClick = (hotel, e) => {
    e.preventDefault();
    setSelectedHotel(hotel);
  };

  const handleDateSelect = ({ startDate, endDate, hotel }) => {
    setSelectedHotel(null);
    const nights = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
    const totalPrice = nights * hotel.cheapestPrice;
    
    // Update SearchContext with selected dates
    dispatch({
      type: "NEW_SEARCH",
      payload: {
        dates: [{
          startDate: new Date(startDate),
          endDate: new Date(endDate),
          key: "selection"
        }],
        options: {
          adult: 1,
          children: 0,
          room: 1
        }
      }
    });
    
    navigate(`/hotels/${hotel._id}`, {
      state: {
        dates: [{
          startDate,
          endDate,
          key: "selection"
        }],
        options: {
          adult: 1,
          children: 0,
          room: 1
        },
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
    <div className="allHotels">
      <div className="ahContainer">
        {loading ? (
          <div className="ahLoading">Loading hotels...</div>
        ) : error ? (
          <div className="ahError">Error loading hotels</div>
        ) : (
          <div className="ahList">
            {hotels.map((hotel) => (
              <div className="ahItem" key={hotel._id}>
                <a href="#" className="ahLink" onClick={(e) => handleHotelClick(hotel, e)}>
                  <img
                    src={hotel.photos[0]}
                    alt={hotel.name}
                    className="ahImg"
                  />
                  <div className="ahDetails">
                    <h3 className="ahName">{hotel.name}</h3>
                    <span className="ahCity">{hotel.city}</span>
                    {hotel.noRoomsConfigured ? (
                      <span className="ahAvailability ahUnavailable">
                        No rooms configured
                      </span>
                    ) : hotel.hasAvailableRooms ? (
                      <span className="ahAvailability">
                        {hotel.availableNights > 0 
                          ? `Available for the next ${hotel.availableNights} ${hotel.availableNights === 1 ? 'night' : 'nights'}`
                          : 'Rooms available'
                        }
                      </span>
                    ) : (
                      <span className="ahAvailability ahUnavailable">
                        No rooms to reserve
                      </span>
                    )}
                    <div className="ahBottom">
                      <div className="ahRating">
                        <span className="ahRatingNumber">{hotel.rating ? hotel.rating.toFixed(1) : "New"}</span>
                        <span className="ahRatingText">
                          {hotel.rating >= 4.5 ? "Excellent" :
                           hotel.rating >= 4 ? "Very Good" :
                           hotel.rating >= 3.5 ? "Good" :
                           hotel.rating > 0 ? "Fair" : "Not rated"}
                        </span>
                      </div>
                      <div className="ahPrice">
                        <span className="ahPriceText">Starting from</span>
                        <span className="ahPriceNumber">PKR {hotel.cheapestPrice.toLocaleString()}/night</span>
                      </div>
                    </div>
                  </div>
                </a>
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedHotel && (
        <DateSelectionModal
          hotel={selectedHotel}
          onClose={() => setSelectedHotel(null)}
          onDateSelect={handleDateSelect}
          maxNights={selectedHotel.availableNights}
        />
      )}
    </div>
  );
};

export default AllHotels; 