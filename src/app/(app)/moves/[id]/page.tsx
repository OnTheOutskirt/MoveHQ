"use client";

import { MoveDetailNotFound, MoveDetailView } from "@/components/moves/detail/MoveDetailView";
import { useMoves } from "@/components/moves/MovesProvider";
import { useParams } from "next/navigation";

export default function MoveDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { getMoveById } = useMoves();
  const move = getMoveById(id);

  if (!move) {
    return <MoveDetailNotFound moveId={id} />;
  }

  return <MoveDetailView move={move} />;
}
