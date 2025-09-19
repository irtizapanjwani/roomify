import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import AdminNav from "../../../components/admin/AdminNav";
import axios from "../../../utils/axios";
import "./editHotel.css";

const EditHotel = () => {
  const { hotelId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    type: "",
    city: "",
    address: "",
    distance: "",
    title: "",
    desc: "",
    cheapestPrice: 0,
    featured: false,
    photos: [],
  });

  useEffect(() => {
    const fetchHotel = async () => {
      try {
        const response = await axios.get(`/api/hotels/find/${hotelId}`);
        setFormData(response.data);
      } catch (err) {
        setError(err.response?.data?.message || "Error fetching hotel details");
        if (err.response?.status === 403) {
          navigate("/admin/hotels");
        }
      } finally {
        setLoading(false);
      }
    };
    fetchHotel();
  }, [hotelId, navigate]);

  const handleInputChange = (e) => {
    const { id, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [id]: type === "checkbox" ? checked : value
    }));
  };

  const handlePhotoChange = (e) => {
    const { value } = e.target;
    // Split the comma-separated URLs and trim whitespace
    const photos = value.split(",").map(url => url.trim());
    setFormData(prev => ({
      ...prev,
      photos
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      // Convert cheapestPrice to number
      const updatedData = {
        ...formData,
        cheapestPrice: Number(formData.cheapestPrice)
      };

      const response = await axios.put(`/api/hotels/${hotelId}`, updatedData);
      if (response.status === 200) {
        // Wait a short moment before navigating to ensure the update is complete
        setTimeout(() => {
          navigate("/admin/hotels", { replace: true });
        }, 500);
      }
    } catch (err) {
      if (err.response?.status === 403) {
        setError("You are not authorized to edit hotels. Please log in as an admin.");
        setTimeout(() => {
          navigate("/admin/hotels");
        }, 2000);
      } else {
        setError(err.response?.data?.message || "Error updating hotel");
      }
    }
  };

  if (loading) return (
    <div className="editHotel">
      <AdminNav />
      <div className="editHotelContainer">Loading...</div>
    </div>
  );

  if (error) return (
    <div className="editHotel">
      <AdminNav />
      <div className="editHotelContainer">
        <div className="errorMessage">{error}</div>
      </div>
    </div>
  );

  return (
    <div className="editHotel">
      <AdminNav />
      <div className="editHotelContainer">
        <h1>Edit Hotel - {formData.name}</h1>
        <form onSubmit={handleSubmit} className="editHotelForm">
          <div className="formRow">
            <div className="formGroup">
              <label htmlFor="name">Name</label>
              <input
                type="text"
                id="name"
                value={formData.name}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="formGroup">
              <label htmlFor="type">Type</label>
              <select
                id="type"
                value={formData.type}
                onChange={handleInputChange}
                required
              >
                <option value="">Select type</option>
                <option value="hotel">Hotel</option>
                <option value="apartment">Apartment</option>
                <option value="resort">Resort</option>
                <option value="villa">Villa</option>
                <option value="cabin">Cabin</option>
              </select>
            </div>
          </div>

          <div className="formRow">
            <div className="formGroup">
              <label htmlFor="city">City</label>
              <input
                type="text"
                id="city"
                value={formData.city}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="formGroup">
              <label htmlFor="address">Address</label>
              <input
                type="text"
                id="address"
                value={formData.address}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>

          <div className="formRow">
            <div className="formGroup">
              <label htmlFor="distance">Distance from City Center</label>
              <input
                type="text"
                id="distance"
                value={formData.distance}
                onChange={handleInputChange}
                placeholder="500m from center"
                required
              />
            </div>
            <div className="formGroup">
              <label htmlFor="cheapestPrice">Price</label>
              <input
                type="number"
                id="cheapestPrice"
                value={formData.cheapestPrice}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>

          <div className="formGroup">
            <label htmlFor="title">Title</label>
            <input
              type="text"
              id="title"
              value={formData.title}
              onChange={handleInputChange}
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
            <label htmlFor="photos">Photos (comma-separated URLs)</label>
            <textarea
              id="photos"
              value={formData.photos.join(", ")}
              onChange={handlePhotoChange}
              placeholder="https://example.com/photo1.jpg, https://example.com/photo2.jpg"
            />
          </div>

          <div className="formGroup">
            <label htmlFor="featured">
              <input
                type="checkbox"
                id="featured"
                checked={formData.featured}
                onChange={handleInputChange}
              />
              Featured Hotel
            </label>
          </div>

          <button type="submit" className="submitButton">Save Changes</button>
        </form>
      </div>
    </div>
  );
};

export default EditHotel; 