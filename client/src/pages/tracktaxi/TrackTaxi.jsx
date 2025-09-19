import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import io from "socket.io-client";
import { Map, Marker, Source, Layer } from "react-map-gl/maplibre";
import "maplibre-gl/dist/maplibre-gl.css";
import maplibregl from "maplibre-gl";
import * as turf from "@turf/turf";

const SOCKET_SERVER_URL = import.meta.env.VITE_API_URL || "http://localhost:7000";
const MAP_STYLE = "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json";

export default function TrackTaxi({ driverId = "driver123" }) {
  const navigate = useNavigate();
  const [driverLocation, setDriverLocation] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [routeGeoJSON, setRouteGeoJSON] = useState(null);
  const [eta, setEta] = useState(null);
  const [distance, setDistance] = useState(null);
  const [viewState, setViewState] = useState({
    longitude: 67.0011, // Default to Karachi
    latitude: 24.8607,
    zoom: 14
  });
  const socketRef = useRef(null);
  const lastFetchRef = useRef(0);
  const fetchTimeoutRef = useRef(null);

  // Watch user location in real-time
  useEffect(() => {
    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const coords = { lat: latitude, lng: longitude };
        setUserLocation(coords);
        
        // Update map view to user's location when first detected
        if (!userLocation) {
          setViewState({
            longitude: longitude,
            latitude: latitude,
            zoom: 14
          });
        }
      },
      (err) => {
        console.error("Geolocation error:", err);
      },
      {
        enableHighAccuracy: true,
        maximumAge: 10000,
        timeout: 5000,
      }
    );

    return () => {
      navigator.geolocation.clearWatch(watchId);
      if (fetchTimeoutRef.current) {
        clearTimeout(fetchTimeoutRef.current);
      }
    };
  }, [userLocation]);

  const fetchRoute = async (from, to) => {
    try {
      // Calculate stats immediately to maintain responsive UI
      calculateStats(from, to);

      // Rate limiting: Only fetch route every 2 seconds
      const now = Date.now();
      if (now - lastFetchRef.current < 2000) {
        return;
      }
      lastFetchRef.current = now;

      const url = `https://router.project-osrm.org/route/v1/driving/${from.lng},${from.lat};${to.lng},${to.lat}?geometries=geojson`;
      const res = await fetch(url);
      
      if (res.status === 429) {
        // Too many requests - keep existing route
        console.log("Rate limited by routing service, keeping existing route");
        return;
      }

      if (!res.ok) {
        throw new Error('Route fetch failed');
      }

      const data = await res.json();

      if (data.routes?.length) {
        setRouteGeoJSON({
          type: "Feature",
          geometry: data.routes[0].geometry,
        });
      }
    } catch (err) {
      console.error("Error fetching route:", err);
      // Keep existing route on error
    }
  };

  const calculateStats = (from, to) => {
    try {
      const fromPoint = turf.point([from.lng, from.lat]);
      const toPoint = turf.point([to.lng, to.lat]);
      const options = { units: "kilometers" };
      const dist = turf.distance(fromPoint, toPoint, options);
      setDistance(dist.toFixed(2));

      const averageSpeedKmph = 40;
      const etaMinutes = (dist / averageSpeedKmph) * 60;
      setEta(Math.round(etaMinutes));
    } catch (err) {
      console.error("Error calculating stats:", err);
    }
  };

  // Listen for driver updates and calculate based on live user position
  useEffect(() => {
    socketRef.current = io(SOCKET_SERVER_URL);
    socketRef.current.on(`location-${driverId}`, (coords) => {
      setDriverLocation(coords);
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [driverId]);

  // Update route when either driver or user moves
  useEffect(() => {
    if (driverLocation && userLocation) {
      // Always calculate stats immediately
      calculateStats(driverLocation, userLocation);

      // Debounce route updates
      if (fetchTimeoutRef.current) {
        clearTimeout(fetchTimeoutRef.current);
      }
      fetchTimeoutRef.current = setTimeout(() => {
        fetchRoute(driverLocation, userLocation);
      }, 500);
    }
  }, [driverLocation, userLocation]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (fetchTimeoutRef.current) {
        clearTimeout(fetchTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div style={{ height: "100vh", width: "100%", position: "relative" }}>
      {/* Back Button */}
      <button
        onClick={() => {
          // Clean up before navigating
          if (socketRef.current) {
            socketRef.current.disconnect();
          }
          if (fetchTimeoutRef.current) {
            clearTimeout(fetchTimeoutRef.current);
          }
          navigate("/taxi/reserve");
        }}
        style={{
          position: "absolute",
          top: 20,
          left: 20,
          zIndex: 1,
          padding: "10px 20px",
          backgroundColor: "#fff",
          border: "1px solid #ccc",
          borderRadius: "4px",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          gap: "5px",
          boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
        }}
      >
        <span style={{ fontSize: "18px" }}>←</span>
        Back to Reservations
      </button>

      {/* ETA and Distance Box */}
      {eta && distance && (
        <div
          style={{
            position: "absolute",
            top: 20,
            right: 20,
            background: "white",
            padding: "10px 15px",
            borderRadius: "8px",
            boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
            zIndex: 1,
          }}
        >
          <div><strong>ETA:</strong> {eta} min</div>
          <div><strong>Distance:</strong> {distance} km</div>
        </div>
      )}

      <Map
        mapLib={maplibregl}
        mapboxAccessToken="fake"
        {...viewState}
        onMove={evt => setViewState(evt.viewState)}
        style={{ width: "100%", height: "100%" }}
        mapStyle={MAP_STYLE}
      >
        {/* Driver Marker */}
        {driverLocation && (
          <Marker longitude={driverLocation.lng} latitude={driverLocation.lat}>
            <div
              style={{
                backgroundColor: "red",
                borderRadius: "50%",
                width: "20px",
                height: "20px",
                border: "2px solid white",
              }}
              title="Driver location"
            />
          </Marker>
        )}

        {/* User Marker */}
        {userLocation && (
          <Marker longitude={userLocation.lng} latitude={userLocation.lat}>
            <div
              style={{
                backgroundColor: "blue",
                borderRadius: "50%",
                width: "20px",
                height: "20px",
                border: "2px solid white",
              }}
              title="Your location"
            />
          </Marker>
        )}

        {/* Route Line */}
        {routeGeoJSON && (
          <Source id="route" type="geojson" data={routeGeoJSON}>
            <Layer
              id="route-line"
              type="line"
              paint={{
                "line-color": "#007AFF",
                "line-width": 4,
              }}
            />
          </Source>
        )}
      </Map>
    </div>
  );
}
