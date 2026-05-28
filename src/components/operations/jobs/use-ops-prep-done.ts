"use client";

import {
  readOpsPrepDoneIds,
  subscribeOpsPrepDone,
} from "@/lib/operations/ops-prep-storage";
import { useEffect, useMemo, useState } from "react";

export function useOpsPrepDoneIds() {
  const [tick, setTick] = useState(0);

  useEffect(() => subscribeOpsPrepDone(() => setTick((n) => n + 1)), []);

  return useMemo(() => readOpsPrepDoneIds(), [tick]);
}
