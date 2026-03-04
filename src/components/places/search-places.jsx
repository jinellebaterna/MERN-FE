import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { searchPlaces } from "../../api/places";
import { Link } from "react-router-dom";
import { Search } from "lucide-react";

const SearchPlaces = () => {
  const [searchTerm, setSearchTerm] = useState("");

  const { data, isLoading, isError } = useQuery({
    queryKey: ["places", "search", searchTerm],
    queryFn: () => searchPlaces({ search: searchTerm }),
    enabled: searchTerm.length > 1,
  });

  const showDropdown = searchTerm.length > 1;

  return (
    <div className="search-places">
      <div className="search-places__input-wrapper">
        <Search size={16} className="search-places__icon" />
        <input
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search places..."
        />
      </div>
      {showDropdown && (
        <div className="search-places__dropdown">
          {isLoading && <p className="search-places__message">Loading...</p>}
          {isError && (
            <p className="search-places__message">Something went wrong.</p>
          )}
          {data?.places.length === 0 && (
            <p className="search-places__message">No places found.</p>
          )}
          {data?.places.map((place) => (
            <Link
              key={place.id}
              to={`/places/view/${place.id}`}
              className="search-places__result"
              onClick={() => setSearchTerm("")}
            >
              {place.title} — {place.address}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchPlaces;
