(function () {
  function dismiss() {
    document.querySelectorAll(".loading-screen--route-boundary").forEach(function (el) {
      el.remove();
    });
  }

  if (document.querySelector("#main-content")) dismiss();

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", dismiss);
  } else {
    dismiss();
  }

  setTimeout(dismiss, 4000);
})();
