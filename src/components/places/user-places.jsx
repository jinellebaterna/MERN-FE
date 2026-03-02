import { useEffect, useState, useContext } from "react";
import { useParams } from "react-router-dom";
import { useHttpClient } from "../shared/hook/http-hook";

import PlaceList from "../places/place-list/place-list";
import ErrorModal from "../shared/components/errorModal/errorModal";
import LoadingSpinner from "../shared/components/loadingSpinner/loadingSpinner";
import { AuthContext } from "../shared/context/auth-context";

const UserPlaces = () => {
  const auth = useContext(AuthContext);
  const [loadedPlaces, setLoadedPlaces] = useState();
  const { isLoading, error, sendRequest, clearError } = useHttpClient();
  const userId = useParams().userId;

  useEffect(() => {
    const fetchPlaces = async () => {
      try {
        const responseData = await sendRequest(
          `http://localhost:5001/api/places/user/${userId}`
        );
        setLoadedPlaces(responseData.places);
      } catch (err) {
        console.log(err);
        setLoadedPlaces([]);
      }
    };
    fetchPlaces();
  }, [sendRequest, userId]);

  const placeDeletedHandler = (deletedPlaceId) => {
    setLoadedPlaces((prevPlace) =>
      prevPlace.filter((place) => place.id !== deletedPlaceId)
    );
  };

  return (
    <>
      <ErrorModal error={error} onClear={clearError} />
      {isLoading && (
        <div className="center">
          <LoadingSpinner asOverlay />
        </div>
      )}
      {!isLoading && loadedPlaces && (
        <PlaceList
          items={loadedPlaces}
          onDeletePlace={placeDeletedHandler}
          canEdit={auth.userId === userId}
        />
      )}
    </>
  );
};

export default UserPlaces;
