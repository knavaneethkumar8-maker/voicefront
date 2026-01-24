const dragDropToggle = document.querySelector('.select-drag-drop-button');
const aksharEditor = document.querySelector('.js-askhar-editor');
const deleteRegion = document.querySelector('.js-delete-region')
const lettersContainer = document.querySelector('.js-letters-container');


dragDropToggle?.addEventListener('click', () => {
  if(!dragDropToggle.classList.contains('drag-selected')) {
    deleteRegion.classList.remove('hide');
    lettersContainer.classList.remove('hide');
    updateEditable(false);
    dragDropToggle.classList.add('drag-selected');
  } else {
    deleteRegion.classList.add('hide');
    lettersContainer.classList.add('hide');
    updateEditable(true);
    dragDropToggle.classList.remove('drag-selected');
  }
});

window.addEventListener("resize", () => {});
//updateEditable(); // run once

function updateEditable(value) {
  document.querySelectorAll(".cell").forEach(cell => {
    cell.contentEditable = value;
  });
}

export function updateScrollEditable() {
  const editable = window.innerWidth < 640;
  document.querySelectorAll(".cell").forEach(cell => {
    cell.contentEditable = editable;
  });
}

window.addEventListener("resize", updateScrollEditable);
updateScrollEditable(); // run once


export function makeCellsEditableOnMobile() {
  if (window.innerWidth < 640) {
    document.querySelectorAll(".cell").forEach(cell => {
      cell.contentEditable = "true";
    });
  }
}
