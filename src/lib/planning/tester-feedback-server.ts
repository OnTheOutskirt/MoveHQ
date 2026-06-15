import {
  generateTesterFeedbackId,
  type NewTesterFeedback,
  type TesterFeedback,
  type TesterFeedbackStatus,
} from "@/lib/planning/tester-feedback";
import { get, put } from "@vercel/blob";
import { promises as fs } from "fs";
import path from "path";

const BLOB_PATHNAME = "planning/tester-feedback.json";
const LOCAL_FILE = path.join(process.cwd(), ".data", "tester-feedback.json");

export type TesterFeedbackStorageMode = "blob" | "local" | "unconfigured";

function useBlobStore(): boolean {
  // Legacy static token, or Vercel's OIDC-linked store (BLOB_STORE_ID + VERCEL_OIDC_TOKEN on deploy).
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN || process.env.BLOB_STORE_ID);
}

function isVercelRuntime(): boolean {
  return Boolean(process.env.VERCEL);
}

export function getTesterFeedbackStorageMode(): TesterFeedbackStorageMode {
  if (useBlobStore()) return "blob";
  if (isVercelRuntime()) return "unconfigured";
  return "local";
}

export function assertTesterFeedbackWritable(): void {
  if (getTesterFeedbackStorageMode() === "unconfigured") {
    throw new Error(
      "Tester feedback storage is not configured. Connect a Vercel Blob store to this project, then redeploy.",
    );
  }
}

function dedupeItems(items: TesterFeedback[]): TesterFeedback[] {
  const seen = new Set<string>();
  return items.filter((item) => {
    if (!item?.id || seen.has(item.id)) return false;
    seen.add(item.id);
    return true;
  });
}

async function readAll(): Promise<TesterFeedback[]> {
  if (useBlobStore()) {
    const result = await get(BLOB_PATHNAME, { access: "private" });
    if (!result || result.statusCode !== 200 || !result.stream) return [];
    const text = await new Response(result.stream).text();
    if (!text.trim()) return [];
    const parsed = JSON.parse(text) as unknown;
    return dedupeItems(Array.isArray(parsed) ? (parsed as TesterFeedback[]) : []);
  }

  if (isVercelRuntime()) return [];

  try {
    const text = await fs.readFile(LOCAL_FILE, "utf8");
    if (!text.trim()) return [];
    const parsed = JSON.parse(text) as unknown;
    return dedupeItems(Array.isArray(parsed) ? (parsed as TesterFeedback[]) : []);
  } catch {
    return [];
  }
}

async function writeAll(items: TesterFeedback[]): Promise<void> {
  assertTesterFeedbackWritable();

  const payload = JSON.stringify(dedupeItems(items), null, 2);

  if (useBlobStore()) {
    await put(BLOB_PATHNAME, payload, {
      access: "private",
      contentType: "application/json",
      allowOverwrite: true,
      addRandomSuffix: false,
    });
    return;
  }

  await fs.mkdir(path.dirname(LOCAL_FILE), { recursive: true });
  await fs.writeFile(LOCAL_FILE, payload, "utf8");
}

export async function listTesterFeedback(): Promise<TesterFeedback[]> {
  const items = await readAll();
  return items.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function addTesterFeedback(input: NewTesterFeedback): Promise<TesterFeedback> {
  const now = new Date().toISOString();
  const item: TesterFeedback = {
    ...input,
    id: generateTesterFeedbackId(),
    status: "open",
    createdAt: now,
    updatedAt: now,
  };
  const items = await readAll();
  await writeAll([item, ...items]);
  return item;
}

export async function updateTesterFeedbackStatus(
  id: string,
  status: TesterFeedbackStatus,
): Promise<TesterFeedback | null> {
  const items = await readAll();
  let updated: TesterFeedback | null = null;
  const next = items.map((item) => {
    if (item.id !== id) return item;
    updated = { ...item, status, updatedAt: new Date().toISOString() };
    return updated;
  });
  if (!updated) return null;
  await writeAll(next);
  return updated;
}

export async function removeTesterFeedback(id: string): Promise<boolean> {
  const items = await readAll();
  const next = items.filter((item) => item.id !== id);
  if (next.length === items.length) return false;
  await writeAll(next);
  return true;
}
