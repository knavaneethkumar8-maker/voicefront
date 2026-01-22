/* Characters */
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
    draggedBlock.remove();
  }
});















