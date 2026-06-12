"use client";

import {
  readManualOpsPrepTasks,
  subscribeManualOpsPrepTasks,
} from "@/lib/operations/ops-prep-custom-storage";
import { useEffect, useMemo, useState } from "react";

export function useManualOpsPrepTasks() {
  const [tick, setTick] = useState(0);

  useEffect(() => subscribeManualOpsPrepTasks(() => setTick((n) => n + 1)), []);

  return useMemo(() => readManualOpsPrepTasks(), [tick]);
}
