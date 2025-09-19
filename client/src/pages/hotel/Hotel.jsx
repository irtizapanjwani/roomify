import "./hotel.css";
import Navbar from "../../components/navbar/Navbar";
import Header from "../../components/header/Header";
import MailList from "../../components/mailList/MailList";
import Footer from "../../components/footer/Footer";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCircleArrowLeft,
  faCircleArrowRight,
  faCircleXmark,
  faLocationDot,
} from "@fortawesome/free-solid-svg-icons";
import { useContext, useState, useEffect } from "react";
import useFetch from "../../hooks/useFetch";
import { useLocation, useNavigate } from "react-router-dom";
import { SearchContext } from "../../context/SearchContext";
import { AuthContext } from "../../context/AuthContext";
import Reserve from "../../components/reserve/Reserve";
import { formatPriceWithConversion } from "../../utils/currencyConverter";

const Hotel = () => {  
  const location = useLocation();
  const id = location.pathname.split("/")[2];
  const [slideNumber, setSlideNumber] = useState(0);
  const [open, setOpen] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [openReserve, setOpenReserve] = useState(location.state?.openReserve || false);
  const reservationData = location.state?.reservationData;
  const selectedDates = location.state?.selectedDates;
  const selectedNights = location.state?.nights || 1;
  const selectedTotalPrice = location.state?.totalPrice;

  const { data, loading, error } = useFetch(`/api/hotels/find/${id}`);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const { dates, options, dispatch } = useContext(SearchContext);

  // Update SearchContext with dates from location state if available
  useEffect(() => {
    if (location.state?.dates) {
      dispatch({
        type: "NEW_SEARCH",
        payload: {
          dates: location.state.dates,
          options: location.state.options
        }
      });
    }
  }, [location.state, dispatch]);

  const MILLISECONDS_PER_DAY = 1000 * 60 * 60 * 24;
  function dayDifference(date1, date2) {
    const timeDiff = Math.abs(date2.getTime() - date1.getTime());
    const diffDays = Math.ceil(timeDiff / MILLISECONDS_PER_DAY);
    return diffDays;
  }
  
  // Use selected dates from location state if available, otherwise fallback to SearchContext dates
  const days = selectedNights || (dates && dates[0]?.endDate && dates[0]?.startDate 
    ? dayDifference(dates[0].endDate, dates[0].startDate)
    : 1);

  const handleOpen = (i) => {
    setSlideNumber(i); 
    setOpen(true);
  };

  const handleMove = (direction) => {
    let newSlideNumber;

    if (direction === "l") {
      newSlideNumber = slideNumber === 0 ? 5 : slideNumber - 1;
    } else {
      newSlideNumber = slideNumber === 5 ? 0 : slideNumber + 1;
    }

    setSlideNumber(newSlideNumber);
  };

  const handleClick = () => {
    if (!user) {
      navigate("/login");
      return;
    }

    // Check if dates are available either in SearchContext or location state
    const hasValidDates = (dates && dates[0]?.startDate && dates[0]?.endDate) || 
                         (location.state?.dates && location.state.dates[0]?.startDate && location.state.dates[0]?.endDate);

    if (!hasValidDates) {
      alert("Please select check-in and check-out dates before booking.");
      navigate("/"); // Navigate back to home to select dates
      return;
    }

    setOpenModal(true);
  };

  useEffect(() => {
    // If returning from profile with reservation data, open the reserve modal
    if (location.state?.openReserve && location.state?.reservationData) {
      setOpenReserve(true);
    }
  }, [location.state]);

  return (
    <div>
      <Navbar />
      <Header type="list" />
      {loading ? (
        "loading"
      ) : error ? (
        "Error loading hotel details"
      ) : (
        <div className="hotelContainer">
          {open && (
            <div className="slider">
              <FontAwesomeIcon
                icon={faCircleXmark}
                className="close"
                onClick={() => setOpen(false)}
              />
              <FontAwesomeIcon
                icon={faCircleArrowLeft}
                className="arrow"
                onClick={() => handleMove("l")}
              />
              <div className="sliderWrapper">
                <img
                  src={data.photos[slideNumber]}
                  alt=""
                  className="sliderImg"
                />
              </div>
              <FontAwesomeIcon
                icon={faCircleArrowRight}
                className="arrow"
                onClick={() => handleMove("r")}
              />
            </div>
          )}
          <div className="hotelWrapper">
            <h1 className="hotelTitle">{data.name}</h1>
            <div className="hotelAddress">
              <FontAwesomeIcon icon={faLocationDot} />
              <span>{data.address}</span>
            </div>
            <span className="hotelDistance">
              Excellent location – {data.distance}m from center
            </span>
            <span className="hotelPriceHighlight">
              Book a stay over ${data.cheapestPrice} at this property and get a free airport taxi
            </span>
            <div className="hotelImages">
              {data.photos?.map((photo, i) => (
                <div className="hotelImgWrapper" key={i}>
                  <img
                    onClick={() => handleOpen(i)}
                    src={photo}
                    alt=""
                    className="hotelImg"
                  />
                </div>
              ))}
            </div>
            <div className="hotelDetails">
              <div className="hotelDetailsTexts">
                <h1 className="hotelTitle">{data.title}</h1>
                <p className="hotelDesc">{data.desc}</p>
              </div>
              <div className="hotelDetailsPrice">
                <h1>Perfect for a {days}-night stay!</h1>
                <span>
                  Located in the real heart of {data.city}, this property has an
                  excellent location score of 9.8!
                </span>
                <h2>
                  {formatPriceWithConversion(days * data.cheapestPrice)} ({days} nights)
                </h2>
                <button onClick={handleClick}>Reserve or Book Now!</button>
              </div>
            </div>
          </div>
          <MailList />
          <Footer />
        </div>
      )}
      {openModal && <Reserve setOpen={setOpenModal} hotelId={id} />}
      {openReserve && (
        <Reserve
          setOpen={setOpenReserve}
          hotelId={id}
          initialData={reservationData}
        />
      )}
    </div>
  );
};

export default Hotel;