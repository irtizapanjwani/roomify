import { useState, useEffect, useContext } from "react";
import "./userProfile.css";
import Navbar from "../../components/navbar/Navbar";
import { AuthContext } from "../../context/AuthContext";
import axios from "../../utils/axios";
import { useNavigate } from "react-router-dom";
import {
  TextField,
  Button,
  Paper,
  Box,
  Typography,
  Avatar,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
  IconButton,
} from "@mui/material";
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import DeleteIcon from '@mui/icons-material/Delete';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const UserProfile = () => {
  const { user: currentUser, dispatch } = useContext(AuthContext);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    country: "",
    city: "",
    phone: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);

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
      
      // Update context
      dispatch({ 
        type: "UPDATE_USER", 
        payload: updatedUser
      });

      // Update localStorage
      localStorage.setItem("user", JSON.stringify(updatedUser));
      
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      await axios.delete(`/api/users/${currentUser._id}`);
      dispatch({ type: "LOGOUT" });
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete account");
    }
  };

  return (
    <div>
      <Navbar />
      <div className="userProfileMain">
        <div className="profileContainer">
          <Paper elevation={3} className="profilePaper">
            <Box className="backButtonContainer">
              <IconButton 
                onClick={() => navigate('/')}
                sx={{ 
                  color: '#003580',
                  '&:hover': {
                    backgroundColor: 'rgba(0, 53, 128, 0.04)'
                  }
                }}
              >
                <ArrowBackIcon />
              </IconButton>
            </Box>
            <Box className="profileHeader">
              <Avatar sx={{ width: 100, height: 100, bgcolor: "#003580" }}>
                <AccountCircleIcon sx={{ fontSize: 60 }} />
              </Avatar>
              <Typography variant="h4" component="h1">
                My Profile
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

              <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  size="large"
                  fullWidth
                  disabled={loading}
                  sx={{ 
                    bgcolor: "#003580",
                    "&:hover": {
                      bgcolor: "#004bb1"
                    }
                  }}
                >
                  {loading ? "Updating..." : "Update Profile"}
                </Button>

                <Button
                  variant="outlined"
                  color="error"
                  size="large"
                  startIcon={<DeleteIcon />}
                  onClick={() => setOpenDeleteDialog(true)}
                  sx={{ minWidth: '200px' }}
                >
                  Delete Account
                </Button>
              </Box>
            </form>
          </Paper>
        </div>

        {/* Delete Account Confirmation Dialog */}
        <Dialog
          open={openDeleteDialog}
          onClose={() => setOpenDeleteDialog(false)}
        >
          <DialogTitle>Delete Account</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Are you sure you want to delete your account? This action cannot be undone and you will lose all your data including reservations.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDeleteDialog(false)}>Cancel</Button>
            <Button 
              onClick={handleDeleteAccount} 
              color="error" 
              variant="contained"
            >
              Delete Account
            </Button>
          </DialogActions>
        </Dialog>

        {/* Success Notification */}
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

        {/* Error Notification */}
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
      </div>
    </div>
  );
};

export default UserProfile; 