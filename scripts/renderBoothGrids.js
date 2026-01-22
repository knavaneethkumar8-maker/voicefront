import { enableDropForCells } from "./dragLetters.js";


export const akshars = [
{ char:"", start:0,  end:20 },
  { char:"", start:21, end:35 },
  { char:"", start:36, end:55 },
  { char:"", start:60, end:90 },
  { char:"", start:91, end:110 },
  { char:"", start:111, end:140 },
  { char:"", start:141, end:170 },
  { char:"", start:171, end:200 },
  { char:"", start:210, end:240 },
  { char:"", start:241, end:270 },
  { char:"", start:271, end:300 },
  { char:"", start:301, end:330 }
];


const bioesTime = 9;
const fileName = 'voice1';
let audioLength = 10*1000 ;
const total9ms = Math.ceil(audioLength / bioesTime);
const gridsCount = Math.ceil(330/(24*bioesTime));
const GRID_WIDTH = 480;
const timeLineLength = gridsCount*GRID_WIDTH;

export function getAksharWidth() {
  const width = timeLineLength/akshars.length;
  return width;
}


function collectChars(start9, end9) {
  const chars = [];
  for (let t = start9; t < end9; t += 3) {
    const a = akshars.find(x => t >= x.start && t < x.end);
    if (a && !chars.includes(a.char)) chars.push(a.char);
  }
  return chars.join("");
}

const gridTimeLine = document.querySelector('.js-grid-timeline');

function renderGrid(gridNum, fileName) {
  const startTime = gridNum*24*bioesTime;
  const gridEndTime = startTime + (24*bioesTime);
  const gridHTML = `
  <div class="booth-grid" id= ${fileName + "_" + gridNum}>
          <div class="lock js-lock" data-id=${fileName + "_" + gridNum}>🔓</div>
          <div class="akash-tier">
            <div class="akash-cell cell" id= ${fileName + "_" +gridNum + "_" + 1} >
            <span>${getAkashCellLabel(gridNum)}</span>
              
            </div>
          </div>
          <div class="agni-tier flex-display">
            <div class="agni-cell cell" id=${fileName + "_" + gridNum+"_"+2} >
              <span>${getAgniCellLabel(gridNum,0)}</span>
            </div>
            <div class="agni-cell cell" id=${fileName + "_" + gridNum+"_"+3} >
              <span>${getAgniCellLabel(gridNum,1)}</span>
            </div>
          </div>
          <div class="vayu-tier flex-display">
            <div class="vayu-cell cell" id=${fileName + "_" + gridNum+"_"+ 4} >
            <span>${getAyuvCellLabel(gridNum,0)}</span>
            </div>
            <div class="vayu-cell cell" id=${fileName + "_" + gridNum+"_"+5} >
            <span>${getAyuvCellLabel(gridNum,1)}</span>
            </div>
            <div class="vayu-cell cell" id=${fileName + "_" + gridNum+"_"+6} >
            <span>${getAyuvCellLabel(gridNum,2)}</span>
            </div>
            <div class="vayu-cell cell" id=${fileName + "_" + gridNum+"_"+7} >
            <span>${getAyuvCellLabel(gridNum,3)}</span>
            </div>
          </div>
          <div class="jal-tier flex-display">
            <div class="jal-cell cell" id=${fileName + "_" + gridNum+"_"+8} >
            <span>${getJalCellLabel(gridNum,0)}</span>
            </div>
            <div class="jal-cell cell" id=${fileName + "_" + gridNum+"_"+9} >
            <span>${getJalCellLabel(gridNum,1)}</span>
            </div>
            <div class="jal-cell cell" id=${fileName + "_" + gridNum+"_"+10} >
            <span>${getJalCellLabel(gridNum,2)}</span>
            </div>
            <div class="jal-cell cell" id=${fileName + "_" + gridNum+"_"+11} >
            <span>${getJalCellLabel(gridNum,3)}</span>
            </div>
            <div class="jal-cell cell" id=${fileName + "_" + gridNum+"_"+12} >
            <span>${getJalCellLabel(gridNum,4)}</span>
            </div>
            <div class="jal-cell cell" id=${fileName + "_" + gridNum+"_"+13} >
            <span>${getJalCellLabel(gridNum,5)}</span>
            </div>
            <div class="jal-cell cell" id=${fileName + "_" + gridNum+"_"+14} >
            <span>${getJalCellLabel(gridNum,6)}</span>
            </div>
            <div class="jal-cell cell" id=${fileName + "_" + gridNum+"_"+15} >
            <span>${getJalCellLabel(gridNum,7)}</span>
            </div>
          </div>
          <div class="prithvi-tier flex-display">
            <div class="prithvi-cell" id=${fileName + "_" + gridNum+"_"+16}></div>
            <div class="prithvi-cell" id=${fileName + "_" + gridNum+"_"+17}></div>
            <div class="prithvi-cell" id=${fileName + "_" + gridNum+"_"+18}></div>
            <div class="prithvi-cell" id=${fileName + "_" + gridNum+"_"+19}></div>
            <div class="prithvi-cell" id=${fileName + "_" + gridNum+"_"+20}></div>
            <div class="prithvi-cell" id=${fileName + "_" + gridNum+"_"+21}></div>
            <div class="prithvi-cell" id=${fileName + "_" + gridNum+"_"+22}></div>
            <div class="prithvi-cell" id=${fileName + "_" + gridNum+"_"+23}></div>
            <div class="prithvi-cell" id=${fileName + "_" + gridNum+"_"+24}></div>
            <div class="prithvi-cell" id=${fileName + "_" + gridNum+"_"+25}></div>
            <div class="prithvi-cell" id=${fileName + "_" + gridNum+"_"+26}></div>
            <div class="prithvi-cell" id=${fileName + "_" + gridNum+"_"+27}></div>
            <div class="prithvi-cell" id=${fileName + "_" + gridNum+"_"+28}></div>
            <div class="prithvi-cell" id=${fileName + "_" + gridNum+"_"+29}></div>
            <div class="prithvi-cell" id=${fileName + "_" + gridNum+"_"+30}></div>
            <div class="prithvi-cell" id=${fileName + "_" + gridNum+"_"+31}></div>
            <div class="prithvi-cell" id=${fileName + "_" + gridNum+"_"+32}></div>
            <div class="prithvi-cell" id=${fileName + "_" + gridNum+"_"+33}></div>
            <div class="prithvi-cell" id=${fileName + "_" + gridNum+"_"+34}></div>
            <div class="prithvi-cell" id=${fileName + "_" + gridNum+"_"+35}></div>
            <div class="prithvi-cell" id=${fileName + "_" + gridNum+"_"+36}></div>
            <div class="prithvi-cell" id=${fileName + "_" + gridNum+"_"+37}></div>
            <div class="prithvi-cell" id=${fileName + "_" + gridNum+"_"+38}></div>
            <div class="prithvi-cell" id=${fileName + "_" + gridNum+"_"+39}></div>
          </div>
        </div>
  `;

  gridTimeLine.innerHTML += gridHTML;
  enableDropForCells(".cell");
}

export function renderAllGrids(gridsCount, fileName) {
  console.log(gridsCount);
  const fileLabel = document.querySelector('.js-rendered-filename');
  fileLabel.innerText = fileName;
  gridTimeLine.innerHTML = '';
  for(let i =0; i < gridsCount ; i++) {
    renderGrid(i, fileName);
  }
}

function getAkashCellLabel(gridNum) {
  const start9 = gridNum*24*bioesTime;
  const end9 = start9 + 24*bioesTime;
  return collectChars(start9, end9);
}

function getAgniCellLabel(gridNum, cellNo) {
  const start9 = gridNum*24*bioesTime + cellNo*12*bioesTime;
  const end9 = start9 + 12*bioesTime;
  return collectChars(start9, end9);
}

function getAyuvCellLabel(gridNum, cellNo) {
  const start9 = gridNum*24*bioesTime + cellNo*6*bioesTime;
  const end9 = start9 + 6*bioesTime;
  return collectChars(start9, end9);
}

function getJalCellLabel(gridNum, cellNo) {
  const start9 = gridNum*24*bioesTime + cellNo*3*bioesTime;
  const end9 = start9 + 3*bioesTime;
  return collectChars(start9, end9);
}

export function updateAllGridLabels(fileName) {
  for (let gridNum = 0; gridNum < gridsCount; gridNum++) {

    // 🔒 skip if this grid is locked
    const gridEl = document.getElementById(`${fileName}_${gridNum}`);
    if (gridEl && gridEl.classList.contains('locked')) {
      continue;
    }

    // -------- AKASH (1 cell) --------
    const akashCell = document.getElementById(
      `${fileName}_${gridNum}_1`
    );
    if (akashCell) {
      akashCell.textContent = getAkashCellLabel(gridNum);
    }

    // -------- AGNI (2 cells) --------
    for (let i = 0; i < 2; i++) {
      const agniCell = document.getElementById(
        `${fileName}_${gridNum}_${2 + i}`
      );
      if (agniCell) {
        agniCell.textContent = getAgniCellLabel(gridNum, i);
      }
    }

    // -------- VAYU (4 cells) --------
    for (let i = 0; i < 4; i++) {
      const vayuCell = document.getElementById(
        `${fileName}_${gridNum}_${4 + i}`
      );
      if (vayuCell) {
        vayuCell.textContent = getAyuvCellLabel(gridNum, i);
      }
    }

    // -------- JAL (8 cells) --------
    for (let i = 0; i < 8; i++) {
      const jalCell = document.getElementById(
        `${fileName}_${gridNum}_${8 + i}`
      );
      if (jalCell) {
        jalCell.textContent = getJalCellLabel(gridNum, i);
      }
    }
  }
}







