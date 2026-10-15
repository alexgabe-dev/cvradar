import { supportsExtractionRuntime } from "../src/lib/server/runtime.mjs";
import { POST } from "../src/app/api/extract/route";
import { test, expect } from "@playwright/test";
import { readFileSync } from "node:fs";
import { extractText, ExtractionError } from "../src/lib/server/extract";

const mime = (name: string) =>
  name.endsWith("pdf")
    ? "application/pdf"
    : "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
const fixture = (name: string) => ({
  name,
  mimeType: mime(name),
  buffer: readFileSync(`tests/fixtures/${name}`),
});

test("szerver: PDF/DOCX, ékezetek, tényleges formátum és korlátok", async ({
  request,
}) => {
  for (const name of ["text.pdf", "text.docx"]) {
    const response = await request.post("/api/extract", {
      multipart: { file: fixture(name) },
    });
    expect(response.status()).toBe(200);
    expect(response.headers()["cache-control"]).toContain("no-store");
    const body = await response.json();
    expect(body.text).toContain("Árvíztűrő tükörfúrógép");
    expect(body.text).toContain("\n");
    expect(body).not.toHaveProperty("score");
  }
  for (const [name, code] of [
    ["blank.docx", "empty"],
    ["not-word.docx", "unsupported"],
    ["blank.pdf", "no_text_pdf"],
    ["image.pdf", "no_text_pdf"],
    ["protected.pdf", "password"],
    ["oversized-content.docx", "archive_limit"],
    ["long-text.docx", "output_limit"],
  ]) {
    const response = await request.post("/api/extract", {
      multipart: { file: fixture(name) },
    });
    expect(response.status()).toBe(422);
    expect((await response.json()).error).toBe(code);
    expect(response.headers()["cache-control"]).toContain("no-store");
  }
  for (const [file, code] of [
    [
      {
        name: "fake.pdf",
        mimeType: "application/pdf",
        buffer: Buffer.from("not a PDF"),
      },
      "unsupported",
    ],
    [
      {
        name: "fake.docx",
        mimeType: mime("docx"),
        buffer: readFileSync("tests/fixtures/text.pdf"),
      },
      "unsupported",
    ],
    [
      {
        name: "broken.pdf",
        mimeType: "application/pdf",
        buffer: Buffer.from("%PDF-1.7\nbroken"),
      },
      "corrupt",
    ],
    [
      {
        name: "broken.docx",
        mimeType: mime("docx"),
        buffer: Buffer.from([80, 75, 3, 4, 0, 0]),
      },
      "corrupt",
    ],
    [
      {
        name: "empty.pdf",
        mimeType: "application/pdf",
        buffer: Buffer.alloc(0),
      },
      "empty",
    ],
    [
      {
        name: "large.pdf",
        mimeType: "application/pdf",
        buffer: Buffer.alloc(10 * 1024 * 1024 + 1),
      },
      "too_large",
    ],
  ] as const) {
    const response = await request.post("/api/extract", {
      multipart: { file },
    });
    expect((await response.json()).error).toBe(code);
  }
  // Client MIME is not trusted: valid bytes still work with an unhelpful MIME.
  const valid = await request.post("/api/extract", {
    multipart: {
      file: { ...fixture("text.pdf"), mimeType: "application/octet-stream" },
    },
  });
  expect(valid.status()).toBe(200);
  // An exact 10 MiB document is accepted (PDF trailing whitespace is legal).
  const pdf = readFileSync("tests/fixtures/text.pdf");
  const boundary = await request.post("/api/extract", {
    multipart: {
      file: {
        name: "boundary.pdf",
        mimeType: "application/pdf",
        buffer: Buffer.concat([
          pdf,
          Buffer.alloc(10 * 1024 * 1024 - pdf.length, 32),
        ]),
      },
    },
  });
  expect(boundary.status()).toBe(200);
});

test("a worker időkorlátja ténylegesen megszakítja a feldolgozást", async () => {
  await expect(
    extractText(
      new Uint8Array(readFileSync("tests/fixtures/text.pdf")),
      "pdf",
      undefined,
      1,
    ),
  ).rejects.toMatchObject({ code: "timeout" });
  expect(new ExtractionError("timeout").message).toBe("timeout");
});

test("DOCX a böngészőben, ártalmatlan szövegmegjelenítés és új fájl", async ({
  page,
}) => {
  await page.goto("/ellenorzes");
  await page.locator('input[type="file"]').setInputFiles(fixture("text.docx"));
  await page
    .getByRole("button", { name: "Szöveg kiolvasása", exact: true })
    .click();
  await expect(page.locator(".extracted-text")).toContainText(
    "Árvíztűrő tükörfúrógép",
  );
  await page.getByRole("button", { name: "Másik fájlt választok" }).click();
  await page
    .locator('input[type="file"]')
    .setInputFiles(fixture("literal.docx"));
  await page
    .getByRole("button", { name: "Szöveg kiolvasása", exact: true })
    .click();
  await expect(page.locator(".extracted-text")).toContainText("<script>");
  expect(await page.evaluate(() => "__documentExecuted" in window)).toBe(false);
});

test("felületi hibák: sérült, képes, védett PDF, időtúllépés és hálózat", async ({
  page,
}) => {
  await page.goto("/ellenorzes");
  for (const [file, message] of [
    [
      {
        name: "broken.pdf",
        mimeType: "application/pdf",
        buffer: Buffer.from("%PDF-1.7\nbroken"),
      },
      "sérült",
    ],
    [fixture("image.pdf"), "nincs OCR"],
    [fixture("protected.pdf"), "jelszóval védett"],
  ] as const) {
    await page.locator('input[type="file"]').setInputFiles(file);
    await page
      .getByRole("button", { name: "Szöveg kiolvasása", exact: true })
      .click();
    await expect(page.locator("#file-error")).toContainText(message);
    await expect(page.locator(".score-ring")).toHaveCount(0);
  }
  await page.locator('input[type="file"]').setInputFiles(fixture("text.pdf"));
  await page.route("**/api/extract", (route) =>
    route.fulfill({
      status: 408,
      contentType: "application/json",
      body: JSON.stringify({ error: "timeout" }),
    }),
  );
  await page
    .getByRole("button", { name: "Szöveg kiolvasása", exact: true })
    .click();
  await expect(page.locator("#file-error")).toContainText("túl sokáig");
  await page.unroute("**/api/extract");
  await page.route("**/api/extract", (route) => route.abort());
  await page
    .getByRole("button", { name: "Szöveg kiolvasása", exact: true })
    .click();
  await expect(page.locator("#file-error")).toContainText(
    "Nem sikerült elérni",
  );
  await page.unroute("**/api/extract");
  await page.route("**/api/extract", (route) =>
    route.fulfill({
      status: 502,
      contentType: "text/html",
      body: "upstream unavailable",
    }),
  );
  await page
    .getByRole("button", { name: "Szöveg kiolvasása", exact: true })
    .click();
  await expect(page.locator("#file-error")).toContainText("A szerver most");
});

test("a szerver a tényleges bodyméretet is korlátozza Content-Length nélkül", async () => {
  let cancelled = false;
  const body = new ReadableStream<Uint8Array>({
    start(controller) {
      controller.enqueue(new Uint8Array(10 * 1024 * 1024 + 64 * 1024 + 1));
    },
    cancel() {
      cancelled = true;
    },
  });
  const request = new Request("http://localhost/api/extract", {
    method: "POST",
    headers: { "Content-Type": "multipart/form-data; boundary=fictional" },
    body,
    duplex: "half",
  } as RequestInit);
  const response = await POST(request);
  expect(response.status).toBe(413);
  expect((await response.json()).error).toBe("too_large");
  expect(cancelled).toBe(true);
  expect(response.headers.get("cache-control")).toContain("no-store");
});

test("a PDF-runtime követelmény nem fogad el Node 20-at vagy túl régi Node 22-t", () => {
  for (const version of ["20.19.2", "22.12.0"])
    expect(supportsExtractionRuntime(version)).toBe(false);
  for (const version of ["22.13.0", "24.4.1", "24.21.0"])
    expect(supportsExtractionRuntime(version)).toBe(true);
});
