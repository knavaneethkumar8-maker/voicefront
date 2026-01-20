import { akshars } from "./renderBoothGrids.js";
import { updateAllGridLabels} from "./renderBoothGrids.js";
import { getCurrentFileName } from "./recorder.js";

const aksharTimeline = document.querySelector('.js-akshar-timeline');

export function renderAkshars(width, setAudio) {
  akshars.forEach((akshar, index )=> {
    const newAkshar = document.createElement('div');
    newAkshar.classList.add('akshar', 'js-akshar');
    newAkshar.textContent = `${akshar.char}`;
    newAkshar.style.width = width + "px";
    newAkshar.style.left = index*width + "px";
    aksharTimeline.appendChild(newAkshar);
    makeAksharResizable(newAkshar, akshar, setAudio);
  });
}

const STEP = 20;
function snap(value) {
  return Math.round(value / STEP) * STEP;
}

export function makeAksharResizable(clip, akshar, setAudio) {

let startX = 0;
let startWidth = 0;
let startLeft = 0;
let mode = null;


const EDGE_SIZE = 8;
const MIN_WIDTH = 10;

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
      const rawWidth = startWidth + dx;
      const snappeWidth = snap(snap(Math.max(MIN_WIDTH, rawWidth)))
      clip.style.width = snappeWidth + "px";
      const rect = clip.getBoundingClientRect();
      akshar.end = ((216*(rect.left + rect.width))/480);
    }

    if (mode === "left") {
      const rawWidth = startWidth - dx;
    const snappedWidth = snap(Math.max(MIN_WIDTH, rawWidth));

    const delta = startWidth - snappedWidth;
    const snappedLeft = snap(Math.max(0, startLeft + delta));

    clip.style.width = snappedWidth + "px";
    clip.style.left = snappedLeft + "px";
    console.log(akshar.start);
    const rect = clip.getBoundingClientRect();
    console.log(akshar.start);
    akshar.start = ((216*(rect.left))/480);
    console.log(akshar.start);
      
    }

    //renderAllGrids();
    //setAudio();
    //lockGrids();
    const fileName = getCurrentFileName();
    updateAllGridLabels(fileName);
  
  }

  function stopResize() {
    mode = null;
    document.removeEventListener("mousemove", resize);
    document.removeEventListener("mouseup", stopResize);
  }

}

