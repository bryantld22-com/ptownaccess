import { expect, test } from "@playwright/test";

const prospectKey = "@ptown/artist-prospects/v1";
const actionKey = "@ptown/artist-prospect-actions/v1";

test("Artist Development dashboard summarizes readiness, tracks, priority, and timing", async ({
  page,
}) => {
  const prospects = [
    {
      id: "ready",
      name: "River Producer",
      track: "Production",
      market: "Paducah",
      portfolio: "Public reel",
      availability: "October",
      notes: "",
      status: "Ready for owner review",
      updatedAt: "2026-09-20T12:00:00.000Z",
    },
    {
      id: "needs",
      name: "Sunday Vocalist",
      track: "Performance",
      market: "",
      portfolio: "",
      availability: "",
      notes: "",
      status: "New lead",
      updatedAt: "2026-09-20T12:00:00.000Z",
    },
  ];
  const actions = [
    {
      id: "overdue",
      prospectId: "ready",
      prospectName: "River Producer",
      action: "Review reel",
      owner: "Owner",
      priority: "High",
      dueDate: "2020-01-01",
      completed: false,
      updatedAt: "2026-09-20T12:00:00.000Z",
    },
    {
      id: "untimed",
      prospectId: "needs",
      prospectName: "Sunday Vocalist",
      action: "Collect public materials",
      owner: "Owner",
      priority: "Normal",
      dueDate: "",
      completed: false,
      updatedAt: "2026-09-20T12:00:00.000Z",
    },
  ];
  await page.goto("/artist-development-dashboard");
  await page.evaluate(
    ({ prospectKey, actionKey, prospects, actions }) => {
      localStorage.setItem(prospectKey, JSON.stringify(prospects));
      localStorage.setItem(actionKey, JSON.stringify(actions));
    },
    { prospectKey, actionKey, prospects, actions },
  );
  await page.reload();
  await expect(
    page.getByRole("heading", {
      name: "See the whole development pipeline.",
      exact: true,
    }),
  ).toBeVisible();
  await expect(page.getByText("Ready for review").locator("..")).toContainText(
    "1",
  );
  await expect(
    page.getByText("Overdue", { exact: true }).locator(".."),
  ).toContainText("1");
  await expect(
    page.getByText("No timing entered", { exact: true }).locator(".."),
  ).toContainText("1");
  await expect(
    page.getByText("Production", { exact: true }).locator(".."),
  ).toContainText("1 private prospect");
  await expect(
    page.getByText("New lead", { exact: true }).locator(".."),
  ).toContainText("1");
  await expect(
    page
      .getByText("Ready for owner review", { exact: true })
      .first()
      .locator(".."),
  ).toContainText("1");
  await expect(page.getByText("River Producer", { exact: true })).toBeVisible();
  await expect(
    page.getByText("Sunday Vocalist", { exact: true }),
  ).toBeVisible();
  await page.getByRole("tab", { name: "Production", exact: true }).click();
  await page
    .getByRole("tab", { name: "Ready for owner review", exact: true })
    .click();
  await page.getByRole("tab", { name: "Overdue", exact: true }).click();
  await expect(page).toHaveURL(/track=Production/);
  await expect(page).toHaveURL(/attention=Overdue/);
  await expect(page).toHaveURL(/status=Ready/);
  await expect(
    page.getByText("1 of 2 private prospects shown", { exact: true }),
  ).toBeVisible();
  const report = await page
    .getByRole("textbox", {
      name: "Private Artist Development pipeline report",
      exact: true,
    })
    .inputValue();
  expect(report).toContain(
    "View: Production · Ready for owner review · Overdue · Urgency",
  );
  expect(report).toContain("River Producer · Production");
  expect(report).not.toContain("Sunday Vocalist · Performance");
  await page.reload();
  await expect(
    page.getByRole("tab", { name: "Production", exact: true }),
  ).toHaveAttribute("aria-selected", "true");
  await expect(
    page.getByRole("tab", { name: "Overdue", exact: true }),
  ).toHaveAttribute("aria-selected", "true");
  await expect(
    page.getByRole("tab", { name: "Ready for owner review", exact: true }),
  ).toHaveAttribute("aria-selected", "true");
  await page
    .getByRole("link", { name: "Open River Producer follow-ups", exact: true })
    .click();
  await expect(page).toHaveURL("/artist-prospect-actions?prospect=ready");
});

test("Artist Development pipeline sort is shareable and changes the owner report order", async ({
  page,
}) => {
  const prospects = [
    {
      id: "older",
      name: "Alpha Artist",
      track: "Performance",
      market: "Paducah",
      portfolio: "Reel",
      availability: "Fall",
      notes: "",
      status: "Ready for owner review",
      updatedAt: "2026-09-18T12:00:00.000Z",
    },
    {
      id: "newer",
      name: "Zulu Artist",
      track: "Production",
      market: "Paducah",
      portfolio: "Reel",
      availability: "Fall",
      notes: "",
      status: "Ready for owner review",
      updatedAt: "2026-09-20T12:00:00.000Z",
    },
  ];
  await page.goto("/artist-development-dashboard");
  await page.evaluate(
    ({ prospectKey, actionKey, prospects }) => {
      localStorage.setItem(prospectKey, JSON.stringify(prospects));
      localStorage.setItem(actionKey, JSON.stringify([]));
    },
    { prospectKey, actionKey, prospects },
  );
  await page.reload();
  await page
    .getByRole("tab", { name: "Recently updated", exact: true })
    .click();
  await expect(page).toHaveURL(/sort=Recently%20updated/);
  const recentReport = await page
    .getByRole("textbox", {
      name: "Private Artist Development pipeline report",
      exact: true,
    })
    .inputValue();
  expect(recentReport.indexOf("Zulu Artist")).toBeLessThan(
    recentReport.indexOf("Alpha Artist"),
  );
  await page.getByRole("tab", { name: "Name", exact: true }).click();
  const nameReport = await page
    .getByRole("textbox", {
      name: "Private Artist Development pipeline report",
      exact: true,
    })
    .inputValue();
  expect(nameReport.indexOf("Alpha Artist")).toBeLessThan(
    nameReport.indexOf("Zulu Artist"),
  );
  await page.reload();
  await expect(
    page.getByRole("tab", { name: "Name", exact: true }),
  ).toHaveAttribute("aria-selected", "true");
});

test("Artist Development pipeline report copies the filtered owner view", async ({
  page,
  context,
}) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.goto("/artist-development-dashboard");
  await page.evaluate(
    ({ prospectKey, actionKey }) => {
      localStorage.setItem(
        prospectKey,
        JSON.stringify([
          {
            id: "one",
            name: "Kitchen Artist",
            track: "Culinary",
            market: "Paducah",
            portfolio: "Menu",
            availability: "Fall",
            notes: "",
            status: "Ready for owner review",
            updatedAt: "2026-09-20T12:00:00.000Z",
          },
        ]),
      );
      localStorage.setItem(actionKey, JSON.stringify([]));
    },
    { prospectKey, actionKey },
  );
  await page.reload();
  await page.getByRole("tab", { name: "Culinary", exact: true }).click();
  await page
    .getByRole("button", {
      name: "Copy private Artist Development pipeline report",
      exact: true,
    })
    .click();
  await expect(
    page.getByText("Private Artist Development pipeline report copied.", {
      exact: true,
    }),
  ).toBeVisible();
  expect(await page.evaluate(() => navigator.clipboard.readText())).toContain(
    "Kitchen Artist · Culinary",
  );
});

test("Artist Development hub links to the private pipeline dashboard", async ({
  page,
}) => {
  await page.goto("/artist-development");
  await page
    .getByRole("link", {
      name: "Open private Artist Development pipeline",
      exact: true,
    })
    .click();
  await expect(page).toHaveURL("/artist-development-dashboard");
});
