import "./list.css";
import Navbar from "../../components/navbar/Navbar";
import Header from "../../components/header/Header";
import { useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { format } from "date-fns";
import { DateRange } from "react-date-range";
import SearchItem from "../../components/searchItem/SearchItem";
import useFetch from "../../hooks/useFetch";

const List = () => {
  const location = useLocation();
  const [destination, setDestination] = useState(location.state?.destination || "");
  const [dates, setDates] = useState(location.state?.dates || [{
    startDate: new Date(),
    endDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
    key: "selection"
  }]);
  const [openDate, setOpenDate] = useState(false);
  const [options, setOptions] = useState(location.state?.options || {
    adult: 1,
    children: 0,
    room: 1,
  });
  const [min, setMin] = useState(undefined);
  const [max, setMax] = useState(undefined);
  const [sortedData, setSortedData] = useState([]);

  // Calculate nights
  const nights = dates[0].endDate && dates[0].startDate ? 
    Math.ceil((dates[0].endDate - dates[0].startDate) / (1000 * 60 * 60 * 24)) : 1;

  const { data, loading, error, reFetch } = useFetch(
    `/api/hotels${destination ? `?city=${destination}&min=${min || 0}&max=${max || 999}` : ""}`
  );

  useEffect(() => {
    if (data) {
      // Sort hotels by rating (highest to lowest)
      const sorted = [...data].sort((a, b) => {
        // If no rating, put at the end
        if (!a.rating) return 1;
        if (!b.rating) return -1;
        return b.rating - a.rating;
      });
      setSortedData(sorted);
    }
  }, [data]);

  const handleClick = () => {
    reFetch();
  };

  return (
    <div>
      <Navbar />
      <Header type="list" />
      <div className="listContainer">
        <div className="listWrapper">
          <div className="listSearch">
            <h1 className="lsTitle">Search</h1>
            <div className="lsItem">
              <label>Destination</label>
              <input 
                placeholder={destination || "Where are you going?"} 
                type="text" 
                value={destination}
                onChange={(e) => setDestination(e.target.value)} 
              />
            </div>
            <div className="lsItem">
              <label>Check-in Date</label>
              <span onClick={() => setOpenDate(!openDate)}>{`${format(
                dates[0].startDate,
                "MM/dd/yyyy"
              )} to ${format(dates[0].endDate, "MM/dd/yyyy")}`}</span>
              {openDate && (
                <DateRange
                  onChange={(item) => setDates([item.selection])}
                  minDate={new Date()}
                  ranges={dates}
                />
              )}
            </div>
            <div className="lsItem">
              <label>Options</label>
              <div className="lsOptions">
                <div className="lsOptionItem">
                  <span className="lsOptionText">
                    Min price <small>per night</small>
                  </span>
                  <input
                    type="number"
                    onChange={(e) => setMin(e.target.value)}
                    className="lsOptionInput"
                  />
                </div>
                <div className="lsOptionItem">
                  <span className="lsOptionText">
                    Max price <small>per night</small>
                  </span>
                  <input
                    type="number"
                    onChange={(e) => setMax(e.target.value)}
                    className="lsOptionInput"
                  />
                </div>
                <div className="lsOptionItem">
                  <span className="lsOptionText">Adult</span>
                  <input
                    type="number"
                    min={1}
                    className="lsOptionInput"
                    placeholder={options.adult}
                  />
                </div>
                <div className="lsOptionItem">
                  <span className="lsOptionText">Children</span>
                  <input
                    type="number"
                    min={0}
                    className="lsOptionInput"
                    placeholder={options.children}
                  />
                </div>
                <div className="lsOptionItem">
                  <span className="lsOptionText">Room</span>
                  <input
                    type="number"
                    min={1}
                    className="lsOptionInput"
                    placeholder={options.room}
                  />
                </div>
              </div>
            </div>
            <button onClick={handleClick}>Search</button>
          </div>
          <div className="listResult">
            {loading ? (
              <div className="loadingState">
                <div className="loadingSpinner"></div>
                <p>Finding the best hotels for you...</p>
              </div>
            ) : error ? (
              <div className="errorState">
                <p>Sorry, we couldn't load the hotels. Please try again.</p>
              </div>
            ) : sortedData.length === 0 ? (
              <div className="noResults">
                <p>No hotels found. Try adjusting your search criteria.</p>
              </div>
            ) : (
              <>
                <div className="resultsSummary">
                  <h2>
                    {destination 
                      ? `Hotels in ${destination}` 
                      : "All Hotels"} 
                    <span className="resultCount">({sortedData.length} properties found)</span>
                  </h2>
                </div>
                {sortedData.map((item) => (
                  <SearchItem 
                    key={item._id} 
                    item={item} 
                    dates={dates}
                    nights={nights}
                    options={options}
                  />
                ))}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default List;
