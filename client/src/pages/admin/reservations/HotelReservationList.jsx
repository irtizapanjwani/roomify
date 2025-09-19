import { useState, useEffect } from "react";
import axios from "../../../utils/axios";
import { format } from "date-fns";
import { DataGrid } from "@mui/x-data-grid";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import TextField from "@mui/material/TextField";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Box from "@mui/material/Box";
import { formatUSD } from "../../../utils/currencyConverter";

const HotelReservationList = () => {
  const [reservations, setReservations] = useState([]);
  const [filteredReservations, setFilteredReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedReservation, setSelectedReservation] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [searchCategory, setSearchCategory] = useState('userName');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchReservations();
  }, []);

  useEffect(() => {
    filterReservations();
  }, [searchQuery, searchCategory, reservations]);

  const filterReservations = () => {
    if (!searchQuery) {
      setFilteredReservations(reservations);
      return;
    }

    const filtered = reservations.filter(reservation => {
      const value = reservation[searchCategory]?.toString().toLowerCase() || '';
      return value.includes(searchQuery.toLowerCase());
    });

    setFilteredReservations(filtered);
  };

  const fetchReservations = async () => {
    try {
      setLoading(true);
      const response = await axios.get("/api/reservations/admin/all");
      const formattedReservations = response.data.map(reservation => ({
        id: reservation._id,
        userName: reservation.userId?.username || "N/A",
        userEmail: reservation.userId?.email || "N/A",
        hotelName: reservation.hotelId?.name || "N/A",
        roomNumbers: reservation.roomNumbers?.join(", ") || "Not assigned",
        startDate: format(new Date(reservation.dates[0]), "MMM dd, yyyy"),
        endDate: format(new Date(reservation.dates[1]), "MMM dd, yyyy"),
        status: reservation.status || "Pending",
        totalPrice: formatUSD(reservation.totalPrice || 0),
        createdAt: format(new Date(reservation.createdAt), "MMM dd, yyyy HH:mm"),
      }));
      setReservations(formattedReservations);
      setFilteredReservations(formattedReservations);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch reservations");
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (reservation) => {
    setSelectedReservation(reservation);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleUpdateStatus = async (reservationId, newStatus) => {
    try {
      await axios.put(`/api/reservations/${reservationId}/status`, { status: newStatus });
      fetchReservations();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update reservation status");
    }
  };

  const searchCategories = [
    { value: 'userName', label: 'Guest Name' },
    { value: 'userEmail', label: 'Email' },
    { value: 'hotelName', label: 'Hotel' },
    { value: 'roomNumbers', label: 'Room Numbers' },
    { value: 'status', label: 'Status' }
  ];

  const columns = [
    { field: "userName", headerName: "Guest Name", flex: 1, minWidth: 130 },
    { field: "userEmail", headerName: "Email", flex: 1.5, minWidth: 200 },
    { field: "hotelName", headerName: "Hotel", flex: 1.5, minWidth: 200 },
    { field: "roomNumbers", headerName: "Room Numbers", flex: 1, minWidth: 130 },
    { field: "startDate", headerName: "Check-in", flex: 1, minWidth: 120 },
    { field: "endDate", headerName: "Check-out", flex: 1, minWidth: 120 },
    { field: "status", headerName: "Status", flex: 0.8, minWidth: 100 },
    { field: "totalPrice", headerName: "Total", flex: 0.8, minWidth: 100 },
    {
      field: "actions",
      headerName: "Actions",
      flex: 1.5,
      minWidth: 220,
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
            color="success"
            size="small"
            onClick={() => handleUpdateStatus(params.row.id, "Confirmed")}
            disabled={params.row.status === "Confirmed"}
            sx={{ mr: 1 }}
          >
            Confirm
          </Button>
          <Button
            variant="contained"
            color="error"
            size="small"
            onClick={() => handleUpdateStatus(params.row.id, "Cancelled")}
            disabled={params.row.status === "Cancelled"}
          >
            Cancel
          </Button>
        </Box>
      ),
    },
  ];

  return (
    <div>
      <h1>Hotel Reservations</h1>
      {error && <div className="error">{error}</div>}
      
      {/* Search Section */}
      <Box className="searchSection" sx={{ mb: 3 }}>
        <FormControl sx={{ minWidth: 200, mr: 2 }}>
          <InputLabel>Search By</InputLabel>
          <Select
            value={searchCategory}
            label="Search By"
            onChange={(e) => setSearchCategory(e.target.value)}
          >
            {searchCategories.map((category) => (
              <MenuItem key={category.value} value={category.value}>
                {category.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <TextField
          label="Search"
          variant="outlined"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          sx={{ minWidth: 300 }}
          placeholder={`Search by ${searchCategories.find(cat => cat.value === searchCategory)?.label}`}
        />
      </Box>

      <div className="dataGridContainer">
        <DataGrid
          rows={filteredReservations}
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

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>Reservation Details</DialogTitle>
        <DialogContent>
          {selectedReservation && (
            <div className="reservationDetails">
              <div className="detailRow">
                <h3>Guest Information</h3>
                <p><strong>Name:</strong> {selectedReservation.userName}</p>
                <p><strong>Email:</strong> {selectedReservation.userEmail}</p>
              </div>
              <div className="detailRow">
                <h3>Booking Details</h3>
                <p><strong>Hotel:</strong> {selectedReservation.hotelName}</p>
                <p><strong>Room Numbers:</strong> {selectedReservation.roomNumbers}</p>
                <p><strong>Check-in:</strong> {selectedReservation.startDate}</p>
                <p><strong>Check-out:</strong> {selectedReservation.endDate}</p>
                <p><strong>Total Price:</strong> {selectedReservation.totalPrice}</p>
                <p><strong>Status:</strong> {selectedReservation.status}</p>
                <p><strong>Booked on:</strong> {selectedReservation.createdAt}</p>
              </div>
            </div>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Close</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default HotelReservationList; 