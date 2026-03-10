import { useContext, useMemo, useEffect, useRef } from "react";
import { MapContainer, useMap } from "react-leaflet";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams, useNavigate } from "react-router-dom";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

import { AuthContext } from "../context/auth-context";
import {
  fetchUserCountries,
  fetchUserById,
  fetchUserWishlist,
} from "../../api/user";
import { fetchWorldGeoJSON } from "../../api/countries";
import LoadingSpinner from "../shared/loadingSpinner/loadingSpinner";
import "./scratch-map.css";

const VISITED_COLOR = "var(--secondary-color)";
const DEFAULT_COLOR = "#d1d5db";
const WISHLIST_COLOR = "var(--accent-color)";

const CountryLayer = ({ geoJSON, visitedCodes, wishlistCodes }) => {
  const map = useMap();
  const layerRef = useRef(null);

  useEffect(() => {
    if (layerRef.current) {
      map.removeLayer(layerRef.current);
    }

    layerRef.current = L.geoJSON(geoJSON, {
      style: (feature) => {
        const code = feature.properties["ISO3166-1-Alpha-2"];
        const visited = visitedCodes.has(code);
        const wishlisted = wishlistCodes.has(code);
        return {
          fillColor: visited
            ? VISITED_COLOR
            : wishlisted
              ? WISHLIST_COLOR
              : DEFAULT_COLOR,
          fillOpacity: visited ? 0.75 : wishlisted ? 0.6 : 0.4,
          color: "#fff",
          weight: 0.5,
        };
      },
    }).addTo(map);

    return () => {
      if (layerRef.current) {
        map.removeLayer(layerRef.current);
        layerRef.current = null;
      }
    };
  }, [geoJSON, visitedCodes, wishlistCodes, map]);

  return null;
};

const ScratchMap = () => {
  const auth = useContext(AuthContext);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const viewedUserId = searchParams.get("user") || auth.userId;

  const isOwnMap = viewedUserId === auth.userId;

  const { data: viewedUser } = useQuery({
    queryKey: ["user", viewedUserId],
    queryFn: () => fetchUserById(viewedUserId),
    enabled: !!viewedUserId && !isOwnMap,
  });

  const { data: countries = [], isLoading: countriesLoading } = useQuery({
    queryKey: ["countries", viewedUserId],
    queryFn: () => fetchUserCountries(viewedUserId),
    enabled: !!viewedUserId,
  });

  const { data: wishlist = [] } = useQuery({
    queryKey: ["wishlist", viewedUserId],
    queryFn: () => fetchUserWishlist(viewedUserId),
    enabled: !!viewedUserId && isOwnMap,
  });

  const wishlistCodes = useMemo(
    () => new Set(wishlist.map((c) => c.code)),
    [wishlist]
  );

  const { data: geoJSON, isLoading: geoLoading } = useQuery({
    queryKey: ["worldGeoJSON"],
    queryFn: fetchWorldGeoJSON,
    staleTime: Infinity,
  });

  const visitedCodes = useMemo(
    () => new Set(countries.map((c) => c.code)),
    [countries]
  );

  const isLoading = countriesLoading || geoLoading;

  return (
    <div className={`scratch-map${!isOwnMap ? " scratch-map--other" : ""}`}>
      {!isOwnMap && viewedUser && (
        <div className="scratch-map__title">
          {viewedUser.name}'s Map
          <button
            className="scratch-map__countries-btn"
            onClick={() => navigate(`/countries?user=${viewedUserId}`)}
          >
            View Countries
          </button>
        </div>
      )}
      {isLoading && (
        <div className="scratch-map__loading">
          <LoadingSpinner asOverlay />
        </div>
      )}

      {visitedCodes.size === 0 && isOwnMap && !isLoading && (
        <div className="scratch-map__empty">
          <span className="scratch-map__empty-icon">🗺️ </span>
          <h3>Your map is empty!</h3>
          <p>Start adding countries you've visited.</p>
          <button
            className="scratch-map__empty-btn"
            onClick={() => navigate("/countries")}
          >
            Add Countries
          </button>
        </div>
      )}
      <div
        className={`scratch-map__badge${isOwnMap ? " scratch-map__badge--clickable" : ""}`}
        onClick={isOwnMap ? () => navigate("/countries") : undefined}
      >
        {visitedCodes.size} {visitedCodes.size === 1 ? "country" : "countries"}{" "}
        visited
      </div>

      <MapContainer
        center={[20, 0]}
        zoom={2}
        minZoom={1}
        maxZoom={6}
        style={{
          height: "100%",
          width: "100%",
          background: "var(--background-color)",
        }}
        zoomControl={false}
        scrollWheelZoom={true}
      >
        {geoJSON && (
          <CountryLayer
            geoJSON={geoJSON}
            visitedCodes={visitedCodes}
            wishlistCodes={wishlistCodes}
          />
        )}
      </MapContainer>

      {isOwnMap && (
        <div className="scratch-map__legend">
          <span className="scratch-map__legend-item scratch-map__legend-item--visited">
            Visited
          </span>
          <span className="scratch-map__legend-item scratch-map__legend-item--wishlist">
            Wishlist
          </span>
        </div>
      )}
    </div>
  );
};

export default ScratchMap;
