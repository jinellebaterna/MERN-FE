import { useContext } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AuthContext } from "../components/context/auth-context";
import { followUser, unfollowUser } from "../api/user";

const useFollowMutation = () => {
  const auth = useContext(AuthContext);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, isFollowing }) =>
      isFollowing
        ? unfollowUser({ userId, token: auth.token })
        : followUser({ userId, token: auth.token }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["user", auth.userId] });
    },
  });
};

export default useFollowMutation;
