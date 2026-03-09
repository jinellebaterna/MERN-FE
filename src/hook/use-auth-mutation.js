import { useContext } from "react";
import { useMutation } from "@tanstack/react-query";
import { AuthContext } from "../components/context/auth-context";

export const useAuthMutation = (options) => {
  const auth = useContext(AuthContext);
  return useMutation({
    ...options,
    onError: (error, ...args) => {
      if (error.message === "UNAUTHORIZED") auth.logout();
      options.onError?.(error, ...args);
    },
  });
};
