import React, { useContext } from "react";
import "./PlaceList.css";
import Card from "../../shared/components/UIElements/Card";
import PlaceItem from "./PlaceItem";
import Button from "../../shared/components/form-elements/Button";
import { AuthContext } from "../../shared/context/Auth-context";

function PlaceList(props) {
  const auth = useContext(AuthContext);
  if (!props.items || props.items.length === 0) {
    return (
      <div className="place-list center">
        <Card>
          {props.uid !== auth.userId && <h2>No places Found</h2>}
          {props.uid === auth.userId && <h2>No places found. Maybe create one?</h2>}
          {props.uid === auth.userId && <Button to="/places/new">Share place</Button>}
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
          image={place.image}
          title={place.title}
          description={place.description}
          address={place.address}
          creatorId={place.creator}
          coordinates={place.location}
          onDelete={props.onDeletePlace}
        />
      ))}
    </ul>
  );
}

export default PlaceList;
