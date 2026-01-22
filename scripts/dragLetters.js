
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


let touchDragBlock = null;
let touchOffsetX = 0;
let touchOffsetY = 0;
let longPressTimer = null;


const lettersContainer = document.getElementById("lettersContainer");

AKSHAR_SET.forEach(char => {
  const div = createLetterBlock(char, "letter");
  div.classList.add(char);
  lettersContainer.appendChild(div);
});

//enableDropForCells(".cell");

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
    touchDragBlock = div;

    const rect = div.getBoundingClientRect();
    touchOffsetX = e.touches[0].clientX - rect.left;
    touchOffsetY = e.touches[0].clientY - rect.top;

    div.classList.add("touch-dragging");
    div.style.position = "fixed";
    div.style.zIndex = "1000";
  }, 300);
});

div.addEventListener("touchmove", e => {
  if (!touchDragBlock) return;
  e.preventDefault();

  const touch = e.touches[0];
  div.style.left = `${touch.clientX - touchOffsetX}px`;
  div.style.top = `${touch.clientY - touchOffsetY}px`;
});

div.addEventListener("touchend", e => {
  clearTimeout(longPressTimer);

  if (!touchDragBlock) return;

  handleTouchDrop(e.changedTouches[0], div);
  cleanupTouchDrag(div);
});

  return div;
}

export function enableDropForCells(selector) {
  document.querySelectorAll(selector).forEach(cell => {

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



const deleteRegion = document.querySelector(".js-delete-region");

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






function handleTouchDrop(touch, block) {
  const dropTarget = document.elementFromPoint(
    touch.clientX,
    touch.clientY
  );

  const cell = dropTarget?.closest(".cell");
  const deleteZone = dropTarget?.closest(".js-delete-region");

  if (cell) {
    const char = block.textContent;
    const copy = createLetterBlock(char);
    cell.appendChild(copy);
    updateCellLabel(cell);

    if (block.closest(".cell")) block.remove();
  }

  if (deleteZone && block.closest(".cell")) {
    const parentCell = block.closest(".cell");
    block.remove();
    updateCellLabel(parentCell);
  }
}




function cleanupTouchDrag(block) {
  block.classList.remove("touch-dragging");
  block.style.position = "";
  block.style.left = "";
  block.style.top = "";
  block.style.zIndex = "";

  touchDragBlock = null;
}























