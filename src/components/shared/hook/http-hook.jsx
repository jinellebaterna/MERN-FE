import { useState, useCallback, useRef, useEffect, useContext } from "react";
import { AuthContext } from "../context/auth-context";

export const useHttpClient = () => {
  const auth = useContext(AuthContext);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(false);

  const activeHttpRequests = useRef([]);

  const sendRequest = useCallback(
    async (url, method = "GET", body = null, headers = {}) => {
      setIsLoading(true);

      const httpAbortCtrll = new AbortController();
      activeHttpRequests.current.push(httpAbortCtrll);
      try {
        const response = await fetch(url, {
          method,
          body,
          headers,
          signal: httpAbortCtrll.signal,
        });

        activeHttpRequests.current = activeHttpRequests.current.filter(
          (reqCtrl) => reqCtrl !== httpAbortCtrll
        );

        const responseData = await response.json();

        // Check for 401 Unauthorized
        if (response.status === 401) {
          auth.logout(); // Auto logout on auth failure
          throw new Error(responseData.message || "Authentication failed");
        }

        if (!response.ok) {
          throw new Error(responseData.message);
        }
        setIsLoading(false);
        return responseData;
      } catch (err) {
        if (err.name === "AbortError") {
          console.log("Request was cancelled");
          return;
        }
        setError(err.message || "Something went wrong!");
        setIsLoading(false);
        throw err;
      }
    },
    [auth]
  );

  useEffect(() => {
    return () => {
      activeHttpRequests.current.forEach((abortCtrl) => abortCtrl.abort());
    };
  }, []);

  const clearError = () => setError(null);
  return { isLoading, error, sendRequest, clearError };
};
