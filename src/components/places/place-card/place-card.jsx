import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import Card from "../../shared/components/card/card";
import { AuthContext } from "../../shared/context/auth-context";
import "./place-card.css";

const PlaceCard = (props) => {
  const navigate = useNavigate();
  const auth = useContext(AuthContext);

  const isVisited = auth.userId && props.visitedBy?.includes(auth.userId);
  const isWantToVisit = auth.userId && props.wantToVisitBy?.includes(auth.userId);

  return (
    <li className="place-card">
      <Card
        className="place-card__content"
        onClick={() => navigate(`/places/view/${props.id}`)}
      >
        {isVisited && <span className="status-badge status-badge--visited">✓ Visited</span>}
        {!isVisited && isWantToVisit && <span className="status-badge status-badge--want">♡ Want to visit</span>}
        <div className="place-card__image">
          <img
            src={`http://localhost:5001/${props.images?.[0]}`}
            alt={props.title}
          />
        </div>
        <div className="place-card__info">
          <h2>{props.title}</h2>
          <p>{props.address}</p>
          {props.tags?.length > 0 && (
            <div className="place-card__tags">
              {props.tags.map((tag) => (
                <span
                  key={tag}
                  className="tag-badge"
                  onClick={(e) => {
                    e.stopPropagation();
                    props.onTagClick?.(tag);
                  }}
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </Card>
    </li>
  );
};

export default PlaceCard;
