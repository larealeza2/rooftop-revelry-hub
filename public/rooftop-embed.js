/* Rooftop Restaurant & Lounge — website widget.
   Paste this where you want the panel to appear:
   <script src="https://YOUR-DASHBOARD-URL/rooftop-embed.js" data-section="menu" defer></script>
   data-section: menu | experiences | gallery | book
   data-mount:  optional CSS selector of the element to place the panel inside
   data-height: optional starting height in pixels (the panel resizes itself) */
(function () {
  var script = document.currentScript;
  if (!script) return;

  var base = script.src.replace(/\/rooftop-embed\.js(\?.*)?$/, "");
  var section = script.getAttribute("data-section") || "menu";
  var mountSelector = script.getAttribute("data-mount");
  var startHeight = parseInt(script.getAttribute("data-height") || "420", 10);

  var frame = document.createElement("iframe");
  frame.title = "Rooftop Restaurant & Lounge";
  frame.setAttribute("loading", "lazy");
  frame.setAttribute("scrolling", "no");
  frame.style.cssText =
    "display:block;width:100%;border:0;min-height:200px;height:" + startHeight + "px;max-width:100%;";
  var parentOrigin = "";
  try {
    if (/^https?:$/.test(location.protocol)) parentOrigin = location.origin;
  } catch (e) {
    parentOrigin = "";
  }
  frame.src =
    base +
    "/embed?section=" +
    encodeURIComponent(section) +
    (parentOrigin ? "&parent=" + encodeURIComponent(parentOrigin) : "");

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", place);
  } else {
    place();
  }

  function place() {
    var target = mountSelector ? document.querySelector(mountSelector) : null;
    if (target) {
      target.appendChild(frame);
    } else if (script.parentNode) {
      script.parentNode.insertBefore(frame, script.nextSibling);
    }
  }

  var origin;
  try {
    origin = new URL(base).origin;
  } catch (e) {
    origin = "";
  }

  window.addEventListener("message", function (event) {
    if (origin && event.origin !== origin) return;
    if (event.source !== frame.contentWindow) return;
    var data = event.data;
    if (!data || data.type !== "rooftop-embed:height") return;
    var height = Math.max(200, Math.min(4000, Number(data.height) || 0));
    frame.style.height = height + "px";
  });
})();
