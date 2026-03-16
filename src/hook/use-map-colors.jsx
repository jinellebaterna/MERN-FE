import { useState } from "react";

const DEFAULTS = {
  visited: "#5ca4a9",
  wishlist: "#c08f9d",
};

const useMapColors = () => {
  const [visitedColor, setVisitedColorState] = useState(
    () => localStorage.getItem("wayfarer_map_visited") || DEFAULTS.visited
  );
  const [wishlistColor, setWishlistColorState] = useState(
    () => localStorage.getItem("wayfarer_map_wishlist") || DEFAULTS.wishlist
  );

  const setVisitedColor = (color) => {
    localStorage.setItem("wayfarer_map_visited", color);
    setVisitedColorState(color);
  };

  const setWishlistColor = (color) => {
    localStorage.setItem("wayfarer_map_wishlist", color);
    setWishlistColorState(color);
  };

  const reset = () => {
    localStorage.removeItem("wayfarer_map_visited");
    localStorage.removeItem("wayfarer_map_wishlist");
    setVisitedColorState(DEFAULTS.visited);
    setWishlistColorState(DEFAULTS.wishlist);
  };

  return { visitedColor, wishlistColor, setVisitedColor, setWishlistColor, reset };
};

export default useMapColors;
