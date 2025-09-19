import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../../utils/axios";
import Navbar from "../../components/navbar/Navbar";
import Footer from "../../components/footer/Footer";
import { 
  Button, 
  TextField, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Box, 
  Typography, 
  List, 
  ListItem, 
  ListItemText, 
  ListItemSecondaryAction, 
  IconButton, 
  CircularProgress, 
  Snackbar, 
  Alert,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper,
  Divider,
  Menu,
  MenuItem,
  Badge
} from "@mui/material";
import SearchIcon from '@mui/icons-material/Search';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import PaymentIcon from '@mui/icons-material/Payment';
import ChatIcon from '@mui/icons-material/Chat';
import SendIcon from '@mui/icons-material/Send';
import { AuthContext } from "../../context/AuthContext";

const PREDEFINED_MESSAGES = [
  "Hello",
  "Pay your share",
  "Are you available to discuss the reservation?",
  "Please check the shared reservation",
  "Thank you"
];

const Connections = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [connections, setConnections] = useState([]);
  const [sharedReservations, setSharedReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");
  const [openChat, setOpenChat] = useState(false);
  const [messages, setMessages] = useState([]);
  const [anchorEl, setAnchorEl] = useState(null);
  const [unreadCounts, setUnreadCounts] = useState({});
  const [newMessage, setNewMessage] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (selectedUser && openChat) {
      fetchMessages();
    }
  }, [selectedUser, openChat]);

  useEffect(() => {
    const fetchUnreadCounts = async () => {
      try {
        const response = await axios.get("/api/messages/unread");
        setUnreadCounts(response.data.data);
      } catch (error) {
        console.error("Error fetching unread counts:", error);
      }
    };

    fetchUnreadCounts();
    const interval = setInterval(fetchUnreadCounts, 30000);

    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [connectionsRes, sharedRes] = await Promise.all([
        axios.get("/api/connections/my-connections"),
        axios.get("/api/shared-reservations")
      ]);
      
      console.log("Shared Reservations Response:", sharedRes.data);
      
      const validSharedReservations = (sharedRes.data.data || []).filter(
        shared => shared.reservationId && shared.reservationId.hotelId
      );
      
      setConnections(connectionsRes.data);
      setSharedReservations(validSharedReservations);
    } catch (error) {
      console.error("Error fetching data:", error);
      setSnackbarMessage("Failed to fetch data");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    try {
      const response = await axios.get(`/api/connections/search?query=${searchQuery}`);
      setSearchResults(response.data);
    } catch (error) {
      console.error("Error searching users:", error);
    }
  };

  const handleSendRequest = async (userId) => {
    try {
      const formattedUserId = typeof userId === 'object' ? userId.toString() : userId;
      console.log('Sending request to user:', formattedUserId);
      
      const response = await axios.post("/api/connections/request", { userId: formattedUserId });
      console.log('Response:', response.data);
      
      setSnackbarMessage(response.data.message || 'Connection request sent successfully');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
      
      setOpenDialog(false);
      await fetchData();
    } catch (error) {
      console.error("Error sending request:", error);
      if (error.response && error.response.data) {
        console.error("Server error details:", error.response.data);
        setSnackbarMessage(error.response.data.message || 'Failed to send connection request');
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
      }
    }
  };

  const handleAcceptRequest = async (connectionId) => {
    try {
      console.log('Accepting connection request with ID:', connectionId);
      await axios.put(`/api/connections/accept/${connectionId}`);
      await fetchData();
    } catch (error) {
      console.error("Error accepting request:", error);
      setSnackbarMessage(error.response?.data?.message || "Failed to accept request");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    }
  };

  const handleRejectRequest = async (connectionId) => {
    try {
      console.log('Rejecting connection request with ID:', connectionId);
      await axios.put(`/api/connections/reject/${connectionId}`);
      await fetchData();
    } catch (error) {
      console.error("Error rejecting request:", error);
      setSnackbarMessage(error.response?.data?.message || "Failed to reject request");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    }
  };

  const handlePayShare = async (sharedReservationId) => {
    try {
      navigate(`/payment/${sharedReservationId}?type=shared`);
    } catch (error) {
      console.error("Error initiating payment:", error);
      setSnackbarMessage(error.response?.data?.message || "Failed to initiate payment");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    }
  };

  const fetchMessages = async () => {
    try {
      const response = await axios.get(`/api/messages/conversation/${selectedUser._id}`);
      setMessages(response.data.data);
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };

  const handleOpenChat = (user) => {
    setSelectedUser(user);
    setOpenChat(true);
  };

  const handleCloseChat = () => {
    setSelectedUser(null);
    setOpenChat(false);
    setMessages([]);
  };

  const handleMessageMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMessageMenuClose = () => {
    setAnchorEl(null);
  };

  const handleSendMessage = async (messageText) => {
    try {
      const response = await axios.post("/api/messages", {
        receiverId: selectedUser._id,
        message: messageText
      });

      setMessages([...messages, response.data.data]);
      handleMessageMenuClose();
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const handleSendCustomMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    
    try {
      const response = await axios.post("/api/messages", {
        receiverId: selectedUser._id,
        message: newMessage.trim()
      });

      setMessages([...messages, response.data.data]);
      setNewMessage(""); // Clear input after sending
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  if (loading) {
    return (
      <div>
        <Navbar />
        <div style={{ padding: "20px", textAlign: "center" }}>
          <CircularProgress />
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div>
      <Navbar />
      <div style={{ padding: "20px" }}>
        <Snackbar
          open={snackbarOpen}
          autoHideDuration={3000}
          onClose={() => setSnackbarOpen(false)}
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
          <Alert 
            onClose={() => setSnackbarOpen(false)} 
            severity={snackbarSeverity}
            sx={{ width: '100%' }}
          >
            {snackbarMessage}
          </Alert>
        </Snackbar>
        <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
          <TextField
            fullWidth
            label="Search users"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch(e)}
            variant="outlined"
          />
          <Button
            variant="contained"
            color="primary"
            startIcon={<SearchIcon />}
            onClick={handleSearch}
          >
            Search
          </Button>
        </Box>

        {searchResults.length > 0 && (
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" gutterBottom>
              Search Results
            </Typography>
            <List>
              {searchResults.map((user) => (
                <ListItem key={user._id}>
                  <ListItemText primary={user.username} secondary={user.email} />
                  <ListItemSecondaryAction>
                    <Button
                      variant="contained"
                      color="primary"
                      startIcon={<PersonAddIcon />}
                      onClick={() => {
                        setSelectedUser(user);
                        setOpenDialog(true);
                      }}
                    >
                      Send Request
                    </Button>
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>
          </Box>
        )}

        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            Shared Reservations
          </Typography>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Hotel</TableCell>
                  <TableCell>Shared By</TableCell>
                  <TableCell>Amount</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {sharedReservations.map((shared) => {
                  const isCreator = shared.createdBy._id === user._id;
                  const myParticipation = shared.participants.find(
                    p => p.userId._id === user._id
                  );
                  
                  return (
                    <TableRow key={shared._id}>
                      <TableCell>
                        <Box>
                          <Typography variant="body1">
                            {shared.reservationId?.hotelId?.name || "N/A"}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {shared.reservationId?.dates?.[0] ? 
                              `${new Date(shared.reservationId.dates[0]).toLocaleDateString()} - 
                               ${new Date(shared.reservationId.dates[1]).toLocaleDateString()}`
                              : "Dates not available"
                            }
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        {isCreator ? "You" : shared.createdBy.username}
                      </TableCell>
                      <TableCell>
                        ${shared.amountPerUser.toFixed(2)}
                      </TableCell>
                      <TableCell>
                        <Typography
                          color={
                            shared.status === "confirmed" ? "success.main" :
                            shared.status === "pending" ? "warning.main" :
                            "error.main"
                          }
                        >
                          {shared.status.charAt(0).toUpperCase() + shared.status.slice(1)}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        {(!isCreator || !myParticipation?.hasPaid) && !myParticipation?.hasPaid && (
                          <Button
                            variant="contained"
                            color="primary"
                            startIcon={<PaymentIcon />}
                            onClick={() => handlePayShare(shared._id)}
                          >
                            Pay Share
                          </Button>
                        )}
                        {myParticipation?.hasPaid && (
                          <Typography variant="body2" color="success.main">
                            <CheckCircleIcon sx={{ fontSize: 16, mr: 1 }} />
                            Paid
                          </Typography>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
                {sharedReservations.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} align="center">
                      <Typography color="text.secondary">
                        No shared reservations found
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>

        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Pending Requests
          </Typography>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell align="right">Status</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {connections
                  .filter(conn => {
                    console.log('Filtering connection:', conn);
                    return conn.status === 'pending' && conn.user2._id === user._id;
                  })
                  .map((connection) => (
                  <TableRow key={connection._id}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {connection.user1.username}
                        <PersonAddIcon color="warning" sx={{ fontSize: 16 }} />
                      </Box>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2" color="warning.main">
                        Pending Request
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button
                          variant="contained"
                          color="success"
                          startIcon={<CheckCircleIcon />}
                          onClick={() => handleAcceptRequest(connection._id)}
                          sx={{ minWidth: 80 }}
                        >
                          Accept
                        </Button>
                        <Button
                          variant="contained"
                          color="error"
                          startIcon={<CancelIcon />}
                          onClick={() => handleRejectRequest(connection._id)}
                          sx={{ minWidth: 80 }}
                        >
                          Reject
                        </Button>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>

        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Your Connections
          </Typography>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell align="right">Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {connections.filter(conn => conn.status === 'accepted' && conn.user1.username === user.username).map((connection) => (
                  <TableRow key={connection._id}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {connection.user2.username}
                        <CheckCircleIcon color="success" sx={{ fontSize: 16 }} />
                      </Box>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2" color="success.main">
                        Connected
                      </Typography>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>

        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Connected Users
          </Typography>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell align="right">Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {connections.filter(conn => conn.status === 'accepted' && conn.user2.username === user.username).map((connection) => (
                  <TableRow key={connection._id}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {connection.user1.username}
                        <CheckCircleIcon color="success" sx={{ fontSize: 16 }} />
                      </Box>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2" color="success.main">
                        Connected
                      </Typography>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>

        <List>
          {connections
            .filter(connection => connection.status === 'accepted')
            .map((connection) => {
              const otherUser = connection.user1._id === user._id ? connection.user2 : connection.user1;
              return (
                <ListItem key={connection._id}>
                  <ListItemText
                    primary={otherUser?.username || 'Unknown User'}
                    secondary={connection.status}
                  />
                  <ListItemSecondaryAction>
                    <IconButton 
                      edge="end" 
                      onClick={() => handleOpenChat(otherUser)}
                    >
                      <Badge 
                        badgeContent={unreadCounts[otherUser?._id] || 0} 
                        color="error"
                      >
                        <ChatIcon />
                      </Badge>
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
              );
            })}
        </List>
      </div>
      <Footer />

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Send Connection Request</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to send a connection request to {selectedUser?.username}?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={() => handleSendRequest(selectedUser?._id)} color="primary">
            Send Request
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog 
        open={openChat} 
        onClose={handleCloseChat}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Chat with {selectedUser?.username}
        </DialogTitle>
        <DialogContent>
          <Paper 
            style={{ 
              height: '300px', 
              overflowY: 'auto', 
              padding: '16px',
              marginBottom: '16px'
            }}
          >
            {messages.map((msg, index) => (
              <Box
                key={index}
                sx={{
                  display: 'flex',
                  justifyContent: msg.senderId._id === user._id ? 'flex-end' : 'flex-start',
                  mb: 1
                }}
              >
                <Paper
                  sx={{
                    p: 1,
                    backgroundColor: msg.senderId._id === user._id ? '#e3f2fd' : '#f5f5f5',
                    maxWidth: '70%'
                  }}
                >
                  <Typography variant="body2">
                    {msg.message}
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    {msg.senderId.username} • {new Date(msg.createdAt).toLocaleTimeString()}
                  </Typography>
                </Paper>
              </Box>
            ))}
          </Paper>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <form onSubmit={handleSendCustomMessage} style={{ display: 'flex', gap: '8px' }}>
              <TextField
                fullWidth
                size="small"
                placeholder="Type a message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                variant="outlined"
              />
              <Button 
                type="submit"
                variant="contained" 
                color="primary"
                endIcon={<SendIcon />}
              >
                Send
              </Button>
            </form>
            <Divider>or</Divider>
            <Button
              variant="outlined"
              onClick={handleMessageMenuClick}
              endIcon={<SendIcon />}
              fullWidth
            >
              Select a predefined message
            </Button>
          </Box>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMessageMenuClose}
          >
            {PREDEFINED_MESSAGES.map((msg, index) => (
              <MenuItem 
                key={index}
                onClick={() => {
                  handleSendMessage(msg);
                  handleMessageMenuClose();
                }}
              >
                {msg}
              </MenuItem>
            ))}
          </Menu>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseChat}>Close</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default Connections;
