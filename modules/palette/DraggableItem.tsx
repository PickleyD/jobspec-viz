import { useDrag } from "react-dnd";

export interface DraggableItemProps {
  children: React.ReactNode;
}

export const ItemTypes = {
  NODE: "node",
};

export const DraggableItem = ({ children }: DraggableItemProps) => {
  const [{ isDragging }, dragRef] = useDrag(
    () => ({
      type: ItemTypes.NODE,
      //   item: { text },
      collect: (monitor) => ({
        isDragging: !!monitor.isDragging(),
      }),
    }),
    []
  );

  return <div ref={dragRef}>{children}</div>;
};
