import { useState, useEffect } from "react";
import "./taxiReservationList.css";
import { DataGrid } from "@mui/x-data-grid";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import DialogContentText from "@mui/material/DialogContentText";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import axios from "../../../utils/axios";
import { format } from "date-fns";

const TaxiReservationList = () => {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchCategory, setSearchCategory] = useState("username");
  const [selectedReservation, setSelectedReservation] = useState(null);
  const [openDetailsDialog, setOpenDetailsDialog] = useState(false);
  const [openStatusDialog, setOpenStatusDialog] = useState(false);

  const driverName = "Driver1"; // Default driver name

  useEffect(() => {
    fetchReservations();
  }, []);

  const fetchReservations = async () => {
    try {
      setLoading(true);
      const response = await axios.get("/api/taxi/admin/reservations");
      const formattedReservations = response.data.map(reservation => ({
        id: reservation._id,
        username: reservation.userId?.username || "N/A",
        email: reservation.userId?.email || "N/A",
        serviceType: reservation.serviceType,
        pickupDate: format(new Date(reservation.pickupDate), "MMM dd, yyyy"),
        pickupTime: reservation.pickupTime,
        pickupAddress: reservation.pickupAddress,
        paymentStatus: reservation.paymentStatus,
        createdAt: format(new Date(reservation.createdAt), "MMM dd, yyyy HH:mm"),
        driver: driverName
      }));
      setReservations(formattedReservations);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch reservations");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (reservationId, newStatus) => {
    try {
      await axios.put(`/api/taxi/admin/reservations/${reservationId}`, {
        paymentStatus: newStatus
      });
      fetchReservations();
      setOpenStatusDialog(false);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update status");
    }
  };

  const filteredReservations = reservations.filter(reservation => {
    if (!searchQuery) return true;
    
    const searchValue = reservation[searchCategory]?.toString().toLowerCase() || "";
    return searchValue.includes(searchQuery.toLowerCase());
  });

  const columns = [
    { field: "username", headerName: "Guest Name", flex: 1, minWidth: 130 },
    { field: "email", headerName: "Email", flex: 1.5, minWidth: 200 },
    { field: "serviceType", headerName: "Service Type", flex: 1, minWidth: 120 },
    { field: "pickupDate", headerName: "Pickup Date", flex: 1, minWidth: 120 },
    { field: "pickupTime", headerName: "Pickup Time", flex: 1, minWidth: 100 },
    { field: "paymentStatus", headerName: "Status", flex: 1, minWidth: 120 },
    { field: "driver", headerName: "Driver", flex: 1, minWidth: 120 },
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
            onClick={() => {
              setSelectedReservation(params.row);
              setOpenDetailsDialog(true);
            }}
            sx={{ mr: 1 }}
          >
            View
          </Button>
          <Button
            variant="contained"
            color="primary"
            size="small"
            onClick={() => {
              setSelectedReservation(params.row);
              setOpenStatusDialog(true);
            }}
          >
            Update Status
          </Button>
        </Box>
      ),
    },
  ];

  return (
    <div className="taxiReservationList">
      <div className="taxiReservationListContainer">
        <div className="listHeader">
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 3 }}>
            <TextField
              select
              label="Search by"
              value={searchCategory}
              onChange={(e) => setSearchCategory(e.target.value)}
              size="small"
              sx={{ minWidth: 150 }}
            >
              <MenuItem value="username">Guest Name</MenuItem>
              <MenuItem value="email">Email</MenuItem>
              <MenuItem value="serviceType">Service Type</MenuItem>
              <MenuItem value="paymentStatus">Status</MenuItem>
              <MenuItem value="driver">Driver</MenuItem>
            </TextField>
            <TextField
              label="Search"
              variant="outlined"
              size="small"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              sx={{ minWidth: 220 }}
            />
          </Box>
        </div>

        {error && <div className="error">{error}</div>}
        
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

        {/* Details Dialog */}
        <Dialog open={openDetailsDialog} onClose={() => setOpenDetailsDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Reservation Details</DialogTitle>
          <DialogContent>
            {selectedReservation && (
              <div className="reservationDetails">
                <div className="detailRow">
                  <h3>Guest Information</h3>
                  <p><strong>Name:</strong> {selectedReservation.username}</p>
                  <p><strong>Email:</strong> {selectedReservation.email}</p>
                </div>
                <div className="detailRow">
                  <h3>Ride Details</h3>
                  <p><strong>Service Type:</strong> {selectedReservation.serviceType}</p>
                  <p><strong>Pickup Date:</strong> {selectedReservation.pickupDate}</p>
                  <p><strong>Pickup Time:</strong> {selectedReservation.pickupTime}</p>
                  <p><strong>Pickup Address:</strong> {selectedReservation.pickupAddress}</p>
                </div>
                <div className="detailRow">
                  <h3>Status Information</h3>
                  <p><strong>Payment Status:</strong> {selectedReservation.paymentStatus}</p>
                  <p><strong>Driver:</strong> {selectedReservation.driver}</p>
                  <p><strong>Created At:</strong> {selectedReservation.createdAt}</p>
                </div>
              </div>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDetailsDialog(false)}>Close</Button>
          </DialogActions>
        </Dialog>

        {/* Status Update Dialog */}
        <Dialog open={openStatusDialog} onClose={() => setOpenStatusDialog(false)}>
          <DialogTitle>Update Reservation Status</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Select the new status for this reservation:
            </DialogContentText>
            <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
              {['pending', 'paid', 'completed', 'cancelled'].map((status) => (
                <Button
                  key={status}
                  variant="outlined"
                  onClick={() => handleUpdateStatus(selectedReservation?.id, status)}
                  sx={{ textTransform: 'capitalize' }}
                >
                  {status}
                </Button>
              ))}
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenStatusDialog(false)}>Cancel</Button>
          </DialogActions>
        </Dialog>
      </div>
    </div>
  );
};

export default TaxiReservationList; 