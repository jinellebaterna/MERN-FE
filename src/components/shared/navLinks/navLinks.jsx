import { useContext, useState, useRef, useCallback } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { Globe, Flag } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchAllUsers, followUser, unfollowUser } from "../../../api/user";
import FollowersModal from "../../followers-modal/followers-modal";
import Avatar from "../avatar/avatar";
import { useClickOutside } from "../../../hook/use-click-outside";
import { AuthContext } from "../../context/auth-context";
import { ThemeContext } from "../../context/theme-context";
import "./navLinks.css";

const NavLinks = () => {
  const auth = useContext(AuthContext);
  const { theme, toggleTheme } = useContext(ThemeContext);
  const location = useLocation();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [modalShow, setModalShow] = useState(false);
  const [modalTab, setModalTab] = useState("followers");

  const dropdownRef = useRef(null);

  const mapParams = new URLSearchParams(location.search);
  const isViewingOtherMap =
    (location.pathname === "/map" || location.pathname === "/countries") &&
    !!mapParams.get("user") &&
    mapParams.get("user") !== auth.userId;

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
                <button
                  onClick={() => {
                    setDropdownOpen(false);
                    auth.logout();
                  }}
                >
                  Logout
                </button>
              </li>
            </ul>
          )}
        </li>
      )}

      <li>
        <button className="theme-toggle" onClick={toggleTheme}>
          {theme === "light" ? "🌙" : "☀️ "}
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
    </ul>
  );
};

export default NavLinks;
