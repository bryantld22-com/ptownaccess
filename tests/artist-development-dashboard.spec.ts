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
  await expect(page.getByText("River Producer", { exact: true })).toBeVisible();
  await expect(
    page.getByText("Sunday Vocalist", { exact: true }),
  ).toBeVisible();
  await page
    .getByRole("link", { name: "Open River Producer follow-ups", exact: true })
    .click();
  await expect(page).toHaveURL("/artist-prospect-actions?prospect=ready");
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
