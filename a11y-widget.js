(function () {
  "use strict";

  var STORAGE_KEY = "homenetip-a11y";
  var TEXT_SIZES = ["a11y-text-lg", "a11y-text-xl"];

  function loadState() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
    } catch (e) {
      return {};
    }
  }

  function saveState(state) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      /* ignore storage errors (private mode, quota) */
    }
  }

  function applyState(state) {
    var html = document.documentElement;
    TEXT_SIZES.forEach(function (cls) { html.classList.remove(cls); });
    if (state.textSize) html.classList.add(state.textSize);
    document.body.classList.toggle("a11y-contrast", !!state.contrast);
    document.body.classList.toggle("a11y-stop-anim", !!state.stopAnim);
  }

  function buildWidget() {
    var state = loadState();

    var wrap = document.createElement("div");
    wrap.className = "a11y-widget";

    var toggle = document.createElement("button");
    toggle.type = "button";
    toggle.className = "a11y-toggle";
    toggle.setAttribute("aria-haspopup", "true");
    toggle.setAttribute("aria-expanded", "false");
    toggle.setAttribute("aria-label", "Accessibility options");
    toggle.textContent = "♿";

    var panel = document.createElement("div");
    panel.className = "a11y-panel";
    panel.setAttribute("role", "menu");
    panel.setAttribute("aria-label", "Accessibility options");

    var title = document.createElement("div");
    title.className = "a11y-title";
    title.textContent = "Accessibility";
    panel.appendChild(title);

    function makeButton(label, pressed, onClick) {
      var btn = document.createElement("button");
      btn.type = "button";
      btn.textContent = label;
      btn.setAttribute("aria-pressed", pressed ? "true" : "false");
      btn.addEventListener("click", onClick);
      panel.appendChild(btn);
      return btn;
    }

    var textLgBtn = makeButton("A+ Larger text", state.textSize === "a11y-text-lg", function () {
      state.textSize = state.textSize === "a11y-text-lg" ? null : "a11y-text-lg";
      persistAndRefresh();
    });
    var textXlBtn = makeButton("A++ Largest text", state.textSize === "a11y-text-xl", function () {
      state.textSize = state.textSize === "a11y-text-xl" ? null : "a11y-text-xl";
      persistAndRefresh();
    });
    var contrastBtn = makeButton("High contrast", !!state.contrast, function () {
      state.contrast = !state.contrast;
      persistAndRefresh();
    });
    var stopAnimBtn = makeButton("Stop animations", !!state.stopAnim, function () {
      state.stopAnim = !state.stopAnim;
      persistAndRefresh();
    });
    makeButton("Reset", false, function () {
      state = {};
      persistAndRefresh();
    });

    function persistAndRefresh() {
      applyState(state);
      saveState(state);
      textLgBtn.setAttribute("aria-pressed", state.textSize === "a11y-text-lg" ? "true" : "false");
      textXlBtn.setAttribute("aria-pressed", state.textSize === "a11y-text-xl" ? "true" : "false");
      contrastBtn.setAttribute("aria-pressed", state.contrast ? "true" : "false");
      stopAnimBtn.setAttribute("aria-pressed", state.stopAnim ? "true" : "false");
    }

    toggle.addEventListener("click", function () {
      var open = panel.classList.toggle("open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });

    document.addEventListener("click", function (e) {
      if (!wrap.contains(e.target)) {
        panel.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
      }
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && panel.classList.contains("open")) {
        panel.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
        toggle.focus();
      }
    });

    wrap.appendChild(toggle);
    wrap.appendChild(panel);
    document.body.appendChild(wrap);

    applyState(state);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", buildWidget);
  } else {
    buildWidget();
  }
})();
