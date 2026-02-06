import { getUrls } from "../config/urls.js";
import { showSubmitDataFailedMessage, showSubmitDataSuccessMessage } from "./sendData.js";
import { socket } from "./main.js";


const urls = getUrls();
const {backendOrigin} = urls;
const bioesTime = 9;

const gridTimeLine = document.querySelector('.js-grid-timeline');


gridTimeLine?.addEventListener("click", (e) => {
  e.preventDefault();
  const cell = e.target.closest(".cell");
  if (!cell) return;

  const cellData = collectCellData(cell);
  const allData = collectAllGridsData();
  console.log(cellData, allData);
});

export function collectLockedCellData() {
  document.addEventListener("click", async (e) => {
    const lockBtn = e.target.closest(".js-cell-lock");
    if (!lockBtn) return;

    e.preventDefault();
    e.stopPropagation();

    const cellEl = lockBtn.closest(".cell");
    if (!cellEl) return;

    // ✅ capture state BEFORE toggle
    const wasLocked = cellEl.classList.contains("locked");

    // allow other handlers to toggle first
    requestAnimationFrame(async () => {
      const isLockedNow = cellEl.classList.contains("locked");

      // 🔒 only unlocked → locked transition
      if (wasLocked || !isLockedNow) return;

      const gridEl = cellEl.closest(".booth-grid");
      const gridId = gridEl?.id;
      const cellId = cellEl.id;

      const cellData = collectCellData(cellEl);
      console.log(cellData);

      const payload = {
        grid_id: gridId,
        cell_id: cellId,
        cell: cellData,
        updated_at: new Date().toISOString()
      };

      try {
        const response = await fetch(
          `${backendOrigin}/upload/cells/${cellId}`,
          {
            method: "PUT",
            credentials: "include",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify(payload)
          }
        );

        if (!response.ok) {
          showSubmitDataFailedMessage();
          const result = await response.json();
          console.log(result);
          return;
        }

        showSubmitDataSuccessMessage();
        console.log("cell locked → data sent ✅");

        const result = await response.json();
        console.log(result);
      } catch (err) {
        console.error("CELL UPLOAD ERROR:", err);
        showSubmitDataFailedMessage();
      }
    });
  });
}



//collectLockedCellData();

function getCellLetters(cell) {
  // Select all letter blocks inside the cell
  const blocks = cell.querySelectorAll(".letter-block");
  
  // Map each block to its textContent and join
  return Array.from(blocks).map(b => b.textContent).join("");
}


export function collectCellData(cellEl) {
  const id = cellEl.id; // fileName_gridNo_cellNo
  const parts = id.split("_");

  const cellNo = Number(parts.pop());   // 7
  const gridNo = Number(parts.pop());

  //console.log(gridNo, cellNo);

  const { start_ms, end_ms } = getCellTimeRange(gridNo, cellNo);

  return {
    id: id,
    index: cellNo ?? 0,
    start_ms: start_ms ?? 0,
    end_ms: end_ms ?? 0,
    text: getCellLetters(cellEl) || cellEl.textContent?.trim() || "",
    conf: 1,
    status: "LOCKED",
    is_locked: true,
    metadata: {}
  };
}

function getCellTimeRange(gridNum, cellNo) {
  const gridStart = gridNum * 24 * bioesTime;

  // Akash (1 cell → 24 units)
  if (cellNo === 1) {
    return {
      start_ms: gridStart,
      end_ms: gridStart + 24 * bioesTime
    };
  }

  // Agni (2–3 → 12 units each)
  if (cellNo >= 2 && cellNo <= 3) {
    const idx = cellNo - 2;
    return {
      start_ms: gridStart + idx * 12 * bioesTime,
      end_ms: gridStart + (idx + 1) * 12 * bioesTime
    };
  }

  // Vayu (4–7 → 6 units each)
  if (cellNo >= 4 && cellNo <= 7) {
    const idx = cellNo - 4;
    return {
      start_ms: gridStart + idx * 6 * bioesTime,
      end_ms: gridStart + (idx + 1) * 6 * bioesTime
    };
  }

  // Jal (8–15 → 3 units each)
  if (cellNo >= 8 && cellNo <= 15) {
    const idx = cellNo - 8;
    return {
      start_ms: gridStart + idx * 3 * bioesTime,
      end_ms: gridStart + (idx + 1) * 3 * bioesTime
    };
  }

  // Prithvi (16–39 → 1 unit each)
  if (cellNo >= 16 && cellNo <= 39) {
    const idx = cellNo - 16;
    return {
      start_ms: gridStart + idx * bioesTime,
      end_ms: gridStart + (idx + 1) * bioesTime
    };
  }

  // Safety fallback
  return {
    start_ms: 0,
    end_ms: 0
  };
}

let finished = 0;
const finishedLabel = document.querySelector('.finished-target');


//get data when grid locked
export function collectLockedGridData() {
  document.addEventListener("click", async (e) => {
    e.preventDefault();
    e.stopPropagation();
    const lock = e.target.closest(".js-lock");
    if (!lock) return;

    const gridEl = lock.closest(".booth-grid");
    if (!gridEl) return;

    if(gridEl.classList.contains('locked')) {
      finished++;
      console.log(finished);
      finishedLabel.innerText = finished;
      const allGridCells = gridEl.querySelectorAll("*");
      allGridCells?.forEach(cell => {
        cell.contentEditable = "false";
      });
    }else {
      const allGridCells = gridEl.querySelectorAll(".cell");
      finishedLabel.innerText = finished;
      allGridCells?.forEach(cell => {
        cell.contentEditable = "true";
      });
    }

    if(!gridEl.classList.contains('locked')) {
      return;
    }
    
    const gridData = collectGridData(gridEl);
    console.log(gridData);
    const gridId = gridEl.id;

    try {
      const response = await fetch(`${backendOrigin}/upload/grids/${gridId}`, {
        method : "PUT",
        body : JSON.stringify(gridData),
        credentials : "include",
        headers : {
          "Content-Type" : "application/json"
        }
      });
      if(!response.ok) {
        showSubmitDataFailedMessage();
      }
      console.log('grid data sent');
      showSubmitDataSuccessMessage();

      const result = await response.json();
      console.log(result);
    } catch (err) {
      console.error(err);
    }

  });
}


gridTimeLine?.addEventListener("click", async (e) => {
  e.preventDefault();
  const lock = e.target.closest(".js-lock");
  if (!lock) return;

  const gridEl = lock.closest(".booth-grid");
  if (!gridEl) return;

  if(gridEl.classList.contains('locked')) {
    finished++;
    console.log(finished);
    finishedLabel.innerText = finished;
    const allGridCells = gridEl.querySelectorAll("*");
    allGridCells?.forEach(cell => {
      cell.contentEditable = "false";
    });
  }else {
    const allGridCells = gridEl.querySelectorAll("*");
    finished--;
    console.log(finished);
    finishedLabel.innerText = finished;
    allGridCells?.forEach(cell => {
      //cell.contentEditable = "true";
    });
  }

  if(!gridEl.classList.contains('locked')) {
    return;
  }
  
  const gridData = collectGridData(gridEl);
  console.log(gridData);
  const gridId = gridEl.id;

  try {
    const response = await fetch(`${backendOrigin}/upload/grids/${gridId}`, {
      method : "PUT",
      body : JSON.stringify(gridData),
      credentials : "include",
      headers : {
        "Content-Type" : "application/json"
      }
    });
    if(!response.ok) {
      showSubmitDataFailedMessage();
    }
    console.log('grid data sent');
    showSubmitDataSuccessMessage();

    const result = await response.json();
    console.log(result);
  } catch (err) {
    console.error(err);
  }

});


export function collectGridData(gridEl) {
  const gridId = gridEl.id; // e.g. file_0
  const gridIndex = Number(gridId.split("_").pop()) || 0;

  const gridStart = gridIndex * 24 * bioesTime;
  const gridEnd = gridStart + 24 * bioesTime;

  const tierConfig = {
    akash:   { name: "आकाश", index: 0 },
    agni:   { name: "अग्नि", index: 1 },
    vayu:   { name: "वायु", index: 2 },
    jal:    { name: "जल",   index: 3 },
    prithvi:{ name: "पृथ्वी",index: 4 }
    //bioes:  { name: "BIOES", index: 5 }
  };

  const tiers = {};

  for (const tierKey in tierConfig) {
    tiers[tierKey] = collectTierData(
      gridEl,
      gridIndex,
      tierKey,
      tierConfig[tierKey],
      gridStart,
      gridEnd
    );
  }

  return {
    id: gridId,
    index: gridIndex,
    start_ms: gridStart,
    end_ms: gridEnd,
    status: "LOCKED",
    is_locked: true,
    metadata: {},
    tiers
  };
}



function collectTierData(gridEl, gridIndex, tierKey, tierInfo, gridStart, gridEnd) {
  const cells = [];

  const cellEls = gridEl.querySelectorAll(`.${tierKey}-cell`);

  cellEls.forEach((cellEl) => {
    const cellData = collectCellData(cellEl);

    cells.push({
      id: cellData.id,
      index: cellData.index ?? 0,
      start_ms: cellData.start_ms ?? 0,
      end_ms: cellData.end_ms ?? 0,
      text: cellData.text ?? "",
      conf: cellData.conf ?? 0,
      status: cellData.status ?? "NEW",
      is_locked: cellData.is_locked ?? false,
      metadata: cellData.metadata ?? {}
    });
  });

  return {
    name: tierInfo.name,
    index: tierInfo.index,
    start_ms: gridStart,
    end_ms: gridEnd,
    cells
  };
}


export function collectAllGridsData(row) {
  const gridEls = row.querySelectorAll(".booth-grid");

  const grids = Array.from(gridEls).map((gridEl) =>
    collectGridData(gridEl)
  );

  return { grids };
}










