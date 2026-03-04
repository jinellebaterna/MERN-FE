import { useContext } from "react";
import { NavLink } from "react-router-dom";
import { Users, MapPin, Map, BookMarked, PlusCircle, UserPen, LogIn, LogOut } from "lucide-react";

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
          <Users size={16} /> ALL USERS
        </NavLink>
      </li>
      <li>
        <NavLink to="/places"><MapPin size={16} /> ALL PLACES</NavLink>
      </li>
      <li>
        <NavLink to="/map"><Map size={16} /> MAP</NavLink>
      </li>
      {auth.isLoggedIn && (
        <li>
          <NavLink to={`/${auth.userId}/places`}><BookMarked size={16} /> MY PLACES</NavLink>
        </li>
      )}
      {auth.isLoggedIn && (
        <li>
          <NavLink to="/places/new"><PlusCircle size={16} /> ADD PLACE</NavLink>
        </li>
      )}
      {auth.isLoggedIn && (
        <li>
          <NavLink to="/users/edit"><UserPen size={16} /> EDIT PROFILE</NavLink>
        </li>
      )}
      {!auth.isLoggedIn && (
        <li>
          <NavLink to="/auth"><LogIn size={16} /> AUTHENTICATE</NavLink>
        </li>
      )}

      {auth.isLoggedIn && (
        <li>
          <button onClick={auth.logout}><LogOut size={16} /> LOGOUT</button>
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
