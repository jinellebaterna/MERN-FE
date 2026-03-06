import { useContext, useState, useRef, useEffect } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { Globe, Flag } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

import { AuthContext } from "../../context/auth-context";
import { ThemeContext } from "../../context/theme-context";
import { fetchUserById } from "../../../../api/user";
import "./navLinks.css";

const IMG_BASE = "http://localhost:5001";

const NavLinks = () => {
  const auth = useContext(AuthContext);
  const { theme, toggleTheme } = useContext(ThemeContext);
  const location = useLocation();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const mapParams = new URLSearchParams(location.search);
  const isViewingOtherMap =
    (location.pathname === "/map" || location.pathname === "/countries") &&
    !!mapParams.get("user") &&
    mapParams.get("user") !== auth.userId;

  const { data: user } = useQuery({
    queryKey: ["user", auth.userId],
    queryFn: () => fetchUserById(auth.userId),
    enabled: !!auth.isLoggedIn && !!auth.userId,
  });

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

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
            {user?.image ? (
              <img
                src={`${IMG_BASE}/${user.image}`}
                alt="avatar"
                className="avatar-img"
              />
            ) : (
              <div className="avatar-placeholder">
                {user?.name?.[0]?.toUpperCase() ?? "?"}
              </div>
            )}
          </button>

          {dropdownOpen && (
            <ul className="avatar-dropdown">
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
    </ul>
  );
};

export default NavLinks;
