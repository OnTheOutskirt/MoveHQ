import {
  removeTesterFeedback,
  updateTesterFeedbackStatus,
} from "@/lib/planning/tester-feedback-server";
import { TESTER_FEEDBACK_STATUSES, type TesterFeedbackStatus } from "@/lib/planning/tester-feedback";
import { NextResponse } from "next/server";

type RouteContext = { params: Promise<{ id: string }> };

function isTesterFeedbackStatus(value: unknown): value is TesterFeedbackStatus {
  return (
    typeof value === "string" &&
    TESTER_FEEDBACK_STATUSES.includes(value as TesterFeedbackStatus)
  );
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const body = (await request.json()) as { status?: unknown };
    if (!isTesterFeedbackStatus(body.status)) {
      return NextResponse.json({ error: "Invalid status." }, { status: 400 });
    }

    const item = await updateTesterFeedbackStatus(id, body.status);
    if (!item) {
      return NextResponse.json({ error: "Report not found." }, { status: 404 });
    }

    return NextResponse.json({ item });
  } catch (error) {
    console.error("PATCH /api/tester-feedback/[id] failed", error);
    const message =
      error instanceof Error ? error.message : "Failed to update tester feedback.";
    const status = message.includes("not configured") ? 503 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const removed = await removeTesterFeedback(id);
    if (!removed) {
      return NextResponse.json({ error: "Report not found." }, { status: 404 });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("DELETE /api/tester-feedback/[id] failed", error);
    const message =
      error instanceof Error ? error.message : "Failed to delete tester feedback.";
    const status = message.includes("not configured") ? 503 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
