import { useContext } from "react";
import { useQuery } from "@tanstack/react-query";
import UsersList from "../users/users-list/users-list";
import LoadingSpinner from "../shared/components/loadingSpinner/loadingSpinner";
import ErrorModal from "../shared/components/errorModal/errorModal";
import { AuthContext } from "../shared/context/auth-context";
import { fetchUsers } from "../../api/places";

const Users = () => {
  const auth = useContext(AuthContext);

  const {
    data: users,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["users"],
    queryFn: fetchUsers,
  });

  // Filter out current user
  const filteredUsers =
    users && auth.isLoggedIn
      ? users.filter((user) => user.id !== auth.userId)
      : users;

  return (
    <>
      <ErrorModal error={error?.message} onClear={() => {}} />
      {isLoading && (
        <div className="center">
          <LoadingSpinner />
        </div>
      )}
      {!isLoading && filteredUsers && <UsersList items={filteredUsers} />}
    </>
  );
};

export default Users;