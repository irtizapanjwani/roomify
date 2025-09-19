import { useState, useEffect } from "react";
import axios from "../../utils/axios";
import "./editRoom.css";

const EditRoom = ({ room, hotelId, onClose, onUpdate }) => {
  const [formData, setFormData] = useState({
    title: room.title,
    price: room.price,
    maxPeople: room.maxPeople,
    desc: room.desc,
  });

  const [roomAvailability, setRoomAvailability] = useState(
    room.roomNumbers.map(rn => ({
      number: rn.number,
      unavailableDates: rn.unavailableDates.map(date => new Date(date))
    }))
  );

  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [id]: id === "price" || id === "maxPeople" ? parseInt(value) : value
    }));
  };

  const handleDateChange = (roomNumber, date, isAvailable) => {
    setRoomAvailability(prev => 
      prev.map(rn => {
        if (rn.number === roomNumber) {
          const newDates = isAvailable
            ? rn.unavailableDates.filter(d => d.getTime() !== date.getTime())
            : [...rn.unavailableDates, date];
          return { ...rn, unavailableDates: newDates };
        }
        return rn;
      })
    );
  };

  const clearAllUnavailableDates = (roomNumber) => {
    if (window.confirm("Are you sure you want to clear all unavailable dates and make this room fully available?")) {
      setRoomAvailability(prev =>
        prev.map(rn => {
          if (rn.number === roomNumber) {
            return { ...rn, unavailableDates: [] };
          }
          return rn;
        })
      );
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const updatedRoom = {
        ...formData,
        roomNumbers: roomAvailability.map(rn => ({
          number: rn.number,
          unavailableDates: rn.unavailableDates
        }))
      };

      // Update the room details
      await axios.put(`/api/rooms/${room._id}`, updatedRoom);
      
      // Update room availability for each room number
      await Promise.all(
        room.roomNumbers.map(async (rn) => {
          const currentRoomAvailability = roomAvailability.find(ra => ra.number === rn.number);
          if (currentRoomAvailability) {
            await axios.put(`/api/rooms/availability/${rn._id}`, {
              dates: currentRoomAvailability.unavailableDates
            });
          }
        })
      );

      onUpdate();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Error updating room");
    } finally {
      setLoading(false);
    }
  };

  const isDateUnavailable = (roomNumber, date) => {
    const room = roomAvailability.find(r => r.number === roomNumber);
    return room?.unavailableDates.some(d => 
      d.getFullYear() === date.getFullYear() &&
      d.getMonth() === date.getMonth() &&
      d.getDate() === date.getDate()
    );
  };

  const getNextNDays = (n) => {
    const dates = [];
    for (let i = 0; i < n; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      dates.push(date);
    }
    return dates;
  };

  const getBookingEndDate = (roomNumber) => {
    const room = roomAvailability.find(r => r.number === roomNumber);
    if (!room || room.unavailableDates.length === 0) return null;
    
    const sortedDates = [...room.unavailableDates].sort((a, b) => b - a);
    return sortedDates[0];
  };

  return (
    <div className="editRoomOverlay">
      <div className="editRoomModal">
        <div className="editRoomHeader">
          <h2>Edit Room</h2>
          <button className="closeButton" onClick={onClose}>&times;</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="formGroup">
            <label htmlFor="title">Room Title</label>
            <input
              type="text"
              id="title"
              value={formData.title}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="formGroup">
            <label htmlFor="price">Price per Night</label>
            <input
              type="number"
              id="price"
              value={formData.price}
              onChange={handleInputChange}
              min="0"
              required
            />
          </div>

          <div className="formGroup">
            <label htmlFor="maxPeople">Max People</label>
            <input
              type="number"
              id="maxPeople"
              value={formData.maxPeople}
              onChange={handleInputChange}
              min="1"
              required
            />
          </div>

          <div className="formGroup">
            <label htmlFor="desc">Description</label>
            <textarea
              id="desc"
              value={formData.desc}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="formGroup">
            <label>Room Availability</label>
            <div className="availabilityGrid">
              {roomAvailability.map(room => (
                <div key={room.number} className="roomAvailability">
                  <div className="roomHeader">
                    <h4>Room {room.number}</h4>
                    <div className="roomStatus">
                      {room.unavailableDates.length > 0 ? (
                        <>
                          <span className="bookedStatus">
                            Booked until: {getBookingEndDate(room.number)?.toLocaleDateString()}
                          </span>
                          <button
                            type="button"
                            className="clearDatesButton"
                            onClick={() => clearAllUnavailableDates(room.number)}
                          >
                            Clear All Dates
                          </button>
                        </>
                      ) : (
                        <span className="availableStatus">Currently Available</span>
                      )}
                    </div>
                  </div>
                  <div className="dateGrid">
                    {getNextNDays(14).map(date => (
                      <div 
                        key={date.getTime()} 
                        className={`dateCell ${isDateUnavailable(room.number, date) ? 'unavailable' : 'available'}`}
                        onClick={() => handleDateChange(room.number, date, isDateUnavailable(room.number, date))}
                      >
                        <div className="dateNumber">{date.getDate()}</div>
                        <div className="monthName">{date.toLocaleString('default', { month: 'short' })}</div>
                        <div className="status">
                          {isDateUnavailable(room.number, date) ? 'Booked' : 'Available'}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {error && <div className="error">{error}</div>}

          <div className="formActions">
            <button type="submit" className="submitButton" disabled={loading}>
              {loading ? "Updating..." : "Update Room"}
            </button>
            <button type="button" className="cancelButton" onClick={onClose}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditRoom; 