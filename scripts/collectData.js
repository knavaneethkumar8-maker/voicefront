const gridTimeLine = document.querySelector('.js-grid-timeline');
const bioesTime = 9;

gridTimeLine.addEventListener("click", (e) => {
  const cell = e.target.closest(".cell");
  if (!cell) return;

  const cellData = collectCellData(cell);
  console.log(cellData);
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





