import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";
import { ReactNode } from "react";

// Generic wrapper: provides a drag handle and applies dnd-kit transforms.
// Children receive normal layout; the handle floats on the top-left.
export const SortableItem = ({ id, children, className = "" }: { id: string; children: ReactNode; className?: string }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : undefined,
    opacity: isDragging ? 0.85 : 1,
  };
  return (
    <div ref={setNodeRef} style={style} className={`relative ${className}`}>
      <button
        type="button"
        {...attributes}
        {...listeners}
        className="absolute top-2 left-2 z-20 w-7 h-7 rounded-md bg-black/60 hover:bg-black/80 text-white/90 flex items-center justify-center cursor-grab active:cursor-grabbing"
        title="Arrastar para reordenar"
        aria-label="Arrastar"
      >
        <GripVertical className="h-4 w-4" />
      </button>
      {children}
    </div>
  );
};

export default SortableItem;