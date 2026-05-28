"use client";

import { MovePriorityCard } from "@/components/moves/shared/MovePriorityCard";
import { compareSalesPriority } from "@/lib/moves/move-priority-tier";
import type { MoveRecord } from "@/lib/moves/types";
import { useMemo } from "react";

type SalesPriorityViewProps = {
  moves: MoveRecord[];
};

export function SalesPriorityView({ moves }: SalesPriorityViewProps) {
  const sorted = useMemo(() => [...moves].sort(compareSalesPriority), [moves]);

  return (
    <ul className="space-y-2">
      {sorted.map((move) => (
        <li key={move.id}>
          <MovePriorityCard move={move} />
        </li>
      ))}
    </ul>
  );
}
