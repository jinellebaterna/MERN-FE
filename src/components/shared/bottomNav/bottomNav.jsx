import { NavLink } from "react-router-dom";
import { Home, Globe, Flag, User } from "lucide-react";
import useNavData from "../../../hook/use-nav-data";
import "./bottomNav.css";

const BottomNav = () => {
  const { auth, isViewingOtherMap } = useNavData();

  if (!auth.isLoggedIn) return null;

  return (
    <>
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

        <NavLink
          to="/profile"
          className={({ isActive }) =>
            `bottom-nav__tab${isActive ? " bottom-nav__tab--active" : ""}`
          }
        >
          <User size={22} />
          <span>Profile</span>
        </NavLink>
      </nav>
    </>
  );
};

export default BottomNav;
