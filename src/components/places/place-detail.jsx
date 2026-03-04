import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { fetchPlaceById } from "../../api/places";

const PlaceDetail = () => {
  const { placeId } = useParams();

  const {
    data: place,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["place", placeId],
    queryFn: () => fetchPlaceById(placeId),
  });

  if (isLoading) return <p>Loading...</p>;
  if (isError || !place) return <p>Could not find this place.</p>;

  return (
    <div>
      <img src={`http://localhost:5001/${place.image}`} alt={place.title} />
      <h2>{place.title}</h2>
      <p>{place.address}</p>
      <p>{place.description}</p>
    </div>
  );
};

export default PlaceDetail;
