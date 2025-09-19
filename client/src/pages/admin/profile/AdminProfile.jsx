import { useState, useEffect, useContext } from "react";
import "./adminProfile.css";
import AdminNav from "../../../components/admin/AdminNav";
import { AuthContext } from "../../../context/AuthContext";
import axios from "../../../utils/axios";
import {
  TextField,
  Button,
  Paper,
  Box,
  Typography,
  Avatar,
  Snackbar,
  Alert,
  Divider,
} from "@mui/material";
import AccountCircleIcon from '@mui/icons-material/AccountCircle';

const AdminProfile = () => {
  const { user: currentUser, dispatch } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    country: "",
    city: "",
    phone: "",
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [passwordError, setPasswordError] = useState(null);
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  useEffect(() => {
    if (currentUser) {
      setFormData({
        username: currentUser.username || "",
        email: currentUser.email || "",
        country: currentUser.country || "",
        city: currentUser.city || "",
        phone: currentUser.phone || "",
      });
    }
  }, [currentUser]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handlePasswordChange = (e) => {
    setPasswordData({
      ...passwordData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await axios.put(`/api/users/${currentUser._id}`, formData);
      
      // Update the context with new user data
      const updatedUser = {
        ...currentUser,
        ...response.data
      };
      
      dispatch({ 
        type: "UPDATE_USER", 
        payload: updatedUser
      });

      // Store updated user data in localStorage
      localStorage.setItem("user", JSON.stringify(updatedUser));
      
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setPasswordError(null);

    // Validate passwords match
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError("New passwords do not match");
      setLoading(false);
      return;
    }

    try {
      await axios.put(`/api/users/${currentUser._id}/password`, {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });

      setPasswordSuccess(true);
      // Clear password fields
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (err) {
      setPasswordError(err.response?.data?.message || "Failed to update password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="adminLayout">
      <AdminNav />
      <div className="adminMain">
        <div className="profileContainer">
          <Paper elevation={3} className="profilePaper">
            <Box className="profileHeader">
              <Avatar sx={{ width: 100, height: 100, bgcolor: "#003580" }}>
                <AccountCircleIcon sx={{ fontSize: 60 }} />
              </Avatar>
              <Typography variant="h4" component="h1">
                Admin Profile
              </Typography>
            </Box>

            <form onSubmit={handleSubmit} className="profileForm">
              <TextField
                name="username"
                label="Username"
                value={formData.username}
                onChange={handleChange}
                fullWidth
                margin="normal"
                variant="outlined"
              />
              
              <TextField
                name="email"
                label="Email"
                value={formData.email}
                onChange={handleChange}
                fullWidth
                margin="normal"
                variant="outlined"
                type="email"
              />

              <TextField
                name="country"
                label="Country"
                value={formData.country}
                onChange={handleChange}
                fullWidth
                margin="normal"
                variant="outlined"
              />

              <TextField
                name="city"
                label="City"
                value={formData.city}
                onChange={handleChange}
                fullWidth
                margin="normal"
                variant="outlined"
              />

              <TextField
                name="phone"
                label="Phone"
                value={formData.phone}
                onChange={handleChange}
                fullWidth
                margin="normal"
                variant="outlined"
              />

              <Button
                type="submit"
                variant="contained"
                color="primary"
                size="large"
                fullWidth
                disabled={loading}
                sx={{ 
                  mt: 3,
                  bgcolor: "#003580",
                  "&:hover": {
                    bgcolor: "#004bb1"
                  }
                }}
              >
                {loading ? "Updating..." : "Update Profile"}
              </Button>
            </form>

            <Divider sx={{ my: 4 }} />

            {/* Password Change Form */}
            <Typography variant="h5" component="h2" sx={{ mb: 3 }}>
              Change Password
            </Typography>
            <form onSubmit={handlePasswordSubmit} className="profileForm">
              <TextField
                name="currentPassword"
                label="Current Password"
                value={passwordData.currentPassword}
                onChange={handlePasswordChange}
                fullWidth
                margin="normal"
                variant="outlined"
                type="password"
                required
              />

              <TextField
                name="newPassword"
                label="New Password"
                value={passwordData.newPassword}
                onChange={handlePasswordChange}
                fullWidth
                margin="normal"
                variant="outlined"
                type="password"
                required
              />

              <TextField
                name="confirmPassword"
                label="Confirm New Password"
                value={passwordData.confirmPassword}
                onChange={handlePasswordChange}
                fullWidth
                margin="normal"
                variant="outlined"
                type="password"
                required
              />

              <Button
                type="submit"
                variant="contained"
                color="primary"
                size="large"
                fullWidth
                disabled={loading}
                sx={{ 
                  mt: 3,
                  bgcolor: "#003580",
                  "&:hover": {
                    bgcolor: "#004bb1"
                  }
                }}
              >
                {loading ? "Updating Password..." : "Change Password"}
              </Button>
            </form>
          </Paper>
        </div>

        {/* Profile Update Success Notification */}
        <Snackbar 
          open={success} 
          autoHideDuration={6000} 
          onClose={() => setSuccess(false)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <Alert severity="success" onClose={() => setSuccess(false)}>
            Profile updated successfully!
          </Alert>
        </Snackbar>

        {/* Profile Update Error Notification */}
        <Snackbar 
          open={!!error} 
          autoHideDuration={6000} 
          onClose={() => setError(null)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <Alert severity="error" onClose={() => setError(null)}>
            {error}
          </Alert>
        </Snackbar>

        {/* Password Update Success Notification */}
        <Snackbar 
          open={passwordSuccess} 
          autoHideDuration={6000} 
          onClose={() => setPasswordSuccess(false)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <Alert severity="success" onClose={() => setPasswordSuccess(false)}>
            Password updated successfully!
          </Alert>
        </Snackbar>

        {/* Password Update Error Notification */}
        <Snackbar 
          open={!!passwordError} 
          autoHideDuration={6000} 
          onClose={() => setPasswordError(null)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <Alert severity="error" onClose={() => setPasswordError(null)}>
            {passwordError}
          </Alert>
        </Snackbar>
      </div>
    </div>
  );
};

export default AdminProfile; 