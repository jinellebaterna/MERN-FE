import { useState, useContext } from "react";
import { useQuery } from "@tanstack/react-query";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { Link } from "react-router-dom";
import L from "leaflet";
import { AuthContext } from "../shared/context/auth-context";
import { searchPlaces } from "../../api/places";
import { geocodeAddress } from "../../api/weather";
import { IMG_BASE } from "../../data/data";
import "leaflet/dist/leaflet.css";
import "./map-view.css";

// Fix default marker icon paths broken by webpack
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const makeIcon = (color) =>
  new L.Icon({
    iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${color}.png`,
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  });

const greenIcon = makeIcon("green");
const violetIcon = makeIcon("violet");
const greyIcon = makeIcon("grey");

const GeocodedMarker = ({ place, userId }) => {
  const isVisited = userId && place.visitedBy?.includes(userId);
  const isWantToVisit = userId && place.wantToVisitBy?.includes(userId);

  const { data: coords } = useQuery({
    queryKey: ["geocode", place.address],
    queryFn: () => geocodeAddress(place.address),
    staleTime: Infinity,
    retry: false,
  });

  if (!coords) return null;

  const icon = isVisited ? greenIcon : isWantToVisit ? violetIcon : greyIcon;

  return (
    <Marker position={[coords.lat, coords.lon]} icon={icon}>
      <Popup>
        <div className="map-popup-container">
          {place.images?.[0] && (
            <img
              className="map-popup-img"
              src={`${IMG_BASE}/${place.images[0]}`}
              alt={place.title}
            />
          )}
          <p className="map-popup-title">{place.title}</p>
          <Link className="map-popup-link" to={`/places/view/${place.id}`}>
            View
          </Link>
        </div>
      </Popup>
    </Marker>
  );
};

const MapView = () => {
  const auth = useContext(AuthContext);
  const [filter, setFilter] = useState("all");

  const { data, isLoading, isError } = useQuery({
    queryKey: ["places", "map"],
    queryFn: () => searchPlaces({ limit: 100 }),
  });

  const places = data?.places ?? [];

  const visiblePlaces =
    filter === "all"
      ? places
      : places.filter((place) =>
          filter === "visited"
            ? place.visitedBy?.includes(auth.userId)
            : place.wantToVisitBy?.includes(auth.userId)
        );

  return (
    <div className="map-page">
      {auth.isLoggedIn && (
        <div className="map-filter-panel">
          {["all", "visited", "want"].map((f) => (
            <button
              key={f}
              className={`filter-chip ${filter === f ? "filter-chip--active" : ""}`}
              onClick={() => setFilter(f)}
            >
              {f === "all"
                ? "All"
                : f === "visited"
                  ? "✓ Visited"
                  : "♡ Want to Visit"}
            </button>
          ))}
        </div>
      )}
      {isError && <p style={{ padding: "1rem" }}>Failed to load places.</p>}
      {isLoading ? (
        <p style={{ padding: "1rem" }}>Loading map...</p>
      ) : (
        <MapContainer
          center={[20, 0]}
          zoom={2}
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {visiblePlaces.map((place) => (
            <GeocodedMarker
              key={place.id}
              place={place}
              userId={auth.userId}
            />
          ))}
        </MapContainer>
      )}
    </div>
  );
};

export default MapView;
