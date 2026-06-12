(function () {
  function revealMain() {
    var main = document.querySelector("#main-content");
    if (main && main.hasAttribute("hidden")) {
      main.removeAttribute("hidden");
    }
    document.querySelectorAll('[id^="S:"][hidden]').forEach(function (node) {
      node.removeAttribute("hidden");
    });
  }

  function dismiss() {
    var hasMain = Boolean(document.querySelector("#main-content"));
    document.querySelectorAll(".loading-screen--route-boundary").forEach(function (el) {
      el.style.setProperty("display", "none", "important");
      el.style.pointerEvents = "none";
      el.setAttribute("aria-hidden", "true");
    });
    if (hasMain) {
      revealMain();
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", dismiss);
  } else {
    dismiss();
  }

  setTimeout(dismiss, 4000);
})();
