import "./getUsersInfo.js";
import { renderAkshars } from "./renderAkshars.js";
import { getAksharWidth, renderAllGrids } from "./renderBoothGrids.js";
import { playAudioSegment } from "./playAudioSegment.js";
import { initPageNavigation } from "./navigation.js";
import { getUrls } from "../config/urls.js";
import "./recorder.js";
import "./collectData.js";
import "./sendData.js";
import "./dragLetters.js";
import "./navigation.js";
import "./recordPage.js";
import "./loginPage.js";
import "./loadAudioFiles.js";
import "./controlMobileUI.js";

const urls = getUrls();
const {backendOrigin} = urls;

export const socket = io(backendOrigin);


document.addEventListener("DOMContentLoaded", initPageNavigation);

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

      const segments = parseSlowedStages(slowedCells);

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
        propagateGridFromPrithvi(row, fileName, gNo, segments);
      });
    });
  });
}

function buildPrithviFromSegments(segments, gridNo) {
  const GRID_SIZE = 24;
  const gridStart = gridNo * GRID_SIZE;
  const gridEnd = gridStart + GRID_SIZE - 1;

  const prithvi = new Array(GRID_SIZE).fill("");

  segments.forEach(({ letter, startIndex, endIndex }) => {
    // find overlap with this grid
    const overlapStart = Math.max(startIndex, gridStart);
    const overlapEnd = Math.min(endIndex, gridEnd);

    if (overlapStart > overlapEnd) return;

    for (let i = overlapStart; i <= overlapEnd; i++) {
      prithvi[i - gridStart] = letter;
    }
  });

  return prithvi;
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

function propagateGridFromPrithvi(row, fileName, gridNo, letterSegments) {
  const getCell = (cellNo) =>
    row.querySelector(
      `#${CSS.escape(`${fileName}_${gridNo}_${cellNo}`)}`
    );

  const getTextEl = (cell) =>
    cell?.querySelector(".cell-text");

  /* ---------------- PRITHVI (from segments, not DOM) ---------------- */
  const prithvi = buildPrithviFromSegments(letterSegments, gridNo);
  // prithvi is now length 24, index 0–23

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


//import { socket } from "./main.js";



socket.on("row:status", ({ filename, status }) => {
  const rows = document.querySelectorAll(".load-row");
  console.log(rows);

  rows.forEach(row => {
    const name = row.querySelector(".js-file-name")?.innerText;
    if (name === filename) {
      const statusEl = row.querySelector(".status");
      if (statusEl) {
        statusEl.innerText = status;
        statusEl.className = `status ${status.toLowerCase()}`;
      }
    }
  });
  
});



document.addEventListener("input", e => {
  const cell = e.target.closest(".cell-text");
  if (!cell) return;

  const cellDiv = cell.closest(".cell");
  if (!cellDiv) return;

  socket.emit("grid:update", {
    cellId: cellDiv.id,
    value: cell.innerText.trim()
  });
});


socket.on("grid:update", ({ cellId, value }) => {
  const el = document.querySelector(`#${CSS.escape(cellId)} .cell-text`);
  if (!el) return;

  if (el.innerText !== value) {
    el.innerText = value;
  }
});


/* ======================================================
   🔒 GLOBAL CELL LOCK EMITTER (CLICK BASED)
   ====================================================== */

document.addEventListener("click", e => {
  e.preventDefault();
  e.stopPropagation();

  const lockBtn = e.target.closest(".js-cell-lock");
  if (!lockBtn) return;

  const cellDiv = lockBtn.closest(".cell");
  if (!cellDiv) return;

  const isLocked = cellDiv.classList.contains("locked");
  console.log(isLocked);

  socket.emit("cell:lock", {
    cellId: cellDiv.id,
    locked: !isLocked
  });
});



socket.on("cell:lock", ({ cellId, locked }) => {
  const cell = document.getElementById(cellId);
  if (!cell) return;
  const cellTextEl = cell.querySelector('.cell-text');

  if (locked) {
    cell.classList.add("locked");
    cellTextEl.setAttribute("contenteditable", "false");
  } else {
    cell.classList.remove("locked");
    cellTextEl.setAttribute("contenteditable", "true");
  }
});




