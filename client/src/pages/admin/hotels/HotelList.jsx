import "./hotelList.css";
import { useState } from "react";
import AdminNav from "../../../components/admin/AdminNav";
import useFetch from "../../../hooks/useFetch.js";
import { Link, useNavigate } from "react-router-dom";
import axios from "../../../utils/axios.js";

const HotelList = () => {
  const { data, loading, error, reFetch } = useFetch("/api/hotels");
  const [deleteId, setDeleteId] = useState(null);
  const navigate = useNavigate();

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this hotel?")) {
      try {
        await axios.delete(`/api/hotels/${id}`);
        reFetch();
      } catch (err) {
        console.error("Error deleting hotel:", err);
      }
    }
  };

  return (
    <div className="hotelList">
      <AdminNav />
      <div className="hotelListContainer">
        <div className="hotelListHeader">
          <h1>Hotels</h1>
          <Link to="/admin/hotels/new" className="addHotelButton">
            Add New Hotel
          </Link>
        </div>

        {loading ? (
          <div>Loading...</div>
        ) : error ? (
          <div>Error loading hotels.</div>
        ) : (
          <div className="hotelListGrid">
            {data?.map((hotel) => (
              <div className="hotelCard" key={hotel._id}>
                <img
                  src={hotel.photos?.[0] || "https://via.placeholder.com/200x150"}
                  alt={hotel.name}
                  className="hotelImage"
                />
                <div className="hotelInfo">
                  <h3>{hotel.name}</h3>
                  <p>{hotel.city}</p>
                  <p>Price: ${hotel.cheapestPrice}</p>
                  <div className="hotelActions">
                    <Link to={`/admin/hotels/${hotel._id}`} className="editButton">
                      Edit
                    </Link>
                    <Link 
                      to={`/admin/hotels/${hotel._id}/rooms`} 
                      className="roomsButton"
                    >
                      Manage Rooms
                    </Link>
                    <button
                      onClick={() => handleDelete(hotel._id)}
                      className="deleteButton"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default HotelList; 