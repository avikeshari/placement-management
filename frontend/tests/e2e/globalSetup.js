import { execFileSync } from "node:child_process";
import path from "node:path";

export default async function globalSetup() {
  const isDeployedRun = Boolean(process.env.E2E_BASE_URL);
  const shouldSeed =
    process.env.E2E_SEED_DEMO === "true" ||
    (!isDeployedRun && process.env.E2E_SEED_DEMO !== "false");

  if (!shouldSeed) {
    console.log("E2E demo seed skipped.");
    return;
  }

  const projectRoot = path.resolve(process.cwd(), "..");
  const backendDir = path.join(projectRoot, "backend");
  const seedScript = path.join(backendDir, "scripts", "seedDemoUsers.js");

  console.log("Seeding deterministic demo data for E2E tests...");
  console.log(`Seed script: ${seedScript}`);

  // Invoke Node directly instead of npm.cmd. This avoids Windows
  // spawnSync npm.cmd EINVAL failures.
  execFileSync(
    process.execPath,
    [seedScript, "--reset"],
    {
      cwd: backendDir,
      stdio: "inherit",
      env: { ...process.env }
    }
  );

  console.log("E2E demo data is ready.");
}
