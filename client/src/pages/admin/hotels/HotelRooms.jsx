import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "../../../utils/axios.js";
import AdminNav from "../../../components/admin/AdminNav";
import EditRoom from "../../../components/admin/EditRoom";
import "./hotelRooms.css";

const HotelRooms = () => {
  const { hotelId } = useParams();
  const navigate = useNavigate();
  const [hotel, setHotel] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingRoom, setEditingRoom] = useState(null);

  // New room form state
  const [showAddForm, setShowAddForm] = useState(false);
  const [newRoom, setNewRoom] = useState({
    title: "",
    price: 0,
    maxPeople: 1,
    desc: "",
    roomNumbers: "",
  });

  // Fetch hotel and room data
  const fetchData = async () => {
    try {
      const hotelRes = await axios.get(`/api/hotels/find/${hotelId}`);
      setHotel(hotelRes.data);
      
      try {
        const roomsRes = await axios.get(`/api/hotels/room/${hotelId}`);
        if (roomsRes.data.success) {
          setRooms(roomsRes.data.data);
        }
      } catch (roomErr) {
        // If it's a 404, we just set empty rooms array
        if (roomErr.response?.status === 404) {
          setRooms([]);
        } else {
          // For other errors, we set the error state
          setError(roomErr.response?.data?.message || "Error fetching rooms");
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || "Error fetching hotel data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [hotelId]);

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setNewRoom(prev => ({
      ...prev,
      [id]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Convert roomNumbers string to array of objects
      const roomNumbersArray = newRoom.roomNumbers.split(",").map(num => ({
        number: parseInt(num.trim()),
        unavailableDates: []
      }));

      const roomData = {
        ...newRoom,
        roomNumbers: roomNumbersArray,
        price: parseInt(newRoom.price),
        maxPeople: parseInt(newRoom.maxPeople)
      };

      await axios.post(`/api/rooms/${hotelId}`, roomData);
      
      // After creating room, refresh the room list
      fetchData();
      
      setShowAddForm(false);
      setNewRoom({
        title: "",
        price: 0,
        maxPeople: 1,
        desc: "",
        roomNumbers: "",
      });
    } catch (err) {
      setError(err.response?.data?.message || "Error creating room");
    }
  };

  const handleDeleteRoom = async (roomId) => {
    if (window.confirm("Are you sure you want to delete this room?")) {
      try {
        await axios.delete(`/api/rooms/${roomId}/${hotelId}`);
        setRooms(rooms.filter(room => room._id !== roomId));
      } catch (err) {
        setError(err.response?.data?.message || "Error deleting room");
      }
    }
  };

  const handleEditRoom = (room) => {
    setEditingRoom(room);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) return <div className="hotelRooms"><AdminNav /><div className="hotelRoomsContainer">Loading...</div></div>;
  if (error) return <div className="hotelRooms"><AdminNav /><div className="hotelRoomsContainer">Error: {error}</div></div>;

  return (
    <div className="hotelRooms">
      <AdminNav />
      <div className="hotelRoomsContainer">
        <div className="hotelRoomsHeader">
          <h1>Rooms - {hotel?.name}</h1>
          <button 
            className="addRoomButton"
            onClick={() => setShowAddForm(true)}
          >
            Add New Room
          </button>
        </div>

        {showAddForm && (
          <div className="addRoomForm">
            <h2>Add New Room</h2>
            <form onSubmit={handleSubmit}>
              <div className="formGroup">
                <label htmlFor="title">Room Title *</label>
                <input
                  type="text"
                  id="title"
                  value={newRoom.title}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="formGroup">
                <label htmlFor="price">Price per Night *</label>
                <input
                  type="number"
                  id="price"
                  value={newRoom.price}
                  onChange={handleInputChange}
                  min="0"
                  required
                />
              </div>

              <div className="formGroup">
                <label htmlFor="maxPeople">Max People *</label>
                <input
                  type="number"
                  id="maxPeople"
                  value={newRoom.maxPeople}
                  onChange={handleInputChange}
                  min="1"
                  required
                />
              </div>

              <div className="formGroup">
                <label htmlFor="desc">Description *</label>
                <textarea
                  id="desc"
                  value={newRoom.desc}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="formGroup">
                <label htmlFor="roomNumbers">Room Numbers (comma-separated) *</label>
                <input
                  type="text"
                  id="roomNumbers"
                  value={newRoom.roomNumbers}
                  onChange={handleInputChange}
                  placeholder="101, 102, 103"
                  required
                />
              </div>

              <div className="formActions">
                <button type="submit" className="submitButton">
                  Add Room
                </button>
                <button 
                  type="button" 
                  className="cancelButton"
                  onClick={() => setShowAddForm(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="roomsList">
          {rooms.map((room) => (
            <div key={room._id} className="roomCard">
              <div className="roomInfo">
                <h3>{room.title}</h3>
                <p className="roomDesc">{room.desc}</p>
                <div className="roomDetails">
                  <span>Price: PKR {room.price}/night</span>
                  <span>Max People: {room.maxPeople}</span>
                </div>
                <div className="roomNumbers">
                  <h4>Room Numbers:</h4>
                  <div className="roomNumbersList">
                    {room.roomNumbers.map((rn) => (
                      <div key={rn.number} className="roomNumberItem">
                        <span>Room {rn.number}</span>
                        {rn.unavailableDates.length > 0 && (
                          <div className="unavailableDates">
                            <span>Booked until: {formatDate(rn.unavailableDates[rn.unavailableDates.length - 1])}</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="roomActions">
                <button 
                  className="editButton"
                  onClick={() => handleEditRoom(room)}
                >
                  Edit Room
                </button>
                <button 
                  className="deleteButton"
                  onClick={() => handleDeleteRoom(room._id)}
                >
                  Delete Room
                </button>
              </div>
            </div>
          ))}
        </div>

        {editingRoom && (
          <EditRoom
            room={editingRoom}
            hotelId={hotelId}
            onClose={() => setEditingRoom(null)}
            onUpdate={fetchData}
          />
        )}
      </div>
    </div>
  );
};

export default HotelRooms; 