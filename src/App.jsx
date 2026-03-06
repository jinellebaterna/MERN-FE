import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useState, useCallback, useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

import UpdateUser from "./components/update-user";
import UserCountries from "./components/shared/user-countries/user-countries";
import UserWishlist from "./components/shared/user-wishlist/user-wishlist";
import ScratchMap from "./components/shared/scratch-map/scratch-map";

import Auth from "./components/auth/auth";
import Navigation from "./components/shared/components/navigation/navigation";
import { AuthContext } from "./components/context/auth-context";
import { ThemeProvider } from "./components/context/theme-context";
import ErrorBoundary from "./components/shared/components/errorBoundary/errorBoundary";
import Home from "./components/shared/home/home";

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // Data is fresh for 5 minutes
      retry: 1,
    },
  },
});

const App = () => {
  // Helper function to get valid stored data
  const getStoredData = () => {
    const storedData = JSON.parse(localStorage.getItem("userData"));
    if (
      storedData &&
      storedData.token &&
      new Date(storedData.expiration) > new Date()
    ) {
      return storedData;
    }
    // Clear invalid data
    localStorage.removeItem("userData");
    return null;
  };

  // Initialize state from localStorage with lazy initialization
  const [token, setToken] = useState(() => {
    const data = getStoredData();
    return data?.token || false;
  });

  const [userId, setUserId] = useState(() => {
    const data = getStoredData();
    return data?.userId || false;
  });

  const [tokenExpirationDate, setTokenExpirationDate] = useState(() => {
    const data = getStoredData();
    return data ? new Date(data.expiration) : null;
  });

  const [name, setName] = useState(() => {
    const data = getStoredData();
    return data?.name || null;
  });

  const [image, setImage] = useState(() => {
    const data = getStoredData();
    return data?.image || null;
  });

  const login = useCallback((uid, token, expirationDate, name, image) => {
    setToken(token);
    setUserId(uid);
    setName(name);
    setImage(image);
    const tokenExpiryDate =
      expirationDate || new Date(new Date().getTime() + 1000 * 60 * 60);
    setTokenExpirationDate(tokenExpiryDate);
    localStorage.setItem(
      "userData",
      JSON.stringify({
        userId: uid,
        token: token,
        expiration: tokenExpiryDate.toISOString(),
        name: name,
        image: image,
      })
    );
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setUserId(null);
    setTokenExpirationDate(null);
    localStorage.removeItem("userData");
    queryClient.clear(); // Clear all cached queries on logout
  }, []);

  const updateProfile = useCallback((name, image) => {
    setName(name);
    setImage(image);
    const storedData = JSON.parse(localStorage.getItem("userData"));
    if (storedData) {
      localStorage.setItem(
        "userData",
        JSON.stringify({ ...storedData, name, image })
      );
    }
  }, []);

  // Auto-logout when token expires (only set timer, don't logout immediately)
  useEffect(() => {
    if (token && tokenExpirationDate) {
      const remainingTime =
        tokenExpirationDate.getTime() - new Date().getTime();
      // Only set timer if token hasn't expired yet
      if (remainingTime > 0) {
        const logoutTimer = setTimeout(logout, remainingTime);
        return () => {
          clearTimeout(logoutTimer);
        };
      }
    }
  }, [token, tokenExpirationDate, logout]);

  const isLoggedIn = !!token;

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthContext.Provider
          value={{
            isLoggedIn: isLoggedIn,
            token: token,
            userId: userId,
            name: name,
            image: image,
            login: login,
            logout: logout,
            updateProfile: updateProfile,
          }}
        >
          <BrowserRouter>
            <Navigation />
            <ErrorBoundary>
              <main>
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route
                    path="/users/edit"
                    element={
                      isLoggedIn ? (
                        <UpdateUser />
                      ) : (
                        <Navigate to="/auth" replace />
                      )
                    }
                  />
                  {/* <Route path="/users/:userId" element={<UserProfile />} />
                  <Route path="/:userId/places" element={<UserPlaces />} />
                  <Route path="/search" element={<SearchPlaces />} />
                  <Route
                    path="/places/new"
                    element={
                      isLoggedIn ? (
                        <NewPlace />
                      ) : (
                        <Navigate to="/auth" replace />
                      )
                    }
                  /> */}
                  {/* <Route path="/places" element={<AllPlaces />} />
                  <Route path="/map" element={<MapView />} />
                  <Route
                    path="/places/view/:placeId"
                    element={<PlaceDetail />}
                  />
                  <Route
                    path="/places/:placeId"
                    element={
                      isLoggedIn ? (
                        <UpdatePlace />
                      ) : (
                        <Navigate to="/auth" replace />
                      )
                    }
                  /> */}

                  <Route
                    path="/countries"
                    element={
                      isLoggedIn ? (
                        <>
                          <UserCountries />
                          <UserWishlist />
                        </>
                      ) : (
                        <Navigate to="/auth" replace />
                      )
                    }
                  />
                  <Route
                    path="/map"
                    element={
                      isLoggedIn ? (
                        <ScratchMap />
                      ) : (
                        <Navigate to="/auth" replace />
                      )
                    }
                  />
                  <Route
                    path="/auth"
                    element={
                      !isLoggedIn ? <Auth /> : <Navigate to="/" replace />
                    }
                  />
                  <Route
                    path="*"
                    element={
                      <Navigate to={isLoggedIn ? "/" : "/auth"} replace />
                    }
                  />
                </Routes>
              </main>
            </ErrorBoundary>
          </BrowserRouter>
        </AuthContext.Provider>
      </ThemeProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
};

export default App;
