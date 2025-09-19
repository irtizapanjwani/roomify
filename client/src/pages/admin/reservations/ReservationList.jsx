import { useState } from "react";
import AdminNav from "../../../components/admin/AdminNav";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Box from "@mui/material/Box";
import HotelReservationList from "./HotelReservationList";
import TaxiReservationList from "./TaxiReservationList";
import "./reservationList.css";

const ReservationList = () => {
  const [activeTab, setActiveTab] = useState(0);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  return (
    <div className="adminLayout">
      <AdminNav />
      <div className="adminMain">
        <div className="reservationListContainer">
          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
            <Tabs 
              value={activeTab} 
              onChange={handleTabChange}
              sx={{
                '& .MuiTab-root': {
                  fontSize: '1rem',
                  textTransform: 'none',
                },
                '& .Mui-selected': {
                  color: '#003580 !important',
                },
                '& .MuiTabs-indicator': {
                  backgroundColor: '#003580',
                },
              }}
            >
              <Tab label="Hotel Reservations" />
              <Tab label="Taxi Reservations" />
            </Tabs>
          </Box>

          {activeTab === 0 && <HotelReservationList />}
          {activeTab === 1 && <TaxiReservationList />}
        </div>
      </div>
    </div>
  );
};

export default ReservationList; 