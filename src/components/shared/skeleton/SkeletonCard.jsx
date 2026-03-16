import "./skeleton.css";

const DEFAULT_COUNT = { country: 12, wishlist: 8, traveler: 6 };

const cards = {
  country: (i) => (
    <div key={i} className="country-card country-card--skeleton">
      <div className="skeleton-block country-card__flag-skel" />
      <div className="skeleton-block country-card__name-skel" />
    </div>
  ),
  wishlist: (i) => (
    <div key={i} className="wishlist-card wishlist-card--skeleton">
      <div className="skeleton-block wishlist-card__flag-skel" />
      <div className="skeleton-block wishlist-card__name-skel" />
      <div className="skeleton-block wishlist-card__date-skel" />
    </div>
  ),
  traveler: (i) => (
    <div key={i} className="traveler-card traveler-card--skeleton">
      <div className="skeleton-block traveler-card__avatar-skel" />
      <div className="traveler-card__info">
        <div className="skeleton-block traveler-card__flags-skel" />
        <div className="skeleton-block traveler-card__name-skel" />
        <div className="skeleton-block traveler-card__meta-skel" />
      </div>
    </div>
  ),
};

const SkeletonCard = ({ type, count }) => {
  const n = count ?? DEFAULT_COUNT[type] ?? 4;
  const render = cards[type];
  return <>{Array.from({ length: n }).map((_, i) => render(i))}</>;
};

export default SkeletonCard;
