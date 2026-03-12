import { useNavigate } from "react-router-dom";

const HomeGuest = () => {
  const navigate = useNavigate();

  return (
    <>
      <div className="home home--guest">
        <div className="home__hero">
          <h1>Map Your Journey Across the World</h1>
          <p>
            Track every country you've visited, capture your stories, and
            connect with travelers around the world.
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
              Visualize every country you've visited on your personal world
              map.
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
            <p>Track countries you dream of visiting next.</p>
          </div>
          <div className="home__feature">
            <div className="home__feature-icon">🌍</div>
            <h3>Follow Travelers</h3>
            <p>
              Follow other travelers, view their maps and country stories.
            </p>
          </div>
          <div className="home__feature">
            <div className="home__feature-icon">📖</div>
            <h3>Travel Stories</h3>
            <p>
              Write about your experiences and keep a journal for each
              country.
            </p>
          </div>
        </div>
      </div>

      <div className="home__cta">
        <h2>Start Your Wayfarer Journey</h2>
        <p>Track Every Country. Remember Every Story.</p>
        <button
          className="home__hero-btn home__hero-btn--primary"
          onClick={() => navigate("/auth")}
        >
          Create Free Account
        </button>
      </div>

      <footer className="home__footer">
        © 2026 Wayfarer — Track Every Country. Remember Every Story.
      </footer>
    </>
  );
};

export default HomeGuest;
