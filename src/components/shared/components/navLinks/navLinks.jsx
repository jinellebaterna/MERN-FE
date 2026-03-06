import { useContext } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { Globe, Flag, UserPen, LogIn, LogOut } from "lucide-react";

import { AuthContext } from "../../context/auth-context";
import { ThemeContext } from "../../context/theme-context";
import "./navLinks.css";

const NavLinks = () => {
  const auth = useContext(AuthContext);
  const { theme, toggleTheme } = useContext(ThemeContext);
  const location = useLocation();
  const mapParams = new URLSearchParams(location.search);
  const isViewingOtherMap =
    (location.pathname === "/map" || location.pathname === "/countries") &&
    !!mapParams.get("user") &&
    mapParams.get("user") !== auth.userId;

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
      {auth.isLoggedIn && (
        <li>
          <NavLink to="/users/edit">
            <UserPen size={16} /> EDIT PROFILE
          </NavLink>
        </li>
      )}
      {!auth.isLoggedIn && (
        <li>
          <NavLink to="/auth">
            <LogIn size={16} /> AUTHENTICATE
          </NavLink>
        </li>
      )}

      {auth.isLoggedIn && (
        <li>
          <button onClick={auth.logout}>
            <LogOut size={16} /> LOGOUT
          </button>
        </li>
      )}

      <li>
        <button className="theme-toggle" onClick={toggleTheme}>
          {theme === "light" ? "🌙" : "☀️"}
        </button>
      </li>
    </ul>
  );
};

export default NavLinks;
