import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AuthContext } from "../context/auth-context";
import { fetchAllUsers, followUser, unfollowUser } from "../../api/user";
import { getFlagEmoji } from "../../utils/flags";
import LoadingSpinner from "../shared/loadingSpinner/loadingSpinner";
import FollowersModal from "../followers-modal/followers-modal";
import Avatar from "../shared/avatar/avatar";

const HomeLoggedIn = () => {
  const auth = useContext(AuthContext);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [modalUser, setModalUser] = useState(null);

  const { data: users = [], isLoading } = useQuery({
    queryKey: ["users"],
    queryFn: fetchAllUsers,
    enabled: !!auth.isLoggedIn,
  });

  const followMutation = useMutation({
    mutationFn: ({ userId, isFollowing }) =>
      isFollowing
        ? unfollowUser({ userId, token: auth.token })
        : followUser({ userId, token: auth.token }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["users"] }),
  });

  const filtered = users
    .filter((u) => u.id !== auth.userId)
    .filter((u) => u.name.toLowerCase().includes(search.toLowerCase()));

  const loggedInUserData = users.find((u) => u.id === auth.userId);

  return (
    <div className="home">
      <div className="home__header">
        <h2>Discover Travelers</h2>
        <input
          className="home__search"
          type="text"
          placeholder="Search travelers..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {isLoading && <LoadingSpinner asOverlay />}

      {!isLoading && filtered.length === 0 && (
        <p className="home__empty">No travelers found.</p>
      )}

      <div className="home__grid">
        {filtered.map((user) => {
          const isFollowing = user.followers?.includes(auth.userId);
          const coverage = (
            ((user.countries?.length || 0) / 195) *
            100
          ).toFixed(1);
          return (
            <div key={user.id} className="traveler-card">
              <Avatar
                image={user.image}
                name={user.name}
                size={48}
                onClick={() => navigate(`/countries?user=${user.id}`)}
              />

              <div
                className="traveler-card__info"
                onClick={() => navigate(`/countries?user=${user.id}`)}
              >
                {user.countries?.length > 0 && (
                  <div className="traveler-card__flags">
                    {user.countries.slice(0, 5).map((c) => (
                      <span key={c.code}>{getFlagEmoji(c.code)}</span>
                    ))}
                    {user.countries.length > 5 && (
                      <span className="traveler-card__flags-more">
                        +{user.countries.length - 5}
                      </span>
                    )}
                  </div>
                )}
                <div className="traveler-card__name">{user.name}</div>
                <div className="traveler-card__meta">
                  {user.countries?.length || 0} countries · {coverage}% of the
                  world ·{" "}
                  <button
                    className="traveler-card__followers-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      setModalUser(user);
                    }}
                  >
                    {user.followers?.length || 0} followers
                  </button>
                </div>
              </div>
              <div className="traveler-card__actions">
                <button
                  className={`traveler-card__follow${isFollowing ? " traveler-card__follow--following" : ""}`}
                  onClick={() =>
                    followMutation.mutate({ userId: user.id, isFollowing })
                  }
                  disabled={followMutation.isPending}
                >
                  {isFollowing ? "Following" : "Follow"}
                </button>
                <button
                  className="traveler-card__map-btn"
                  onClick={() => navigate(`/map?user=${user.id}`)}
                >
                  View Map
                </button>
              </div>
            </div>
          );
        })}
      </div>
      <FollowersModal
        show={!!modalUser}
        targetUser={modalUser}
        allUsers={users}
        loggedInUserData={loggedInUserData}
        onClose={() => setModalUser(null)}
        followMutation={followMutation}
        auth={auth}
      />
    </div>
  );
};

export default HomeLoggedIn;
