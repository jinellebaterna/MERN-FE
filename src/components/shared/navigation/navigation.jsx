import { useState } from "react";
import { Link } from "react-router-dom";
import { Menu } from "lucide-react";

import MainHeader from "../mainHeader/mainHeader";
import NavLinks from "../navLinks/navLinks";
import SideDrawer from "../sideDrawer/sideDrawer";
import Backdrop from "../backdrop/backdrop";
import BottomNav from "../bottomNav/bottomNav"; // ← ADD THIS

import "./navigation.css";

const Navigation = () => {
  const [drawerIsOpen, setDrawerIsOpen] = useState(false);
  const toggleDrawer = () => setDrawerIsOpen((prev) => !prev);

  return (
    <>
      <SideDrawer show={drawerIsOpen}>
        <nav className="main-navigation__drawer-nav">
          <NavLinks onClick={toggleDrawer} />
        </nav>
      </SideDrawer>
      {drawerIsOpen && <Backdrop onClick={toggleDrawer} />}
      <MainHeader>
        <button
          className="main-navigation__menu-btn"
          onClick={toggleDrawer}
          aria-label="Open navigation menu"
        >
          <Menu />
        </button>

        <h1 className="main-navigation__title">
          <Link to="/">Wayfarer</Link>
        </h1>

        <nav className="main-navigation__header-nav">
          <NavLinks />
        </nav>
      </MainHeader>
      <BottomNav /> {/* ← ADD THIS */}
    </>
  );
};

export default Navigation;
