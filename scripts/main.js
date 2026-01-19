import { renderAkshars } from "./renderAkshars.js";
import { getAksharWidth, renderAllGrids } from "./renderBoothGrids.js";
import { playAudioSegment } from "./playAudioSegment.js";
import "./recorder.js";

const audio = document.querySelector('.js-audio-file');
const width = getAksharWidth();
renderAllGrids(2);
renderAkshars(width, setAudioForAllCells);
setAudioForAllCells();
lockGrids();


export function setAudioForAllCells(audio) {
  const allCells = document.querySelectorAll('.cell');
  allCells?.forEach(cell => {
    cell.addEventListener("click", () => {
      console.log(cell.id);
      const times = getStartEndTimes(cell.id);
      playAudioSegment(audio, times.start, times.end);
    })
  })
}

export function lockGrids() {
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