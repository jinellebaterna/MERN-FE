import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { fetchUserById } from "../../../api/user";
import Avatar from "../../shared/components/avatar/avatar";
import Card from "../../shared/components/card/card";

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
    <Card>
      <Avatar
        image={`http://localhost:5001/${user.image}`}
        alt={user.name}
        style={{ width: "6rem", height: "6rem" }}
      />
      <h2>{user.name}</h2>
      <p>
        {user.places.length} {user.places.length === 1 ? "Place" : "Places"}
      </p>
      <Link to={`/${user.id}/places`}>View Places</Link>
    </Card>
  );
};

export default UserProfile;
