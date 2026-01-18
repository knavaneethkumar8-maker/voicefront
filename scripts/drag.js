const dragElement = document.querySelector('.js-drag');
const dragField = document.querySelector('.js-drag-field');

let isDragging = false;
let offsetX = 0;
let offsetY = 0;


dragElement?.addEventListener("click", ()=> {
  console.log('present');
});

dragElement.addEventListener("mousedown", (e) => {
  isDragging = true;
  console.log(e.clientX);
  console.log(e.clientY);
  console.log(dragElement.offsetLeft);
  console.log(dragElement.offsetTop);
  offsetX = e.clientX - dragElement.offsetLeft;
  offsetY = e.clientY - dragElement.offsetTop;
});


document.addEventListener('mousemove', (e) => {
  if(!isDragging) return;
  console.log(isDragging);

  let x = e.clientX - offsetX;
  let y = e.clientY - offsetY;

  const maxX = dragField.clientWidth - dragElement.offsetWidth;
  const maxY = dragField.clientHeight - dragElement.offsetHeight;

  x = Math.max(0, Math.min(x, maxX));
  y = Math.max(0, Math.min(y, maxY));

  dragElement.style.left = x + "px";
  dragElement.style.top = y + "px";
});

document.addEventListener("mouseup", () => {
  isDragging = false;
})
