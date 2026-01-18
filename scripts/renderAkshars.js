import { makeAksharResizable } from "./aksharTimeline.js";
import { akshars } from "./renderBoothGrids.js";

const aksharTimeline = document.querySelector('.js-akshar-timeline');

console.log(aksharTimeline);


function renderAkshars() {
  akshars.forEach((akshar, index )=> {
    const newAkshar = document.createElement('div');
    newAkshar.classList.add('akshar', 'js-akshar');
    newAkshar.textContent = `${akshar.char}`;
    console.log(newAkshar);
    newAkshar.style.left = index*100 + "px";
    aksharTimeline.appendChild(newAkshar);
    makeAksharResizable(newAkshar);
  })
}

renderAkshars();


