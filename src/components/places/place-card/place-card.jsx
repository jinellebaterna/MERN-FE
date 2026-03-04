import { useNavigate } from "react-router-dom";
import Card from "../../shared/components/card/card";
import "./place-card.css";

const PlaceCard = (props) => {
  const navigate = useNavigate();

  return (
    <li className="place-card">
      <Card
        className="place-card__content"
        onClick={() => navigate(`/places/view/${props.id}`)}
      >
        <div className="place-card__image">
          <img src={`http://localhost:5001/${props.image}`} alt={props.title} />
        </div>
        <div className="place-card__info">
          <h2>{props.title}</h2>
          <p>{props.address}</p>
        </div>
      </Card>
    </li>
  );
};

export default PlaceCard;
