// Composition — the inline enhancement script (contract's `X10`, `X9`).
//
// Not part of Composition's public surface (the contract closes that to
// `composeApex`, `composeMiss`, `composeTestimonials` and `foldRoutes`) — this
// is `foldRoutes`'s own internal helper, imported by `./fold` alone.
//
// The returned string is plain, hand-written vanilla JavaScript with no
// import, no template compilation and no build step (S12's *Depends on*
// forbids a framework, a bundler or a minifier). It knows nothing about
// Content: every project, sentence and testimonial it touches is read from
// the DOM the response body already carries, never interpolated, so this
// module imports nothing from Content and the string below names no project,
// no quote and no author (S12.2). It is wrapped in its own `try`/`catch` so a
// defect in it degrades to the pre-S12, CSS-only fold rather than to a
// broken page (S12.10), and it never writes a literal `class="` attribute
// into markup it builds — every element it creates is styled with inline
// `style` properties drawn from the token custom properties already declared
// on `:root`, so nothing here is visible to `stylesheetFor` or
// `assertStyleAgreement`'s class scan (both read the same raw body text this
// script travels inside of).
//
// Three behaviours, each additive over markup already in the DOM:
//   - the shared nav's `#apex`/`#testimonials` links swap the two folded
//     views directly, instead of leaving the browser to write the fragment
//     and let `:target` do it;
//   - a search box and one filter chip per lifecycle stage hide and reveal
//     `.entry` elements already under `#echo-system`, never adding or
//     removing a project;
//   - a "Details" button per ecosystem entry opens a focus-trapped overlay
//     built from that entry's own already-rendered markup, cloned rather than
//     re-authored.
export function enhancementScript(): string {
  return `(function () {
  "use strict";
  try {
    var doc = document;
    var page = doc.querySelector(".page");
    if (!page) return;

    function views() {
      return {
        apex: doc.querySelector('[data-view="apex"]'),
        testimonials: doc.querySelector('[data-view="testimonials"]'),
      };
    }

    function switchView(name) {
      var v = views();
      if (!v.apex || !v.testimonials) return;
      var showApex = name === "apex";
      v.apex.hidden = !showApex;
      v.testimonials.hidden = showApex;
    }

    doc.addEventListener("click", function (event) {
      var el = event.target;
      if (!el || typeof el.closest !== "function") return;
      var link = el.closest('a[href="#apex"], a[href="#testimonials"]');
      if (!link) return;
      event.preventDefault();
      switchView(link.getAttribute("href") === "#apex" ? "apex" : "testimonials");
    });

    var ecosystem = doc.getElementById("echo-system");
    if (ecosystem) initEcosystemFilter(ecosystem);

    function initEcosystemFilter(root) {
      var groups = [];
      var children = root.children;
      for (var i = 0; i < children.length; i++) {
        var child = children[i];
        if (child.tagName === "DIV" && child.querySelector("h3")) groups.push(child);
      }
      if (groups.length === 0) return;

      var entries = [];
      var stages = [];
      groups.forEach(function (group) {
        var heading = group.querySelector("h3");
        var stageName = heading.textContent.replace(/\\s*\\([0-9]+\\)\\s*$/, "").trim();
        stages.push(stageName);
        var groupEntries = group.querySelectorAll(".entry");
        for (var j = 0; j < groupEntries.length; j++) {
          entries.push({ el: groupEntries[j], stage: stageName });
        }
      });
      if (entries.length === 0) return;

      var controls = doc.createElement("div");
      controls.style.cssText =
        "display:flex;flex-wrap:wrap;gap:0.6rem;align-items:center;margin:0 0 var(--space-0);";

      var searchInput = doc.createElement("input");
      searchInput.type = "search";
      searchInput.placeholder = "Search projects";
      searchInput.setAttribute("aria-label", "Search projects");
      searchInput.style.cssText =
        "background:var(--bg);color:var(--fg);border:1px solid var(--rule);" +
        "border-radius:0.3rem;padding:0.4rem 0.6rem;font:inherit;flex:1 1 12rem;";
      controls.appendChild(searchInput);

      var chipsWrap = doc.createElement("div");
      chipsWrap.style.cssText = "display:flex;flex-wrap:wrap;gap:0.4rem;";
      controls.appendChild(chipsWrap);

      var activeStage = null;
      var chips = [];

      function styleChip(chip, active) {
        chip.style.cssText =
          "font:inherit;padding:0.3rem 0.7rem;border-radius:999px;" +
          "border:1px solid var(--rule);cursor:pointer;background:" +
          (active ? "var(--fg)" : "transparent") +
          ";color:" +
          (active ? "var(--bg)" : "var(--fg)") +
          ";";
      }

      var seen = {};
      stages.forEach(function (stage) {
        if (seen[stage]) return;
        seen[stage] = true;
        var chip = doc.createElement("button");
        chip.type = "button";
        chip.textContent = stage;
        chip.setAttribute("aria-pressed", "false");
        styleChip(chip, false);
        chip.addEventListener("click", function () {
          activeStage = activeStage === stage ? null : stage;
          chips.forEach(function (entry) {
            var pressed = entry.stage === activeStage;
            entry.chip.setAttribute("aria-pressed", pressed ? "true" : "false");
            styleChip(entry.chip, pressed);
          });
          applyFilter();
        });
        chips.push({ stage: stage, chip: chip });
        chipsWrap.appendChild(chip);
      });

      root.insertBefore(controls, groups[0]);

      var emptyMessage = doc.createElement("p");
      emptyMessage.textContent = "No projects match your search.";
      emptyMessage.hidden = true;
      emptyMessage.style.cssText = "color:var(--fg-muted);";
      root.insertBefore(emptyMessage, groups[0]);

      function applyFilter() {
        var query = searchInput.value.trim().toLowerCase();
        var visibleCount = 0;
        entries.forEach(function (item) {
          var text = item.el.textContent.toLowerCase();
          var matchesQuery = query === "" || text.indexOf(query) !== -1;
          var matchesStage = activeStage === null || item.stage === activeStage;
          var visible = matchesQuery && matchesStage;
          item.el.hidden = !visible;
          if (visible) visibleCount++;
        });
        groups.forEach(function (group) {
          var groupEntries = group.querySelectorAll(".entry");
          var anyVisible = false;
          for (var k = 0; k < groupEntries.length; k++) {
            if (!groupEntries[k].hidden) {
              anyVisible = true;
              break;
            }
          }
          group.hidden = !anyVisible;
        });
        emptyMessage.hidden = visibleCount !== 0;
      }

      searchInput.addEventListener("input", applyFilter);
    }

    initDetailOverlay();

    function initDetailOverlay() {
      var entries = doc.querySelectorAll("#echo-system .entry");
      if (entries.length === 0) return;

      var overlay = null;
      var lastTrigger = null;

      function focusableIn(node) {
        return node.querySelectorAll(
          'button, [href], input, [tabindex]:not([tabindex="-1"])',
        );
      }

      function onKeydown(event) {
        if (!overlay) return;
        if (event.key === "Escape") {
          closeOverlay();
          return;
        }
        if (event.key === "Tab") {
          var focusable = focusableIn(overlay);
          if (focusable.length === 0) return;
          var first = focusable[0];
          var last = focusable[focusable.length - 1];
          if (event.shiftKey && doc.activeElement === first) {
            event.preventDefault();
            last.focus();
          } else if (!event.shiftKey && doc.activeElement === last) {
            event.preventDefault();
            first.focus();
          }
        }
      }

      function closeOverlay() {
        if (!overlay) return;
        var node = overlay;
        overlay = null;
        doc.removeEventListener("keydown", onKeydown, true);
        node.remove();
        if (lastTrigger) lastTrigger.focus();
      }

      function openOverlay(entry, trigger) {
        closeOverlay();
        lastTrigger = trigger;

        var backdrop = doc.createElement("div");
        backdrop.setAttribute("role", "dialog");
        backdrop.setAttribute("aria-modal", "true");
        backdrop.style.cssText =
          "position:fixed;inset:0;background:rgba(0,0,0,0.6);display:flex;" +
          "align-items:center;justify-content:center;padding:1.5rem;z-index:1000;";

        var panel = doc.createElement("div");
        panel.style.cssText =
          "background:var(--bg);color:var(--fg);border:1px solid var(--rule);" +
          "border-radius:0.5rem;max-width:34rem;width:100%;max-height:80vh;" +
          "overflow:auto;padding:var(--space-1);";

        var closeButton = doc.createElement("button");
        closeButton.type = "button";
        closeButton.textContent = "Close";
        closeButton.style.cssText =
          "font:inherit;background:transparent;color:var(--fg);" +
          "border:1px solid var(--rule);border-radius:0.3rem;padding:0.3rem 0.7rem;" +
          "cursor:pointer;margin:0 0 var(--space-0);";
        closeButton.addEventListener("click", closeOverlay);

        var content = entry.cloneNode(true);
        content.removeAttribute("id");
        var innerTrigger = content.querySelector("button");
        if (innerTrigger) innerTrigger.remove();

        panel.appendChild(closeButton);
        panel.appendChild(content);
        backdrop.appendChild(panel);

        backdrop.addEventListener("click", function (event) {
          if (event.target === backdrop) closeOverlay();
        });

        doc.body.appendChild(backdrop);
        overlay = backdrop;
        doc.addEventListener("keydown", onKeydown, true);
        closeButton.focus();
      }

      for (var i = 0; i < entries.length; i++) {
        (function (entry) {
          var trigger = doc.createElement("button");
          trigger.type = "button";
          trigger.textContent = "Details";
          trigger.style.cssText =
            "font:inherit;background:transparent;color:var(--link);" +
            "border:1px solid var(--rule);border-radius:0.3rem;padding:0.2rem 0.6rem;" +
            "cursor:pointer;align-self:flex-start;margin-top:0.3rem;";
          trigger.addEventListener("click", function () {
            openOverlay(entry, trigger);
          });
          entry.appendChild(trigger);
        })(entries[i]);
      }
    }
  } catch (err) {
    /* additive only — a failure here must leave the server-rendered,
       CSS-only page exactly as it was before this script ran. */
  }
})();`;
}
