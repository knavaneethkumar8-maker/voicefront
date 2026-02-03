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
  let rafId = null;

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
    return i > 0 ? msToPx(akshars[i - 1].end) : 0;
  }

  function rightLimit(i) {
    return i < akshars.length - 1
      ? msToPx(akshars[i + 1].start)
      : container.offsetWidth;
  }

  /* =========================
     AUDIO
     ========================= */
  audio.playbackRate = 1 / slowFactor;
  const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

  playPauseBtn.onclick = async () => {
    if (audioCtx.state === "suspended") await audioCtx.resume();

    if (audio.paused) {
      audio.play();
      startCursorLoop();
      playPauseBtn.textContent = "Pause";
    } else {
      audio.pause();
      stopCursorLoop();
      playPauseBtn.textContent = "Play";
    }
  };

  function startCursorLoop() {
    if (rafId) return;

    const loop = () => {
      if (audio.paused) {
        stopCursorLoop();
        return;
      }

      const globalPx = audio.currentTime * 1000 * PX_PER_MS;
      cursor.style.left = globalPx + "px";

      if (audio.currentTime >= audio.duration) {
        cursor.style.left = msToPx(audio.duration * 1000) + "px";
        stopCursorLoop();
        playPauseBtn.textContent = "Play";
        return;
      }

      rafId = requestAnimationFrame(loop);
    };

    rafId = requestAnimationFrame(loop);
  }

  function stopCursorLoop() {
    if (!rafId) return;
    cancelAnimationFrame(rafId);
    rafId = null;
  }

  audio.addEventListener("ended", () => {
    stopCursorLoop();
    cursor.style.left = msToPx(audio.duration * 1000) + "px";
    playPauseBtn.textContent = "Play";
  });

  /* =========================
     TIMELINE CLICK (FIXED)
     ========================= */
  viewport.addEventListener("click", async e => {
    const rect = viewport.getBoundingClientRect();

    // global timeline px (THIS IS THE KEY FIX)
    const globalPx =
      (e.clientX - rect.left) + viewport.scrollLeft;

    const timeSec = globalPx / PX_PER_MS / 1000;
    audio.currentTime = Math.max(0, Math.min(timeSec, audio.duration));

    // cursor MUST always use global px
    cursor.style.left = globalPx + "px";

    if (!audio.paused) {
      if (audioCtx.state === "suspended") await audioCtx.resume();
      startCursorLoop();
    }
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

    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = "#00ff88";

    const spp = data.length / width;
    const mid = height / 2;
    const amp = mid * 0.475;

    for (let x = 0; x < width; x++) {
      let min = 1, max = -1;
      const s = Math.floor(x * spp);
      const e = Math.floor(s + spp);
      for (let i = s; i < e; i++) {
        const v = data[i] || 0;
        min = Math.min(min, v);
        max = Math.max(max, v);
      }
      ctx.fillRect(
        x,
        mid + min * amp,
        1,
        Math.max(1, (max - min) * amp)
      );
    }

    renderAkshars();
  }

  audio.readyState >= 1
    ? drawWaveform()
    : audio.addEventListener("loadedmetadata", drawWaveform, { once: true });

  /* =========================
     RENDER
     ========================= */
  function renderAkshars() {
    container.querySelectorAll(".akshar").forEach(e => e.remove());

    akshars.forEach((a, i) => {
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
     CLIPS (unchanged)
     ========================= */
  function attachClip(el, akshar, index) {
    el.addEventListener("mousemove", e => {
      if (el.classList.contains("editing")) return;
      const rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left;
      el.style.cursor = (x < EDGE || x > rect.width - EDGE) ? "ew-resize" : "grab";
    });

    el.addEventListener("mouseleave", () => {
      if (!el.classList.contains("editing")) el.style.cursor = "grab";
    });

    el.addEventListener("mousedown", e => {
      if (el.classList.contains("editing")) return;

      clearSelection();
      el.classList.add("selected");
      selectedIndex = index;

      const rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left;

      if (e.altKey && x > EDGE && x < rect.width - EDGE) mode = "duplicate";
      else if (x < EDGE) mode = "left";
      else if (x > rect.width - EDGE) mode = "right";
      else mode = "move";

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
        ghost.style.left = snapPx(startLeft + dx) + "px";
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

  document.addEventListener("keydown", e => {
    if ((e.key !== "Backspace" && e.key !== "Delete") || selectedIndex === null)
      return;

    const el = container.querySelector(".akshar.selected");
    if (!el || el.classList.contains("editing")) return;

    e.preventDefault();
    akshars.splice(selectedIndex, 1);
    selectedIndex = null;
    renderAkshars();
  });

  document.addEventListener("mousedown", e => {
    if (!e.target.closest(".akshar")) clearSelection();
  });
}
