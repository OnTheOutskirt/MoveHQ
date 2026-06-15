import {
  addTesterFeedback,
  getTesterFeedbackStorageMode,
  listTesterFeedback,
} from "@/lib/planning/tester-feedback-server";
import { TESTER_FEEDBACK_KINDS, type NewTesterFeedback } from "@/lib/planning/tester-feedback";
import { NextResponse } from "next/server";

function isNewTesterFeedback(value: unknown): value is NewTesterFeedback {
  if (!value || typeof value !== "object") return false;
  const input = value as Partial<NewTesterFeedback>;
  return (
    typeof input.description === "string" &&
    input.description.trim().length > 0 &&
    typeof input.pagePath === "string" &&
    input.pagePath.length > 0 &&
    typeof input.reporterId === "string" &&
    typeof input.reporterName === "string" &&
    typeof input.kind === "string" &&
    TESTER_FEEDBACK_KINDS.includes(input.kind as (typeof TESTER_FEEDBACK_KINDS)[number])
  );
}

export async function GET() {
  try {
    const items = await listTesterFeedback();
    return NextResponse.json({
      items,
      storage: getTesterFeedbackStorageMode(),
    });
  } catch (error) {
    console.error("GET /api/tester-feedback failed", error);
    return NextResponse.json({ error: "Failed to load tester feedback." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as unknown;
    if (!isNewTesterFeedback(body)) {
      return NextResponse.json({ error: "Invalid feedback payload." }, { status: 400 });
    }

    const item = await addTesterFeedback({
      kind: body.kind,
      description: body.description.trim(),
      pagePath: body.pagePath,
      pageTitle: typeof body.pageTitle === "string" ? body.pageTitle : undefined,
      reporterId: body.reporterId,
      reporterName: body.reporterName,
    });

    return NextResponse.json({ item }, { status: 201 });
  } catch (error) {
    console.error("POST /api/tester-feedback failed", error);
    const message =
      error instanceof Error ? error.message : "Failed to save tester feedback.";
    const status = message.includes("not configured") ? 503 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
