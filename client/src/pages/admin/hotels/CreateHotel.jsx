import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../../../utils/axios";
import AdminNav from "../../../components/admin/AdminNav";
import "./createHotel.css";

const CreateHotel = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    type: "hotel", // default value
    city: "",
    address: "",
    distance: "",
    photos: [],
    title: "",
    desc: "",
    rating: 0,
    cheapestPrice: 0,
    featured: false,
  });

  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' 
      ? e.target.checked 
      : e.target.type === 'number'
      ? Number(e.target.value)
      : e.target.value;
    
    setFormData({
      ...formData,
      [e.target.id]: value,
    });
  };

  const handlePhotoChange = (e) => {
    // For now, we'll just store URLs. In a real app, you'd handle file uploads
    const photoUrls = e.target.value.split(',').map(url => url.trim());
    setFormData({
      ...formData,
      photos: photoUrls,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await axios.post("/api/hotels", formData);
      console.log("Hotel created:", response.data);
      navigate("/admin/hotels");
    } catch (err) {
      setError(err.response?.data?.message || "Error creating hotel");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="createHotel">
      <AdminNav />
      <div className="createHotelContainer">
        <h1>Add New Hotel</h1>
        <form onSubmit={handleSubmit} className="createHotelForm">
          <div className="formGroup">
            <label htmlFor="name">Hotel Name *</label>
            <input
              type="text"
              id="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="formGroup">
            <label htmlFor="type">Type *</label>
            <select id="type" value={formData.type} onChange={handleChange} required>
              <option value="hotel">Hotel</option>
              <option value="apartment">Apartment</option>
              <option value="resort">Resort</option>
              <option value="villa">Villa</option>
              <option value="cabin">Cabin</option>
            </select>
          </div>

          <div className="formGroup">
            <label htmlFor="city">City *</label>
            <input
              type="text"
              id="city"
              value={formData.city}
              onChange={handleChange}
              required
            />
          </div>

          <div className="formGroup">
            <label htmlFor="address">Address *</label>
            <input
              type="text"
              id="address"
              value={formData.address}
              onChange={handleChange}
              required
            />
          </div>

          <div className="formGroup">
            <label htmlFor="distance">Distance *</label>
            <input
              type="text"
              id="distance"
              value={formData.distance}
              onChange={handleChange}
              placeholder="e.g., 500m from center"
              required
            />
          </div>

          <div className="formGroup">
            <label htmlFor="photos">Photos (comma-separated URLs)</label>
            <textarea
              id="photos"
              value={formData.photos.join(", ")}
              onChange={handlePhotoChange}
              placeholder="Enter photo URLs separated by commas"
            />
          </div>

          <div className="formGroup">
            <label htmlFor="title">Title *</label>
            <input
              type="text"
              id="title"
              value={formData.title}
              onChange={handleChange}
              required
            />
          </div>

          <div className="formGroup">
            <label htmlFor="desc">Description *</label>
            <textarea
              id="desc"
              value={formData.desc}
              onChange={handleChange}
              required
            />
          </div>

          <div className="formGroup">
            <label htmlFor="cheapestPrice">Price per Night *</label>
            <input
              type="number"
              id="cheapestPrice"
              value={formData.cheapestPrice}
              onChange={handleChange}
              min="0"
              required
            />
          </div>

          <div className="formGroup">
            <label htmlFor="rating">Rating</label>
            <input
              type="number"
              id="rating"
              value={formData.rating}
              onChange={handleChange}
              min="0"
              max="5"
              step="0.1"
            />
          </div>

          <div className="formGroup checkbox">
            <label htmlFor="featured">
              <input
                type="checkbox"
                id="featured"
                checked={formData.featured}
                onChange={handleChange}
              />
              Featured Hotel
            </label>
          </div>

          {error && <div className="error-message">{error}</div>}
          
          <button type="submit" className="submitButton" disabled={loading}>
            {loading ? "Creating..." : "Create Hotel"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateHotel; 