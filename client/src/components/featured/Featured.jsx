import { useState, useEffect } from "react";
import useFetch from "../../hooks/useFetch";
import "./featured.css";

const Featured = () => {
  const [topCities, setTopCities] = useState([]);
  const { data: allHotels, loading } = useFetch("/api/hotels");

  useEffect(() => {
    if (allHotels) {
      // Get unique cities and count their hotels
      const cityCounts = allHotels.reduce((acc, hotel) => {
        acc[hotel.city] = (acc[hotel.city] || 0) + 1;
        return acc;
      }, {});

      // Convert to array and sort by count
      const sortedCities = Object.entries(cityCounts)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 3)
        .map(([city, count]) => ({ city, count }));

      setTopCities(sortedCities);
    }
  }, [allHotels]);

  return (
    <div className="featured">
      {loading ? ("Loading please wait") : (
        <>
          {topCities.map((cityData, index) => (
            <div className="featuredItem" key={cityData.city}>
              <img
                src={index === 0 ? 
                  "https://cf.bstatic.com/xdata/images/city/max500/957801.webp?k=a969e39bcd40cdcc21786ba92826063e3cb09bf307bcfeac2aa392b838e9b7a5&o=" :
                  index === 1 ?
                  "https://cf.bstatic.com/xdata/images/city/max500/690334.webp?k=b99df435f06a15a1568ddd5f55d239507c0156985577681ab91274f917af6dbb&o=" :
                  "https://cf.bstatic.com/xdata/images/city/max500/689422.webp?k=2595c93e7e067b9ba95f90713f80ba6e5fa88a66e6e55600bd27a5128808fdf2&o="
                }
                alt={cityData.city}
                className="featuredImg"
              />
              <div className="featuredTitles">
                <h1>{cityData.city}</h1>
                <h2>{cityData.count} {cityData.count === 1 ? 'Hotel' : 'Hotels'}</h2>
              </div>
            </div>
          ))}
        </>
      )}
    </div>
  );
};

export default Featured;
