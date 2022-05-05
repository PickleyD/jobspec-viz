import { useDrag } from "react-dnd";

export interface DraggableItemProps {
  children: React.ReactNode;
  itemProps?: any;
}

export const ItemTypes = {
  NODE: "node"
};

export const DraggableItem = ({ children, itemProps = {} }: DraggableItemProps) => {
  const [{ isDragging }, dragRef] = useDrag(
    () => ({
      type: ItemTypes.NODE,
      item: itemProps,
      collect: (monitor) => ({
        isDragging: !!monitor.isDragging(),
      }),
    }),
    []
  );

  return <div ref={dragRef}>{children}</div>;
};
