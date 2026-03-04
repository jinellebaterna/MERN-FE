import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { MapPin } from "lucide-react";
import { fetchUserById, fetchLikedPlaces } from "../../../api/user";
import Avatar from "../../shared/components/avatar/avatar";
import Card from "../../shared/components/card/card";
import PlaceCard from "../../places/place-card/place-card";
import "./user-profile.css";

const UserProfile = () => {
  const { userId } = useParams();

  const {
    data: user,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["user", userId],
    queryFn: () => fetchUserById(userId),
  });

  const { data: likedPlaces = [] } = useQuery({
    queryKey: ["likedPlaces", userId],
    queryFn: () => fetchLikedPlaces(userId),
  });

  if (isLoading) return <p>Loading...</p>;
  if (isError || !user) return <p>Could not find this user.</p>;

  return (
    <div className="user-profile">
      <Card>
        <div className="user-profile__avatar">
          <Avatar
            image={`http://localhost:5001/${user.image}`}
            alt={user.name}
            style={{ width: "6rem", height: "6rem" }}
          />
        </div>
        <h2 className="user-profile__name">{user.name}</h2>
        <p className="user-profile__count">
          {user.places.length} {user.places.length === 1 ? "Place" : "Places"}
        </p>
        <Link to={`/${user.id}/places`} className="user-profile__link">
          <MapPin size={16} /> View Places
        </Link>
      </Card>
      {likedPlaces.length > 0 && (
        <div className="user-profile__liked">
          <h3>Liked Places</h3>
          <ul className="user-profile__liked-list">
            {likedPlaces.map((place) => (
              <PlaceCard
                key={place.id}
                id={place.id}
                title={place.title}
                address={place.address}
                image={place.image}
                tags={place.tags}
              />
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default UserProfile;
