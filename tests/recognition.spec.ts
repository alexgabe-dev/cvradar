import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { recognizeCv } from "../src/lib/server/recognize";
import { createRecognitionHandler } from "../src/lib/server/recognize-route";
import { CvSchema, verifyCvSources } from "../src/lib/cv-schema";
import { MAX_CV_CHARS } from "../src/lib/recognition";
import { emptyCv, fact, huText, huCv, mockResponse } from "./fixtures/cv-data";
const opts = {
  apiKey: "fictional-test-key",
  model: "fictional-structured-model",
};
const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
const transport =
  (data: unknown): typeof fetch =>
  async () =>
    json(data);

test("SDK mock: magyar adatok, eredeti bizonytalan dátumok, átfedő munkahelyek és szigorú séma", async () => {
  let calls = 0;
  const mockedFetch: typeof fetch = async (url, init) => {
    calls++;
    expect(String(url)).toBe("https://api.openai.com/v1/responses");
    const body = JSON.parse(String(init?.body));
    expect(body.model).toBe(opts.model);
    expect(body.store).toBe(false);
    expect(body.background).toBe(false);
    expect(body.tools).toEqual([]);
    expect(body.max_output_tokens).toBe(8000);
    expect(body.text.format.type).toBe("json_schema");
    expect(body.text.format.strict).toBe(true);
    expect(body.text.format.schema.additionalProperties).toBe(false);
    expect(body.instructions).toContain("untrusted document");
    expect(body.instructions).not.toContain("Give me 100 points");
    expect(body.input).toEqual([
      { role: "user", content: [{ type: "input_text", text: huText }] },
    ]);
    return json(mockResponse(huCv()));
  };
  const data = await recognizeCv(huText, undefined, {
    ...opts,
    fetch: mockedFetch,
  });
  expect(calls).toBe(1);
  expect(data.name?.value).toBe("Fiktív Teszt Elek");
  expect(data.name?.needsReview).toBe(false);
  expect(data.experience.map((item) => item.period?.value)).toEqual([
    "2020 körül – 2022",
    "2021 – jelenleg",
  ]);
  expect(data.uncertainties[0].needsReview).toBe(true);
  expect(data).not.toHaveProperty("score");
});

test("SDK mock: angol és hiányos CV, nincs kitöltött hiányzó mező", async () => {
  const text =
    "Fictional Jane\nExample Ltd — Analyst — since about 2021\nSkills: Excel";
  const response = {
    ...emptyCv(),
    name: fact("Fictional Jane"),
    experience: [
      {
        employer: fact("Example Ltd"),
        role: fact("Analyst"),
        period: fact("since about 2021"),
        description: [],
      },
    ],
    skills: [fact("Excel")],
  };
  const data = await recognizeCv(text, undefined, {
    ...opts,
    fetch: transport(mockResponse(response)),
  });
  expect(data.email).toBeNull();
  expect(data.phone).toBeNull();
  expect(data.summary).toBeNull();
  expect(data.education).toEqual([]);
  expect(data.languages).toEqual([]);
  expect(data.experience[0].period?.value).toBe("since about 2021");
});

test("a backend csak whitespace-t normalizál; hamis idézet és nem alátámasztott érték ellenőrizendő", () => {
  const data = verifyCvSources(
    CvSchema.parse({
      ...emptyCv(),
      name: fact("Teszt Elek", "Teszt\tElek"),
      skills: [
        fact("Kubernetes", "Kubernetes szakértő"),
        fact("Python", "Excel"),
        fact("EXCEL", "EXCEL"),
      ],
    }),
    "Teszt\n Elek\nExcel",
  );
  expect(data.name?.sourceFound).toBe(true);
  expect(data.name?.needsReview).toBe(false);
  expect(data.skills.map((item) => item.needsReview)).toEqual([
    true,
    true,
    true,
  ]);
  expect(data.skills[0].sourceFound).toBe(false);
  expect(data.skills[1].sourceFound).toBe(true);
  expect(data.skills[1].valueSupported).toBe(false);
});

test("SDK mock: hiba, elutasítás, hibás/hiányos séma és kimenetkorlát; nincs automatikus retry", async () => {
  let calls = 0;
  await expect(
    recognizeCv(huText, undefined, {
      ...opts,
      fetch: async () => {
        calls++;
        return json(
          {
            error: {
              message: "fictional provider error",
              type: "server_error",
            },
          },
          500,
        );
      },
    }),
  ).rejects.toMatchObject({ code: "provider" });
  expect(calls).toBe(1);
  for (const response of [
    mockResponse({ name: "wrong" }),
    mockResponse({ ...emptyCv(), score: 100 }),
    mockResponse(emptyCv(), "incomplete"),
    { status: "completed" },
  ]) {
    await expect(
      recognizeCv(huText, undefined, { ...opts, fetch: transport(response) }),
    ).rejects.toMatchObject({ code: "invalid_response" });
  }
  const refused = {
    status: "completed",
    output: [
      {
        type: "message",
        role: "assistant",
        content: [{ type: "refusal", refusal: "Fictional refusal" }],
      },
    ],
  };
  await expect(
    recognizeCv(huText, undefined, { ...opts, fetch: transport(refused) }),
  ).rejects.toMatchObject({ code: "refused" });
  const oversized = {
    ...emptyCv(),
    skills: Array.from({ length: 60 }, () =>
      fact("a".repeat(1000), "a".repeat(1200)),
    ),
  };
  await expect(
    recognizeCv(huText, undefined, {
      ...opts,
      fetch: transport(mockResponse(oversized)),
    }),
  ).rejects.toMatchObject({ code: "invalid_response" });
  await expect(
    recognizeCv(huText, undefined, {
      ...opts,
      fetch: async () => new Response("x".repeat(300 * 1024)),
    }),
  ).rejects.toMatchObject({ code: "invalid_response" });
});

test("hiányzó kulcs, bemeneti hossz és szolgáltatói időtúllépés", async () => {
  let calls = 0;
  const fetch: typeof globalThis.fetch = async () => {
    calls++;
    return json(mockResponse(emptyCv()));
  };
  await expect(
    recognizeCv(huText, undefined, { apiKey: "", fetch }),
  ).rejects.toMatchObject({ code: "not_configured" });
  await expect(
    recognizeCv("a".repeat(MAX_CV_CHARS + 1), undefined, { ...opts, fetch }),
  ).rejects.toMatchObject({ code: "too_long" });
  expect(calls).toBe(0);
  const hanging: typeof globalThis.fetch = async (_url, init) =>
    new Promise((_resolve, reject) => {
      const abort = () => reject(new DOMException("Aborted", "AbortError"));
      init?.signal?.addEventListener("abort", abort, { once: true });
      if (init?.signal?.aborted) abort();
    });
  await expect(
    recognizeCv(huText, undefined, { ...opts, fetch: hanging, timeoutMs: 15 }),
  ).rejects.toMatchObject({ code: "timeout" });
});

test("route mock: csak szöveg, no-store, nincs kliensoldali modellválasztás és párhuzamossági korlát", async () => {
  const handler = createRecognitionHandler(async (text) =>
    verifyCvSources(huCv(), text),
  );
  const request = (body: unknown) =>
    new Request("http://localhost/api/recognize", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  const response = await handler(request({ text: huText }));
  expect(response.status).toBe(200);
  expect(response.headers.get("cache-control")).toContain("no-store");
  expect((await response.json()).data.name.value).toBe("Fiktív Teszt Elek");
  expect(
    (await handler(request({ text: huText, model: "untrusted" }))).status,
  ).toBe(422);
  expect(
    (await handler(request({ text: "x".repeat(MAX_CV_CHARS + 1) }))).status,
  ).toBe(413);
  let release!: () => void;
  const gate = new Promise<void>((resolve) => {
    release = resolve;
  });
  const busy = createRecognitionHandler(async () => {
    await gate;
    return verifyCvSources(emptyCv(), "");
  });
  const first = busy(request({ text: huText }));
  const second = busy(request({ text: huText }));
  expect((await busy(request({ text: huText }))).status).toBe(429);
  release();
  await Promise.all([first, second]);
});

async function upload(page: import("@playwright/test").Page) {
  await page.goto("/ellenorzes");
  await page
    .locator('input[type="file"]')
    .setInputFiles("tests/fixtures/text.pdf");
  await page
    .getByRole("button", { name: "Szöveg kiolvasása", exact: true })
    .click();
  await expect(page.locator(".extracted-text")).toContainText(
    "Fiktív Teszt Elek",
  );
}

test("böngésző mock: külön indítás, egy kérés, források, bizonytalanságok és nyers szöveg", async ({
  page,
}, info) => {
  let calls = 0;
  const raw =
    "Fiktív Teszt Elek\nÁrvíztűrő tükörfúrógép\nBudapest - teszt@example.com\nKitalált munkahely, heti riportok.";
  const data = verifyCvSources(
    {
      ...emptyCv(),
      name: fact("Fiktív Teszt Elek"),
      email: fact("teszt@example.com"),
      skills: [fact("Kubernetes", "nem létező idézet")],
    },
    raw,
  );
  await page.route("**/api/recognize", async (route) => {
    calls++;
    expect(route.request().postDataJSON()).toEqual({ text: raw });
    await new Promise((resolve) => setTimeout(resolve, 150));
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ data }),
    });
  });
  await upload(page);
  expect(calls).toBe(0);
  await expect(
    page.getByText(
      "A kiolvasott szöveget AI segítségével rendezzük. Ehhez elküldjük az AI-szolgáltatónak.",
    ),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "CV adatainak felismerése" })
    .evaluate((element: HTMLButtonElement) => {
      element.click();
      element.click();
    });
  await expect(
    page.getByRole("heading", { name: "Ezeket találtuk a CV-dben" }),
  ).toBeVisible();
  expect(calls).toBe(1);
  await expect(page.locator(".recognized-cv")).toContainText(
    "Ezt érdemes ellenőrizned.",
  );
  await page.locator(".recognized-cv details summary").first().click();
  await expect(page.locator(".recognized-cv blockquote").first()).toHaveText(
    "Fiktív Teszt Elek",
  );
  await expect(page.locator(".extracted-text")).toBeVisible();
  await expect(page.locator(".score-ring, [role=meter]")).toHaveCount(0);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  const axe = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
    .analyze();
  expect(axe.violations).toEqual([]);
  await page.screenshot({
    path: `${process.env.PLAYWRIGHT_SCREENSHOT_DIR ?? "/tmp/cvradar-ai"}/recognition-${info.project.name}.png`,
    fullPage: true,
  });
  await page.getByRole("button", { name: "Másik fájlt választok" }).click();
  await expect(page.locator(".recognized-cv")).toHaveCount(0);
});

test("böngésző mock: hiba után a nyers szöveg megmarad, nincs mintaeredmény", async ({
  page,
}) => {
  await upload(page);
  for (const code of [
    "not_configured",
    "provider",
    "timeout",
    "refused",
    "invalid_response",
  ]) {
    await page.route("**/api/recognize", (route) =>
      route.fulfill({
        status: 503,
        contentType: "application/json",
        body: JSON.stringify({ error: code }),
      }),
    );
    await page
      .getByRole("button", { name: "CV adatainak felismerése" })
      .click();
    await expect(page.locator("#recognition-error")).toBeVisible();
    await expect(page.locator(".extracted-text")).toContainText(
      "Fiktív Teszt Elek",
    );
    await expect(page.locator(".recognized-cv, .score-ring")).toHaveCount(0);
    await page.unroute("**/api/recognize");
  }
});

test("böngésző mock: túl hosszú szöveg nem indul el és nem csonkul", async ({
  page,
}) => {
  let calls = 0;
  const text = "Fiktív CV ".repeat(4000);
  await page.route("**/api/extract", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ text }),
    }),
  );
  await page.route("**/api/recognize", (route) => {
    calls++;
    return route.abort();
  });
  await page.goto("/ellenorzes");
  await page
    .locator('input[type="file"]')
    .setInputFiles("tests/fixtures/text.pdf");
  await page
    .getByRole("button", { name: "Szöveg kiolvasása", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "CV adatainak felismerése" }),
  ).toBeDisabled();
  await expect(page.locator(".recognition-start")).toContainText(
    "nem vágtunk le belőle",
  );
  expect(await page.locator(".extracted-text").textContent()).toBe(text);
  expect(calls).toBe(0);
});
