let cachedGeoJSON = null;

export const fetchWorldGeoJSON = async () => {
  if (cachedGeoJSON) return cachedGeoJSON;
  const response = await fetch(
    "https://raw.githubusercontent.com/datasets/geo-countries/master/data/countries.geojson",
  );
  if (!response.ok) throw new Error("Failed to load world map data");
  cachedGeoJSON = await response.json();
  return cachedGeoJSON;
};
