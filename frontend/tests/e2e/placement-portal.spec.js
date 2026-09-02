import { test, expect } from "@playwright/test";

const STUDENT_EMAIL = process.env.E2E_STUDENT_EMAIL || "student.demo@aviportal.com";
const STUDENT_PASSWORD = process.env.E2E_STUDENT_PASSWORD || "Student@123";
const COMPANY_EMAIL = process.env.E2E_COMPANY_EMAIL || "company.demo@aviportal.com";
const COMPANY_PASSWORD = process.env.E2E_COMPANY_PASSWORD || "Company@123";

async function login(page, email, password, expectedPath) {
  await page.goto("/login");
  await expect(page.getByRole("heading", { name: "Login" })).toBeVisible();
  await page.getByPlaceholder("you@example.com").fill(email);
  await page.getByPlaceholder(/password|At least 6 characters/i).fill(password);
  await page.getByRole("button", { name: "Sign In" }).click();
  await page.waitForURL(new RegExp(`${expectedPath.replaceAll("/", "\\/")}\\/?$`));
}

async function expectVisibleOrEmpty(page, locator, emptyLocator) {
  if (await locator.count()) {
    await expect(locator.first()).toBeVisible();
    return;
  }
  await expect(emptyLocator).toBeVisible();
}

// ---------------------------------------------------------------------------
// PUBLIC
// ---------------------------------------------------------------------------

test.describe("Public application smoke tests", () => {
  test("login and registration routes render", async ({ page }) => {
    await page.goto("/login");
    await expect(page.getByRole("heading", { name: "Placement Portal By Avi" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Login" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Register" })).toHaveAttribute("href", "/register");

    await page.goto("/register");
    await expect(page.getByRole("heading", { name: "Create Account" })).toBeVisible();
    await expect(page.getByPlaceholder("Your full name")).toBeVisible();
    await expect(page.getByPlaceholder("you@example.com")).toBeVisible();
    await expect(page.getByPlaceholder("At least 6 characters")).toBeVisible();
    await expect(page.getByRole("button", { name: "Create Account" })).toBeVisible();
  });

  test("unknown route renders application 404 page", async ({ page }) => {
    await page.goto("/this-route-does-not-exist");
    await expect(page.getByText(/404|page not found|not found/i).first()).toBeVisible();
  });
});

// ---------------------------------------------------------------------------
// STUDENT
// ---------------------------------------------------------------------------

test.describe("Student authenticated smoke tests", () => {
  test.beforeEach(async ({ page }) => {
    await login(page, STUDENT_EMAIL, STUDENT_PASSWORD, "/student");
  });

  test("student dashboard renders", async ({ page }) => {
    await expect(page.getByRole("heading", { name: "Student Dashboard" })).toBeVisible();
  });

  test("student can open Jobs", async ({ page }) => {
    await page.goto("/student/jobs");
    await expect(page.getByRole("heading", { name: "Find Jobs" })).toBeVisible();
    await expect(page.getByRole("button", { name: "View Full Details" }).first()).toBeVisible();
  });

  test("student can view complete job information", async ({ page }) => {
    await page.goto("/student/jobs");
    await page.getByRole("button", { name: "View Full Details" }).first().click();
    await expect(page.getByRole("heading", { name: "Job Description" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Close" })).toBeVisible();
  });

  test("student can open Applications", async ({ page }) => {
    await page.goto("/student/applications");
    await expect(page.getByRole("heading", { name: "My Applications" })).toBeVisible();
    await expect(page.getByText("Frontend Developer", { exact: true })).toBeVisible();
  });

  test("student application page exposes withdrawal functionality", async ({ page }) => {
    await page.goto("/student/applications");
    const withdraw = page.getByRole("button", { name: "Withdraw Application" });
    await expect(withdraw.first()).toBeVisible();
  });

  test("student can open Interviews", async ({ page }) => {
    await page.goto("/student/interviews");
    await expect(page.getByRole("heading", { name: "My Interviews" })).toBeVisible();
    await expect(page.getByText("Backend Developer", { exact: true })).toBeVisible();
  });

  test("student interview controls are available for pending interview", async ({ page }) => {
    await page.goto("/student/interviews");
    await expect(page.getByRole("button", { name: "Accept Interview" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Decline Interview" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Message Company" })).toBeVisible();
  });

  test("student can open Messages and see the seeded interview conversation", async ({ page }) => {
    await page.goto("/messages");
    await expect(page.getByTestId("messages-heading")).toBeVisible();
    await expect(page.getByTestId("messages-connections")).toBeVisible({ timeout: 15000 });
    await expect(page.getByTestId("conversation-item").first()).toContainText("Backend Developer");
    await expect(page.getByTestId("conversation-last-message").first()).toContainText(/interview-related communication/i);
  });

  test("student sidebar exposes required navigation", async ({ page }) => {
    const nav = page.getByTestId("sidebar-nav");
    await expect(nav).toHaveAttribute("aria-label", "student navigation");

    const expectedLinks = [
      ["Dashboard", "/student"],
      ["Profile", "/student/profile"],
      ["Jobs", "/student/jobs"],
      ["Applications", "/student/applications"],
      ["Interviews", "/student/interviews"],
      ["Messages", "/messages"]
    ];

    for (const [name, href] of expectedLinks) {
      const link = nav.locator(`a[href="${href}"]`);
      await expect(link).toHaveCount(1);
      await expect(link).toContainText(name);
    }
  });
});

// ---------------------------------------------------------------------------
// COMPANY
// ---------------------------------------------------------------------------

test.describe("Company authenticated smoke tests", () => {
  test.beforeEach(async ({ page }) => {
    await login(page, COMPANY_EMAIL, COMPANY_PASSWORD, "/company");
  });

  test("company dashboard renders", async ({ page }) => {
    await expect(page.getByRole("heading", { name: "Company Dashboard" })).toBeVisible();
  });

  test("company can open Manage Jobs", async ({ page }) => {
    await page.goto("/company/jobs");
    await expect(page.getByRole("heading", { name: "Manage Jobs" })).toBeVisible();
    await expect(page.getByText("Frontend Developer", { exact: true })).toBeVisible();
  });

  test("company can open Interviews", async ({ page }) => {
    await page.goto("/company/interviews");
    await expect(page.getByRole("heading", { name: "Interviews" })).toBeVisible();
    await expect(page.getByText("Backend Developer", { exact: true })).toBeVisible();
  });

  test("company interview page exposes meeting and cancellation controls", async ({ page }) => {
    await page.goto("/company/interviews");
    const card = page.locator("article").filter({ hasText: "Backend Developer" }).first();
    await expect(card).toBeVisible();
    await expect(card.getByRole("link", { name: "Open Meeting Link" })).toBeVisible();
    await expect(card.getByRole("button", { name: "Cancel Interview" })).toBeVisible();
    await expect(card.getByRole("link", { name: "Message Student" })).toBeVisible();
  });

  test("company can open Messages and see the seeded interview conversation", async ({ page }) => {
    await page.goto("/messages");
    await expect(page.getByTestId("messages-heading")).toBeVisible();
    await expect(page.getByTestId("messages-connections")).toBeVisible({ timeout: 15000 });
    await expect(page.getByTestId("conversation-item").first()).toContainText("Backend Developer");
    await expect(page.getByTestId("conversation-last-message").first()).toContainText(/interview-related communication/i);
  });

  test("company sidebar exposes required navigation", async ({ page }) => {
    const nav = page.getByTestId("sidebar-nav");
    await expect(nav).toHaveAttribute("aria-label", "company navigation");

    const expectedLinks = [
      ["Dashboard", "/company"],
      ["Profile", "/company/profile"],
      ["Manage Jobs", "/company/jobs"],
      ["Post Job", "/company/jobs/new"],
      ["Interviews", "/company/interviews"],
      ["Messages", "/messages"]
    ];

    for (const [name, href] of expectedLinks) {
      const link = nav.locator(`a[href="${href}"]`);
      await expect(link).toHaveCount(1);
      await expect(link).toContainText(name);
    }
  });
});
