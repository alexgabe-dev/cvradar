import {
  MAX_FILE_BYTES,
  extractionMessages,
  type ExtractionErrorCode,
} from "@/lib/extraction";
import { extractText, ExtractionError } from "@/lib/server/extract";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const headers = {
  "Cache-Control": "no-store, private, max-age=0",
  "X-Content-Type-Options": "nosniff",
};
const statuses: Partial<Record<ExtractionErrorCode, number>> = {
  too_large: 413,
  timeout: 408,
  server: 503,
};
const failure = (code: ExtractionErrorCode) =>
  Response.json(
    { error: code, message: extractionMessages[code] },
    { status: statuses[code] ?? 422, headers },
  );
// Per-process concurrency bound, not a distributed rate limiter.
let active = 0;

export async function POST(request: Request) {
  if (active >= 2) return failure("server");
  const origin = request.headers.get("origin");
  if (origin) {
    // Next's bind address (0.0.0.0) may differ from the browser-facing host.
    // Use the HTTP Host, never a client-supplied X-Forwarded-Host.
    try {
      const source = new URL(origin);
      if (
        !["http:", "https:"].includes(source.protocol) ||
        source.host !== request.headers.get("host")
      )
        return failure("unsupported");
    } catch {
      return failure("unsupported");
    }
  }
  if (!request.headers.get("content-type")?.startsWith("multipart/form-data"))
    return failure("unsupported");
  const MAX_BODY = MAX_FILE_BYTES + 64 * 1024;
  const length = Number(request.headers.get("content-length"));
  if (length > MAX_BODY) return failure("too_large");
  active++;
  let reader: ReadableStreamDefaultReader<Uint8Array> | undefined;
  const controller = new AbortController();
  const abort = () => controller.abort();
  request.signal.addEventListener("abort", abort, { once: true });
  const timer = setTimeout(abort, 20_000);
  try {
    reader = request.body?.getReader();
    if (!reader) return failure("empty");
    const chunks: Uint8Array[] = [];
    let size = 0;
    // Bound the actual stream, even when Content-Length is absent or false.
    const body = await Promise.race([
      (async () => {
        for (;;) {
          const { done, value } = await reader!.read();
          if (done) break;
          size += value.byteLength;
          if (size > MAX_BODY) throw new ExtractionError("too_large");
          chunks.push(value);
        }
        return Buffer.concat(chunks);
      })(),
      new Promise<never>((_, reject) => {
        const timedOut = () => reject(new ExtractionError("timeout"));
        controller.signal.addEventListener("abort", timedOut, { once: true });
        if (controller.signal.aborted || request.signal.aborted) timedOut();
      }),
    ]);
    const form = await new Response(body, {
      headers: { "Content-Type": request.headers.get("content-type")! },
    })
      .formData()
      .catch(() => {
        throw new ExtractionError("corrupt");
      });
    const files = form.getAll("file");
    if (
      files.length !== 1 ||
      !(files[0] instanceof File) ||
      [...form.keys()].some((key) => key !== "file")
    )
      return failure("unsupported");
    const file = files[0];
    if (file.size > MAX_FILE_BYTES) return failure("too_large");
    if (!file.size) return failure("empty");
    const bytes = new Uint8Array(await file.arrayBuffer());
    const extension = file.name.split(".").pop()?.toLowerCase();
    const pdf = Buffer.from(bytes.subarray(0, 8))
      .toString("ascii")
      .startsWith("%PDF-");
    const zip =
      bytes[0] === 0x50 &&
      bytes[1] === 0x4b &&
      bytes[2] === 3 &&
      bytes[3] === 4;
    const format =
      pdf && extension === "pdf"
        ? "pdf"
        : zip && extension === "docx"
          ? "docx"
          : null;
    if (!format) return failure("unsupported");
    const text = await extractText(bytes, format, controller.signal);
    return Response.json({ text }, { headers });
  } catch (error) {
    return failure(
      controller.signal.aborted
        ? "timeout"
        : error instanceof ExtractionError
          ? error.code
          : "server",
    );
  } finally {
    clearTimeout(timer);
    request.signal.removeEventListener("abort", abort);
    await reader?.cancel().catch(() => {});
    active--;
  }
}
