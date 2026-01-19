export const akshars = [
{ char:"म", start:0,  end:20 },
  { char:"ै", start:21, end:35 },
  { char:"ं", start:36, end:55 },
  { char:"व", start:60, end:90 },
  { char:"ि", start:91, end:110 },
  { char:"द", start:111, end:140 },
  { char:"य", start:141, end:170 },
  { char:"ा", start:171, end:200 },
  { char:"ज", start:210, end:240 },
  { char:"ा", start:241, end:270 },
  { char:"त", start:271, end:300 },
  { char:"ा", start:301, end:330 }
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

function renderGrid(gridNum) {
  const startTime = gridNum*24*bioesTime;
  const gridEndTime = startTime + (24*bioesTime);
  const gridHTML = `
  <div class="booth-grid" id= ${fileName + "_" + gridNum}>
          <div class="lock js-lock" data-id=${fileName + "_" + gridNum}>🔓</div>
          <div class="akash-tier">
            <div class="akash-cell cell" id= ${fileName + "_" +gridNum + "_" + 1} >
              ${getAkashCellLabel(gridNum)}
            </div>
          </div>
          <div class="agni-tier flex-display">
            <div class="agni-cell cell" id=${fileName + "_" + gridNum+"_"+2}>${getAgniCellLabel(gridNum,0)}</div>
            <div class="agni-cell cell" id=${fileName + "_" + gridNum+"_"+3}>${getAgniCellLabel(gridNum,1)}</div>
          </div>
          <div class="vayu-tier flex-display">
            <div class="vayu-cell cell" id=${fileName + "_" + gridNum+"_"+ 4}>
            ${getAyuvCellLabel(gridNum,0)}
            </div>
            <div class="vayu-cell cell" id=${fileName + "_" + gridNum+"_"+5}>
            ${getAyuvCellLabel(gridNum,1)}
            </div>
            <div class="vayu-cell cell" id=${fileName + "_" + gridNum+"_"+6}>
            ${getAyuvCellLabel(gridNum,2)}
            </div>
            <div class="vayu-cell cell" id=${fileName + "_" + gridNum+"_"+7}>
            ${getAyuvCellLabel(gridNum,3)}
            </div>
          </div>
          <div class="jal-tier flex-display">
            <div class="jal-cell cell" id=${fileName + "_" + gridNum+"_"+8}>
            ${getJalCellLabel(gridNum,0)}
            </div>
            <div class="jal-cell cell" id=${fileName + "_" + gridNum+"_"+9}>
            ${getJalCellLabel(gridNum,1)}
            </div>
            <div class="jal-cell cell" id=${fileName + "_" + gridNum+"_"+10}>
            ${getJalCellLabel(gridNum,2)}
            </div>
            <div class="jal-cell cell" id=${fileName + "_" + gridNum+"_"+11}>
            ${getJalCellLabel(gridNum,3)}
            </div>
            <div class="jal-cell cell" id=${fileName + "_" + gridNum+"_"+12}>
            ${getJalCellLabel(gridNum,4)}
            </div>
            <div class="jal-cell cell" id=${fileName + "_" + gridNum+"_"+13}>
            ${getJalCellLabel(gridNum,5)}
            </div>
            <div class="jal-cell cell" id=${fileName + "_" + gridNum+"_"+14}>
            ${getJalCellLabel(gridNum,6)}
            </div>
            <div class="jal-cell cell" id=${fileName + "_" + gridNum+"_"+15}>
            ${getJalCellLabel(gridNum,7)}
            </div>
          </div>
          <div class="prithvi-tier flex-display">
            <div class="prithvi-cell">10</div>
            <div class="prithvi-cell">16</div>
            <div class="prithvi-cell">17</div>
            <div class="prithvi-cell">10</div>
            <div class="prithvi-cell">11</div>
            <div class="prithvi-cell">12</div>
            <div class="prithvi-cell">13</div>
            <div class="prithvi-cell">14</div>
            <div class="prithvi-cell">7</div>
            <div class="prithvi-cell">8</div>
            <div class="prithvi-cell">9</div>
            <div class="prithvi-cell">10</div>
            <div class="prithvi-cell">11</div>
            <div class="prithvi-cell">12</div>
            <div class="prithvi-cell">13</div>
            <div class="prithvi-cell">14</div>
            <div class="prithvi-cell">7</div>
            <div class="prithvi-cell">8</div>
            <div class="prithvi-cell">9</div>
            <div class="prithvi-cell">10</div>
            <div class="prithvi-cell">11</div>
            <div class="prithvi-cell">12</div>
            <div class="prithvi-cell">13</div>
            <div class="prithvi-cell">14</div>
          </div>
        </div>
  `;

  gridTimeLine.innerHTML += gridHTML;
}

export function renderAllGrids(gridsCount) {
  console.log(gridsCount);
  gridTimeLine.innerHTML = '';
  for(let i =0; i < gridsCount ; i++) {
    renderGrid(i);
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


export function updateAllGridLabels() {
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







