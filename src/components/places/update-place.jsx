import { useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import Input from "../shared/components/input/input";
import Button from "../shared/components/button/button";
import Card from "../shared/components/card/card";
import LoadingSpinner from "../shared/components/loadingSpinner/loadingSpinner";
import ErrorModal from "../shared/components/errorModal/errorModal";
import {
  VALIDATOR_REQUIRE,
  VALIDATOR_MINLENGTH,
} from "../shared/utils/validators";
import { useForm } from "../shared/hook/form-hook";
import { AuthContext } from "../shared/context/auth-context";
import { fetchPlaceById, updatePlace } from "../../api/places";
import "./place-form.css";

const UpdatePlace = () => {
  const auth = useContext(AuthContext);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const placeId = useParams().placeId;

  const [formState, inputHandler, setFormData] = useForm(
    {
      title: {
        value: "",
        isValid: false,
      },
      description: {
        value: "",
        isValid: false,
      },
    },
    false
  );

  const {
    data: place,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["place", placeId],
    queryFn: () => fetchPlaceById(placeId),
  });

  const updateMutation = useMutation({
    mutationFn: updatePlace,
    onSuccess: () => {
      queryClient.invalidateQueries(["places", auth.userId]);
      queryClient.invalidateQueries(["place", placeId]);
      navigate(`/${auth.userId}/places`);
    },
    onError: (error) => {
      if (error.message === "UNAUTHORIZED") {
        auth.logout();
      }
    },
  });

  useEffect(() => {
    if (place) {
      setFormData(
        {
          title: {
            value: place.title,
            isValid: true,
          },
          description: {
            value: place.description,
            isValid: true,
          },
        },
        true
      );
    }
  }, [setFormData, place]);

  const placeUpdateSubmitHandler = (event) => {
    event.preventDefault();
    updateMutation.mutate({
      placeId,
      placeData: {
        title: formState.inputs.title.value,
        description: formState.inputs.description.value,
      },
      token: auth.token,
    });
  };

  if (isLoading) {
    return (
      <div className="center">
        <LoadingSpinner />
      </div>
    );
  }

  if (!place && !isLoading) {
    return (
      <div className="center">
        <Card>
          <h2>Could not find place!</h2>
        </Card>
      </div>
    );
  }

  return (
    <>
      <ErrorModal
        error={error?.message || updateMutation.error?.message}
        onClear={() => updateMutation.reset()}
      />
      {updateMutation.isPending && <LoadingSpinner asOverlay />}
      <form className="place-form" onSubmit={placeUpdateSubmitHandler}>
        <Input
          id="title"
          element="input"
          type="text"
          label="Title"
          validators={[VALIDATOR_REQUIRE()]}
          errorText="Please enter a valid title."
          onInput={inputHandler}
          initialValue={formState.inputs.title.value}
          initialValid={formState.inputs.title.isValid}
        />
        <Input
          id="description"
          element="textarea"
          label="Description"
          validators={[VALIDATOR_MINLENGTH(5)]}
          errorText="Please enter a valid description (min. 5 characters)."
          onInput={inputHandler}
          initialValue={formState.inputs.description.value}
          initialValid={formState.inputs.description.isValid}
        />
        <div className="place-form__actions">
          <Button type="button" inverse onClick={() => navigate(`/${auth.userId}/places`)}>
            CANCEL
          </Button>
          <Button type="submit" disabled={!formState.isValid}>
            UPDATE PLACE
          </Button>
        </div>
      </form>
    </>
  );
};

export default UpdatePlace;