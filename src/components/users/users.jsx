import { useEffect, useState, useContext } from "react";
import UsersList from "../users/users-list/users-list";
import LoadingSpinner from "../shared/components/loadingSpinner/loadingSpinner";
import ErrorModal from "../shared/components/errorModal/errorModal";
import { useHttpClient } from "../shared/hook/http-hook";
import { AuthContext } from "../shared/context/auth-context";

const Users = () => {
  const auth = useContext(AuthContext);
  const { isLoading, error, sendRequest, clearError } = useHttpClient();
  const [loadedUsers, setLoadedUsers] = useState();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const responseData = await sendRequest(
          "http://localhost:5001/api/users"
        );

        const filteredUsers = auth.isLoggedIn
          ? responseData.users.filter((user) => user.id !== auth.userId)
          : responseData.users;
        setLoadedUsers(filteredUsers);
      } catch (err) {
        console.log(err);
      }
    };
    fetchUsers();
  }, [sendRequest, auth.isLoggedIn, auth.userId]);
  return (
    <>
      <ErrorModal error={error} onClear={clearError} />
      {isLoading && (
        <div className="center">
          <LoadingSpinner />
        </div>
      )}
      {!isLoading && loadedUsers && <UsersList items={loadedUsers} />}
    </>
  );
};

export default Users;
