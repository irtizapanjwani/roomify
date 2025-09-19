import { useState, useEffect } from "react";
import "./userList.css";
import AdminNav from "../../../components/admin/AdminNav";
import { DataGrid } from "@mui/x-data-grid";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import DialogContentText from "@mui/material/DialogContentText";
import TextField from "@mui/material/TextField";
import Box from "@mui/material/Box";
import { format } from "date-fns";
import axios from "../../../utils/axios";
import { useNavigate } from "react-router-dom";

const UserList = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const navigate = useNavigate();

  const searchCategories = [
    { value: 'username', label: 'Guest Name' },
    { value: 'email', label: 'Email' },
    { value: 'country', label: 'Country' },
    { value: 'city', label: 'City' },
    { value: 'phone', label: 'Phone' },
    { value: 'isAdmin', label: 'Admin Status' }
  ];

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [searchQuery, users]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await axios.get("/api/users");
      const formattedUsers = response.data.map(user => ({
        id: user._id,
        username: user.username,
        email: user.email,
        isAdmin: user.isAdmin ? "Yes" : "No",
        createdAt: format(new Date(user.createdAt), "MMM dd, yyyy HH:mm"),
        reservationsCount: user.reservations?.length || 0,
        country: user.country || "N/A",
        city: user.city || "N/A",
        phone: user.phone || "N/A"
      }));
      setUsers(formattedUsers);
      setFilteredUsers(formattedUsers);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  const filterUsers = () => {
    if (!searchQuery) {
      setFilteredUsers(users);
      return;
    }

    const filtered = users.filter(user => {
      const searchFields = [
        user.username,
        user.email,
        user.country,
        user.city,
        user.phone
      ].map(field => 
        field?.toLowerCase() || ''
      );
      return searchFields.some(field => field.includes(searchQuery.toLowerCase()));
    });

    setFilteredUsers(filtered);
  };

  const handleViewDetails = (user) => {
    setSelectedUser(user);
    setOpenDialog(true);
  };

  const handleDeleteUser = async (userId) => {
    try {
      await axios.delete(`/api/users/${userId}`);
      fetchUsers();
      setOpenDeleteDialog(false);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete user");
    }
  };

  const columns = [
    { field: "username", headerName: "Username", flex: 1, minWidth: 130 },
    { field: "email", headerName: "Email", flex: 1.5, minWidth: 200 },
    { field: "country", headerName: "Country", flex: 1, minWidth: 120 },
    { field: "city", headerName: "City", flex: 1, minWidth: 120 },
    { field: "phone", headerName: "Phone", flex: 1, minWidth: 130 },
    { field: "isAdmin", headerName: "Admin", flex: 0.7, minWidth: 100 },
    { field: "reservationsCount", headerName: "Reservations", flex: 1, minWidth: 120 },
    { field: "createdAt", headerName: "Joined", flex: 1.2, minWidth: 180 },
    {
      field: "actions",
      headerName: "Actions",
      flex: 1.2,
      minWidth: 200,
      sortable: false,
      renderCell: (params) => (
        <Box className="actionButtons">
          <Button
            variant="outlined"
            size="small"
            onClick={() => handleViewDetails(params.row)}
            sx={{ mr: 1 }}
          >
            View
          </Button>
          <Button
            variant="contained"
            color="error"
            size="small"
            onClick={() => {
              setSelectedUser(params.row);
              setOpenDeleteDialog(true);
            }}
          >
            Delete
          </Button>
        </Box>
      ),
    },
  ];

  return (
    <div className="adminLayout">
      <AdminNav />
      <div className="adminMain">
        <div className="userListContainer">
          <div className="userListHeader">
            <h1>User Management</h1>
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              <TextField
                label="Search Users"
                variant="outlined"
                size="small"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name, email, country..."
              />
            </Box>
          </div>

          <div className="statsCards">
            <div className="statCard">
              <h3>Total Users</h3>
              <p>{users.length}</p>
            </div>
            <div className="statCard">
              <h3>Admin Users</h3>
              <p>{users.filter(user => user.isAdmin === "Yes").length}</p>
            </div>
            <div className="statCard">
              <h3>Active Reservations</h3>
              <p>{users.reduce((total, user) => total + user.reservationsCount, 0)}</p>
            </div>
          </div>

          {error && <div className="error">{error}</div>}
          
          <div className="userListWrapper">
            <DataGrid
              rows={filteredUsers}
              columns={columns}
              pageSize={10}
              rowsPerPageOptions={[10]}
              disableSelectionOnClick
              loading={loading}
              autoHeight
              sx={{
                '& .MuiDataGrid-cell': {
                  borderBottom: '1px solid #e0e0e0',
                },
                '& .MuiDataGrid-columnHeaders': {
                  backgroundColor: '#f5f5f5',
                  borderBottom: '2px solid #003580',
                },
              }}
            />
          </div>

          {/* User Details Dialog */}
          <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
            <DialogTitle>User Details</DialogTitle>
            <DialogContent>
              {selectedUser && (
                <div className="userDetails">
                  <div className="detailRow">
                    <h3>Account Information</h3>
                    <p><strong>Username:</strong> {selectedUser.username}</p>
                    <p><strong>Email:</strong> {selectedUser.email}</p>
                    <p><strong>Admin Status:</strong> {selectedUser.isAdmin}</p>
                    <p><strong>Joined:</strong> {selectedUser.createdAt}</p>
                  </div>
                  <div className="detailRow">
                    <h3>Contact Information</h3>
                    <p><strong>Country:</strong> {selectedUser.country}</p>
                    <p><strong>City:</strong> {selectedUser.city}</p>
                    <p><strong>Phone:</strong> {selectedUser.phone}</p>
                  </div>
                  <div className="detailRow">
                    <h3>Activity</h3>
                    <p><strong>Total Reservations:</strong> {selectedUser.reservationsCount}</p>
                  </div>
                </div>
              )}
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setOpenDialog(false)}>Close</Button>
            </DialogActions>
          </Dialog>

          {/* Delete Confirmation Dialog */}
          <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)}>
            <DialogTitle>Confirm Delete</DialogTitle>
            <DialogContent>
              <DialogContentText>
                Are you sure you want to delete the user "{selectedUser?.username}"? 
                This action cannot be undone.
              </DialogContentText>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setOpenDeleteDialog(false)}>Cancel</Button>
              <Button 
                onClick={() => handleDeleteUser(selectedUser?.id)} 
                color="error" 
                variant="contained"
              >
                Delete
              </Button>
            </DialogActions>
          </Dialog>
        </div>
      </div>
    </div>
  );
};

export default UserList; 