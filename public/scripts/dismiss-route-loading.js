(function () {
  var BUILD_KEY = "minrosh-build-id";
  var RELOAD_KEY = "minrosh-build-reload";
  var STUCK_KEY = "minrosh-stuck-reload";

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

  function isStuck() {
    var overlay = document.querySelector(".loading-screen--route-boundary");
    if (overlay && overlay.offsetParent !== null) return true;
    var text = (document.body && document.body.innerText) || "";
    if (text.indexOf("Preparing your migration portal") >= 0) {
      var main = document.querySelector("#main-content");
      if (!main || main.getBoundingClientRect().height < 48) return true;
    }
    return false;
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", dismiss);
  } else {
    dismiss();
  }

  setTimeout(dismiss, 1500);
  setTimeout(function () {
    if (isStuck() && sessionStorage.getItem(STUCK_KEY) !== "1") {
      sessionStorage.setItem(STUCK_KEY, "1");
      var url = new URL(window.location.href);
      url.searchParams.set("__v", String(Date.now()));
      window.location.replace(url.toString());
    }
  }, 4500);
})();
