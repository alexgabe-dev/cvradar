// Kept as a native module: Next traces this file and its parser dependencies.
import { supportsExtractionRuntime } from "./runtime.mjs";
import { parentPort, workerData } from "node:worker_threads";
import yauzl from "yauzl";
import mammoth from "mammoth";
import { XMLValidator, XMLParser } from "fast-xml-parser";

// Third-party diagnostic strings can contain document data. Never forward them.
console.log =
  console.warn =
  console.error =
  console.info =
  console.debug =
    () => {};
const MAX_EXPANDED = 30 * 1024 * 1024;
const MAX_ENTRY = 10 * 1024 * 1024;
const MAX_ENTRIES = 1000;
const fail = (code) => {
  throw Object.assign(new Error(code), { code });
};

async function validateDocx(buffer) {
  const required = new Map();
  const names = new Set();
  let declared = 0,
    actual = 0,
    count = 0;
  await new Promise((resolve, reject) => {
    yauzl.fromBuffer(
      buffer,
      { lazyEntries: true, validateEntrySizes: true, strictFileNames: true },
      (error, zip) => {
        if (error) return reject(error);
        const stop = (error) => {
          zip.close();
          reject(error);
        };
        zip.on("error", stop);
        zip.on("end", resolve);
        zip.on("entry", (entry) => {
          try {
            if (
              ++count > MAX_ENTRIES ||
              entry.uncompressedSize > MAX_ENTRY ||
              (declared += entry.uncompressedSize) > MAX_EXPANDED
            )
              fail("archive_limit");
            if (names.has(entry.fileName) || entry.generalPurposeBitFlag & 1)
              fail("corrupt");
            names.add(entry.fileName);
            if (entry.fileName.endsWith("/")) {
              zip.readEntry();
              return;
            }
            zip.openReadStream(entry, (error, stream) => {
              if (error) return stop(error);
              let size = 0;
              const chunks = [];
              const xml = /\.(xml|rels)$/i.test(entry.fileName);
              stream.on("error", stop);
              stream.on("data", (chunk) => {
                size += chunk.length;
                actual += chunk.length;
                if (size > MAX_ENTRY || actual > MAX_EXPANDED) {
                  stream.destroy();
                  stop(Object.assign(new Error(), { code: "archive_limit" }));
                  return;
                }
                if (xml) chunks.push(chunk);
              });
              stream.on("end", () => {
                try {
                  if (xml) {
                    const text = Buffer.concat(chunks).toString("utf8");
                    // No DTD/entity expansion. Reject malformed XML before Mammoth.
                    if (
                      /<!DOCTYPE|<!ENTITY/i.test(text) ||
                      XMLValidator.validate(text) !== true
                    )
                      fail("corrupt");
                    if (
                      [
                        "[Content_Types].xml",
                        "word/document.xml",
                        "_rels/.rels",
                      ].includes(entry.fileName)
                    )
                      required.set(entry.fileName, text);
                  }
                  zip.readEntry();
                } catch (error) {
                  stop(error);
                }
              });
            });
          } catch (error) {
            stop(error);
          }
        });
        zip.readEntry();
      },
    );
  });
  const parser = new XMLParser({
    ignoreAttributes: false,
    processEntities: false,
  });
  if (
    !required.has("word/document.xml") ||
    !required.has("[Content_Types].xml") ||
    !required.has("_rels/.rels")
  )
    fail("unsupported");
  const types = parser.parse(required.get("[Content_Types].xml"));
  const overrides = [types.Types?.Override ?? []].flat();
  if (
    !overrides.some(
      (item) =>
        item["@_PartName"] === "/word/document.xml" &&
        item["@_ContentType"] ===
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml",
    )
  )
    fail("unsupported");
  const document = parser.parse(required.get("word/document.xml"));
  if (
    !document["w:document"] ||
    document["w:document"]["@_xmlns:w"] !==
      "http://schemas.openxmlformats.org/wordprocessingml/2006/main"
  )
    fail("unsupported");
}

async function pdfText(bytes) {
  const { getDocument } = await import("pdfjs-dist/legacy/build/pdf.mjs").catch(
    () => fail("server"),
  );
  const task = getDocument({
    data: bytes,
    isEvalSupported: false,
    enableXfa: false,
    useWorkerFetch: false,
    useSystemFonts: false,
    disableFontFace: true,
    verbosity: 0,
    stopAtErrors: true,
  });
  try {
    const pdf = await task.promise;
    if (pdf.numPages > 200) fail("output_limit");
    let text = "";
    for (let index = 1; index <= pdf.numPages; index++) {
      const page = await pdf.getPage(index);
      const reader = page.streamTextContent().getReader();
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        for (const item of value.items) {
          if (!("str" in item)) continue;
          text += item.str + (item.hasEOL ? "\n" : " ");
          if (text.length > workerData.maxTextChars) fail("output_limit");
        }
      }
      text += "\n\n";
      page.cleanup();
    }
    if (!text.trim()) fail("no_text_pdf");
    return text;
  } catch (error) {
    if (error.name === "PasswordException") fail("password");
    throw error;
  } finally {
    await task.destroy();
  }
}

try {
  if (!supportsExtractionRuntime()) fail("server");
  const bytes = new Uint8Array(workerData.bytes);
  const buffer = Buffer.from(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  let text;
  if (workerData.format === "pdf") text = await pdfText(bytes);
  else {
    await validateDocx(buffer);
    text = (
      await mammoth.extractRawText({ buffer }, { externalFileAccess: false })
    ).value;
  }
  text = text
    .replace(/\r\n?/g, "\n")
    .replace(/\u0000/g, "")
    .trim();
  if (!text) fail("empty");
  if (text.length > workerData.maxTextChars) fail("output_limit");
  parentPort.postMessage({ text });
} catch (error) {
  const allowed = [
    "server",
    "unsupported",
    "corrupt",
    "password",
    "empty",
    "no_text_pdf",
    "output_limit",
    "archive_limit",
  ];
  parentPort.postMessage({
    error: allowed.includes(error.code) ? error.code : "corrupt",
  });
}
