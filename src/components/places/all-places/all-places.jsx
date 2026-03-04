import { useQuery } from "@tanstack/react-query";
import { searchPlaces } from "../../../api/places";
import PlaceCard from "../place-card/place-card";
import "./all-places.css";

const AllPlaces = () => {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["places", "all"],
    queryFn: () => searchPlaces(),
  });

  if (isLoading) return <p>Loading...</p>;
  if (isError) return <p>Something went wrong.</p>;

  return (
    <ul className="all-places-list">
      {data?.places.map((place) => (
        <PlaceCard
          key={place.id}
          id={place.id}
          title={place.title}
          address={place.address}
          image={place.image}
        />
      ))}
    </ul>
  );
};

export default AllPlaces;
