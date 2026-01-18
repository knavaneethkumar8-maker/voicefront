import { makeAksharResizable } from "./aksharTimeline.js";
import { akshars } from "./renderBoothGrids.js";

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


