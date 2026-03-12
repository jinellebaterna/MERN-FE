import { useContext } from "react";
import { AuthContext } from "../../components/context/auth-context";
import HomeGuest from "./home-guest";
import HomeLoggedIn from "./home-loggedin";
import "./home.css";

const Home = () => {
  const auth = useContext(AuthContext);
  return auth.isLoggedIn ? <HomeLoggedIn /> : <HomeGuest />;
};

export default Home;
