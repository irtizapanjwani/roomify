import { useState, useEffect } from 'react';
import { DateRange } from 'react-date-range';
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';
import { formatPriceWithConversion } from '../../utils/currencyConverter';
import './dateSelectionModal.css';

const DateSelectionModal = ({ hotel, onClose, onDateSelect, maxNights }) => {
  const [dateRange, setDateRange] = useState([
    {
      startDate: new Date(),
      endDate: new Date(),
      key: 'selection'
    }
  ]);

  const [totalNights, setTotalNights] = useState(1);
  const [totalPrice, setTotalPrice] = useState(hotel.cheapestPrice);

  useEffect(() => {
    const nights = Math.ceil(
      (dateRange[0].endDate - dateRange[0].startDate) / (1000 * 60 * 60 * 24)
    );
    setTotalNights(nights);
    setTotalPrice(nights * hotel.cheapestPrice);
  }, [dateRange, hotel.cheapestPrice]);

  const handleSelect = (ranges) => {
    const nights = Math.ceil(
      (ranges.selection.endDate - ranges.selection.startDate) / (1000 * 60 * 60 * 24)
    );
    
    // If selected range exceeds maxNights, adjust the endDate
    if (nights > maxNights) {
      const adjustedEndDate = new Date(ranges.selection.startDate);
      adjustedEndDate.setDate(adjustedEndDate.getDate() + maxNights);
      
      setDateRange([{
        startDate: ranges.selection.startDate,
        endDate: adjustedEndDate,
        key: 'selection'
      }]);
    } else {
      setDateRange([ranges.selection]);
    }
  };

  const handleSubmit = () => {
    onDateSelect({
      startDate: dateRange[0].startDate,
      endDate: dateRange[0].endDate,
      hotel
    });
  };

  // Calculate the maximum selectable date
  const maxSelectableDate = new Date();
  maxSelectableDate.setDate(maxSelectableDate.getDate() + maxNights);

  return (
    <div className="dateSelectionOverlay">
      <div className="dateSelectionModal">
        <div className="modalHeader">
          <h2>Select Your Stay Dates</h2>
          <button className="closeButton" onClick={onClose}>&times;</button>
        </div>
        
        <div className="hotelPreview">
          <img src={hotel.photos[0] || "https://via.placeholder.com/200x150"} alt={hotel.name} />
          <div className="hotelInfo">
            <h3>{hotel.name}</h3>
            <p className="location">{hotel.city}</p>
            <div className="rating">
              Rating: {hotel.rating ? `${hotel.rating.toFixed(1)} / 5` : 'New'}
            </div>
          </div>
        </div>

        <div className="availabilityInfo">
          <p>This hotel can be booked for up to {maxNights} {maxNights === 1 ? 'night' : 'nights'}</p>
        </div>

        <div className="datePickerContainer">
          <DateRange
            editableDateInputs={true}
            onChange={handleSelect}
            moveRangeOnFirstSelection={false}
            ranges={dateRange}
            minDate={new Date()}
            maxDate={maxSelectableDate}
            months={2}
            direction="horizontal"
            className="datePicker"
          />
        </div>

        <div className="stayDetails">
          <div className="stayLength">
            {totalNights} {totalNights === 1 ? 'night' : 'nights'}
          </div>
          <div className="stayPrice">
            <span className="priceLabel">Total Price:</span>
            <span className="priceAmount">{formatPriceWithConversion(totalPrice)}</span>
            <span className="priceBreakdown">
              ({formatPriceWithConversion(hotel.cheapestPrice)}/night)
            </span>
          </div>
        </div>

        <div className="modalActions">
          <button className="cancelButton" onClick={onClose}>Cancel</button>
          <button className="confirmButton" onClick={handleSubmit}>
            View Available Rooms
          </button>
        </div>
      </div>
    </div>
  );
};

export default DateSelectionModal; 