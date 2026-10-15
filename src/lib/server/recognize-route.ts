import { recognizeCv, RecognitionError } from "./recognize";
import {
  AI_TIMEOUT_MS,
  MAX_CV_CHARS,
  recognitionMessages,
  type RecognitionErrorCode,
} from "../recognition";
const headers = {
  "Cache-Control": "no-store, private, max-age=0",
  "X-Content-Type-Options": "nosniff",
};
const statuses: Partial<Record<RecognitionErrorCode, number>> = {
  too_long: 413,
  not_configured: 503,
  busy: 429,
  timeout: 504,
  provider: 502,
  invalid_response: 502,
};
const failure = (code: RecognitionErrorCode) =>
  Response.json(
    { error: code, message: recognitionMessages[code] },
    { status: statuses[code] ?? 422, headers },
  );

export function createRecognitionHandler(
  recognize: typeof recognizeCv = recognizeCv,
) {
  let active = 0;
  return async (request: Request) => {
    if (active >= 2) return failure("busy");
    const origin = request.headers.get("origin");
    if (origin) {
      try {
        if (new URL(origin).host !== request.headers.get("host"))
          return failure("invalid");
      } catch {
        return failure("invalid");
      }
    }
    if (
      request.headers.get("content-type")?.split(";")[0].trim() !==
      "application/json"
    )
      return failure("invalid");
    active++;
    const controller = new AbortController();
    const abort = () => controller.abort();
    const timer = setTimeout(abort, AI_TIMEOUT_MS + 5000);
    request.signal.addEventListener("abort", abort, { once: true });
    if (request.signal.aborted) abort();
    const reader = request.body?.getReader();
    try {
      const work = async () => {
        if (!reader) throw new RecognitionError("invalid");
        const chunks: Uint8Array[] = [];
        let size = 0;
        for (;;) {
          const { done, value } = await reader.read();
          if (done) break;
          size += value.byteLength;
          if (size > MAX_CV_CHARS * 6 + 1024)
            throw new RecognitionError("too_long");
          chunks.push(value);
        }
        let data: unknown;
        try {
          data = JSON.parse(Buffer.concat(chunks).toString("utf8"));
        } catch {
          throw new RecognitionError("invalid");
        }
        if (
          !data ||
          typeof data !== "object" ||
          Object.keys(data).length !== 1 ||
          !("text" in data) ||
          typeof data.text !== "string" ||
          !data.text.trim()
        )
          throw new RecognitionError("invalid");
        if (data.text.length > MAX_CV_CHARS)
          throw new RecognitionError("too_long");
        if (controller.signal.aborted) throw new RecognitionError("timeout");
        return recognize(data.text, controller.signal);
      };
      const result = await Promise.race([
        work(),
        new Promise<never>((_, reject) => {
          const timedOut = () => reject(new RecognitionError("timeout"));
          controller.signal.addEventListener("abort", timedOut, { once: true });
          if (controller.signal.aborted) timedOut();
        }),
      ]);
      return Response.json({ data: result }, { headers });
    } catch (error) {
      return failure(
        error instanceof RecognitionError ? error.code : "provider",
      );
    } finally {
      clearTimeout(timer);
      request.signal.removeEventListener("abort", abort);
      await reader?.cancel().catch(() => {});
      active--;
    }
  };
}
