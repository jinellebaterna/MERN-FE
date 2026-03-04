import { useNavigate } from "react-router-dom";

import Avatar from "../../shared/components/avatar/avatar";
import Card from "../../shared/components/card/card";
import "./user-item.css";

const UserItem = (props) => {
  const navigate = useNavigate();

  return (
    <li className="user-item">
      <Card
        className="user-item__content"
        onClick={() => {
          navigate(`/${props.id}/places`);
        }}
      >
        <div className="user-item__image">
          <Avatar
            image={`http://localhost:5001/${props.image}`}
            alt={props.name}
          />
        </div>
        <div className="user-item__info">
          <h2>{props.name}</h2>
          <h3>
            {props.placeCount} {props.placeCount === 1 ? "Place" : "Places"}
          </h3>
        </div>
      </Card>
    </li>
  );
};

export default UserItem;
