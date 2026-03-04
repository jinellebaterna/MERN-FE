import { useContext } from "react";
import { NavLink } from "react-router-dom";

import { AuthContext } from "../../context/auth-context";
import { ThemeContext } from "../../context/theme-context";
import "./navLinks.css";

const NavLinks = () => {
  const auth = useContext(AuthContext);
  const { theme, toggleTheme } = useContext(ThemeContext);

  return (
    <ul className="nav-links">
      <li>
        <NavLink to="/" end>
          ALL USERS
        </NavLink>
      </li>
      <li>
        <NavLink to="/places">ALL PLACES</NavLink>
      </li>
      {auth.isLoggedIn && (
        <li>
          <NavLink to={`/${auth.userId}/places`}>MY PLACES</NavLink>
        </li>
      )}
      {auth.isLoggedIn && (
        <li>
          <NavLink to="/places/new">ADD PLACE</NavLink>
        </li>
      )}
      {!auth.isLoggedIn && (
        <li>
          <NavLink to="/auth">AUTHENTICATE</NavLink>
        </li>
      )}
      {auth.isLoggedIn && (
        <li>
          <button onClick={auth.logout}>LOGOUT</button>
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
