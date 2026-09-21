import { expect, test } from "@playwright/test";

const prospectKey = "@ptown/artist-prospects/v1";
const actionKey = "@ptown/artist-prospect-actions/v1";
const prospect = {
  id: "prospect-one",
  name: "River Producer",
  track: "Production",
  market: "Paducah",
  portfolio: "Public reel",
  availability: "October",
  notes: "",
  status: "Ready for owner review",
  updatedAt: "2026-09-20T12:00:00.000Z",
};
const action = {
  id: "action-one",
  prospectId: prospect.id,
  prospectName: prospect.name,
  action: "Review reel",
  owner: "Owner",
  priority: "High",
  dueDate: "",
  completed: false,
  updatedAt: "2026-09-20T12:00:00.000Z",
};

test("Private Artist Development transfer moves prospects and follow-ups together", async ({
  browser,
  page,
}) => {
  await page.goto("/artist-prospect-backup");
  await page.evaluate(
    ({ prospectKey, actionKey, prospect, action }) => {
      localStorage.setItem(prospectKey, JSON.stringify([prospect]));
      localStorage.setItem(actionKey, JSON.stringify([action]));
    },
    { prospectKey, actionKey, prospect, action },
  );
  await page.reload();
  const code = await page
    .getByRole("textbox", {
      name: "Private Artist Development transfer code",
      exact: true,
    })
    .inputValue();
  expect(JSON.parse(code)).toMatchObject({
    type: "artist-prospect-bundle",
    prospects: [prospect],
    actions: [action],
  });
  const context = await browser.newContext();
  try {
    const other = await context.newPage();
    await other.goto("/artist-prospect-backup");
    await other
      .getByRole("textbox", {
        name: "Paste private Artist Development transfer code",
        exact: true,
      })
      .fill(code);
    await other
      .getByRole("button", {
        name: "Review private Artist Development transfer",
        exact: true,
      })
      .click();
    await expect(
      other.getByText(/1 linked · 0 unlinked history/),
    ).toBeVisible();
    expect(
      await other.evaluate((key) => localStorage.getItem(key), prospectKey),
    ).toBeNull();
    await other
      .getByRole("button", {
        name: "Replace private prospects and follow-ups together",
        exact: true,
      })
      .click();
    expect(
      await other.evaluate(
        (key) => JSON.parse(localStorage.getItem(key)!),
        prospectKey,
      ),
    ).toEqual([prospect]);
    expect(
      await other.evaluate(
        (key) => JSON.parse(localStorage.getItem(key)!),
        actionKey,
      ),
    ).toEqual([action]);
  } finally {
    await context.close();
  }
});

test("Artist Development transfer rejects invalid data and cancel preserves current device data", async ({
  page,
}) => {
  await page.goto("/artist-prospect-backup");
  await page.evaluate(
    ({ prospectKey, actionKey, prospect, action }) => {
      localStorage.setItem(prospectKey, JSON.stringify([prospect]));
      localStorage.setItem(actionKey, JSON.stringify([action]));
    },
    { prospectKey, actionKey, prospect, action },
  );
  await page.reload();
  const input = page.getByRole("textbox", {
    name: "Paste private Artist Development transfer code",
    exact: true,
  });
  await input.fill(
    JSON.stringify({
      app: "PTown Access",
      type: "artist-prospect-bundle",
      format: 1,
      prospects: [prospect],
      actions: [{ ...action, priority: "Urgent" }],
    }),
  );
  await page
    .getByRole("button", {
      name: "Review private Artist Development transfer",
      exact: true,
    })
    .click();
  await expect(page.getByRole("alert")).toContainText("could not be read");
  const code = await page
    .getByRole("textbox", {
      name: "Private Artist Development transfer code",
      exact: true,
    })
    .inputValue();
  await input.fill(code);
  await page
    .getByRole("button", {
      name: "Review private Artist Development transfer",
      exact: true,
    })
    .click();
  await page
    .getByRole("button", {
      name: "Cancel Artist Development replacement",
      exact: true,
    })
    .click();
  expect(
    await page.evaluate(
      (key) => JSON.parse(localStorage.getItem(key)!),
      prospectKey,
    ),
  ).toEqual([prospect]);
});

test("Artist Development transfer reports duplicate names, orphaned follow-ups, and name mismatches", async ({
  page,
}) => {
  const duplicate = { ...prospect, id: "duplicate", name: " river producer " };
  const orphan = {
    ...action,
    id: "orphan",
    prospectId: "missing",
    prospectName: "Removed Artist",
    action: "Archive notes",
  };
  const mismatch = {
    ...action,
    id: "mismatch",
    prospectName: "Old artist name",
    action: "Confirm fit",
  };
  await page.goto("/artist-prospect-backup");
  await page
    .getByRole("textbox", {
      name: "Paste private Artist Development transfer code",
      exact: true,
    })
    .fill(
      JSON.stringify({
        app: "PTown Access",
        type: "artist-prospect-bundle",
        format: 1,
        prospects: [prospect, duplicate],
        actions: [orphan, mismatch],
      }),
    );
  await page
    .getByRole("button", {
      name: "Review private Artist Development transfer",
      exact: true,
    })
    .click();
  await expect(
    page.getByText("3 of 3 integrity findings unresolved", { exact: true }),
  ).toBeVisible();
  await expect(page.getByText('Duplicate prospect name: River Producer', { exact: true })).toBeVisible();
  await expect(
    page.getByText("Unlinked follow-up: Archive notes", { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByText("Prospect name mismatch: Confirm fit", { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", {
      name: "Resolve 3 integrity findings before replacement",
      exact: true,
    }),
  ).toBeDisabled();
  expect(
    await page.evaluate((key) => localStorage.getItem(key), prospectKey),
  ).toBeNull();
});

test("Incoming Artist Development repairs unlock reviewed replacement", async ({
  page,
}) => {
  const orphan = {
    ...action,
    id: "orphan",
    prospectId: "missing",
    prospectName: "Removed Artist",
    action: "Archive notes",
  };
  const mismatch = {
    ...action,
    id: "mismatch",
    prospectName: "Old artist name",
    action: "Confirm fit",
  };
  await page.goto("/artist-prospect-backup");
  await page
    .getByRole("textbox", {
      name: "Paste private Artist Development transfer code",
      exact: true,
    })
    .fill(
      JSON.stringify({
        app: "PTown Access",
        type: "artist-prospect-bundle",
        format: 1,
        prospects: [prospect],
        actions: [orphan, mismatch],
      }),
    );
  await page
    .getByRole("button", {
      name: "Review private Artist Development transfer",
      exact: true,
    })
    .click();
  await page
    .getByRole("button", {
      name: "Update stored prospect name for Confirm fit",
      exact: true,
    })
    .click();
  await page.getByRole("radio", { name: prospect.name, exact: true }).click();
  await page
    .getByRole("button", { name: "Reconnect Archive notes", exact: true })
    .click();
  await expect(
    page.getByText("No relationship issues found", { exact: true }),
  ).toBeVisible();
  await page
    .getByRole("button", {
      name: "Replace private prospects and follow-ups together",
      exact: true,
    })
    .click();
  const saved = await page.evaluate(
    (key) => JSON.parse(localStorage.getItem(key)!),
    actionKey,
  );
  expect(saved).toEqual(
    expect.arrayContaining([
      expect.objectContaining({
        id: orphan.id,
        prospectId: prospect.id,
        prospectName: prospect.name,
      }),
      expect.objectContaining({ id: mismatch.id, prospectName: prospect.name }),
    ]),
  );
});

test("Explicitly retained unlinked follow-up permits replacement", async ({
  page,
}) => {
  const orphan = {
    ...action,
    id: "orphan",
    prospectId: "missing",
    prospectName: "Removed Artist",
    action: "Archive notes",
  };
  await page.goto("/artist-prospect-backup");
  await page
    .getByRole("textbox", {
      name: "Paste private Artist Development transfer code",
      exact: true,
    })
    .fill(
      JSON.stringify({
        app: "PTown Access",
        type: "artist-prospect-bundle",
        format: 1,
        prospects: [prospect],
        actions: [orphan],
      }),
    );
  await page
    .getByRole("button", {
      name: "Review private Artist Development transfer",
      exact: true,
    })
    .click();
  await page
    .getByRole("button", {
      name: "Retain Archive notes as unlinked history",
      exact: true,
    })
    .click();
  await page
    .getByRole("button", {
      name: "Replace private prospects and follow-ups together",
      exact: true,
    })
    .click();
  const receipt = await page
    .getByRole("textbox", {
      name: "Private Artist Development transfer receipt",
      exact: true,
    })
    .inputValue();
  expect(receipt).toContain("Private prospects replaced: 1");
  expect(receipt).toContain("Unlinked history retained: 1");
  expect(receipt).toContain("Initial integrity findings: 1");
  expect(receipt).toContain(
    "Retained “Archive notes” as unlinked private history.",
  );
  expect(
    await page.evaluate(
      (key) => JSON.parse(localStorage.getItem(key)!),
      actionKey,
    ),
  ).toEqual([orphan]);
});

test("Clean Artist Development transfer creates a no-repairs receipt", async ({
  page,
}) => {
  await page.goto("/artist-prospect-backup");
  await page
    .getByRole("textbox", {
      name: "Paste private Artist Development transfer code",
      exact: true,
    })
    .fill(
      JSON.stringify({
        app: "PTown Access",
        type: "artist-prospect-bundle",
        format: 1,
        prospects: [prospect],
        actions: [action],
      }),
    );
  await page
    .getByRole("button", {
      name: "Review private Artist Development transfer",
      exact: true,
    })
    .click();
  await page
    .getByRole("button", {
      name: "Replace private prospects and follow-ups together",
      exact: true,
    })
    .click();
  const receipt = await page
    .getByRole("textbox", {
      name: "Private Artist Development transfer receipt",
      exact: true,
    })
    .inputValue();
  expect(receipt).toContain("Linked follow-ups: 1");
  expect(receipt).toContain("Initial integrity findings: 0");
  expect(receipt).toContain("No repairs or retention decisions were needed.");
});
