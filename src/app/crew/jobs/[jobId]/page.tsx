"use client";

import { CrewJobDetailScreen } from "@/components/crew-app/screens/CrewJobDetailScreen";
import { use } from "react";

export default function CrewJobDetailPage({
  params,
}: {
  params: Promise<{ jobId: string }>;
}) {
  const { jobId } = use(params);
  return <CrewJobDetailScreen jobId={jobId} />;
}
