import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { fetchPlaceById } from "../../../api/places";
import Card from "../../shared/components/card/card";
import "./place-detail.css";

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
    <div className="place-details">
      <Card>
        <div className="place-details-container">
          <img src={`http://localhost:5001/${place.image}`} alt={place.title} />
          <div className="place-details-info ">
            <h1>{place.title}</h1>
            <p>Address: {place.address}</p>
            <p>{place.description}</p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default PlaceDetail;
