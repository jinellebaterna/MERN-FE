import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { Home, Globe, Flag, User, X } from "lucide-react";
import useNavData from "../../../hook/use-nav-data";
import Avatar from "../avatar/avatar";
import FollowersModal from "../../followers-modal/followers-modal";
import ConfirmModal from "../../confirmation-modal/confirmation-modal";
import useScrollLock from "../../../hook/use-scroll-lock";
import "./bottomNav.css";

const BottomNav = () => {
  const {
    auth,
    theme,
    toggleTheme,
    allUsers,
    loggedInUser,
    followMutation,
    modalShow,
    setModalShow,
    modalTab,
    setModalTab,
    showLogoutConfirm,
    setShowLogoutConfirm,
    isViewingOtherMap,
  } = useNavData();

  const navigate = useNavigate();
  const [panelOpen, setPanelOpen] = useState(false);

  useScrollLock(panelOpen);

  if (!auth.isLoggedIn) return null;

  return (
    <>
      {/* Bottom Nav Bar */}
      <nav className="bottom-nav">
        <NavLink
          to="/"
          end
          onClick={() => setPanelOpen(false)}
          className={({ isActive }) =>
            `bottom-nav__tab${isActive ? " bottom-nav__tab--active" : ""}`
          }
        >
          <Home size={22} />
          <span>Home</span>
        </NavLink>

        <NavLink
          to="/map"
          onClick={() => setPanelOpen(false)}
          className={({ isActive }) =>
            `bottom-nav__tab${isActive && !isViewingOtherMap ? " bottom-nav__tab--active" : ""}`
          }
        >
          <Globe size={22} />
          <span>My Map</span>
        </NavLink>

        <NavLink
          to="/countries"
          onClick={() => setPanelOpen(false)}
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
        <div className="bottom-sheet__header">
          <Avatar image={auth.image} name={auth.name} size={48} />
          <span className="bottom-sheet__name">{auth.name}</span>
          <button
            className="bottom-sheet__close"
            onClick={() => setPanelOpen(false)}
          >
            <X size={20} />
          </button>
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
              {theme === "light" ? "🌙" : "☀️  "}
            </button>
          </li>
          <li>
            <button
              className="bottom-sheet__logout"
              onClick={() => setShowLogoutConfirm(true)}
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
      <ConfirmModal
        show={showLogoutConfirm}
        message="Are you sure you want to log out?"
        onConfirm={() => {
          setShowLogoutConfirm(false);
          auth.logout();
        }}
        onCancel={() => setShowLogoutConfirm(false)}
      />
    </>
  );
};

export default BottomNav;
