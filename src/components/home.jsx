import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AuthContext } from "./shared/context/auth-context";
import { fetchAllUsers, followUser, unfollowUser } from "../api/user";
import LoadingSpinner from "./shared/components/loadingSpinner/loadingSpinner";
import "./home.css";

const IMG_BASE = "http://localhost:5001";

const Home = () => {
  const auth = useContext(AuthContext);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");

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

  if (!auth.isLoggedIn) {
    return (
      <>
        <div className="home home--guest">
          <div className="home__hero">
            <h1>Track Every Country You've Visited</h1>
            <p>
              Pin countries on your personal world map, track your adventures,
              and relive your travel memories.
            </p>
            <div className="home__hero-actions">
              <button
                className="home__hero-btn home__hero-btn--primary"
                onClick={() => navigate("/auth")}
              >
                Get Started
              </button>
            </div>
          </div>
          <div className="home__features">
            <div className="home__feature">
              <div className="home__feature-icon">🗺️ </div>
              <h3>Interactive Map</h3>
              <p>
                Click countries you've visited and visualize your world travels.
              </p>
            </div>
            <div className="home__feature">
              <div className="home__feature-icon">📍</div>
              <h3>Pin Cities</h3>
              <p>Mark cities and destinations you explored in each country.</p>
            </div>
            <div className="home__feature">
              <div className="home__feature-icon">📷</div>
              <h3>Photo Memories</h3>
              <p>Upload photos from your trips and create a travel gallery.</p>
            </div>
            <div className="home__feature">
              <div className="home__feature-icon">✈️ </div>
              <h3>Bucket List</h3>
              <p>
                Track countries you want to visit and follow other travelers.
              </p>
            </div>
          </div>
        </div>
        <div className="home__cta">
          <h2>Start Mapping Your Adventures</h2>
          <p>
            Join travelers who are documenting their journeys around the world.
          </p>
          <button
            className="home__hero-btn home__hero-btn--primary"
            onClick={() => navigate("/auth")}
          >
            Create Free Account
          </button>
        </div>
        <footer className="home__footer">
          © 2026 Explore. Track. Remember.
        </footer>
      </>
    );
  }

  const filtered = users
    .filter((u) => u.id !== auth.userId)
    .filter((u) => u.name.toLowerCase().includes(search.toLowerCase()));

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
          return (
            <div key={user.id} className="traveler-card">
              <img
                className="traveler-card__avatar"
                src={`${IMG_BASE}/${user.image}`}
                alt={user.name}
                onClick={() => navigate(`/countries?user=${user.id}`)}
              />
              <div
                className="traveler-card__info"
                onClick={() => navigate(`/countries?user=${user.id}`)}
              >
                <div className="traveler-card__name">{user.name}</div>
                <div className="traveler-card__meta">
                  {user.countries?.length || 0} countries ·{" "}
                  {user.followers?.length || 0} followers
                </div>
              </div>
              <button
                className={`traveler-card__follow${isFollowing ? " traveler-card__follow--following" : ""}`}
                onClick={() =>
                  followMutation.mutate({ userId: user.id, isFollowing })
                }
                disabled={followMutation.isPending}
              >
                {isFollowing ? "Following" : "Follow"}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Home;
