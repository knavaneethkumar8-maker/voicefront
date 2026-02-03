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
      console.log(text);
      if (!text) return;

      const { start, end } = getNormalTimeFromSlowedCell(index, factor);
      console.log(start, end);

      applySlowedInputToNormalGrid({
        row,
        text,
        normalStart: start,
        normalEnd: end
      });
      const fileName = row.querySelector('.js-file-name').innerText
      const gridNo = getGridNoFromStartTime(start);
      console.log(gridNo);
      propagateGridFromPrithvi(row, fileName, gridNo);

    });
  });
}

function getGridNoFromStartTime(startMs) {
  return Math.floor(startMs / 216);
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
  console.log(row, text, normalStart, normalEnd)

  const fileName = row.querySelector(".js-file-name").textContent;
  const grids = row.querySelectorAll(".booth-grid");
  console.log(fileName)

  grids.forEach((gridEl) => {
    const gridNoStr = gridEl.id.split("_").at(-1);
    console.log(gridEl.id.split("_"));
    const gridNo = Number(gridNoStr);
    console.log(gridNo)

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

  const getCellTextEl = (cell) =>
    cell?.querySelector(".cell-text");

  // ---------- PRITHVI (16–39) ----------
  const prithvi = [];
  for (let i = 16; i < 40; i++) {
    prithvi.push(getCell(i)?.innerText || "");
  }

  // ---------- JAL (8–15) : 3 prithvi ----------
  for (let i = 0; i < 8; i++) {
    const text =
      prithvi[i * 3] +
      prithvi[i * 3 + 1] +
      prithvi[i * 3 + 2];

    const cell = getCell(8 + i);
    const textEl = getCellTextEl(cell);

    if (textEl && !isCellProtected(cell)) {
      textEl.innerText = text;
    }
  }

  // ---------- VAYU (4–7) : 6 prithvi ----------
  for (let i = 0; i < 4; i++) {
    const base = i * 6;
    const text =
      prithvi[base] +
      prithvi[base + 1] +
      prithvi[base + 2] +
      prithvi[base + 3] +
      prithvi[base + 4] +
      prithvi[base + 5];

    const cell = getCell(4 + i);
    const textEl = getCellTextEl(cell);

    if (textEl && !isCellProtected(cell)) {
      textEl.innerText = text;
    }
  }

  // ---------- AGNI (2–3) : 12 prithvi ----------
  for (let i = 0; i < 2; i++) {
    let text = "";
    for (let j = 0; j < 12; j++) {
      text += prithvi[i * 12 + j];
    }

    const cell = getCell(2 + i);
    const textEl = getCellTextEl(cell);

    if (textEl && !isCellProtected(cell)) {
      textEl.innerText = text;
    }
  }

  // ---------- AKASH (1) : 24 prithvi ----------
  {
    let text = "";
    for (let i = 0; i < 24; i++) text += prithvi[i];

    const cell = getCell(1);
    const textEl = getCellTextEl(cell);

    if (textEl && !isCellProtected(cell)) {
      textEl.innerText = text;
    }
  }
}



function isCellProtected(cellEl) {
  if (!cellEl) return true;

  // cell-level protection
  if (
    cellEl.classList.contains("locked") ||
    cellEl.classList.contains("verified")
  ) {
    return true;
  }

  // grid-level protection
  const gridEl = cellEl.closest(".booth-grid");
  if (gridEl && gridEl.classList.contains("locked")) {
    return true;
  }

  return false;
}




