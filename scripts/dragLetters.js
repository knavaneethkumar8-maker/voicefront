
const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const AKSHAR_SET = [
    "अ", "आ", "इ", "उ", "ए", "ओ",
    "क", "ख", "ग", "घ", "च", "छ", "ज", "झ",
    "ट", "ठ", "ड", "ढ", "त", "थ", "द", "ध",
    "प", "फ", "ब", "भ",
    "न", "म",
    "य", "र", "ल", "व",
    "स", "ह" , "०"
];

let draggedBlock = null;
let draggedFromCell = false;


let touchGhost = null;
let touchSourceBlock = null;
let touchOffsetX = 0;
let touchOffsetY = 0;
let longPressTimer = null;



/* const lettersContainer = document.getElementById("lettersContainer");

AKSHAR_SET.forEach(char => {
  const div = createLetterBlock(char, "letter");
  div.classList.add(char);
  lettersContainer.appendChild(div);
}); */

//enableDropForCells(".cell");

export function createLettersContainer(container) {
  AKSHAR_SET.forEach(char => {
    const div = createLetterBlock(char, "letter");
    div.classList.add(char);
    container.appendChild(div);
  });
}

function createLetterBlock(char) {
  const div = document.createElement("div");
  div.className = "letter-block";
  div.classList.add(char);
  div.textContent = char;
  div.draggable = true;

  div.addEventListener("dragstart", () => {
    draggedBlock = div;
    draggedFromCell = !!div.closest(".cell");
  });

  div.addEventListener("dragend", () => {
    draggedBlock = null;
    draggedFromCell = false;
  });

div.addEventListener("touchstart", e => {
  if (e.touches.length !== 1) return;

  longPressTimer = setTimeout(() => {
    touchSourceBlock = div;

    // 👻 create ghost
    touchGhost = div.cloneNode(true);
    touchGhost.classList.add("touch-dragging");
    document.body.appendChild(touchGhost);

    const rect = div.getBoundingClientRect();
    const touch = e.touches[0];

    touchOffsetX = touch.clientX - rect.left;
    touchOffsetY = touch.clientY - rect.top;

    touchGhost.style.position = "fixed";
    touchGhost.style.left = `${touch.clientX - touchOffsetX}px`;
    touchGhost.style.top = `${touch.clientY - touchOffsetY}px`;
    touchGhost.style.zIndex = "1000";
    touchGhost.style.pointerEvents = "none";
  }, 300);
});


div.addEventListener("touchmove", e => {
  if (!touchGhost) return;
  e.preventDefault();

  const touch = e.touches[0];
  touchGhost.style.left = `${touch.clientX - touchOffsetX}px`;
  touchGhost.style.top = `${touch.clientY - touchOffsetY}px`;
});


div.addEventListener("touchend", e => {
  clearTimeout(longPressTimer);
  if (!touchGhost || !touchSourceBlock) return;

  const touch = e.changedTouches[0];
  handleTouchDrop(touch, touchSourceBlock);

  touchGhost.remove();
  touchGhost = null;
  touchSourceBlock = null;
});


  return div;
}

export function enableDropForCells(selector, row) {
  row.querySelectorAll(selector).forEach(cell => {

    cell.addEventListener("dragover", e => {
      e.preventDefault();
    });

    cell.addEventListener("drop", e => {
      e.preventDefault();

      if (!draggedBlock) return;

      const char = draggedBlock.textContent;
      const copy = createLetterBlock(char);

      cell.appendChild(copy);
      updateCellLabel(cell);
    });
  });
}



export function setAllDeleteRegionsActive() {

  const allDeleteRegions = document.querySelectorAll(".js-delete-region");

  allDeleteRegions?.forEach(deleteRegion => {
    deleteRegion.addEventListener("dragover", e => {
      e.preventDefault();
      deleteRegion.classList.add("active-delete");
    });

    deleteRegion.addEventListener("dragleave", () => {
      deleteRegion.classList.remove("active-delete");
    });

    deleteRegion.addEventListener("drop", e => {
      e.preventDefault();
      deleteRegion.classList.remove("active-delete");

      // 🔥 DELETE ONLY if dragged from a cell
      if (draggedFromCell && draggedBlock) {
        const parentCell = draggedBlock.closest(".cell");
        draggedBlock.remove();
        if (parentCell) {
          updateCellLabel(parentCell);
        }
      }
    });

  })

}

export function setRowDeleteRegionsActive(row) {
  const deleteRegion = row.querySelector(".js-delete-region");
  deleteRegion.addEventListener("dragover", e => {
    e.preventDefault();
    deleteRegion.classList.add("active-delete");
  });

  deleteRegion.addEventListener("dragleave", () => {
    deleteRegion.classList.remove("active-delete");
  });

  deleteRegion.addEventListener("drop", e => {
    e.preventDefault();
    deleteRegion.classList.remove("active-delete");

    // 🔥 DELETE ONLY if dragged from a cell
    if (draggedFromCell && draggedBlock) {
      const parentCell = draggedBlock.closest(".cell");
      draggedBlock.remove();
      if (parentCell) {
        updateCellLabel(parentCell);
      }
    }
  });


}







function getCellLetters(cell) {
  // Select all letter blocks inside the cell
  const blocks = cell.querySelectorAll(".letter-block");
  
  // Map each block to its textContent and join
  return Array.from(blocks).map(b => b.textContent).join("");
}


function updateCellLabel(cell) {
  const labelEl = cell.querySelector(".cell-label");
  if (!labelEl) return;

  labelEl.textContent = getCellLetters(cell);
}

// 📱 MOBILE LONG-PRESS DRAG
function handleTouchDrop(touch, sourceBlock) {
  const target = document.elementFromPoint(
    touch.clientX,
    touch.clientY
  );

  const cell = target?.closest(".cell");
  const deleteZone = target?.closest(".js-delete-region");

  const fromCell = sourceBlock.closest(".cell");

  // ✅ DROP ON CELL → ALWAYS COPY
  if (cell) {
    const copy = createLetterBlock(sourceBlock.textContent);
    cell.appendChild(copy);
    updateCellLabel(cell);
  }

  // ✅ DROP ON DELETE → REMOVE ONLY IF FROM CELL
  if (deleteZone && fromCell) {
    fromCell.removeChild(sourceBlock);
    updateCellLabel(fromCell);
  }
}
























