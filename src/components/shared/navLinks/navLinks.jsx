import { NavLink, useNavigate } from "react-router-dom";
import { Globe, Flag } from "lucide-react";
import Avatar from "../avatar/avatar";
import useNavData from "../../../hook/use-nav-data";
import "./navLinks.css";

const NavLinks = () => {
  const { auth, isViewingOtherMap } = useNavData();

  const navigate = useNavigate();

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
        <li>
          <button className="avatar-btn" onClick={() => navigate("/profile")}>
            <Avatar
              image={auth.image}
              name={auth.name}
              size={36}
              className="avatar-nav"
            />
          </button>
        </li>
      )}
    </ul>
  );
};

export default NavLinks;
