import { useContext } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AuthContext } from "../../shared/context/auth-context";
import { likePlace, unlikePlace, fetchPlaceById } from "../../../api/places";
import { useParams } from "react-router-dom";
import { Heart } from "lucide-react";
import Card from "../../shared/components/card/card";
import "./place-detail.css";

const PlaceDetail = () => {
  const { placeId } = useParams();
  const auth = useContext(AuthContext);
  const queryClient = useQueryClient();

  const {
    data: place,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["place", placeId],
    queryFn: () => fetchPlaceById(placeId),
  });

  const isLiked = place?.likes?.includes(auth.userId);

  const likeMutation = useMutation({
    mutationFn: isLiked ? unlikePlace : likePlace,
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ["place", placeId] });
      const previous = queryClient.getQueryData(["place", placeId]);
      queryClient.setQueryData(["place", placeId], (old) => ({
        ...old,
        likes: isLiked
          ? old.likes.filter((id) => id !== auth.userId)
          : [...(old.likes || []), auth.userId],
      }));
      return { previous };
    },
    onError: (_err, _vars, context) => {
      queryClient.setQueryData(["place", placeId], context.previous);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["place", placeId] });
    },
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
            {auth.isLoggedIn && (
              <button
                className={`like-btn ${isLiked ? "like-btn--liked" : ""}`}
                onClick={() => likeMutation.mutate({ placeId, token: auth.token })}
                disabled={likeMutation.isPending}
              >
                <Heart size={20} fill={isLiked ? "currentColor" : "none"} />
                <span>{place.likes?.length || 0}</span>
              </button>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
};

export default PlaceDetail;
