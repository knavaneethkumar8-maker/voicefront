import "./getUsersInfo.js";
import { renderAkshars } from "./renderAkshars.js";
import { getAksharWidth, renderAllGrids } from "./renderBoothGrids.js";
import { playAudioSegment } from "./playAudioSegment.js";
import { initPageNavigation } from "./navigation.js";
import "./recorder.js";
import "./collectData.js";
import "./sendData.js";
import "./dragLetters.js";
import "./navigation.js";
import "./recordPage.js";
import "./loginPage.js";
import "./loadAudioFiles.js";
import "./controlMobileUI.js"


const audio = document.querySelector('.js-audio-file');
const width = getAksharWidth();
//renderAllGrids(2, 'new-file-name');
//renderAkshars(width, setAudioForAllCells);
//setAudioForAllCells();
//lockGrids();
document.addEventListener("DOMContentLoaded", initPageNavigation);

//enableDropForCells('.cell');


export function setAudioForAllCells(audio, row) {
  const allCells = row.querySelectorAll('.cell');
  allCells?.forEach(cell => {
    cell.addEventListener("click", () => {
      const times = getStartEndTimes(cell.id);
      playAudioSegment(audio, times.start, times.end);
    })
  })
}

export function setAudioForSlowedCells(slowTimelineEl, factor) {
  if (!slowTimelineEl) return;

  const audioEl = slowTimelineEl.querySelector("audio");
  const slowedCells = slowTimelineEl.querySelectorAll(".slowed-cell");

  if (!audioEl || !slowedCells.length) return;

  const row = slowTimelineEl.closest(".load-row");

  slowedCells.forEach((cell, index) => {

    // 🎧 audio (already correct)
    cell.addEventListener("click", () => {
      const start = (index * 9 * factor) / 1000;
      const end = start + (9 * factor) / 1000;
      playAudioSegment(audioEl, start, end);
    });

    // ✍️ annotation → normal grid
    cell.addEventListener("input", () => {
      const text = cell.textContent;
      if (!text) return;

      const { start, end } =
        getNormalTimeFromSlowedCell(index, factor);

      applySlowedInputToNormalGrid({
        row,
        text,
        normalStart: start,
        normalEnd: end
      });
      propagateGridFromPrithvi(row, fileName, gridNo);

    });
  });
}



function getNormalCellTimeRange(gridNo, cellNo) {
  const GRID_MS = 216;
  const PRITHVI_MS = 9;

  const gridStart = gridNo * GRID_MS;

  // PRITHVI tier (cellNo 16 → 39)
  if (cellNo >= 16 && cellNo < 40) {
    const index = cellNo - 16;
    const start = gridStart + index * PRITHVI_MS;
    return {
      start,
      end: start + PRITHVI_MS
    };
  }

  // ignore higher tiers for now
  return null;
}


function getNormalTimeFromSlowedCell(index, factor) {
  const slowedCellMs = 9 * factor;

  const slowedStart = index * slowedCellMs;
  const slowedEnd = slowedStart + slowedCellMs;

  return {
    start: slowedStart / factor,
    end: slowedEnd / factor
  };
}



function applySlowedInputToNormalGrid({
  row,
  text,
  normalStart,
  normalEnd
}) {
  if (!text.trim()) return;

  const fileName = row.querySelector(".js-file-name").textContent;
  const grids = row.querySelectorAll(".booth-grid");

  grids.forEach((gridEl) => {
    const [_, gridNoStr] = gridEl.id.split("_");
    const gridNo = Number(gridNoStr);

    for (let cellNo = 16; cellNo < 40; cellNo++) {
      const range = getNormalCellTimeRange(gridNo, cellNo);
      if (!range) continue;

      const overlaps =
        normalStart < range.end && normalEnd > range.start;

      if (!overlaps) continue;

      const cellId = `${fileName}_${gridNo}_${cellNo}`;
      const cellEl = row.querySelector(
        `#${CSS.escape(cellId)}`
      );
      if (!cellEl) continue;

      // 🔒 skip protected
      if (isCellProtected(cellEl)) continue;

      // append text
      cellEl.textContent =
        (cellEl.textContent || "") + text;
    }
  });
}



export function lockGrids(row) {
  const allLocks = row.querySelectorAll('.js-lock');
  allLocks.forEach(lock => {
    lock.addEventListener("click", () => {
      const gridId = lock.dataset.id;
      const selectedGrid = document.getElementById(gridId);

      if(!selectedGrid.classList.contains('locked')) {
        lock.innerText = "🔒";
        lock.style.backgroundColor = "green";
        selectedGrid.classList.add('locked');
      } else {
        lock.innerText = "🔓";
        lock.style.backgroundColor = "rgb(37, 37, 37)";
        selectedGrid.classList.remove('locked');
      }
      
    })
  })
}

function getStartEndTimes(id) {
  const idArray = id.split("_");
  //console.log(idArray);
  const gridNum = parseInt(idArray.at(-2));
  const cellId = parseInt(idArray.at(-1));
  //console.log(gridNum, cellId);

  let start;
  let end;
  if(cellId === 1) {
    start = ((gridNum)*216)/1000;
    end = start + (216/1000);
  }else if( cellId >=2 && cellId < 4) {
    start = ((gridNum)*216 + (cellId-2)*108)/1000;
    end = start + (108/1000);
  } else if(cellId < 8) {
    start = ((gridNum)*216 + (cellId-4)*54)/1000;
    end = start + (54/1000);
  } else if(cellId < 16) {
    start = ((gridNum)*216 + (cellId-8)*27)/1000;
    end = start + (27/1000);
  } else {
    return;
  }
  const times = {
    start : Number(start.toFixed(4)),
    end : Number(end.toFixed(4))
  }
  return times;
}


function propagateGridFromPrithvi(row, fileName, gridNo) {
  const getCell = (cellNo) =>
    row.querySelector(
      `#${CSS.escape(`${fileName}_${gridNo}_${cellNo}`)}`
    );

  // ---------- PRITHVI (8–31) ----------
  const prithvi = [];
  for (let i = 8; i < 32; i++) {
    prithvi.push(getCell(i)?.textContent || "");
  }

  // ---------- JAL (4–7) : 3 prithvi ----------
  for (let i = 0; i < 8; i++) {
    const text =
      prithvi[i * 3] +
      prithvi[i * 3 + 1] +
      prithvi[i * 3 + 2];

    const cell = getCell(4 + i);
    if (cell && !isCellProtected(cell)) {
      cell.textContent = text;
    }
  }

  // ---------- VAYU (2–3) : 6 prithvi ----------
  for (let i = 0; i < 4; i++) {
    const base = i * 6;
    const text =
      prithvi[base] +
      prithvi[base + 1] +
      prithvi[base + 2] +
      prithvi[base + 3] +
      prithvi[base + 4] +
      prithvi[base + 5];

    const cell = getCell(2 + i);
    if (cell && !isCellProtected(cell)) {
      cell.textContent = text;
    }
  }

  // ---------- AGNI (1) : 12 prithvi ----------
  {
    let text = "";
    for (let i = 0; i < 12; i++) text += prithvi[i];
    const cell = getCell(1);
    if (cell && !isCellProtected(cell)) {
      cell.textContent = text;
    }
  }

  // ---------- AKASH / GRID (0) : 24 prithvi ----------
  {
    let text = "";
    for (let i = 0; i < 24; i++) text += prithvi[i];
    const cell = getCell(0);
    if (cell && !isCellProtected(cell)) {
      cell.textContent = text;
    }
  }
}




