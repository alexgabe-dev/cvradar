import { expect, test, type Page } from "@playwright/test";
import { readFileSync } from "node:fs";
import AxeBuilder from "@axe-core/playwright";

const screenshotDirectory =
  process.env.PLAYWRIGHT_SCREENSHOT_DIR ?? "screenshots";

const pdf = {
  name: "anna-cv.pdf",
  mimeType: "application/pdf",
  buffer: readFileSync("tests/fixtures/text.pdf"),
};
const docx = {
  name: "anna-cv-uj.docx",
  mimeType:
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  buffer: Buffer.from("demo fixture"),
};

async function noOverflow(page: Page) {
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
}

test("landing, navigáció, mobilmenü, GYIK és példa CTA", async ({
  page,
}, info) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "Küldés előtt",
  );
  await page.evaluate(() => document.fonts.ready);
  await noOverflow(page);
  await page.screenshot({
    path: `${screenshotDirectory}/landing-${info.project.name}.png`,
    fullPage: true,
  });
  await page.screenshot({
    path: `${screenshotDirectory}/hero-${info.project.name}.png`,
  });
  const mobile = info.project.name === "mobile";
  if (mobile) {
    await page.getByRole("button", { name: "Menü megnyitása" }).click();
    await expect(
      page.getByRole("button", { name: "Menü bezárása" }),
    ).toHaveAttribute("aria-expanded", "true");
    await page.keyboard.press("Escape");
    await expect(
      page.getByRole("button", { name: "Menü megnyitása" }),
    ).toBeFocused();
  }
  for (const [link, hash] of [
    ["Így működik", "igy-mukodik"],
    ["Mit vizsgálunk?", "mit-vizsgalunk"],
    ["Árak", "arak"],
  ]) {
    if (mobile)
      await page.getByRole("button", { name: "Menü megnyitása" }).click();
    const navigation = page.getByRole("navigation", {
      name: mobile ? "Mobil navigáció" : "Fő navigáció",
      exact: true,
    });
    await navigation.getByRole("link", { name: link, exact: true }).click();
    await expect(page).toHaveURL(new RegExp(`#${hash}$`));
    if (mobile)
      await expect(
        page.getByRole("button", { name: "Menü megnyitása" }),
      ).toHaveAttribute("aria-expanded", "false");
  }
  const faq = page.locator("details").last();
  await faq.locator("summary").click();
  await expect(faq).toHaveAttribute("open", "");
  await expect(faq).toContainText("nem tároljuk tartósan");
  const hero = page.locator(".hero");
  await expect(
    hero.getByText(
      "Most szövegkinyerést és egy külön mintaelemzést tudsz kipróbálni.",
    ),
  ).toBeVisible();
  await expect(
    hero.getByRole("link", { name: "Megnézem a mintaelemzést" }),
  ).toHaveAttribute("href", "/mintaelemzes");
  await hero.getByRole("link", { name: "Megnézem a mintaelemzést" }).click();
  await expect(page).toHaveURL(/\/mintaelemzes$/);
  await expect(
    page.getByRole("heading", { name: "3 javítandó részlet" }),
  ).toBeVisible();
  expect(errors).toEqual([]);
});

test("fájlválasztás: típus, méret, üres fájl, csere, eltávolítás és határérték", async ({
  page,
}) => {
  await page.goto("/ellenorzes");
  await expect(
    page.getByText("Valódi szövegkinyerés, értékelés nélkül."),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Szöveg kiolvasása", exact: true })
    .click();
  await expect(page.locator("#file-error")).toContainText("Először válassz");
  const input = page.locator('input[type="file"]');
  await input.setInputFiles({
    name: "cv.txt",
    mimeType: "text/plain",
    buffer: Buffer.from("text"),
  });
  await expect(page.locator("#file-error")).toContainText(
    "fájltípust nem tudod kiválasztani",
  );
  await input.setInputFiles({
    ...pdf,
    buffer: Buffer.alloc(10 * 1024 * 1024 + 1),
  });
  await expect(page.locator("#file-error")).toContainText("nagyobb 10 MB-nál");
  await input.setInputFiles({ ...pdf, buffer: Buffer.alloc(0) });
  await expect(page.locator("#file-error")).toContainText("fájl üres");
  await input.setInputFiles({ ...pdf, buffer: Buffer.alloc(10 * 1024 * 1024) });
  await expect(page.locator(".selected-filename")).toHaveText(pdf.name);
  await expect(page.locator(".file-size")).toContainText("10 MB");
  await expect(page.locator("#file-error")).toHaveCount(0);
  await input.setInputFiles(docx);
  await expect(page.locator(".selected-filename")).toHaveText(docx.name);
  await input.setInputFiles({
    name: "bad.exe",
    mimeType: "application/octet-stream",
    buffer: Buffer.from("bad"),
  });
  await expect(page.locator("#file-error")).toBeVisible();
  await expect(page.locator(".selected-filename")).toHaveText(docx.name);
  await page.getByRole("button", { name: "Eltávolítás" }).click();
  await expect(page.locator(".selected-filename")).toHaveCount(0);
  await expect(
    page.getByText("Húzz ide egy PDF- vagy DOCX-fájlt."),
  ).toBeVisible();
  await noOverflow(page);
});

test("drag-and-drop, több fájl és feltöltés nélküli továbblépés", async ({
  page,
}) => {
  await page.goto("/ellenorzes");
  const multiple = await page.evaluateHandle(() => {
    const data = new DataTransfer();
    data.items.add(new File(["one"], "one.pdf", { type: "application/pdf" }));
    data.items.add(new File(["two"], "two.pdf", { type: "application/pdf" }));
    return data;
  });
  await page
    .locator(".dropzone")
    .dispatchEvent("drop", { dataTransfer: multiple });
  await expect(page.locator("#file-error")).toContainText("Egyszerre egy");
  const single = await page.evaluateHandle(() => {
    const data = new DataTransfer();
    data.items.add(
      new File(["demo"], "behuzott-cv.pdf", { type: "application/pdf" }),
    );
    return data;
  });
  await page
    .locator(".dropzone")
    .dispatchEvent("drop", { dataTransfer: single });
  await expect(page.locator(".selected-filename")).toHaveText(
    "behuzott-cv.pdf",
  );
  await page
    .locator("main")
    .getByRole("link", { name: "Megnézem a mintaelemzést" })
    .click();
  await expect(page).toHaveURL(/\/mintaelemzes$/);
});

test("valódi feltöltés: csak a fájl kerül hálózatra, nincs tartós tárolás vagy demópontszám", async ({
  page,
}, info) => {
  await page.goto("/");
  await page
    .getByRole("link", { name: "Kiolvasom a saját CV-m szövegét", exact: true })
    .first()
    .click();
  await expect(page).toHaveURL(/\/ellenorzes$/);
  const posts: string[] = [];
  const leaked: string[] = [];
  page.on("request", (request) => {
    if (request.method() === "POST")
      posts.push(new URL(request.url()).pathname);
    if (
      `${request.url()} ${request.postData() ?? ""}`.includes(
        "HIRDETES_TITKOS_FIKTIV",
      )
    )
      leaked.push(request.url());
  });
  const before = await page.evaluate(() => ({
    local: { ...localStorage },
    session: { ...sessionStorage },
  }));
  await page.locator('input[type="file"]').setInputFiles(pdf);
  await page
    .getByLabel("Álláshirdetés", { exact: false })
    .fill("HIRDETES_TITKOS_FIKTIV marketingkoordinátor");
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({
    path: `${screenshotDirectory}/upload-${info.project.name}.png`,
    fullPage: true,
  });
  await page
    .getByRole("button", { name: "Szöveg kiolvasása", exact: true })
    .click();
  await expect(
    page.getByRole("heading", {
      name: "Ezt a szöveget sikerült kiolvasnunk a dokumentumból.",
    }),
  ).toBeVisible();
  await expect(page.locator(".extracted-text")).toContainText(
    "Árvíztűrő tükörfúrógép",
  );
  await expect(page.locator(".selected-filename")).toHaveText(pdf.name);
  await expect(
    page.locator(".score-ring, .sample-badge, [role=meter]"),
  ).toHaveCount(0);
  expect(posts).toEqual(["/api/extract"]);
  expect(leaked).toEqual([]);
  expect(
    await page.evaluate(() => ({
      local: { ...localStorage },
      session: { ...sessionStorage },
    })),
  ).toEqual(before);
  await noOverflow(page);
  await page.screenshot({
    path: `${screenshotDirectory}/extraction-${info.project.name}.png`,
    fullPage: true,
  });
  await page.getByRole("button", { name: "Másik fájlt választok" }).click();
  await expect(page.locator(".selected-filename")).toHaveCount(0);
  await expect(page.getByLabel("Álláshirdetés", { exact: false })).toHaveValue(
    "",
  );
});

test("közvetlen mintaelemzés, részpontszámok és hirdetés nélküli állapot", async ({
  page,
}, info) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/mintaelemzes");
  await expect(page.locator(".sample-badge")).toHaveText("Mintaelemzés");
  await expect(page.locator(".score-ring")).toContainText("82");
  await expect(page.getByRole("meter")).toHaveCount(3);
  await expect(page.locator(".improvement")).toHaveCount(3);
  await expect(
    page.getByRole("heading", {
      name: "Milyen adatok szerepelnek a mintában?",
    }),
  ).toBeVisible();
  await expect(page.locator(".job-match")).toContainText(
    "Nincs megadott álláshirdetés",
  );
  await expect(page.locator(".job-match")).not.toContainText(/\d/);
  await noOverflow(page);
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({
    path: `${screenshotDirectory}/report-${info.project.name}.png`,
    fullPage: true,
  });
  expect(errors).toEqual([]);
});

test("billentyűzet, csökkentett mozgás és hozzáférhetőség mindhárom oldalon", async ({
  page,
}) => {
  const issues = [];
  for (const route of ["/", "/ellenorzes", "/mintaelemzes"]) {
    await page.goto(route);
    await page.keyboard.press("Tab");
    await expect(
      page.getByRole("link", { name: "Ugrás a tartalomra" }),
    ).toBeFocused();
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
      .analyze();
    issues.push(
      ...results.violations.map((item) => ({
        route,
        id: item.id,
        nodes: item.nodes.map((node) => ({
          target: node.target,
          summary: node.failureSummary,
        })),
      })),
    );
    await noOverflow(page);
  }
  await page.goto("/");
  expect(
    await page
      .locator(".scan-light")
      .evaluate((element) => getComputedStyle(element).display),
  ).toBe("none");
  expect(issues.length, JSON.stringify(issues, null, 2)).toBe(0);
});
