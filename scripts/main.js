import { renderAkshars } from "./renderAkshars.js";
import { getAksharWidth } from "./renderBoothGrids.js";
import { playAudioSegment } from "./playAudioSegment.js";

const audio = document.querySelector('.js-audio-file');
const width = getAksharWidth();
renderAkshars(width, setAudioForAllCells);
//playAudioSegment(audio, 10, 11);

const ele = document.getElementById("voice1_1_1");
console.log(ele);

ele.addEventListener("click", ()=> {
  console.log('clicked');
  const times = getStartEndTimes(ele.id);
  console.log(times);
  playAudioSegment(audio, times.start, times.end);
})


function setAudioForAllCells() {
  const allCells = document.querySelectorAll('.cell');
  allCells?.forEach(cell => {
    cell.addEventListener("click", () => {
      console.log(cell.id);
      const times = getStartEndTimes(cell.id);
      playAudioSegment(audio, times.start, times.end);
    })
  })
}


setAudioForAllCells();


function lockGrids() {
  const allLocks = document.querySelectorAll('.js-lock');
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

lockGrids();


function getStartEndTimes(id) {
  const idArray = id.split("_");
  console.log(idArray);
  const gridNum = parseInt(idArray[1]);
  const cellId = parseInt(idArray[2]);
  console.log(gridNum, typeof cellId);
  //if(!gridNum || !cellId) return;

  let start;
  let end;
  if(cellId === 1) {
    console.log('hello');
    start = ((gridNum)*216)/1000;
    end = start + (216/1000);
    console.log(start , end);
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

const times = getStartEndTimes("voice1_2_10");
console.log(times);