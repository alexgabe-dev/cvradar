import { expect, test, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const screenshotDirectory =
  process.env.PLAYWRIGHT_SCREENSHOT_DIR ?? "screenshots";

const pdf = {
  name: "anna-cv.pdf",
  mimeType: "application/pdf",
  buffer: Buffer.concat([
    Buffer.from("%PDF-1.4 demo fixture"),
    Buffer.alloc(241 * 1024),
  ]),
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
    "Ne csak elküldd.",
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
  await expect(faq).toContainText("Nem olvassuk ki");
  await page.getByRole("link", { name: "Megnézem egy példán" }).click();
  await expect(page).toHaveURL(/\/mintaelemzes$/);
  await expect(
    page.getByRole("heading", { name: "Van mire építened." }),
  ).toBeVisible();
  expect(errors).toEqual([]);
});

test("fájlválasztás: típus, méret, üres fájl, csere, eltávolítás és határérték", async ({
  page,
}) => {
  await page.goto("/ellenorzes");
  await expect(page.getByText("Ez egy kipróbálható demó.")).toBeVisible();
  await page.getByRole("button", { name: "Mintaelemzés megnyitása" }).click();
  await expect(page.locator("#file-error")).toContainText("Először válassz");
  const input = page.locator('input[type="file"]');
  await input.setInputFiles({
    name: "cv.txt",
    mimeType: "text/plain",
    buffer: Buffer.from("text"),
  });
  await expect(page.locator("#file-error")).toContainText(
    "fájltípus nem támogatott",
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
  await expect(page.getByText("Húzd ide az önéletrajzodat.")).toBeVisible();
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
  await page.getByRole("link", { name: "Megnézem fájl nélkül" }).click();
  await expect(page).toHaveURL(/\/mintaelemzes$/);
});

test("teljes demó: fájl és hirdetés nem kerül hálózatra vagy tartós tárolóba", async ({
  page,
}, info) => {
  await page.goto("/");
  await page
    .getByRole("link", { name: "Önéletrajz feltöltése", exact: true })
    .first()
    .click();
  await expect(page).toHaveURL(/\/ellenorzes$/);
  const posts: string[] = [];
  const leaked: string[] = [];
  page.on("request", (request) => {
    if (request.method() === "POST") posts.push(request.url());
    if (
      `${request.url()} ${request.postData() ?? ""}`.includes(
        "Marketingkoordinátort keresünk",
      )
    )
      leaked.push(request.url());
  });
  await page.evaluate(() => {
    File.prototype.text = () => {
      throw new Error("A fájlt nem szabad kiolvasni.");
    };
    File.prototype.arrayBuffer = () => {
      throw new Error("A fájlt nem szabad kiolvasni.");
    };
  });
  const before = await page.evaluate(() => ({
    local: { ...localStorage },
    session: { ...sessionStorage },
  }));
  await page.locator('input[type="file"]').setInputFiles(pdf);
  await page
    .getByLabel("Álláshirdetés", { exact: false })
    .fill(
      "Marketingkoordinátort keresünk heti közösségimédia-feladatokhoz. Elvárás az Excel-ismeret és a kampányriportálási tapasztalat.",
    );
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({
    path: `${screenshotDirectory}/upload-${info.project.name}.png`,
    fullPage: true,
  });
  await page.getByRole("button", { name: "Mintaelemzés megnyitása" }).click();
  await expect(page).toHaveURL(/\/mintaelemzes\?hirdetes=megadva$/);
  await expect(page.locator(".job-match")).toContainText(
    "nem értékeli ki a bemásolt tartalmat",
  );
  await expect(page.locator(".job-match")).not.toContainText(/\d/);
  expect(posts).toEqual([]);
  expect(leaked).toEqual([]);
  expect(
    await page.evaluate(() => ({
      local: { ...localStorage },
      session: { ...sessionStorage },
    })),
  ).toEqual(before);
  await noOverflow(page);
  await page
    .getByRole("link", { name: "Vissza a feltöltéshez", exact: false })
    .first()
    .click();
  await expect(page.locator(".selected-filename")).toHaveCount(0);
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
    page.getByRole("heading", { name: "Mit sikerült kiolvasni?" }),
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
