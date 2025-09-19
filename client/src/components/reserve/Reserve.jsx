import "./reserve.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleXmark } from "@fortawesome/free-solid-svg-icons";
import useFetch from "../../hooks/useFetch";
import { useContext, useState, useEffect } from "react";
import { SearchContext } from "../../context/SearchContext";
import axios from "../../utils/axios";
import { useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import { Alert, Snackbar } from "@mui/material";
import ProfileUpdateModal from "../profileUpdate/ProfileUpdateModal";
import { formatPriceWithConversion, convertPKRtoUSD, formatUSD } from "../../utils/currencyConverter";

const Reserve = ({ setOpen, hotelId, initialData }) => {
  const [selectedRooms, setSelectedRooms] = useState(initialData?.selectedRooms || []);
  const [selectedRoomNumbers, setSelectedRoomNumbers] = useState(initialData?.selectedRoomNumbers || []);
  const { dates, options, dispatch } = useContext(SearchContext);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [error, setError] = useState(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const initialDates = initialData?.dates;
  const [alertMessage, setAlertMessage] = useState("");
  const [totalPrice, setTotalPrice] = useState(0);
  const selectedDates = location.state?.selectedDates;
  const selectedNights = location.state?.nights;
  const hotelTotalPrice = location.state?.totalPrice;

  // Get dates from either SearchContext or location state
  const effectiveDates = dates[0]?.startDate && dates[0]?.endDate ? dates :
                        location.state?.dates ? location.state.dates :
                        null;

  const { data: roomResponse, loading: roomLoading, error: roomError } = useFetch(`/api/hotels/room/${hotelId}`);
  const { data: hotelDetails, loading: hotelLoading, error: hotelError } = useFetch(`/api/hotels/find/${hotelId}`);
  const [roomData, setRoomData] = useState([]);

  console.log("room fetch data", roomResponse);
  console.log("hotelId", hotelId);
  console.log("hotel fetch data", hotelDetails);
  console.log("Detailed room data:", roomResponse?.data ? JSON.stringify(roomResponse.data, null, 2) : "No room data");

  useEffect(() => {
    if (roomResponse?.success && Array.isArray(roomResponse.data)) {
      setRoomData(roomResponse.data);
    }
  }, [roomResponse]);

  useEffect(() => {
    // Update SearchContext with dates from location state if available
    if (location.state?.dates && (!dates || !dates[0]?.startDate || !dates[0]?.endDate)) {
      dispatch({
        type: "NEW_SEARCH",
        payload: {
          dates: location.state.dates,
          options: location.state.options
        }
      });
    }
  }, [location.state, dates, dispatch]);

  useEffect(() => {
    if (initialData?.selectedRooms?.length) {
      setSelectedRooms(initialData.selectedRooms);
      setSelectedRoomNumbers(initialData.selectedRoomNumbers);
    }
  }, [initialData]);

  // Use hotel total price if available and multiply by number of rooms
  useEffect(() => {
    if (effectiveDates && hotelDetails) {
      const numberOfDays = Math.ceil(
        (new Date(effectiveDates[0].endDate) - new Date(effectiveDates[0].startDate)) / (1000 * 60 * 60 * 24)
      );
      const basePrice = numberOfDays * hotelDetails.cheapestPrice;
      // Multiply by number of selected rooms
      const totalPriceWithRooms = basePrice * (selectedRooms.length || 1);
      setTotalPrice(totalPriceWithRooms);
    }
  }, [hotelTotalPrice, effectiveDates, hotelDetails, selectedRooms]); // Added selectedRooms dependency

  const getDatesInRange = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const date = new Date(start.getTime());
    const dates = [];

    while (date <= end) {
      dates.push(new Date(date).getTime());
      date.setDate(date.getDate() + 1);
    }

    return dates;
  };

  const alldates = effectiveDates ? getDatesInRange(effectiveDates[0].startDate, effectiveDates[0].endDate) : [];

  const isAvailable = (roomNumber) => {
    const isFound = roomNumber.unavailableDates?.some((date) =>
      alldates.includes(new Date(date).getTime())
    );
    return !isFound;
  };

  // Add profile check function
  const checkProfileComplete = () => {
    if (!user.city || !user.country || !user.phone) {
      return false;
    }
    return true;
  };

  const handleSelect = (e, roomNumber, room) => {
    const checked = e.target.checked;
    const value = e.target.value;
    
    console.log("Debug - Selection:", {
      checked,
      value,
      roomNumber,
      roomPrice: room.price
    });
    
    setSelectedRooms(
      checked
        ? [...selectedRooms, value]
        : selectedRooms.filter((item) => item !== value)
    );

    setSelectedRoomNumbers(
      checked
        ? [...selectedRoomNumbers, roomNumber]
        : selectedRoomNumbers.filter((num) => num !== roomNumber)
    );
  };

  const handleClick = async () => {
    if (!checkProfileComplete()) {
      setShowProfileModal(true);
      return;
    }

    await handleReservation();
  };

  const handleReservation = async () => {
    if (!selectedRooms.length) {
      setError("Please select at least one room");
      return;
    }

    try {
      setError(null);
      
      // First update room availability
      await Promise.all(
        selectedRooms.map((roomId) => {
          return axios.put(`/api/rooms/availability/${roomId}`, {
            dates: alldates,
          });
        })
      );

      // Convert total price to USD for storage
      const totalPriceUSD = Number(convertPKRtoUSD(totalPrice));

      // Create a new reservation
      const reservationData = {
        userId: user._id,
        hotelId: hotelId,
        roomIds: selectedRooms,
        roomNumbers: selectedRoomNumbers,
        dates: [effectiveDates[0].startDate, effectiveDates[0].endDate],
        totalPrice: totalPriceUSD,
        priceInPKR: totalPrice
      };

      const response = await axios.post(`/api/reservations`, reservationData);

      if (response.data.success) {
        // Update user's reservations array
        await axios.put(`/api/users/reservation/${user._id}`, {
          reservationId: response.data.reservationId
        });

        // Show success message
        setAlertMessage("Reservation successful! Redirecting to your reservations...");
        
        // Close the reserve modal
        setOpen(false);
        
        // Navigate to reservations page after a short delay
        setTimeout(() => {
          navigate("/reservation", { replace: true });
        }, 1500);
      } else {
        throw new Error(response.data.message || "Failed to create reservation");
      }
    } catch (err) {
      console.error("Error during reservation:", err);
      setError(err.response?.data?.message || err.message || "Failed to make reservation. Please try again.");
      
      // If reservation fails, rollback the room availability update
      try {
        await Promise.all(
          selectedRooms.map((roomId) => {
            return axios.put(`/api/rooms/availability/${roomId}`, {
              dates: alldates,
              remove: true
            });
          })
        );
      } catch (rollbackErr) {
        console.error("Error rolling back room availability:", rollbackErr);
      }
    }
  };

  if (roomLoading || hotelLoading) {
    return (
      <div className="reserve">
        <div className="rContainer">
          <FontAwesomeIcon
            icon={faCircleXmark}
            className="rClose"
            onClick={() => setOpen(false)}
          />
          <span>Loading room information...</span>
        </div>
      </div>
    );
  }

  if (roomError || hotelError || error) {
    return (
      <div className="reserve">
        <div className="rContainer">
          <FontAwesomeIcon
            icon={faCircleXmark}
            className="rClose"
            onClick={() => setOpen(false)}
          />
          <span className="error">Error: {error || roomError || hotelError}</span>
        </div>
      </div>
    );
  }

  if (!roomData.length) {
    return (
      <div className="reserve">
        <div className="rContainer">
          <FontAwesomeIcon
            icon={faCircleXmark}
            className="rClose"
            onClick={() => setOpen(false)}
          />
          <span>No rooms available for this hotel.</span>
        </div>
      </div>
    );
  }

  return (
    <div className="reserve">
      <div className="rContainer">
        <FontAwesomeIcon
          icon={faCircleXmark}
          className="rClose"
          onClick={() => setOpen(false)}
        />
        <span>Select your rooms:</span>
        {roomLoading ? (
          "Loading..."
        ) : (
          <div className="rContent">
            {roomData.map((room) => (
              <div className="rItem" key={room._id}>
                <div className="rItemInfo">
                  <div className="rTitle">{room.title}</div>
                  <div className="rDesc">{room.desc}</div>
                  <div className="rMax">
                    Max people: <b>{room.maxPeople}</b>
                  </div>
                </div>
                <div className="rSelectRooms">
                  {room.roomNumbers.map((roomNumber) => (
                    <div className="room" key={roomNumber._id}>
                      <label>{roomNumber.number}</label>
                      <input
                        type="checkbox"
                        value={roomNumber._id}
                        onChange={(e) => handleSelect(e, roomNumber.number, room)}
                        disabled={!isAvailable(roomNumber)}
                        checked={selectedRooms.includes(roomNumber._id)}
                      />
                    </div>
                  ))}
                </div>
              </div>
            ))}
            {selectedRooms.length > 0 && (
              <div className="rPrice">
                <span>Total Price for {selectedNights || 1} nights ({selectedRooms.length} {selectedRooms.length === 1 ? 'room' : 'rooms'}):</span>
                <span className="rPriceValue">{formatPriceWithConversion(totalPrice)}</span>
              </div>
            )}
            <button onClick={handleClick} className="rButton" disabled={selectedRooms.length === 0}>
              Reserve Now!
            </button>
          </div>
        )}
        {error && (
          <Snackbar open={!!error} autoHideDuration={6000} onClose={() => setError(null)}>
            <Alert onClose={() => setError(null)} severity="error">
              {error}
            </Alert>
          </Snackbar>
        )}
        {alertMessage && (
          <Snackbar open={!!alertMessage} autoHideDuration={2000}>
            <Alert severity="success">
              {alertMessage}
            </Alert>
          </Snackbar>
        )}
        {showProfileModal && (
          <ProfileUpdateModal
            setOpen={setShowProfileModal}
            onUpdateSuccess={(updatedUser) => {
              // After profile update, proceed with reservation
              handleReservation();
            }}
          />
        )}
      </div>
    </div>
  );
};

export default Reserve;
