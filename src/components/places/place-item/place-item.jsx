import React, { useState, useContext } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams } from "react-router-dom";

import Card from "../../shared/components/card/card";
import Button from "../../shared/components/button/button";
import Modal from "../../shared/components/modal/modal";
import ErrorModal from "../../shared/components/errorModal/errorModal";
import LoadingSpinner from "../../shared/components/loadingSpinner/loadingSpinner";
import { AuthContext } from "../../shared/context/auth-context";
import { deletePlace } from "../../../api/places";
import "./place-item.css";

const PlaceItem = (props) => {
  const auth = useContext(AuthContext);
  const queryClient = useQueryClient();
  const params = useParams();
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const deleteMutation = useMutation({
    mutationFn: () => deletePlace({ placeId: props.id, token: auth.token }),
    onSuccess: () => {
      // Invalidate and refetch places for this user
      queryClient.invalidateQueries(["places", params.userId]);
      setShowConfirmModal(false);
    },
    onError: (error) => {
      if (error.message === "UNAUTHORIZED") {
        auth.logout();
      }
    },
  });

  const showDeleteWarningHandler = () => {
    setShowConfirmModal(true);
  };

  const cancelDeleteHandler = () => {
    setShowConfirmModal(false);
  };

  const confirmDeleteHandler = () => {
    deleteMutation.mutate();
  };

  return (
    <>
      <ErrorModal
        error={deleteMutation.error?.message}
        onClear={() => deleteMutation.reset()}
      />
      <Modal
        show={showConfirmModal}
        onCancel={cancelDeleteHandler}
        header="Are you sure?"
        footerClass="place-item__modal-actions"
        footer={
          <>
            <Button inverse onClick={cancelDeleteHandler}>
              CANCEL
            </Button>
            <Button danger onClick={confirmDeleteHandler}>
              DELETE
            </Button>
          </>
        }
      >
        <p>
          Do you want to proceed and delete this place? Please note that it
          can't be undone thereafter.
        </p>
      </Modal>
      <li className="place-item">
        <Card className="place-item__content">
          {deleteMutation.isPending && <LoadingSpinner asOverlay />}
          <div className="place-item__image">
            <img
              src={`http://localhost:5001/${props.image}`}
              alt={props.title}
            />
          </div>
          <div className="place-item__info">
            <h2>{props.title}</h2>
            <h3>{props.address}</h3>
            <p>{props.description}</p>
          </div>
          {auth.userId === props.creatorId && (
            <div className="place-item__actions">
              <Button to={`/places/${props.id}`}>EDIT</Button>
              <Button danger onClick={showDeleteWarningHandler}>
                DELETE
              </Button>
            </div>
          )}
        </Card>
      </li>
    </>
  );
};

export default PlaceItem;