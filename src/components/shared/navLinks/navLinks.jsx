import { useState, useRef, useCallback } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { Globe, Flag } from "lucide-react";
import FollowersModal from "../../followers-modal/followers-modal";
import ConfirmModal from "../../confirmation-modal/confirmation-modal";
import Avatar from "../avatar/avatar";
import { useClickOutside } from "../../../hook/use-click-outside";
import useNavData from "../../../hook/use-nav-data";
import "./navLinks.css";

const NavLinks = () => {
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
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const closeDropdown = useCallback(() => setDropdownOpen(false), []);
  useClickOutside(dropdownRef, closeDropdown);

  return (
    <ul className="nav-links">
      {auth.isLoggedIn && (
        <li>
          <NavLink
            to="/map"
            className={({ isActive }) =>
              isActive && !isViewingOtherMap ? "active" : undefined
            }
          >
            <Globe size={16} /> MY MAP
          </NavLink>
        </li>
      )}
      {auth.isLoggedIn && (
        <li>
          <NavLink
            to="/countries"
            className={({ isActive }) =>
              isActive && !isViewingOtherMap ? "active" : undefined
            }
          >
            <Flag size={16} /> MY COUNTRIES
          </NavLink>
        </li>
      )}

      {!auth.isLoggedIn && (
        <li>
          <NavLink to="/auth">AUTHENTICATE</NavLink>
        </li>
      )}

      {auth.isLoggedIn && (
        <li className="avatar-menu" ref={dropdownRef}>
          <button
            className="avatar-btn"
            onClick={() => setDropdownOpen((o) => !o)}
          >
            <Avatar
              image={auth.image}
              name={auth.name}
              size={36}
              className="avatar-nav"
            />
          </button>

          {dropdownOpen && (
            <ul className="avatar-dropdown">
              <li>
                <button
                  onClick={() => {
                    setDropdownOpen(false);
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
                    setDropdownOpen(false);
                    navigate("/users/edit");
                  }}
                >
                  Edit Profile
                </button>
              </li>
              <li>
                <button onClick={() => setShowLogoutConfirm(true)}>
                  Logout
                </button>
              </li>
            </ul>
          )}
        </li>
      )}

      <li>
        <button className="theme-toggle" onClick={toggleTheme}>
          {theme === "light" ? "🌙" : "☀️  "}
        </button>
      </li>
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
    </ul>
  );
};

export default NavLinks;
