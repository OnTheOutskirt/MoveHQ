import { getMoveEstimatedValue } from "@/lib/moves/move-priority-tier";
import type { DefaultsSettings } from "@/lib/settings/types";
import type { MoveRecord } from "./types";

export type MoveDepositSummary = {
  quoteTotal: number;
  depositDue: number;
  depositReceived: number;
  balanceDue: number;
  depositLabel: string;
};

function formatMoney(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function computeMoveDeposit(
  move: MoveRecord,
  defaults: DefaultsSettings,
): MoveDepositSummary {
  const quoteTotal = move.quoteAmount ?? getMoveEstimatedValue(move) ?? 0;

  const depositDue =
    defaults.depositMode === "percent"
      ? Math.round((quoteTotal * defaults.depositValue) / 100)
      : defaults.depositValue;

  let depositReceived = 0;
  if (move.pipelineStage === "booked" || move.pipelineStage === "completed") {
    depositReceived =
      move.pipelineStage === "completed" ? depositDue : Math.round(depositDue * 0.5);
  }

  const balanceDue = Math.max(0, quoteTotal - depositReceived);

  const depositLabel =
    defaults.depositMode === "percent"
      ? `${defaults.depositValue}% (${formatMoney(depositDue)})`
      : formatMoney(depositDue);

  return {
    quoteTotal,
    depositDue,
    depositReceived,
    balanceDue,
    depositLabel,
  };
}
