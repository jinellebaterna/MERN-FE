import { useContext, useMemo, useEffect, useRef } from "react";
import { MapContainer, useMap } from "react-leaflet";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

import { AuthContext } from "../../shared/context/auth-context";
import { fetchUserCountries } from "../../../api/user";
import { fetchWorldGeoJSON } from "../../../api/countries";
import LoadingSpinner from "../../shared/components/loadingSpinner/loadingSpinner";
import "./ScratchMap.css";

const VISITED_COLOR = "#7d5ba6";
const DEFAULT_COLOR = "#d1d5db";

const CountryLayer = ({ geoJSON, visitedCodes }) => {
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
        return {
          fillColor: visited ? VISITED_COLOR : DEFAULT_COLOR,
          fillOpacity: visited ? 0.75 : 0.4,
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
  }, [geoJSON, visitedCodes, map]);

  return null;
};

const ScratchMap = () => {
  const auth = useContext(AuthContext);
  const [searchParams] = useSearchParams();
  const viewedUserId = searchParams.get("user") || auth.userId;

  const { data: countries = [], isLoading: countriesLoading } = useQuery({
    queryKey: ["countries", viewedUserId],
    queryFn: () => fetchUserCountries(viewedUserId),
    enabled: !!viewedUserId,
  });

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
    <div className="scratch-map">
      {isLoading && (
        <div className="scratch-map__loading">
          <LoadingSpinner asOverlay />
        </div>
      )}

      <div className="scratch-map__badge">
        {visitedCodes.size} {visitedCodes.size === 1 ? "country" : "countries"}{" "}
        visited
      </div>

      <MapContainer
        center={[20, 0]}
        zoom={2}
        minZoom={1}
        maxZoom={6}
        style={{ height: "100%", width: "100%", background: "#a8c8e8" }}
        zoomControl={true}
        scrollWheelZoom={true}
      >
        {geoJSON && (
          <CountryLayer geoJSON={geoJSON} visitedCodes={visitedCodes} />
        )}
      </MapContainer>
    </div>
  );
};

export default ScratchMap;
