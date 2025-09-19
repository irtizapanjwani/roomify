import "./profileUpdateModal.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleXmark } from "@fortawesome/free-solid-svg-icons";
import { useState, useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import axios from "../../utils/axios";
import { Alert, Snackbar } from "@mui/material";

const ProfileUpdateModal = ({ setOpen, onUpdateSuccess }) => {
  const { user, dispatch } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    city: user?.city || "",
    country: user?.country || "",
    phone: user?.phone || "",
  });
  const [showMessage, setShowMessage] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await axios.put(`/api/users/${user._id}`, {
        ...formData,
        username: user.username,
        email: user.email
      });

      // Update local storage with new user data
      const updatedUser = { ...user, ...formData };
      localStorage.setItem("user", JSON.stringify(updatedUser));

      // Update context
      dispatch({ 
        type: "UPDATE_USER", 
        payload: updatedUser
      });

      // Show success message
      setShowMessage(true);
      
      // Call the success callback with updated user data after a short delay
      setTimeout(() => {
        setShowMessage(false);
        setOpen(false);
        if (onUpdateSuccess) {
          onUpdateSuccess(updatedUser);
        }
      }, 500);

    } catch (err) {
      console.error("Profile update error:", err);
      setError(err.response?.data?.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="profileUpdate" onClick={(e) => {
      if (e.target.className === "profileUpdate") {
        setOpen(false);
      }
    }}>
      <div className="pContainer">
        <FontAwesomeIcon
          icon={faCircleXmark}
          className="pClose"
          onClick={() => setOpen(false)}
        />
        <span className="pTitle">Update Your Profile</span>
        <span className="pSubtitle">Please provide your contact information</span>
        
        <form onSubmit={handleSubmit} className="pForm">
          <div className="pFormGroup">
            <label>Country</label>
            <input
              type="text"
              name="country"
              value={formData.country}
              onChange={handleChange}
              className="pInput"
              required
            />
          </div>
          <div className="pFormGroup">
            <label>City</label>
            <input
              type="text"
              name="city"
              value={formData.city}
              onChange={handleChange}
              className="pInput"
              required
            />
          </div>
          <div className="pFormGroup">
            <label>Phone Number</label>
            <input
              type="text"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="pInput"
              required
            />
          </div>
          <button type="submit" className="pButton" disabled={loading}>
            {loading ? "Updating..." : "Update Profile"}
          </button>
        </form>

        <Snackbar
          open={showMessage}
          autoHideDuration={500}
          onClose={() => setShowMessage(false)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert severity="success" sx={{ width: '100%' }}>
            Profile updated successfully!
          </Alert>
        </Snackbar>

        <Snackbar
          open={!!error}
          autoHideDuration={3000}
          onClose={() => setError(null)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert severity="error" sx={{ width: '100%' }}>
            {error}
          </Alert>
        </Snackbar>
      </div>
    </div>
  );
};

export default ProfileUpdateModal; 