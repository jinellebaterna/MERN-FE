const StarRating = ({ value, onChange, readOnly = false }) => {
  return (
    <div className="star-rating">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          className={`star-rating__star ${star <= value ? "star-rating__star--filled" : ""}`}
          onClick={() => !readOnly && onChange(star === value ? 0 : star)}
          disabled={readOnly}
          aria-label={`${star} star`}
        >
          ★
        </button>
      ))}
    </div>
  );
};

export default StarRating;
