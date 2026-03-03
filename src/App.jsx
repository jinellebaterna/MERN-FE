import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useState, useCallback, useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

import Users from "./components/users/users";
import NewPlace from "./components/places/new-place";
import UserPlaces from "./components/places/user-places";
import UpdatePlace from "./components/places/update-place";
import Auth from "./components/users/auth/auth";
import Navigation from "./components/shared/components/navigation/navigation";
import { AuthContext } from "./components/shared/context/auth-context";
import { ThemeProvider } from "./components/shared/context/theme-context";

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

  const login = useCallback((uid, token, expirationDate) => {
    setToken(token);
    setUserId(uid);
    const tokenExpiryDate =
      expirationDate || new Date(new Date().getTime() + 1000 * 60 * 60); // 1 hour
    setTokenExpirationDate(tokenExpiryDate);
    localStorage.setItem(
      "userData",
      JSON.stringify({
        userId: uid,
        token: token,
        expiration: tokenExpiryDate.toISOString(),
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
            login: login,
            logout: logout,
          }}
        >
          <BrowserRouter>
            <Navigation />
            <main>
              <Routes>
                <Route path="/" element={<Users />} />
                <Route path="/:userId/places" element={<UserPlaces />} />
                <Route
                  path="/places/new"
                  element={
                    isLoggedIn ? <NewPlace /> : <Navigate to="/auth" replace />
                  }
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
                />

                <Route
                  path="/auth"
                  element={!isLoggedIn ? <Auth /> : <Navigate to="/" replace />}
                />

                <Route
                  path="*"
                  element={<Navigate to={isLoggedIn ? "/" : "/auth"} replace />}
                />
              </Routes>
            </main>
          </BrowserRouter>
        </AuthContext.Provider>
      </ThemeProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
};

export default App;