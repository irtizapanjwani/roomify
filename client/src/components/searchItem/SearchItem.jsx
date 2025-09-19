import "./searchItem.css";
import { Link } from "react-router-dom";
import { formatPriceWithConversion } from "../../utils/currencyConverter";

const SearchItem = ({ item, dates, nights, options }) => {
  // Calculate total price based on nights
  const totalPrice = nights * item.cheapestPrice;

  return (
    <div className="searchItem">
      <img
        src={item.photos[0] ? item.photos[0] : "https://cf.bstatic.com/static/img/theme-index/carousel_320x240/card-image-villas_300/dd0d7f8202676306a661aa4f0cf1ffab31286211.jpg"}
        alt=""
        className="siImg"
      />
      <div className="siDesc">
        <h1 className="siTitle">{item.name}</h1>
        <span className="siDistance">{item.distance}m from center</span>
        <span className="siTaxiOp">Free airport taxi</span>
        <span className="siSubtitle">
          Studio Apartment with Air conditioning
        </span>
        <span className="siFeatures">{item.desc}</span>
        <span className="siCancelOp">Free cancellation </span>
        <span className="siCancelOpSubtitle">
          You can cancel later, so lock in this great price today!
        </span>
      </div>
      <div className="siDetails">
        {item.rating && <div className="siRating">
          <span>Excellent</span>
          <button>{item.rating}</button>
        </div>}
        <div className="siDetailTexts">
          <span className="siPrice">
            {formatPriceWithConversion(item.cheapestPrice)}
            <small> per night</small>
          </span>
          {nights > 1 && (
            <span className="siTotalPrice">
              {formatPriceWithConversion(totalPrice)} total for {nights} nights
            </span>
          )}
          <span className="siTaxOp">Includes taxes and fees</span>
          <Link 
            to={`/hotels/${item._id}`}
            state={{
              dates: dates,
              nights: nights,
              totalPrice: totalPrice,
              selectedDates: {
                startDate: dates[0].startDate,
                endDate: dates[0].endDate
              },
              options: options
            }}
          >
            <button className="siCheckButton">See availability</button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SearchItem;
