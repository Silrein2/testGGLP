// admin_phishing_authoring.js
(function () {
  document.addEventListener("DOMContentLoaded", function () {
    const wrap = document.getElementById("phishing-canvas-wrap");
    if (!wrap) return;

    const canvasEl = document.getElementById("phishing-canvas");
    const hiddenInput = document.getElementById("phishing-indicators-hidden");
    const newRectBtn = document.getElementById("phishing-new-rect");
    const clearBtn = document.getElementById("phishing-clear");

    const imageUrl = wrap.dataset.imageUrl;
    let existing = [];
    try { existing = JSON.parse(wrap.dataset.indicators || "[]"); } catch (e) { existing = []; }

    const canvas = new fabric.Canvas("phishing-canvas", {
      selection: true,
      preserveObjectStacking: true,
    });

    let naturalWidth = 1, naturalHeight = 1, displayScale = 1;

    function resizeCanvasToImage(img) {
      const maxWidth = 900;
      const maxHeight = 600;
      let w = img.width;
      let h = img.height;
      const ratio = Math.min(maxWidth / w, maxHeight / h, 1);
      const displayW = Math.round(w * ratio);
      const displayH = Math.round(h * ratio);
      canvas.setWidth(displayW);
      canvas.setHeight(displayH);
      displayScale = displayW / naturalWidth;
      canvas.renderAll();
    }

    const nativeImg = new Image();
    nativeImg.onload = function () {
      naturalWidth = nativeImg.naturalWidth || nativeImg.width;
      naturalHeight = nativeImg.naturalHeight || nativeImg.height;

      fabric.Image.fromURL(imageUrl, function (fimg) {
        resizeCanvasToImage({ width: naturalWidth, height: naturalHeight });

        fimg.set({
          left: 0,
          top: 0,
          selectable: false,
          evented: false,
          originX: "left",
          originY: "top",
          scaleX: displayScale,
          scaleY: displayScale,
        });
        canvas.setBackgroundImage(fimg, canvas.renderAll.bind(canvas));
        loadExistingRects();
      });
    };
    nativeImg.crossOrigin = "anonymous";
    nativeImg.src = imageUrl;

    function loadExistingRects() {
      existing.forEach(function (item) {
        const x1 = item.x1 * naturalWidth;
        const y1 = item.y1 * naturalHeight;
        const x2 = item.x2 * naturalWidth;
        const y2 = item.y2 * naturalHeight;
        createRectOnCanvas(x1, y1, x2 - x1, y2 - y1, item.label, false);
      });
    }

    function createRectOnCanvas(left, top, width, height, label, selectIt = true) {
      const dispLeft = left * displayScale;
      const dispTop = top * displayScale;
      const dispW = width * displayScale;
      const dispH = height * displayScale;

      const rect = new fabric.Rect({
        left: dispLeft,
        top: dispTop,
        width: Math.max(4, dispW),
        height: Math.max(4, dispH),
        fill: "rgba(255,0,0,0.12)",
        stroke: "rgba(255,0,0,0.8)",
        strokeWidth: 2,
        hasRotatingPoint: false,
        lockRotation: true,
        cornerColor: "black",
        cornerSize: 8,
      });
      rect.setControlsVisibility({
        mtr: false
      });

      const textbox = new fabric.Textbox(label || "", {
        left: dispLeft + 4,
        top: dispTop - 20,
        fontSize: 14,
        editable: false,
        selectable: false,
        backgroundColor: "rgba(255,255,255,0.8)"
      });

      rect.associatedText = textbox;

      canvas.add(rect);
      canvas.add(textbox);
      if (selectIt) {
        canvas.setActiveObject(rect);
      }

      rect.on("moving", function () {
        textbox.left = rect.left + 4;
        textbox.top = rect.top - 20;
        canvas.requestRenderAll();
      });
      rect.on("scaling", function () {
        textbox.left = rect.left + 4;
        textbox.top = rect.top - 20;
        canvas.requestRenderAll();
      });

      rect.on("mousedblclick", function () {
      });

      return rect;
    }

    let lastClick = 0;
    canvas.on("mouse:down", function (opt) {
      const now = new Date().getTime();
      if (now - lastClick < 300) {
        const target = opt.target;
        if (target && target.type === "rect") {
          const tb = target.associatedText;
          const newLabel = prompt("Edit label:", tb.text || "");
          if (newLabel !== null) {
            tb.text = newLabel;
            tb.text = tb.text.trim() === "" ? "" : tb.text;
            canvas.requestRenderAll();
          }
        }
      }
      lastClick = now;
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Delete" || e.key === "Backspace") {
        const active = canvas.getActiveObject();
        if (active && active.type === "rect") {
          const tb = active.associatedText;
          if (tb) canvas.remove(tb);
          canvas.remove(active);
          e.preventDefault();
        }
      }
    });

    newRectBtn.addEventListener("click", function () {
      const w = naturalWidth * 0.2;
      const h = naturalHeight * 0.12;
      const left = (naturalWidth - w) / 2;
      const top = (naturalHeight - h) / 2;
      const rect = createRectOnCanvas(left, top, w, h, "");
      const label = prompt("Label for this box (e.g. 'Suspicious link'):");
      rect.associatedText.text = label || "";
      canvas.requestRenderAll();
    });

    clearBtn.addEventListener("click", function () {
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
    });

    const form = document.querySelector("form");
    if (form) {
      form.addEventListener("submit", function () {
        const objs = canvas.getObjects().filter(o => o.type === "rect");
        const out = objs.map(function (r) {
          const leftNatural = (r.left / displayScale);
          const topNatural = (r.top / displayScale);
          const wNatural = (r.width * r.scaleX) / displayScale;
          const hNatural = (r.height * r.scaleY) / displayScale;

          const x1 = leftNatural / naturalWidth;
          const y1 = topNatural / naturalHeight;
          const x2 = (leftNatural + wNatural) / naturalWidth;
          const y2 = (topNatural + hNatural) / naturalHeight;
          return {
            x1: Math.max(0, Math.min(1, x1)),
            y1: Math.max(0, Math.min(1, y1)),
            x2: Math.max(0, Math.min(1, x2)),
            y2: Math.max(0, Math.min(1, y2)),
            label: (r.associatedText && r.associatedText.text) ? r.associatedText.text : ""
          };
        });
        hiddenInput.value = JSON.stringify(out);
      });
    }
  });
})();

