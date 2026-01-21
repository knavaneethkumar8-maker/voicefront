const gridTimeLine = document.querySelector('.js-grid-timeline');
const bioesTime = 9;

gridTimeLine.addEventListener("click", (e) => {
  e.preventDefault();
  const cell = e.target.closest(".cell");
  if (!cell) return;

  const cellData = collectCellData(cell);
  const allData = collectAllGridsData();
  console.log(cellData, allData);
});


function collectCellData(cellEl) {
  const id = cellEl.id; // fileName_gridNo_cellNo
  const [file, gridNoStr, cellNoStr] = id.split("_");

  const gridNo = Number(gridNoStr);
  const cellNo = Number(cellNoStr);

  const { start_ms, end_ms } = getCellTimeRange(gridNo, cellNo);

  return {
    id: id,
    index: cellNo ?? 0,
    start_ms: start_ms ?? 0,
    end_ms: end_ms ?? 0,
    text: cellEl.textContent?.trim() || "",
    conf: 0,
    status: "NEW",
    is_locked: false,
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


gridTimeLine.addEventListener("click", async (e) => {
  e.preventDefault();
  const lock = e.target.closest(".js-lock");
  if (!lock) return;

  const gridEl = lock.closest(".booth-grid");
  if (!gridEl) return;

  if(gridEl.classList.contains('locked')) {
    const allGridCells = gridEl.querySelectorAll("*");
    allGridCells?.forEach(cell => {
      cell.contentEditable = "false";
    });
  }else {
    const allGridCells = gridEl.querySelectorAll("*");
    allGridCells?.forEach(cell => {
    cell.contentEditable = "true";
  });
  }
  
  const gridData = collectGridData(gridEl);
  console.log(gridData);
  const gridId = gridEl.id;

  try {
    const response = await fetch(`https://api.xn--l2bot2c0c.com/upload/grids/${gridId}`, {
      method : "PUT",
      body : JSON.stringify(gridData),
      credentials : "include",
      headers : {
        "Content-Type" : "application/json"
      }
    });
    console.log('grid data sent');

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
    status: "NEW",
    is_locked: false,
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


export function collectAllGridsData() {
  const gridEls = document.querySelectorAll(".booth-grid");

  const grids = Array.from(gridEls).map((gridEl) =>
    collectGridData(gridEl)
  );

  return { grids };
}










