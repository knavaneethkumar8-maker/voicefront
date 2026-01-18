
import { akshars } from "./renderBoothGrids.js";
import { renderAllGrids } from "./renderBoothGrids.js";

const aksharTimeline = document.querySelector('.js-akshar-timeline');

console.log(aksharTimeline);


export function renderAkshars(width) {
  akshars.forEach((akshar, index )=> {
    const newAkshar = document.createElement('div');
    newAkshar.classList.add('akshar', 'js-akshar');
    newAkshar.textContent = `${akshar.char}`;
    newAkshar.style.width = width + "px";
    newAkshar.style.left = index*width + "px";
    aksharTimeline.appendChild(newAkshar);
    makeAksharResizable(newAkshar, akshar);
  });
}

//renderAkshars();


const STEP = 20;

function snap(value) {
  return Math.round(value / STEP) * STEP;
}



export function makeAksharResizable(clip, akshar) {

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
      console.log(akshar.end);
      akshar.end = ((216*(rect.left + rect.width))/480);
      console.log(akshar.end);
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

    renderAllGrids();
  }

  function stopResize() {
    mode = null;
    document.removeEventListener("mousemove", resize);
    document.removeEventListener("mouseup", stopResize);
  }

}


