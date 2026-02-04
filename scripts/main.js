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
  const fileName = row.querySelector(".js-file-name").innerText;

  slowedCells.forEach((cell, index) => {

    // 🎧 audio playback (factor is ONLY for audio)
    cell.addEventListener("click", () => {
      const start = (index * 9 * factor) / 1000;
      const end = start + (9 * factor) / 1000;
      playAudioSegment(audioEl, start, end);
    });

    // ✍️ RAW slowed → RAW prithvi (1-to-1 index mapping)
    cell.addEventListener("input", () => {
      const rawValue = cell.textContent.trim();

      // 🔑 1:1 cell mapping
      const globalPrithviIndex = index;

      const gridNo = Math.floor(globalPrithviIndex / 24);
      const prithviIndex = globalPrithviIndex % 24; // 0–23
      const cellNo = 16 + prithviIndex;

      const prithviCell = row.querySelector(
        `#${CSS.escape(`${fileName}_${gridNo}_${cellNo}`)}`
      );

      if (prithviCell && !isCellProtected(prithviCell)) {
        prithviCell.innerText = rawValue;
      }

      // propagate upper tiers (unchanged)
      const grids = row.querySelectorAll(".booth-grid");
      grids.forEach(gridEl => {
        const gNo = Number(gridEl.id.split("_").at(-1));
        propagateGridFromPrithvi(row, fileName, gNo);
      });
    });
  });
}



function getGridNoFromStartTime(startMs) {
  return Math.floor(startMs / 216);
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

  const getTextEl = (cell) =>
    cell?.querySelector(".cell-text");

  /* ---------------- PRITHVI (source of truth) ---------------- */
  const prithvi = [];
  for (let i = 16; i < 40; i++) {
    prithvi.push(getCell(i)?.innerText || "");
  }

  /* ---------------- JAL (3 prithvi = 27ms) ---------------- */
  for (let i = 0; i < 8; i++) {
    const slice = prithvi.slice(i * 3, i * 3 + 3);
    const value = collapseConsecutive(slice);

    const cell = getCell(8 + i);
    const textEl = getTextEl(cell);

    if (textEl && !isCellProtected(cell)) {
      textEl.innerText = value;
    }
  }

  /* ---------------- VAYU (6 prithvi) ---------------- */
  for (let i = 0; i < 4; i++) {
    const slice = prithvi.slice(i * 6, i * 6 + 6);
    const value = collapseConsecutive(slice);

    const cell = getCell(4 + i);
    const textEl = getTextEl(cell);

    if (textEl && !isCellProtected(cell)) {
      textEl.innerText = value;
    }
  }

  /* ---------------- AGNI (12 prithvi) ---------------- */
  for (let i = 0; i < 2; i++) {
    const slice = prithvi.slice(i * 12, i * 12 + 12);
    const value = collapseConsecutive(slice);

    const cell = getCell(2 + i);
    const textEl = getTextEl(cell);

    if (textEl && !isCellProtected(cell)) {
      textEl.innerText = value;
    }
  }

  /* ---------------- AKASH (24 prithvi) ---------------- */
  {
    const value = collapseConsecutive(prithvi);

    const cell = getCell(1);
    const textEl = getTextEl(cell);

    if (textEl && !isCellProtected(cell)) {
      textEl.innerText = value;
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

function parseSlowedStages(slowedCells) {
  const segments = [];

  let current = null;

  slowedCells.forEach((cell, index) => {
    const raw = cell.textContent.trim();
    if (!raw) return;

    const parts = raw.split(",");
    const stage = Number(parts[0]);
    const letter = parts[1]?.trim();

    // new letter starts
    if (letter) {
      // close previous letter
      if (current) {
        current.endIndex = index - 1;
        segments.push(current);
      }

      current = {
        letter,
        startIndex: index,
        endIndex: index
      };
      return;
    }

    // stage-only continuation
    if (current) {
      current.endIndex = index;
    }

    // stage 7 ends letter
    if (stage === 7 && current) {
      segments.push(current);
      current = null;
    }
  });

  // close dangling letter
  if (current) {
    segments.push(current);
  }

  return segments;
}


function applySlowedStagesToPrithvi({
  row,
  segments,
  factor
}) {
  const fileName = row.querySelector(".js-file-name").textContent;
  const grids = row.querySelectorAll(".booth-grid");

  // clear all Prithvi first
  grids.forEach(gridEl => {
    const gridNo = Number(gridEl.id.split("_").at(-1));
    for (let i = 16; i < 40; i++) {
      const cell = row.querySelector(
        `#${CSS.escape(`${fileName}_${gridNo}_${i}`)}`
      );
      if (cell && !isCellProtected(cell)) {
        cell.innerText = "";
      }
    }
  });

  // apply segments
  segments.forEach(seg => {
    for (let slowedIndex = seg.startIndex; slowedIndex <= seg.endIndex; slowedIndex++) {
      const { start } = getNormalTimeFromSlowedCell(slowedIndex, factor);
      const gridNo = getGridNoFromStartTime(start);

      const prithviIndex =
        Math.floor((start % 216) / 9); // 0–23

      const cellNo = 16 + prithviIndex;

      const cell = row.querySelector(
        `#${CSS.escape(`${fileName}_${gridNo}_${cellNo}`)}`
      );

      if (cell && !isCellProtected(cell)) {
        cell.innerText = seg.letter;
      }
    }
  });
}


function collapseConsecutive(values) {
  const result = [];
  let last = null;

  for (const v of values) {
    if (!v) continue;          // ignore empty
    if (v !== last) {
      result.push(v);
      last = v;
    }
  }

  return result.join("");
}






