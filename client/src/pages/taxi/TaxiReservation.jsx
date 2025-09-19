import { useNavigate } from "react-router-dom";
import { Alert, Snackbar } from "@mui/material";

const TaxiReservation = () => {
  const navigate = useNavigate();
  const [showProfileAlert, setShowProfileAlert] = useState(false);
  const { user } = useContext(AuthContext);

  const checkProfileComplete = () => {
    if (!user.city || !user.country || !user.phone) {
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!checkProfileComplete()) {
      setShowProfileAlert(true);
      setTimeout(() => {
        navigate("/profile", { 
          state: { 
            message: "Please complete your profile information before booking a taxi.",
            returnPath: "/taxi"
          } 
        });
      }, 2000);
      return;
    }

    // ... rest of your existing handleSubmit code ...
  };

  return (
    <div>
      <Navbar />
      <div className="taxiContainer">
        {/* ... existing form JSX ... */}
        
        <Snackbar 
          open={showProfileAlert} 
          autoHideDuration={2000} 
          onClose={() => setShowProfileAlert(false)}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        >
          <Alert severity="warning" sx={{ width: '100%' }}>
            Please complete your profile information before booking a taxi.
          </Alert>
        </Snackbar>
      </div>
      <Footer />
    </div>
  );
}; 