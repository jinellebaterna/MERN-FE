import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { searchPlaces } from "../../api/places";

const AllPlaces = () => {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["places", "all"],
    queryFn: () => searchPlaces(),
  });

  if (isLoading) return <p>Loading...</p>;
  if (isError) return <p>Something went wrong.</p>;

  return (
    <ul>
      {data?.places.map((place) => (
        <li key={place.id}>
          <Link to={`/places/view/${place.id}`}>
            {place.title} — {place.address}
          </Link>
        </li>
      ))}
    </ul>
  );
};

export default AllPlaces;
