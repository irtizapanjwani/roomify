import "./dashboard.css";
import AdminNav from "../../components/admin/AdminNav";
import useFetch from "../../hooks/useFetch.js";

const Dashboard = () => {
  const { data: hotels } = useFetch("/api/hotels");
  const { data: rooms } = useFetch("/api/rooms");
  const { data: users } = useFetch("/api/users");

  return (
    <div className="adminDashboard">
      <AdminNav />
      <div className="dashboardContainer">
        <h1>Dashboard Overview</h1>
        <div className="dashboardStats">
          <div className="statCard">
            <h3>Total Hotels</h3>
            <p>{hotels?.length || 0}</p>
          </div>
          <div className="statCard">
            <h3>Total Rooms</h3>
            <p>{rooms?.length || 0}</p>
          </div>
          <div className="statCard">
            <h3>Total Users</h3>
            <p>{users?.length || 0}</p>
          </div>
        </div>
        <div className="dashboardActions">
          <button onClick={() => window.location.href = '/admin/hotels/new'} className="actionButton">
            Add New Hotel
          </button>
          <button onClick={() => window.location.href = '/admin/hotels'} className="actionButton">
            Manage Hotels
          </button>
          <button onClick={() => window.location.href = '/admin/reservations'} className="actionButton">
            View Reservations
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 