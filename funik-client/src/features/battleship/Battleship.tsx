import React, { useState } from "react";
import { DndContext, useDraggable, useDroppable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";

const GRID_SIZE = 4;

type Ship = {
  id: string;
  size: number;
  position: { row: number; col: number } | null;
  orientation: "horizontal" | "vertical";
};

const Battleship: React.FC = () => {
  const [ship, setShip] = useState<Ship>({
    id: "battleship",
    size: 3,
    position: null,
    orientation: "horizontal",
  });

  const handleDragEnd = (event: any) => {
    const { over, active } = event;
    if (!over) return;
 
    const [_, rowStr, colStr] = over.id.split("-");
    const row = parseInt(rowStr);
    const col = parseInt(colStr);

    // check if ship fits horizontally
    if (ship.orientation === "horizontal" && col + ship.size - 1 < GRID_SIZE) {
      setShip({ ...ship, position: { row, col } });
    } else if (ship.orientation === "vertical" && row + ship.size - 1 < GRID_SIZE) {
      setShip({ ...ship, position: { row, col } });
    } else {
      console.log("Ship does not fit here!");
    }
  };

  return (
    <DndContext onDragEnd={handleDragEnd}>
      <div className="grid grid-cols-4 gap-1 w-max p-4 border relative">
        {Array.from({ length: GRID_SIZE }).map((_, row) =>
          Array.from({ length: GRID_SIZE }).map((_, col) => {
            const id = `cell-${row}-${col}`;
            return <GridCell key={id} id={id} />;
          })
        )}

        {/* Render placed ship */}
        {ship.position && (
          <PlacedShip ship={ship} />
        )}
      </div>

      {/* Draggable ship dock if not placed */}
      {ship.position === null && <DraggableShip id={ship.id} size={ship.size} />}
    </DndContext>
  );
};

// Grid Cell
function GridCell({ id }: { id: string }) {
  const { isOver, setNodeRef } = useDroppable({ id });
  return (
    <div
      ref={setNodeRef}
      className={`w-16 h-16 border flex items-center justify-center ${
        isOver ? "bg-green-300" : "bg-gray-100"
      }`}
    />
  );
}

// Draggable Ship
function DraggableShip({ id, size }: { id: string; size: number }) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({ id });
  const style = {
    transform: CSS.Translate.toString(transform),
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="flex gap-1 p-2 cursor-grab"
    >
      {Array.from({ length: size }).map((_, i) => (
        <div key={i} className="w-16 h-16 bg-blue-500 rounded" />
      ))}
    </div>
  );
}

// Placed Ship
function PlacedShip({ ship }: { ship: Ship }) {
  const { row, col } = ship.position!;
  const style =
    ship.orientation === "horizontal"
      ? { gridRowStart: row + 1, gridColumnStart: col + 1, gridColumnEnd: col + 1 + ship.size }
      : { gridColumnStart: col + 1, gridRowStart: row + 1, gridRowEnd: row + 1 + ship.size };

  return (
    <div
      className="absolute grid"
      style={{
        ...style,
        display: "grid",
        gridTemplateColumns:
          ship.orientation === "horizontal" ? `repeat(${ship.size}, 4rem)` : "4rem",
        gridTemplateRows:
          ship.orientation === "vertical" ? `repeat(${ship.size}, 4rem)` : "4rem",
      }}
    >
      {Array.from({ length: ship.size }).map((_, i) => (
        <div key={i} className="w-16 h-16 bg-blue-700 rounded" />
      ))}
    </div>
  );
}

export default Battleship;
