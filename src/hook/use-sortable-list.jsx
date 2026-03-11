import { useContext } from "react";
import { useSensor, useSensors, PointerSensor } from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import { AuthContext } from "../components/context/auth-context";

const useSortableList = ({ items, setItems, reorderMutation }) => {
  const auth = useContext(AuthContext);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = items.findIndex((c) => c.code === active.id);
    const newIndex = items.findIndex((c) => c.code === over.id);
    const reordered = arrayMove(items, oldIndex, newIndex);
    setItems(reordered);
    reorderMutation.mutate({
      userId: auth.userId,
      codes: reordered.map((c) => c.code),
      token: auth.token,
    });
  };

  return { sensors, handleDragEnd };
};

export default useSortableList;
