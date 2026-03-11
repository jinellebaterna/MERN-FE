import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

const useSortableItem = (id, canEdit, defaultCursor = "default") => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    cursor: canEdit ? "grab" : defaultCursor,
  };

  return {
    setNodeRef,
    style,
    attributes,
    listeners: canEdit ? listeners : {},
  };
};

export default useSortableItem;
