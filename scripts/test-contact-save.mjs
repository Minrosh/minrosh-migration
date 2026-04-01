import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { spawn } from "node:child_process";

async function waitForServer(url, timeoutMs = 20000) {
  const started = Date.now();
  while (Date.now() - started < timeoutMs) {
    try {
      const response = await fetch(url);
      if (response.ok || response.status === 404) {
        return;
      }
    } catch {}
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  throw new Error("Next.js server did not start in time.");
}

async function main() {
  const tempDir = await mkdtemp(path.join(tmpdir(), "minrosh-contact-test-"));
  const enquiriesFile = path.join(tempDir, "data-enquiries.json");
  const port = 3210;

  const child = spawn(
    process.execPath,
    [path.resolve("node_modules", "next", "dist", "bin", "next"), "dev", "-p", String(port)],
    {
      cwd: path.resolve("."),
      env: {
        ...process.env,
        PORT: String(port),
        ENQUIRIES_FILE: enquiriesFile,
        SMTP_HOST: "",
        SMTP_USER: "",
        SMTP_PASS: "",
      },
      stdio: ["ignore", "pipe", "pipe"],
    }
  );

  let stderr = "";
  child.stderr.on("data", (chunk) => {
    stderr += chunk.toString();
  });

  try {
    await waitForServer(`http://127.0.0.1:${port}`);

    const payload = {
      firstName: "Test",
      lastName: "User",
      email: "test@example.com",
      phone: "0400000000",
      preferredCountry: "Australia",
      mainNeed: "Skilled Migration",
      message: "Please confirm this enquiry is written to disk.",
      quizSummary: "Estimated points: 70",
    };

    const response = await fetch(`http://127.0.0.1:${port}/api/contact`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(payload),
    });

    const body = await response.json();
    if (!response.ok || !body.ok) {
      throw new Error(`Unexpected response: ${response.status} ${JSON.stringify(body)}`);
    }

    const saved = JSON.parse(await readFile(enquiriesFile, "utf8"));
    if (!Array.isArray(saved) || saved.length !== 1) {
      throw new Error("Expected exactly one saved enquiry.");
    }

    if (saved[0].email !== payload.email || saved[0].message !== payload.message) {
      throw new Error("Saved enquiry content does not match the submitted payload.");
    }

    console.log("PASS: Contact enquiry was saved to disk.");
  } finally {
    child.kill("SIGTERM");
    await new Promise((resolve) => setTimeout(resolve, 500));
    if (!child.killed) {
      child.kill("SIGKILL");
    }
    await rm(tempDir, { recursive: true, force: true });
    if (stderr.trim()) {
      console.error(stderr.trim());
    }
  }
}

main().catch((error) => {
  console.error("FAIL:", error.message);
  process.exitCode = 1;
});
