import "./featuredProperties.css";
import useFetch from "../../hooks/useFetch";
import { Link } from "react-router-dom";

const FeaturedProperties = () => {
  const { data, loading, error } = useFetch("/api/hotels?limit=4&featured=true");

  return (
    <div className="fp">
      {loading ? (
        "Loading..."
      ) : error ? (
        "Error loading featured hotels"
      ) : (
        <>
          {data && data.map((item) => (
            <Link to={`/hotels/${item._id}`} className="fpItem" key={item._id}>
              <img
                src={item.photos?.[0] || "https://cf.bstatic.com/static/img/theme-index/carousel_320x240/card-image-chalet_300/8ee014fcc493cb3334e25893a1dee8c6d36ed0ba.jpg"}
                alt={item.name}
                className="fpImg"
              />
              <span className="fpName">{item.name}</span>
              <span className="fpCity">{item.city}</span>
              <span className="fpPrice">Starting from ${item.cheapestPrice}</span>
              {item.rating && (
                <div className="fpRating">
                  <button>{item.rating}</button>
                  <span>{item.rating >= 4.5 ? "Excellent" : item.rating >= 4 ? "Very Good" : "Good"}</span>
                </div>
              )}
            </Link>
          ))}
          {(!data || data.length === 0) && (
            <div className="noFeaturedHotels">
              <p>No featured hotels available at the moment.</p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default FeaturedProperties;
