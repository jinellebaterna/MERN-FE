import { useContext, useState } from "react";
import { useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { fetchAllUsers } from "../api/user";
import { AuthContext } from "../components/context/auth-context";
import { ThemeContext } from "../components/context/theme-context";
import useFollowMutation from "../hook/use-follow-mutation";

const useNavData = () => {
  const auth = useContext(AuthContext);

  const { theme, toggleTheme } = useContext(ThemeContext);
  const location = useLocation();

  const [modalShow, setModalShow] = useState(false);
  const [modalTab, setModalTab] = useState("followers");
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const { data: allUsers = [] } = useQuery({
    queryKey: ["users"],
    queryFn: fetchAllUsers,
    enabled: !!auth.isLoggedIn,
  });

  const loggedInUser = allUsers.find((u) => u.id === auth.userId);
  const followMutation = useFollowMutation();

  const mapParams = new URLSearchParams(location.search);
  const isViewingOtherMap =
    (location.pathname === "/map" || location.pathname === "/countries") &&
    !!mapParams.get("user") &&
    mapParams.get("user") !== auth.userId;

  return {
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
  };
};

export default useNavData;
