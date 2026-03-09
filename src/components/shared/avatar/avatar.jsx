import { IMG_BASE } from "../../../data/data";
import "./avatar.css";

const Avatar = ({ image, name, size = 40, onClick, className = "" }) => {
  const style = { width: size, height: size };
  const clickable = !!onClick;

  if (image) {
    return (
      <img
        className={`avatar avatar--img${clickable ? " avatar--clickable" : ""}${className ? ` ${className}` : ""}`}
        style={style}
        src={`${IMG_BASE}/${image}`}
        alt={name}
        onClick={onClick}
      />
    );
  }

  return (
    <div
      className={`avatar avatar--placeholder${clickable ? " avatar--clickable" : ""}${className ? ` ${className}` : ""}`}
      style={style}
      onClick={onClick}
    >
      {name?.[0]?.toUpperCase() ?? "?"}
    </div>
  );
};

export default Avatar;
