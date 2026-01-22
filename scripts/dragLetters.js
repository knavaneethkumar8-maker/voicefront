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
]

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
  div.classList.add(char)
  div.textContent = char;
  div.draggable = true;

  div.addEventListener("dragstart", e => {
    e.dataTransfer.setData("text/plain", char);
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

      const char = e.dataTransfer.getData("text/plain");
      if (!char) return;

      const block = createLetterBlock(char);
      cell.appendChild(block);
    });
  });
}
