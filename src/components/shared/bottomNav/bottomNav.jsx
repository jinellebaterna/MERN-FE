import { useContext, useState } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { Home, Globe, Flag, User, X } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchAllUsers, followUser, unfollowUser } from "../../../api/user";
import { AuthContext } from "../../context/auth-context";
import { ThemeContext } from "../../context/theme-context";
import Avatar from "../avatar/avatar";
import FollowersModal from "../../followers-modal/followers-modal";
import "./bottomNav.css";

const BottomNav = () => {
  const auth = useContext(AuthContext);
  const { theme, toggleTheme } = useContext(ThemeContext);
  const navigate = useNavigate();
  const location = useLocation();

  const [panelOpen, setPanelOpen] = useState(false);
  const [modalShow, setModalShow] = useState(false);
  const [modalTab, setModalTab] = useState("followers");

  const queryClient = useQueryClient();

  const { data: allUsers = [] } = useQuery({
    queryKey: ["users"],
    queryFn: fetchAllUsers,
    enabled: !!auth.isLoggedIn,
  });

  const loggedInUser = allUsers.find((u) => u.id === auth.userId);

  const followMutation = useMutation({
    mutationFn: ({ userId, isFollowing }) =>
      isFollowing
        ? unfollowUser({ userId, token: auth.token })
        : followUser({ userId, token: auth.token }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["user", auth.userId] });
    },
  });

  if (!auth.isLoggedIn) return null;

  const mapParams = new URLSearchParams(location.search);
  const isViewingOtherMap =
    (location.pathname === "/map" || location.pathname === "/countries") &&
    !!mapParams.get("user") &&
    mapParams.get("user") !== auth.userId;

  return (
    <>
      {/* Bottom Nav Bar */}
      <nav className="bottom-nav">
        <NavLink
          to="/"
          end
          className={({ isActive }) =>
            `bottom-nav__tab${isActive ? " bottom-nav__tab--active" : ""}`
          }
        >
          <Home size={22} />
          <span>Home</span>
        </NavLink>

        <NavLink
          to="/map"
          className={({ isActive }) =>
            `bottom-nav__tab${isActive && !isViewingOtherMap ? " bottom-nav__tab--active" : ""}`
          }
        >
          <Globe size={22} />
          <span>My Map</span>
        </NavLink>

        <NavLink
          to="/countries"
          className={({ isActive }) =>
            `bottom-nav__tab${isActive && !isViewingOtherMap ? " bottom-nav__tab--active" : ""}`
          }
        >
          <Flag size={22} />
          <span>Countries</span>
        </NavLink>

        <button
          className={`bottom-nav__tab${panelOpen ? " bottom-nav__tab--active" : ""}`}
          onClick={() => setPanelOpen(true)}
        >
          <User size={22} />
          <span>Profile</span>
        </button>
      </nav>

      {/* Overlay */}
      {panelOpen && (
        <div
          className="bottom-sheet-overlay"
          onClick={() => setPanelOpen(false)}
        />
      )}

      {/* Profile Bottom Sheet */}
      <div className={`bottom-sheet${panelOpen ? " bottom-sheet--open" : ""}`}>
        <button
          className="bottom-sheet__close"
          onClick={() => setPanelOpen(false)}
        >
          <X size={20} />
        </button>

        <div className="bottom-sheet__header">
          <Avatar image={auth.image} name={auth.name} size={48} />
          <span className="bottom-sheet__name">{auth.name}</span>
        </div>

        <ul className="bottom-sheet__list">
          <li>
            <button
              onClick={() => {
                setPanelOpen(false);
                setModalTab("followers");
                setModalShow(true);
              }}
            >
              Followers
            </button>
          </li>
          <li>
            <button
              onClick={() => {
                setPanelOpen(false);
                navigate("/users/edit");
              }}
            >
              My Profile
            </button>
          </li>
          <li className="bottom-sheet__theme-row" onClick={toggleTheme}>
            <span>Theme</span>
            <button className="theme-toggle">
              {theme === "light" ? "🌙" : "☀️ "}
            </button>
          </li>
          <li>
            <button
              className="bottom-sheet__logout"
              onClick={() => {
                setPanelOpen(false);
                auth.logout();
              }}
            >
              Logout
            </button>
          </li>
        </ul>
      </div>

      <FollowersModal
        show={modalShow}
        targetUser={loggedInUser}
        allUsers={allUsers}
        loggedInUserData={loggedInUser}
        onClose={() => setModalShow(false)}
        followMutation={followMutation}
        auth={auth}
        initialTab={modalTab}
      />
    </>
  );
};

export default BottomNav;
