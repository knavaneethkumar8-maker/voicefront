const clip = document.querySelector('.js-resize-element');

let startX = 0;
let startWidth = 0;
let startLeft = 0;
let mode = null;


const EDGE_SIZE = 8;
const MIN_WIDTH = 40;

clip.addEventListener("mousemove", (e) => {
    e.preventDefault();
    const rect = clip.getBoundingClientRect();
    const x = e.clientX - rect.left;

    if (x < EDGE_SIZE || x > rect.width - EDGE_SIZE) {
      clip.style.cursor = "ew-resize";
    } else {
      clip.style.cursor = "default";
    }
  });

  clip.addEventListener("mousedown", (e) => {
    e.preventDefault();
    const rect = clip.getBoundingClientRect();
    const x = e.clientX - rect.left;

    if (x < EDGE_SIZE) mode = "left";
    else if (x > rect.width - EDGE_SIZE) mode = "right";
    else return;

    startX = e.clientX;
    startWidth = clip.offsetWidth;
    startLeft = clip.offsetLeft;

    document.addEventListener("mousemove", resize);
    document.addEventListener("mouseup", stopResize);
  });

  function resize(e) {
    e.preventDefault();
    const dx = e.clientX - startX;

    if (mode === "right") {
      clip.style.width =
        Math.max(MIN_WIDTH, startWidth + dx) + "px";
    }

    if (mode === "left") {
      const newWidth = Math.max(MIN_WIDTH, startWidth - dx);
      clip.style.width = newWidth + "px";
      clip.style.left = startLeft + (startWidth - newWidth) + "px";
    }
  }

  function stopResize() {
    mode = null;
    document.removeEventListener("mousemove", resize);
    document.removeEventListener("mouseup", stopResize);
  }
