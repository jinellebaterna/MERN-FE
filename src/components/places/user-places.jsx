import { useContext } from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { AuthContext } from "../shared/context/auth-context";
import { fetchPlacesByUser } from "../../api/places";

import PlaceList from "../places/place-list/place-list";
import ErrorModal from "../shared/components/errorModal/errorModal";
import LoadingSpinner from "../shared/components/loadingSpinner/loadingSpinner";

const UserPlaces = () => {
  const auth = useContext(AuthContext);
  const userId = useParams().userId;

  const {
    data: loadedPlaces = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["places", userId],
    queryFn: () => fetchPlacesByUser(userId),
  });

  return (
    <>
      <ErrorModal error={error?.message} onClear={() => {}} />
      {isLoading && (
        <div className="center">
          <LoadingSpinner asOverlay />
        </div>
      )}
      {!isLoading && (
        <PlaceList items={loadedPlaces} canEdit={auth.userId === userId} />
      )}
    </>
  );
};

export default UserPlaces;