import { useContext } from "react";
import { AuthContext } from "../../components/context/auth-context";
import HomeGuest from "./HomeGuest";
import HomeLoggedIn from "./HomeLoggedIn";
import "./home.css";

const Home = () => {
  const auth = useContext(AuthContext);
  return auth.isLoggedIn ? <HomeLoggedIn /> : <HomeGuest />;
};

export default Home;
