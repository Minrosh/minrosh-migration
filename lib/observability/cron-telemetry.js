import { randomUUID } from "node:crypto";
import { readCronRuns, writeCronRuns } from "@/lib/admin/json-store";
import { obsLogger } from "./logger";

function keepRecentRuns(runs) {
  return runs.slice(0, 1000);
}

function appendRun(entry) {
  const store = readCronRuns();
  const runs = Array.isArray(store.runs) ? [...store.runs] : [];
  runs.unshift(entry);
  writeCronRuns({ runs: keepRecentRuns(runs) });
}

export async function runWithCronTelemetry({ requestId, jobName, run }) {
  const startedAt = new Date();
  const jobRunId = randomUUID();
  obsLogger.info("cron_run_started", { requestId, jobRunId, jobName, startedAt: startedAt.toISOString() });
  try {
    const result = await run({ jobRunId, startedAt });
    const finishedAt = new Date();
    const durationMs = finishedAt.getTime() - startedAt.getTime();
    const entry = {
      id: jobRunId,
      jobName,
      requestId: requestId || "",
      startedAt: startedAt.toISOString(),
      finishedAt: finishedAt.toISOString(),
      durationMs,
      status: "ok",
      resultSummary: result?.summary || {},
    };
    appendRun(entry);
    obsLogger.info("cron_run_finished", entry);
    return { jobRunId, startedAt: entry.startedAt, finishedAt: entry.finishedAt, durationMs, result };
  } catch (error) {
    const finishedAt = new Date();
    const durationMs = finishedAt.getTime() - startedAt.getTime();
    const entry = {
      id: jobRunId,
      jobName,
      requestId: requestId || "",
      startedAt: startedAt.toISOString(),
      finishedAt: finishedAt.toISOString(),
      durationMs,
      status: "error",
      error: String(error?.message || "cron_run_failed").slice(0, 400),
    };
    appendRun(entry);
    obsLogger.error("cron_run_failed", { ...entry, error });
    throw error;
  }
}
