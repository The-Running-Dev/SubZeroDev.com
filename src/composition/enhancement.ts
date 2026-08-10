// Composition — the inline enhancement script (contract's `X10`, `X9`).
//
// Not part of Composition's public surface (the contract closes that to
// `composeApex` and `composeMiss`) — imported by `apex.ts` alone.
//
// The returned string is plain, hand-written vanilla JavaScript with no
// import, no template compilation and no build step (S12's *Depends on*
// forbids a framework, a bundler or a minifier). It knows nothing about
// Content: every project, sentence and testimonial it touches is read from
// the DOM the response body already carries, never interpolated, so this
// module imports nothing from Content and the string below names no project,
// no quote and no author (S12.2). It is wrapped in its own `try`/`catch` so a
// defect in it degrades to the plain server-rendered page rather than to a
// broken one (S12.10), and it never writes a literal class attribute into
// markup it builds — every element it creates is styled with inline `style`
// properties drawn from the token custom properties already declared on
// `:root`, so nothing here is visible to `stylesheetFor` or
// `assertStyleAgreement`'s class scan (both read the same raw body text this
// script travels inside of).
//
// Four behaviours, each additive over markup already in the DOM, and each a
// transcription of the imported prototype (`SubZeroDev Landing.dc.html`)
// rather than an invention of this module — with one deliberate departure:
// the prototype's nav shows exactly one section at a time by toggling a
// `view` state; this site keeps Effortless Action, The Echo System,
// Contamination and Testimonials all visible on the same page at once, so the
// nav's four links are plain same-document anchors and nothing here
// intercepts their click:
//   - each section's heading is moved above its index label, the order the
//     prototype uses — a reorder of nodes already present, never a rewrite;
//   - the manifesto's lines are numbered and alternated left/right, and its
//     closing statement is pulled into a ruled block, as the prototype lays
//     them out;
//   - a search box and one filter chip per lifecycle stage hide and reveal
//     `.entry` elements already under `#echo-system`, never adding or removing
//     a project. Chips are multi-select, as the prototype's `stages` array is,
//     and the ecosystem's own count line reads "N of M projects." while a
//     filter narrows it — the same `shownCount` the prototype renders, read
//     back off the DOM rather than recomputed from Content;
//   - a whole ecosystem entry is the control that opens its detail overlay
//     (the prototype binds its `onClick` to the entry, not to a button), and
//     so is a contamination node's name. Both are given `role="button"` and a
//     tab stop so the overlay stays keyboard-reachable (`P4`, S12.8), which
//     the prototype's bare `<div onClick>` would not be;
//   - the overlay itself is the prototype's: index line and a `×` close
//     control on one row, then the name, the line, the question behind a rule,
//     and a "Visit home" link — every string of it read from the entry's own
//     already-rendered markup.
//
// The prototype's scroll reveal is deliberately absent: S12's *Out of scope*
// rules it out by name, because it sets `opacity: 0` before observing and
// `S12.9`'s second clause requires a reveal to only ever add visibility.
export function enhancementScript(): string {
  return `(function () {
  "use strict";
  try {
    var doc = document;
    var page = doc.querySelector(".page");
    if (!page) return;

    // The prototype's own token spellings, reached through the custom
    // properties Presentation already declares on ':root' rather than as hex
    // literals — S4.2 keeps one colour to one spelling.
    var META =
      "margin:0;font-family:ui-monospace,SFMono-Regular,Consolas,monospace;" +
      "font-size:0.8rem;color:var(--fg-muted);letter-spacing:0.1em;" +
      "line-height:1.4;text-transform:uppercase;";

    // ---- keep a tab switch at the top of the document -------------------
    //
    // The switch itself is Presentation's, in CSS, so it works with this
    // script absent. What the CSS cannot do is stop the browser scrolling
    // the newly targeted section under the masthead — a tab is a view
    // change, not a jump to a place further down. Resetting on hashchange
    // covers the tab buttons and the back/forward that pairs with them.
    window.addEventListener("hashchange", function () {
      window.scrollTo(0, 0);
    });

    function directChildren(node, tag) {
      var out = [];
      var kids = node.children;
      for (var i = 0; i < kids.length; i++) {
        if (kids[i].tagName === tag) out.push(kids[i]);
      }
      return out;
    }

    // ---- heading above index label, the prototype's section order -------

    var sectionAnchors = ["#effortless-action", "#echo-system", "#contamination", "#testimonials"];

    sectionAnchors.forEach(function (h) {
      var section = doc.getElementById(h.slice(1));
      if (!section) return;
      var heading = section.querySelector("h2");
      var label = directChildren(section, "P")[0];
      if (!heading || !label) return;
      if (heading.compareDocumentPosition(label) & 2) section.insertBefore(heading, label);
    });

    // ---- the manifesto's numbered, alternating lines --------------------

    (function layOutManifesto() {
      var section = doc.getElementById("effortless-action");
      if (!section) return;
      // The index label is the one paragraph the server rendered here that
      // opens with a two-digit section number; the rest are the manifesto.
      var paragraphs = directChildren(section, "P").filter(function (p) {
        return !/^[0-9]{2} \\//.test(p.textContent.trim());
      });
      if (paragraphs.length < 3) return;

      var closing = paragraphs.slice(-2);
      var lines = paragraphs.slice(0, -2);

      var list = doc.createElement("div");
      list.style.cssText =
        "display:flex;flex-direction:column;gap:clamp(0.45rem,1vw,0.7rem);" +
        "margin-top:clamp(0.5rem,1.2vw,0.9rem);padding-right:clamp(1.5rem,8vw,7rem);";
      section.insertBefore(list, lines[0]);

      lines.forEach(function (paragraph, index) {
        var toTheLeft = index % 2 === 0;
        var row = doc.createElement("div");
        row.style.cssText =
          "display:flex;align-items:baseline;justify-content:flex-start;" +
          "gap:clamp(0.7rem,1.8vw,1.3rem);flex-direction:" +
          (toTheLeft ? "row" : "row-reverse") + ";";

        var ordinal = index + 1;
        var num = doc.createElement("span");
        num.textContent = ordinal < 10 ? "0" + ordinal : String(ordinal);
        num.style.cssText =
          "flex:none;font-family:ui-monospace,SFMono-Regular,Consolas,monospace;" +
          "font-size:0.72rem;letter-spacing:0.1em;color:var(--rule);";

        paragraph.style.cssText =
          "margin:0;font-size:clamp(1rem,1.4vw,1.2rem);line-height:1.35;" +
          "letter-spacing:-0.015em;font-weight:500;text-align:" +
          (toTheLeft ? "left;" : "right;color:var(--fg-muted);");

        row.appendChild(num);
        row.appendChild(paragraph);
        list.appendChild(row);
      });

      var block = doc.createElement("div");
      block.style.cssText =
        "display:flex;flex-direction:column;gap:0.5rem;" +
        "margin-top:clamp(1rem,2.2vw,1.6rem);padding-top:clamp(0.9rem,1.8vw,1.3rem);" +
        "border-top:1px solid var(--rule);";
      section.insertBefore(block, closing[0]);

      closing[0].style.cssText =
        "margin:0;max-width:24ch;font-size:clamp(1.3rem,1.9vw,1.75rem);" +
        "line-height:1.15;letter-spacing:-0.025em;font-weight:700;";
      closing[1].style.cssText = META + "color:var(--link);";
      block.appendChild(closing[0]);
      block.appendChild(closing[1]);
    })();

    // ---- the detail overlay ---------------------------------------------

    var overlay = null;
    var lastTrigger = null;

    function focusableIn(node) {
      return node.querySelectorAll('button, [href], input, [tabindex]:not([tabindex="-1"])');
    }

    function onKeydown(event) {
      if (!overlay) return;
      if (event.key === "Escape") {
        closeOverlay();
        return;
      }
      if (event.key !== "Tab") return;
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

    function closeOverlay() {
      if (!overlay) return;
      var node = overlay;
      overlay = null;
      doc.removeEventListener("keydown", onKeydown, true);
      node.remove();
      if (lastTrigger) lastTrigger.focus();
    }

    // Every string below is lifted from the entry's own rendered markup —
    // nothing here is interpolated from Content.
    function fieldsFrom(entry) {
      var paragraphs = directChildren(entry, "P");
      var heading = entry.querySelector("h4");
      var anchor = heading ? heading.querySelector("a") : null;
      return {
        metaLine: paragraphs[0] ? paragraphs[0].textContent : "",
        name: heading ? heading.textContent : "",
        line: paragraphs[1] ? paragraphs[1].textContent : "",
        question: paragraphs[2] ? paragraphs[2].textContent : "",
        href: anchor ? anchor.getAttribute("href") : null,
      };
    }

    function openOverlay(entry, trigger) {
      closeOverlay();
      lastTrigger = trigger;
      var field = fieldsFrom(entry);

      var backdrop = doc.createElement("div");
      backdrop.setAttribute("role", "dialog");
      backdrop.setAttribute("aria-modal", "true");
      backdrop.style.cssText =
        "position:fixed;inset:0;background:rgba(10,10,12,0.72);display:flex;" +
        "align-items:center;justify-content:center;padding:1.25rem;z-index:50;";

      var panel = doc.createElement("div");
      panel.style.cssText =
        "width:min(100%,620px);max-height:84vh;overflow:auto;background:var(--bg);" +
        "border:1px solid var(--rule);border-radius:0.5rem;" +
        "padding:clamp(1.25rem,3vw,2rem);display:flex;flex-direction:column;gap:0.75rem;";

      var topRow = doc.createElement("div");
      topRow.style.cssText =
        "display:flex;justify-content:space-between;align-items:flex-start;gap:1rem;";

      var metaLine = doc.createElement("p");
      metaLine.textContent = field.metaLine;
      metaLine.style.cssText = META;

      var closeButton = doc.createElement("button");
      closeButton.type = "button";
      closeButton.textContent = "\\u00D7";
      closeButton.setAttribute("aria-label", "Close");
      closeButton.style.cssText =
        "appearance:none;background:none;border:1px solid var(--rule);" +
        "border-radius:0.35rem;color:var(--fg-muted);cursor:pointer;" +
        "padding:0.15rem 0.5rem;font-family:ui-monospace,monospace;" +
        "font-size:0.9rem;line-height:1.4;";
      closeButton.addEventListener("click", closeOverlay);

      topRow.appendChild(metaLine);
      topRow.appendChild(closeButton);
      panel.appendChild(topRow);

      var title = doc.createElement("h3");
      title.textContent = field.name;
      title.style.cssText =
        "margin:0;font-size:clamp(1.3rem,2.4vw,1.75rem);line-height:1.15;" +
        "letter-spacing:-0.02em;font-weight:700;";
      panel.appendChild(title);

      if (field.line) {
        var lineParagraph = doc.createElement("p");
        lineParagraph.textContent = field.line;
        lineParagraph.style.cssText = "margin:0;";
        panel.appendChild(lineParagraph);
      }

      if (field.question) {
        var questionParagraph = doc.createElement("p");
        var emphasis = doc.createElement("em");
        emphasis.textContent = field.question;
        questionParagraph.appendChild(emphasis);
        questionParagraph.style.cssText =
          "margin:0;padding-left:0.9rem;border-left:1px solid var(--rule);color:var(--fg-muted);";
        panel.appendChild(questionParagraph);
      }

      if (field.href) {
        var footer = doc.createElement("div");
        footer.style.cssText =
          "display:flex;gap:1.2rem;flex-wrap:wrap;margin-top:0.4rem;" +
          "padding-top:0.9rem;border-top:1px solid var(--rule);" +
          "font-family:ui-monospace,SFMono-Regular,Consolas,monospace;" +
          "font-size:0.8rem;letter-spacing:0.1em;text-transform:uppercase;" +
          "color:var(--fg-muted);";
        var homeLink = doc.createElement("a");
        homeLink.setAttribute("href", field.href);
        homeLink.setAttribute("rel", "noreferrer");
        homeLink.textContent = "Visit home";
        homeLink.style.color = "var(--link)";
        footer.appendChild(homeLink);
        panel.appendChild(footer);
      }

      backdrop.appendChild(panel);
      backdrop.addEventListener("click", function (event) {
        if (event.target === backdrop) closeOverlay();
      });

      doc.body.appendChild(backdrop);
      overlay = backdrop;
      doc.addEventListener("keydown", onKeydown, true);
      closeButton.focus();
    }

    // The prototype binds its detail handler to the whole entry rather than
    // to a button. A bare div is not keyboard-reachable, so the tab stop and
    // the Enter/Space handling below are what keep P4 and S12.8 satisfied.
    function makeOpener(element, entry) {
      element.setAttribute("role", "button");
      element.setAttribute("tabindex", "0");
      element.style.cursor = "pointer";
      element.addEventListener("click", function (event) {
        // A project's own home link stays a link.
        var target = event.target;
        if (target && typeof target.closest === "function" && target.closest("a")) return;
        openOverlay(entry, element);
      });
      element.addEventListener("keydown", function (event) {
        if (event.key !== "Enter" && event.key !== " ") return;
        if (event.target !== element) return;
        event.preventDefault();
        openOverlay(entry, element);
      });
    }

    var ecosystemEntries = doc.querySelectorAll("#echo-system .entry");
    for (var e = 0; e < ecosystemEntries.length; e++) {
      makeOpener(ecosystemEntries[e], ecosystemEntries[e]);
    }

    // Contamination binds the node's name, as the prototype does — an entry
    // there nests its own escapes, so the whole entry is not one project.
    var contaminationEntries = doc.querySelectorAll("#contamination .entry");
    for (var c = 0; c < contaminationEntries.length; c++) {
      var nameHeading = contaminationEntries[c].querySelector("h4");
      if (nameHeading) makeOpener(nameHeading, contaminationEntries[c]);
    }

    // ---- the ecosystem's search box and stage chips ----------------------

    var ecosystem = doc.getElementById("echo-system");
    if (ecosystem) initEcosystemFilter(ecosystem);

    function initEcosystemFilter(root) {
      var groups = directChildren(root, "DIV").filter(function (child) {
        return child.querySelector("h3") !== null;
      });
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

      // The prototype folds its shownCount into this section's own count
      // line. Read before anything is inserted, so it names the server's
      // paragraph rather than one of ours.
      var labels = directChildren(root, "P");
      var countLine = labels.length > 0 ? labels[labels.length - 1] : null;
      var countTemplate = countLine ? countLine.textContent : "";
      var totalMatch = /([0-9]+)/.exec(countTemplate);
      var total = totalMatch ? Number(totalMatch[1]) : entries.length;

      var controls = doc.createElement("div");
      controls.style.cssText =
        "display:flex;flex-direction:column;gap:0.6rem;margin:0.5rem 0 0.2rem;";

      var searchInput = doc.createElement("input");
      searchInput.type = "search";
      searchInput.placeholder = "Filter projects\\u2026";
      searchInput.setAttribute("aria-label", "Filter projects");
      searchInput.style.cssText =
        "width:100%;background:transparent;border:1px solid var(--rule);" +
        "border-radius:0.4rem;padding:0.55rem 0.7rem;color:var(--fg);" +
        "font-family:ui-monospace,SFMono-Regular,Consolas,monospace;" +
        "font-size:0.85rem;letter-spacing:0.04em;";
      controls.appendChild(searchInput);

      var chipsWrap = doc.createElement("div");
      chipsWrap.style.cssText = "display:flex;flex-wrap:wrap;gap:0.4rem;";
      controls.appendChild(chipsWrap);

      // Multi-select, as the prototype's own stages array is.
      var activeStages = [];
      var chips = [];

      function styleChip(chip, active) {
        chip.style.cssText =
          "appearance:none;cursor:pointer;border-radius:999px;padding:0.25rem 0.7rem;" +
          "font-family:ui-monospace,SFMono-Regular,Consolas,monospace;" +
          "font-size:0.72rem;letter-spacing:0.1em;text-transform:uppercase;" +
          (active
            ? "border:1px solid var(--link);background:var(--link);color:var(--bg);"
            : "border:1px solid var(--rule);background:transparent;color:var(--fg-muted);");
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
          var at = activeStages.indexOf(stage);
          if (at === -1) activeStages.push(stage);
          else activeStages.splice(at, 1);
          chips.forEach(function (item) {
            var pressed = activeStages.indexOf(item.stage) !== -1;
            item.chip.setAttribute("aria-pressed", pressed ? "true" : "false");
            styleChip(item.chip, pressed);
          });
          applyFilter();
        });
        chips.push({ stage: stage, chip: chip });
        chipsWrap.appendChild(chip);
      });

      root.insertBefore(controls, groups[0]);

      var emptyMessage = doc.createElement("p");
      emptyMessage.textContent = "Nothing matches. The absence of a result is the result.";
      emptyMessage.hidden = true;
      emptyMessage.style.cssText = "margin:1rem 0 0;color:var(--fg-muted);";
      root.insertBefore(emptyMessage, groups[0]);

      function applyFilter() {
        var query = searchInput.value.trim().toLowerCase();
        var visibleCount = 0;
        entries.forEach(function (item) {
          var text = item.el.textContent.toLowerCase();
          var matchesQuery = query === "" || text.indexOf(query) !== -1;
          var matchesStage =
            activeStages.length === 0 || activeStages.indexOf(item.stage) !== -1;
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
        if (countLine) {
          countLine.textContent =
            visibleCount === total
              ? countTemplate
              : visibleCount + " of " + total + " projects.";
        }
      }

      searchInput.addEventListener("input", applyFilter);
    }
  } catch (err) {
    /* additive only — a failure here must leave the server-rendered page
       exactly as it was before this script ran. */
  }
})();`;
}
