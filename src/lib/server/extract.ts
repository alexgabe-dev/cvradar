// Load the native constructor at runtime: Turbopack must not bundle the parser
// worker or forward Next.js globals into its isolated runtime.
const { Worker } = process.getBuiltinModule("node:worker_threads");
import path from "node:path";
import {
  EXTRACTION_TIMEOUT_MS,
  MAX_TEXT_CHARS,
  type ExtractionErrorCode,
} from "../extraction";

export class ExtractionError extends Error {
  constructor(public code: ExtractionErrorCode) {
    super(code);
  }
}

export function extractText(
  bytes: Uint8Array,
  format: "pdf" | "docx",
  signal?: AbortSignal,
  timeoutMs = EXTRACTION_TIMEOUT_MS,
): Promise<string> {
  return new Promise((resolve, reject) => {
    const worker = new Worker(
      path.join(process.cwd(), "src/lib/server/extract-worker.mjs"),
      {
        workerData: { bytes, format, maxTextChars: MAX_TEXT_CHARS },
        execArgv: [],
        resourceLimits: {
          maxOldGenerationSizeMb: 128,
          maxYoungGenerationSizeMb: 16,
          stackSizeMb: 4,
        },
        stdout: true,
        stderr: true,
      },
    );
    worker.stdout.resume();
    worker.stderr.resume();
    let settled = false;
    const finish = (error?: ExtractionError, text?: string) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      signal?.removeEventListener("abort", abort);
      // Termination is awaited: no parser continues after timeout/error/success.
      void worker.terminate().finally(() => {
        if (error) reject(error);
        else resolve(text!);
      });
    };
    const abort = () => finish(new ExtractionError("timeout"));
    const timer = setTimeout(abort, timeoutMs);
    signal?.addEventListener("abort", abort, { once: true });
    if (signal?.aborted) abort();
    worker.on("message", (message) => {
      if (message.error) finish(new ExtractionError(message.error));
      else if (
        typeof message.text !== "string" ||
        message.text.length > MAX_TEXT_CHARS
      )
        finish(new ExtractionError("output_limit"));
      else finish(undefined, message.text);
    });
    worker.on("error", () => finish(new ExtractionError("server")));
    worker.on("exit", () => {
      if (!settled) finish(new ExtractionError("server"));
    });
  });
}
