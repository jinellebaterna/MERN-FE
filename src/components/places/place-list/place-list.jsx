import Card from "../../shared/components/card/card";
import Button from "../../shared/components/button/button";

import PlaceItem from "../place-item/place-item";

import "./place-list.css";

const PlaceList = (props) => {
  if (props.items.length === 0) {
    return (
      <div className="place-list center">
        <Card>
          <h2>No places found.</h2>
          {props.canEdit && <Button to="/places/new">Share Place</Button>}
        </Card>
      </div>
    );
  }

  return (
    <ul className="place-list">
      {props.items.map((place) => (
        <PlaceItem
          key={place.id}
          id={place.id}
          images={place.images ?? []}
          title={place.title}
          description={place.description}
          address={place.address}
          creatorId={place.creator}
          onDelete={props.onDeletePlace}
        />
      ))}
    </ul>
  );
};

export default PlaceList;
