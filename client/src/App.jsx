import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";
import Home from "./pages/home/Home.jsx";
import Hotel from "./pages/hotel/Hotel.jsx";
import List from "./pages/list/List.jsx";
import Login from "./pages/login/login.jsx";
import Register from "./pages/register/Register.jsx";
import Reservation from "./pages/reservation/Reservation.jsx";
import Taxi from './pages/taxi/Taxi.jsx';
import TaxiReservation from './pages/taxireservation/TaxiReservation.jsx';
import TaxiPayment from "./pages/taxipayment/TaxiPayment.jsx";
import TrackTaxi from "./pages/tracktaxi/TrackTaxi.jsx";
import Dashboard from "./pages/admin/Dashboard.jsx";
import HotelList from "./pages/admin/hotels/HotelList.jsx";
import CreateHotel from "./pages/admin/hotels/CreateHotel.jsx";
import EditHotel from "./pages/admin/hotels/EditHotel.jsx";
import HotelRooms from "./pages/admin/hotels/HotelRooms.jsx";
import ReservationList from "./pages/admin/reservations/ReservationList.jsx";
import AdminProtectedRoute from "./components/admin/AdminProtectedRoute.jsx";
import UserList from "./pages/admin/users/UserList.jsx";
import AdminProfile from "./pages/admin/profile/AdminProfile.jsx";
import UserProfile from "./pages/profile/UserProfile.jsx";
import HotelPayment from "./pages/payment/HotelPayment.jsx";
import BookingHistory from "./pages/bookingHistory/BookingHistory.jsx";
import Connections from "./pages/connections/Connections.jsx";
import Attractions from "./pages/attractions/Attractions.jsx";
import { AuthContextProvider } from "./context/AuthContext.jsx";
import { SearchContextProvider } from "./context/SearchContext.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";

function App() {
  return (
    <BrowserRouter>
      <AuthContextProvider>
        <SearchContextProvider>
          <Routes>
            <Route path="/" element={<Home/>}/>
            <Route path="/hotels" element={<List/>}/>
            <Route path="/hotels/:id" element={<Hotel/>}/>
            <Route path="/login" element={<Login/>} />
            <Route path="/register" element={<Register/>} />
            <Route path="/reservation" element={<Reservation/>} />
            <Route path="/profile" element={<UserProfile />} />
            <Route path="/taxi" element={<Taxi />} />
            <Route path="/taxi/reserve" element={<TaxiReservation />} />
            <Route path="/taxipayment/:id" element={<TaxiPayment />} />
            <Route path="/tracktaxi/:id" element={<TrackTaxi />} />
            <Route path="/payment/:id" element={<HotelPayment />} />
            <Route path="/booking-history" element={<BookingHistory />} />
            <Route path="/connections" element={<Connections />} />
            <Route path="/attractions" element={<Attractions />} />
            
            {/* Admin Routes */}
            <Route path="/admin" element={
              <AdminProtectedRoute>
                <Dashboard />
              </AdminProtectedRoute>
            }/>
            <Route path="/admin/hotels" element={
              <AdminProtectedRoute>
                <HotelList />
              </AdminProtectedRoute>
            }/>
            <Route path="/admin/hotels/new" element={
              <AdminProtectedRoute>
                <CreateHotel />
              </AdminProtectedRoute>
            }/>
            <Route path="/admin/hotels/:hotelId" element={
              <AdminProtectedRoute>
                <EditHotel />
              </AdminProtectedRoute>
            }/>
            <Route path="/admin/hotels/:hotelId/rooms" element={
              <AdminProtectedRoute>
                <HotelRooms />
              </AdminProtectedRoute>
            }/>
            <Route path="/admin/reservations" element={
              <AdminProtectedRoute>
                <ReservationList />
              </AdminProtectedRoute>
            }/>
            <Route path="/admin/users" element={
              <AdminProtectedRoute>
                <UserList />
              </AdminProtectedRoute>
            } />
            <Route path="/admin/profile" element={
              <AdminProtectedRoute>
                <AdminProfile />
              </AdminProtectedRoute>
            } />
          </Routes>
        </SearchContextProvider>
      </AuthContextProvider>
    </BrowserRouter>
  );
}

export default App;
