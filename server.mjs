/**
 * Dev server: static files + POST /api/chat → OpenAI Chat Completions.
 * Usage (PowerShell): $env:OPENAI_API_KEY="sk-..."; node server.mjs
 * Or: set OPENAI_API_KEY and run: node server.mjs
 */
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.PORT) || 3000;
const OPENAI_KEY = process.env.OPENAI_API_KEY;

const SYSTEM_PROMPT =
  "You are the Minrosh Migration Assistant. Help users find Australian visa pathways based on the latest 2026 Department of Home Affairs guidelines.";

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json",
  ".ico": "image/x-icon",
  ".png": "image/png",
  ".svg": "image/svg+xml",
};

function sendJson(res, status, obj) {
  const body = JSON.stringify(obj);
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Content-Length": Buffer.byteLength(body),
  });
  res.end(body);
}

async function handleChat(req, res) {
  if (!OPENAI_KEY) {
    sendJson(res, 500, {
      error: "OPENAI_API_KEY is not set. Set it in the environment before starting the server.",
    });
    return;
  }

  let raw = "";
  for await (const chunk of req) raw += chunk;

  let body;
  try {
    body = JSON.parse(raw || "{}");
  } catch {
    sendJson(res, 400, { error: "Invalid JSON body" });
    return;
  }

  const incoming = Array.isArray(body.messages) ? body.messages : [];
  const model = typeof body.model === "string" ? body.model : "gpt-4o-mini";

  const messages = [{ role: "system", content: SYSTEM_PROMPT }].concat(
    incoming.filter(function (m) {
      return m && (m.role === "user" || m.role === "assistant") && typeof m.content === "string";
    })
  );

  try {
    const r = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + OPENAI_KEY,
      },
      body: JSON.stringify({ model, messages, temperature: 0.6 }),
    });

    const data = await r.json();
    res.writeHead(r.status, { "Content-Type": "application/json; charset=utf-8" });
    res.end(JSON.stringify(data));
  } catch (e) {
    sendJson(res, 502, { error: String(e && e.message ? e.message : e) });
  }
}

function serveStatic(req, res) {
  let urlPath = new URL(req.url, "http://localhost").pathname;
  if (urlPath === "/") urlPath = "/index.html";

  const relative = urlPath.replace(/^\/+/, "").replace(/(\.\.(\/|\\|$))+/g, "");
  const filePath = path.join(__dirname, relative);
  const normalizedRoot = path.resolve(__dirname);
  const relToRoot = path.relative(normalizedRoot, filePath);
  if (relToRoot.startsWith("..") || path.isAbsolute(relToRoot)) {
    res.writeHead(403);
    res.end();
    return;
  }

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, { "Content-Type": "text/plain" });
      res.end("Not found");
      return;
    }
    const ext = path.extname(filePath).toLowerCase();
    res.writeHead(200, { "Content-Type": MIME[ext] || "application/octet-stream" });
    res.end(data);
  });
}

const server = http.createServer((req, res) => {
  if (req.method === "OPTIONS" && req.url === "/api/chat") {
    res.writeHead(204, {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    });
    res.end();
    return;
  }

  if (req.method === "POST" && req.url === "/api/chat") {
    handleChat(req, res).catch((e) => sendJson(res, 500, { error: String(e) }));
    return;
  }

  if (req.method === "GET") {
    serveStatic(req, res);
    return;
  }

  res.writeHead(405, { "Content-Type": "text/plain" });
  res.end("Method not allowed");
});

server.listen(PORT, () => {
  console.log("Minrosh site: http://localhost:" + PORT);
  console.log("POST /api/chat requires OPENAI_API_KEY");
});
