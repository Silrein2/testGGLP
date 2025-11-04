(function () {

  document.addEventListener("DOMContentLoaded", function () {
    try {
      const wrap = document.getElementById("phishing-canvas-wrap");
      if (!wrap) return;

      // Note: This assumes the first language in the list is the preferred display language.
      const LANGUAGES = JSON.parse(wrap.dataset.languages || '["en"]');

      const canvasEl = document.getElementById("phishing-canvas");
      const hiddenInput = document.getElementById("phishing-indicators-hidden");
      const newRectBtn = document.getElementById("phishing-new-rect");
      const clearBtn = document.getElementById("phishing-clear");

      if (!canvasEl || !hiddenInput) return;

      const imageUrl = wrap.dataset.imageUrl;
      let existing = [];
      try {
        // Crucially, this JSON must contain "labelTranslations": { "en": "...", "fr": "..." }
        existing = JSON.parse(wrap.dataset.indicators || "[]");

        // 🛑 CRITICAL MODIFICATION (A): Filter out non-visual indicators immediately.
        // This ensures the JS tool only ever operates on visual data (x1, y1, x2, y2 > 0).
        existing = existing.filter(item => {
          const x1 = item.x1 || 0;
          const y1 = item.y1 || 0;
          const x2 = item.x2 || 0;
          const y2 = item.y2 || 0;
          // We keep only the objects that occupy a visual space (i.e., not all zeros).
          return !(x1 === 0 && y1 === 0 && x2 === 0 && y2 === 0);
        });
        // --------------------------------------------------------------------------

      } catch (e) {
        existing = [];
        console.warn("phishing: invalid data-indicators JSON, falling back to []", e);
      }

      const canvas = new fabric.Canvas("phishing-canvas", { selection: true, preserveObjectStacking: true });
      let naturalWidth = 1, naturalHeight = 1, displayScale = 1;
      let lastClick = 0;

      // --- Canvas resize ---
      function resizeCanvasToImage({ width: w, height: h }) {
        const maxWidth = 900;
        const maxHeight = 600;
        const ratio = Math.min(maxWidth / w, maxHeight / h, 1);
        const displayW = Math.round(w * ratio);
        const displayH = Math.round(h * ratio);
        canvas.setWidth(displayW);
        canvas.setHeight(displayH);
        canvas.getElement().style.width = displayW + "px";
        canvas.getElement().style.height = displayH + "px";
        displayScale = displayW / naturalWidth;
        canvas.renderAll();
      }

      // --- Load background image ---
      if (!imageUrl) return;

      const nativeImg = new Image();
      nativeImg.crossOrigin = "anonymous";
      nativeImg.onload = function () {
        naturalWidth = nativeImg.naturalWidth || nativeImg.width || 1;
        naturalHeight = nativeImg.naturalHeight || nativeImg.height || 1;

        resizeCanvasToImage({ width: naturalWidth, height: naturalHeight });

        fabric.Image.fromURL(imageUrl, function (fimg) {
          fimg.set({ left: 0, top: 0, selectable: false, evented: false, originX: "left", originY: "top", scaleX: displayScale, scaleY: displayScale });
          canvas.setBackgroundImage(fimg, canvas.renderAll.bind(canvas));
          loadExistingRects();
        }, { crossOrigin: "anonymous" });
      };
      nativeImg.src = imageUrl;

      // --- Create a rectangle on canvas ---
      function createRectOnCanvas(left, top, width, height, labelTranslations = {}, selectIt = true) {
        const dispLeft = left * displayScale;
        const dispTop = top * displayScale;
        const dispW = width * displayScale;
        const dispH = height * displayScale;

        const rect = new fabric.Rect({
          left: dispLeft, top: dispTop, width: Math.max(4, dispW), height: Math.max(4, dispH),
          fill: "rgba(255,0,0,0.12)", stroke: "rgba(255,0,0,0.8)", strokeWidth: 2,
          hasRotatingPoint: false, lockRotation: true, cornerColor: "black", cornerSize: 8, strokeUniform: true
        });
        rect.setControlsVisibility({ mtr: false });
        rect.labelTranslations = { ...labelTranslations };

        // Determine which text to display on the canvas (first language, or 'en' as fallback)
        const initialText = rect.labelTranslations[LANGUAGES[0]] || rect.labelTranslations["en"] || Object.values(rect.labelTranslations)[0] || "";

        const textbox = new fabric.Textbox(
          initialText,
          { left: dispLeft + 4, top: dispTop - 20, fontSize: 14, editable: false, selectable: false, backgroundColor: "rgba(255,255,255,0.8)" }
        );
        rect.associatedText = textbox;

        canvas.add(rect);
        canvas.add(textbox);
        if (selectIt) canvas.setActiveObject(rect);

        function syncTextbox() {
          textbox.left = rect.left + 4;
          textbox.top = rect.top - 20;
          canvas.requestRenderAll();
        }
        rect.on("moving", syncTextbox);
        rect.on("scaling", syncTextbox);
        rect.on("mousedblclick", () => openLabelModal(rect));

        return rect;
      }

      // --- Load existing rectangles ---
      function loadExistingRects() {
        // Because we filtered 'existing' above (Modification A), this loop
        // only processes visual rectangles.
        existing.forEach(item => {
          const x1 = (item.x1 || 0) * naturalWidth;
          const y1 = (item.y1 || 0) * naturalHeight;
          const x2 = (item.x2 || 0) * naturalWidth;
          const y2 = (item.y2 || 0) * naturalHeight;

          // This check is redundant now but harmless.
          const isAllZero = x1 === 0 && y1 === 0 && x2 === 0 && y2 === 0;
          if (isAllZero) return;

          createRectOnCanvas(x1, y1, x2 - x1, y2 - y1, item.labelTranslations || {}, false);
        });
      }

      // --- Update hidden input ---
      function updateHiddenInput() {
        // gather visible rects from canvas
        const visibleRects = canvas.getObjects().filter(o => o.type === "rect");

        const visibleData = visibleRects.map(r => {
          const leftNatural = (r.left || 0) / displayScale;
          const topNatural = (r.top || 0) / displayScale;
          const wNatural = ((r.width || 0) * (r.scaleX || 1)) / displayScale;
          const hNatural = ((r.height || 0) * (r.scaleY || 1)) / displayScale;

          return {
            x1: leftNatural / naturalWidth,
            y1: topNatural / naturalHeight,
            x2: (leftNatural + wNatural) / naturalWidth,
            y2: (topNatural + hNatural) / naturalHeight,
            labelTranslations: r.labelTranslations || {},
          };
        });

        // 🛑 CRITICAL MODIFICATION (B): Remove all logic related to 'zeroOnes' merging.
        // The saved data will now ONLY contain visual rectangles.
        /*
        // 🩷 Keep any existing items that are all-zero (not on canvas)
        const zeroOnes = existing.filter(item => {
          const x1 = item.x1 || 0;
          const y1 = item.y1 || 0;
          const x2 = item.x2 || 0;
          const y2 = item.y2 || 0;
          return x1 === 0 && y1 === 0 && x2 === 0 && y2 === 0;
        });

        // merge visible + zero ones
        const merged = [...visibleData, ...zeroOnes];

        hiddenInput.value = JSON.stringify(merged);
        existing = merged; // update master copy
        */

        // Use only the visible data to update the hidden input
        hiddenInput.value = JSON.stringify(visibleData);
        existing = visibleData; // update master copy
        // --------------------------------------------------------

      }

      // --- Open modal for editing translations ---
      function openLabelModal(rect) {
        canvas.selection = false;
        const modal = document.createElement("div");
        modal.className = "phishing-modal"; // Assign a class for CSS styling

        // Remove old inline styles:
        // modal.style = "position:fixed;top:20%;left:50%;transform:translateX(-50%);background:#fff;padding:1.5em;border:1px solid #ccc;z-index:1000;box-shadow: 0 4px 12px rgba(0,0,0,0.2);min-width: 400px; max-width: 90vw;";

        const tabs = document.createElement("div");
        tabs.className = "phishing-tabs";
        // tabs.style = "margin-bottom: 0.5em; display: flex;"; // Using CSS class

        const contents = document.createElement("div");
        contents.className = "phishing-tab-content";
        // contents.style = "border: 1px solid #eee; padding: 0.5em;"; // Using CSS class

        const inputs = {};

        LANGUAGES.forEach((lang, idx) => {
          // --- Tab Button ---
          const tabBtn = document.createElement("button");
          tabBtn.innerText = lang.toUpperCase();
          tabBtn.type = "button";
          tabBtn.className = "phishing-tab-btn";
          tabBtn.dataset.lang = lang;

          // Initial background setting must remain in JS to reflect initial state
          if (idx === 0) {
            tabBtn.classList.add("active");
          }

          // --- Input Field (The Content) ---
          const input = document.createElement("input");
          input.type = "text";
          input.value = rect.labelTranslations[lang] || "";
          input.dataset.lang = lang;
          input.className = "phishing-input";

          inputs[lang] = input;
          contents.appendChild(input);

          // Initial visibility state
          if (idx > 0) {
            input.style.display = "none";
          }

          // --- Tab Click Handler ---
          tabBtn.onclick = () => {
            // Hide all content and reset tab backgrounds
            Array.from(tabs.children).forEach(btn => btn.classList.remove("active"));
            Array.from(contents.children).forEach(c => c.style.display = "none");

            // Show current content and set current tab background
            tabBtn.classList.add("active");
            inputs[lang].style.display = "block";
            inputs[lang].focus(); // Optional: set focus to the input
          };

          tabs.appendChild(tabBtn);
        });

        // --- Save Button ---
        const saveBtn = document.createElement("button");
        saveBtn.type = "button";
        saveBtn.innerText = "Save";
        saveBtn.className = "phishing-btn phishing-btn-save";
        // saveBtn.style = "margin-top:1em; padding: 10px 20px; background: #007bff; color: white; border: none; cursor: pointer;"; // Using CSS classes
        saveBtn.onclick = () => {
          const newTranslations = {};
          LANGUAGES.forEach(lang => {
            newTranslations[lang] = inputs[lang].value.trim();
          });

          rect.labelTranslations = newTranslations;

          const displayText = newTranslations[LANGUAGES[0]] || newTranslations["en"] || Object.values(newTranslations).find(val => val) || "";
          rect.associatedText.text = displayText;

          canvas.requestRenderAll();
          updateHiddenInput();

          document.body.removeChild(modal);
          canvas.selection = true;
        };

        // --- Cancel Button ---
        const closeBtn = document.createElement("button");
        closeBtn.type = "button";
        closeBtn.innerText = "Cancel";
        closeBtn.className = "phishing-btn phishing-btn-cancel";
        // closeBtn.style = "margin-top:1em; margin-left: 0.5em; padding: 10px 20px; background: #ccc; border: none; cursor: pointer;"; // Using CSS classes
        closeBtn.onclick = () => {
          document.body.removeChild(modal);
          canvas.selection = true;
        };

        const buttonGroup = document.createElement("div");
        buttonGroup.className = "phishing-modal-buttons";
        buttonGroup.appendChild(saveBtn);
        buttonGroup.appendChild(closeBtn);

        modal.appendChild(tabs);
        modal.appendChild(contents);
        modal.appendChild(buttonGroup);
        document.body.appendChild(modal);

        // Add a backdrop to darken the background
        const backdrop = document.createElement("div");
        backdrop.className = "phishing-modal-backdrop";
        backdrop.onclick = closeBtn.onclick; // Close on backdrop click
        document.body.appendChild(backdrop);

        modal.backdrop = backdrop; // Keep a reference to remove it later

        // Ensure backdrop is removed when modal is closed (in both Save and Cancel handlers)
        const originalClose = closeBtn.onclick;
        closeBtn.onclick = () => {
          originalClose();
          document.body.removeChild(modal.backdrop);
        };
        const originalSave = saveBtn.onclick;
        saveBtn.onclick = () => {
          originalSave();
          document.body.removeChild(modal.backdrop);
        };
      }


      // --- Events ---
      canvas.on("mouse:down", function (opt) {
        const now = Date.now();
        if (now - lastClick < 300) {
          const target = opt.target;
          if (target && target.type === "rect") openLabelModal(target);
        }
        lastClick = now;
      });

      document.addEventListener("keydown", function (e) {
        if (e.key === "Delete") {
          const active = canvas.getActiveObject();
          if (active && active.type === "rect") {
            if (active.associatedText) canvas.remove(active.associatedText);
            canvas.remove(active);
            e.preventDefault();
            updateHiddenInput();
          }
        }
      });

      if (newRectBtn) {
        newRectBtn.addEventListener("click", () => {
          const w = naturalWidth * 0.2;
          const h = naturalHeight * 0.12;
          const left = (naturalWidth - w) / 2;
          const top = (naturalHeight - h) / 2;
          const rect = createRectOnCanvas(left, top, w, h, {});
          openLabelModal(rect);
        });
      }

      if (clearBtn) {
        clearBtn.addEventListener("click", () => {
          if (!confirm("Clear all annotation boxes? This cannot be undone.")) return;
          const objs = canvas.getObjects();
          for (let i = objs.length - 1; i >= 0; i--) {
            const o = objs[i];
            if (o.type === "rect") {
              if (o.associatedText) canvas.remove(o.associatedText);
              canvas.remove(o);
            }
          }
          canvas.requestRenderAll();
          updateHiddenInput();
        });
      }

      canvas.on("object:added", updateHiddenInput);
      canvas.on("object:modified", updateHiddenInput);
      canvas.on("object:removed", updateHiddenInput);

      const form = document.querySelector("form");
      if (form) form.addEventListener("submit", updateHiddenInput);
      const submitButtons = document.querySelectorAll(".submit-row input, .submit-row button");
      submitButtons.forEach(btn => btn.addEventListener("click", updateHiddenInput, { capture: true, passive: false }));

    } catch (err) {
      console.error("phishing: unexpected initialization error", err);
    }
  });
})();
