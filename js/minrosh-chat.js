/**
 * Minrosh Chat — simple UI that talks to OpenAI via a same-origin proxy (see server.mjs).
 * Optional: set window.MINROSH_CHAT_API = '/api/chat' (default).
 * Do not put API keys in this file.
 */
(function () {
  var API_URL =
    (typeof window.MINROSH_CHAT_API === "string" && window.MINROSH_CHAT_API) || "/api/chat";

  var root = document.getElementById("minrosh-chat");
  if (!root) return;

  var logEl = root.querySelector("[data-chat-log]");
  var form = root.querySelector("[data-chat-form]");
  var input = root.querySelector("[data-chat-input]");
  var sendBtn = root.querySelector("[data-chat-send]");
  var errEl = root.querySelector("[data-chat-error]");

  /** History sent to the server (no system message here — server adds it). */
  var history = [];

  function setError(msg) {
    if (errEl) {
      errEl.textContent = msg || "";
      errEl.hidden = !msg;
    }
  }

  function appendMessage(role, text) {
    var row = document.createElement("div");
    row.className = "minrosh-chat__msg minrosh-chat__msg--" + role;
    var bubble = document.createElement("div");
    bubble.className = "minrosh-chat__bubble";
    bubble.textContent = text;
    row.appendChild(bubble);
    logEl.appendChild(row);
    logEl.scrollTop = logEl.scrollHeight;
  }

  function parseAssistantContent(data) {
    if (!data || typeof data !== "object") return null;
    var c = data.choices && data.choices[0];
    if (c && c.message && typeof c.message.content === "string") return c.message.content.trim();
    if (data.error && typeof data.error.message === "string") return null;
    return null;
  }

  function send(userText) {
    setError("");
    sendBtn.disabled = true;
    appendMessage("user", userText);
    history.push({ role: "user", content: userText });

    return fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ messages: history }),
    })
      .then(function (res) {
        return res.json().then(function (data) {
          if (!res.ok) {
            var msg =
              (data && data.error) ||
              (data && data.message) ||
              "Request failed (" + res.status + ").";
            throw new Error(typeof msg === "string" ? msg : JSON.stringify(msg));
          }
          return data;
        });
      })
      .then(function (data) {
        var text = parseAssistantContent(data);
        if (!text) throw new Error("Unexpected response from assistant.");
        appendMessage("assistant", text);
        history.push({ role: "assistant", content: text });
      })
      .catch(function (e) {
        history.pop();
        if (logEl && logEl.lastElementChild) logEl.removeChild(logEl.lastElementChild);
        setError(e.message || "Could not reach the assistant. Run the local server (see server.mjs).");
      })
      .finally(function () {
        sendBtn.disabled = false;
        if (input) input.focus();
      });
  }

  function onSubmit(e) {
    e.preventDefault();
    var text = input && input.value ? input.value.trim() : "";
    if (!text) return;
    input.value = "";
    send(text);
  }

  if (form) form.addEventListener("submit", onSubmit);

  appendMessage(
    "assistant",
    "Hi — I’m the Minrosh Migration Assistant. Ask about Australian visa pathways in plain language. " +
      "This is general information only; confirm details with a registered migration professional."
  );
})();
