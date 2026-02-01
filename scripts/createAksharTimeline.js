export function createAksharEditor(row, akshars, slowFactor = 8) {

  /* =========================
     CONSTANTS
     ========================= */
  const MS_PER_BLOCK = 9;
  const PX_PER_BLOCK = 20;
  const PX_PER_MS = PX_PER_BLOCK / MS_PER_BLOCK;
  const STEP_PX = PX_PER_BLOCK;
  const EDGE = 8;

  /* =========================
     DOM (ROW SCOPED)
     ========================= */
  const audio = row.querySelector("audio");
  const viewport = row.querySelector(".viewport");
  const playPauseBtn = row.querySelector(".playPause");
  const container = row.querySelector(".wave-container");
  const canvas = container.querySelector("canvas");
  const cursor = container.querySelector(".cursor");
  const ctx = canvas.getContext("2d");

  /* =========================
     STATE
     ========================= */
  let selectedIndex = null;
  let mode = null;
  let startX = 0;
  let startLeft = 0;
  let startWidth = 0;
  let ghost = null;

  /* =========================
     HELPERS
     ========================= */
  const msToPx = ms => ms * PX_PER_MS;
  const pxToMs = px => px / PX_PER_MS;
  const snapPx = px => Math.round(px / STEP_PX) * STEP_PX;

  function clearSelection() {
    container.querySelectorAll(".akshar.selected")
      .forEach(e => e.classList.remove("selected"));
    selectedIndex = null;
  }

  function leftLimit(i) {
    return i > 0 ? msToPx(akshars[i-1].end) : 0;
  }

  function rightLimit(i) {
    return i < akshars.length - 1
      ? msToPx(akshars[i+1].start)
      : container.offsetWidth;
  }

  /* =========================
     AUDIO
     ========================= */
  audio.playbackRate = 1 / slowFactor;
  const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

  playPauseBtn.onclick = async () => {
    if (audioCtx.state === "suspended") await audioCtx.resume();
    audio.paused ? audio.play() : audio.pause();
    playPauseBtn.textContent = audio.paused ? "Play" : "Pause";
  };

  function updateCursor() {
    cursor.style.left =
      audio.currentTime * 1000 * PX_PER_MS + "px";
    requestAnimationFrame(updateCursor);
  }
  audio.addEventListener("loadedmetadata", updateCursor);

  container.addEventListener("click", e => {
    const r = container.getBoundingClientRect();
    audio.currentTime =
      (e.clientX - r.left) / PX_PER_MS / 1000;
  });

  /* =========================
     WAVEFORM
     ========================= */
  async function drawWaveform() {
    const res = await fetch(audio.src);
    const buf = await res.arrayBuffer();
    const audioBuffer = await audioCtx.decodeAudioData(buf);

    const data = audioBuffer.getChannelData(0);
    const durationMs = audioBuffer.duration * 1000;
    const width = Math.round(durationMs * PX_PER_MS);
    const height = container.clientHeight;

    container.style.width = width + "px";
    canvas.width = width;
    canvas.height = height;

    ctx.clearRect(0,0,width,height);
    ctx.fillStyle = "#00ff88";

    const spp = data.length / width;
    const mid = height / 2;
    const amp = mid * 0.95*0.5;

    for (let x = 0; x < width; x++) {
      let min = 1, max = -1;
      const s = Math.floor(x * spp);
      const e = Math.floor(s + spp);
      for (let i = s; i < e; i++) {
        const v = data[i] || 0;
        min = Math.min(min, v);
        max = Math.max(max, v);
      }
      ctx.fillRect(x, mid + min * amp, 1, Math.max(1,(max-min)*amp));
    }

    renderAkshars();
  }

  audio.readyState >= 1
    ? drawWaveform()
    : audio.addEventListener("loadedmetadata", drawWaveform, { once:true });

  /* =========================
     TEXT EDIT
     ========================= */
  function enableEditing(el, akshar) {
    el.classList.add("editing");
    el.contentEditable = "true";

    const originalText = akshar.char;
    el.textContent = originalText;
    el.focus();

    function commit() {
      akshar.char = el.textContent.trim();
      cleanup();
    }

    function cancel() {
      el.textContent = originalText;
      cleanup();
    }

    function cleanup() {
      el.classList.remove("editing");
      el.contentEditable = "false";
      el.removeEventListener("keydown", onKey);
      el.removeEventListener("blur", commit);
      el.blur();
    }

    function onKey(e) {
      if (e.key === "Enter") {
        e.preventDefault();
        commit();
      } else if (e.key === "Escape") {
        e.preventDefault();
        cancel();
      }
    }

    el.addEventListener("keydown", onKey);
    el.addEventListener("blur", commit);
  }

  /* =========================
     CLIPS
     ========================= */
  function attachClip(el, akshar, index) {

    /* =========================
      CURSOR FEEDBACK
      ========================= */
    el.addEventListener("mousemove", e => {
      if (el.classList.contains("editing")) return;

      const rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left;

      if (x < EDGE || x > rect.width - EDGE) {
        el.style.cursor = "ew-resize";
      } else {
        el.style.cursor = "grab";
      }
    });

    el.addEventListener("mouseleave", () => {
      if (!el.classList.contains("editing")) {
        el.style.cursor = "grab";
      }
    });

    /* =========================
      MOUSEDOWN LOGIC
      ========================= */
    el.addEventListener("mousedown", e => {
      if (el.classList.contains("editing")) return;

      clearSelection();
      el.classList.add("selected");
      selectedIndex = index;

      const rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left;

      if (e.altKey && x > EDGE && x < rect.width - EDGE) {
        mode = "duplicate";
      } else if (x < EDGE) {
        mode = "left";
      } else if (x > rect.width - EDGE) {
        mode = "right";
      } else {
        mode = "move";
      }

      startX = e.clientX;
      startLeft = el.offsetLeft;
      startWidth = el.offsetWidth;

      if (mode === "duplicate") {
        ghost = el.cloneNode(true);
        ghost.style.opacity = "0.5";
        ghost.style.pointerEvents = "none";
        container.appendChild(ghost);
      }

      document.addEventListener("mousemove", onMove);
      document.addEventListener("mouseup", onUp);
      e.preventDefault();
    });

    el.addEventListener("dblclick", e => {
      e.stopPropagation();
      enableEditing(el, akshar);
    });

    function onMove(e) {
      const dx = snapPx(e.clientX - startX);

      if (mode === "duplicate") {
        let left = snapPx(startLeft + dx);
        ghost.style.left = left + "px";
        ghost.style.width = startWidth + "px";
        return;
      }

      if (mode === "move") {
        let left = snapPx(startLeft + dx);
        left = Math.max(left, leftLimit(index));
        left = Math.min(left, rightLimit(index) - startWidth);
        el.style.left = left + "px";
      }

      if (mode === "right") {
        let w = snapPx(startWidth + dx);
        w = Math.max(w, STEP_PX);
        w = Math.min(w, rightLimit(index) - startLeft);
        el.style.width = w + "px";
      }

      if (mode === "left") {
        const r = startLeft + startWidth;
        let left = snapPx(startLeft + dx);
        left = Math.max(left, leftLimit(index));
        left = Math.min(left, r - STEP_PX);
        el.style.left = left + "px";
        el.style.width = (r - left) + "px";
      }

      akshar.start = pxToMs(el.offsetLeft);
      akshar.end = pxToMs(el.offsetLeft + el.offsetWidth);
    }

    function onUp() {
      if (mode === "duplicate" && ghost) {
        akshars.push({
          char: akshar.char,
          start: pxToMs(ghost.offsetLeft),
          end: pxToMs(ghost.offsetLeft + ghost.offsetWidth)
        });
        akshars.sort((a,b)=>a.start-b.start);
        ghost.remove();
        renderAkshars();
      }

      ghost = null;
      mode = null;
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup", onUp);
    }
  }

  /* =========================
     RENDER
     ========================= */
  function renderAkshars() {
    container.querySelectorAll(".akshar").forEach(e => e.remove());

    akshars.forEach((a,i) => {
      const el = document.createElement("div");
      el.className = "akshar";
      el.textContent = a.char;
      el.style.left = msToPx(a.start) + "px";
      el.style.width = msToPx(a.end - a.start) + "px";
      attachClip(el, a, i);
      container.appendChild(el);
    });
  }

  /* =========================
     DELETE (ROW SCOPED)
     ========================= */
  document.addEventListener("keydown", e => {
    if (e.key !== "Backspace" && e.key !== "Delete") return;
    if (selectedIndex === null) return;

    const el = container.querySelector(".akshar.selected");
    if (!el) return;
    if (el.classList.contains("editing")) return;

    e.preventDefault();

    // delete ONLY the selected clip
    akshars.splice(selectedIndex, 1);

    selectedIndex = null;
    renderAkshars();
  });


  document.addEventListener("mousedown", e => {
    if (e.target.closest(".akshar")) return;
    clearSelection();
  });
}
