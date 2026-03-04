import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { MapPin } from "lucide-react";
import { fetchUserById } from "../../../api/user";
import Avatar from "../../shared/components/avatar/avatar";
import Card from "../../shared/components/card/card";
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
    </div>
  );
};

export default UserProfile;
