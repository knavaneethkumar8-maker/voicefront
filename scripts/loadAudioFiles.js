import { fetchUsers } from "./getUsersInfo.js";
import { getUrls } from "../config/urls.js";
import { createLettersContainer } from "./dragLetters.js";
import { generateAudioTimeLine , makeVerifyButtonsActive} from "./recorder.js";
import { setAllDeleteRegionsActive , setRowDeleteRegionsActive} from "./dragLetters.js";
import { collectLockedGridData , collectLockedCellData} from "./collectData.js";
import { activateSubmitForRow } from "./sendData.js";


const urls = getUrls();
const {backendOrigin} = urls;

fetchUsers().then(users => {
  const select = document.querySelector(".js-account-select");
  select.innerHTML = "";

  users.forEach(user => {
    const option = document.createElement("option");
    option.value = user;
    option.textContent = user;
    select.appendChild(option);
  });
});


async function loadRecordings() {
  const user = document.querySelector(".js-account-select").value;
  const time = document.querySelector(".js-time-select").value;

  const res = await fetch(
    `${backendOrigin}/api/recordings`
  );

  const data = await res.json();
  console.log(data);
  renderRecordings(data, user);
  setAllDeleteRegionsActive();
  collectLockedGridData();
  collectLockedCellData();
  makeVerifyButtonsActive();
}

async function renderRecordings(records, user) {
  const container = document.querySelector(".loaded-files-container");
  container.innerHTML = "";

  if (!records.length) {
    container.innerHTML = "<p class='empty'>No recordings found</p>";
    return;
  }

  for (const r of records) {
    const audioUrl = `${backendOrigin}/uploads/recordings/${r.filename}`;

    const mime =
      r.filename.endsWith(".wav")  ? "audio/wav"  :
      r.filename.endsWith(".mp4")  ? "audio/mp4"  :
      r.filename.endsWith(".webm") ? "audio/webm" :
      "audio/*";

    const row = document.createElement("div");
    row.className = "load-row";

    row.innerHTML = `
      <div class="file-details-container">
        <audio controls preload="metadata" playsinline id="audioEl_${r.filename}">
          <source src="${audioUrl}" type="${mime}">
        </audio>

        <div class="file-name js-file-name">${r.filename}</div>
        <div class="status ${r.status.toLowerCase()}">${r.status}</div>

        <button class="generate-btn js-submit-annotation">Submit</button>
        <button class="delete-btn">Clear</button>
      </div>

      <div class="js-askhar-editor akshar-editor" id="${r.filename}">
        <div class="js-timeline timeline">
          <div class="js-grid-timeline grid-timeline"></div>
        </div>
      </div>
    `;

    container.appendChild(row);

    const gridTimeLine = row.querySelector(".js-grid-timeline");

    // ✅ THIS NOW REALLY WAITS
    await generateAudioTimeLine(row, gridTimeLine);

    // ✅ SAFE: cells now exist
    if (r.textgrid) {
      applyTextgridToRenderedGrids(r.textgrid);
    }

    activateSubmitForRow(row);
  }
}




const loadRecordingsButton = document.querySelector('.js-load-btn');

loadRecordingsButton?.addEventListener("click", () => {
  loadRecordings();
});


document.addEventListener("click", (e) => {
  if (!e.target.classList.contains("delete-btn")) return;

  const row = e.target.closest(".load-row");
  if (row) {
    row.remove();
  }
});


export function applyTextgridToRenderedGrids(textgrid) {
  if (!textgrid || !textgrid.grids) return;

  textgrid.grids.forEach(grid => {
    const tiers = grid.tiers;
    //console.log(tiers);

    Object.values(tiers).forEach(tier => {
      //console.log("came to objec values");
      tier.cells.forEach(cell => {
        const cellEl = document.getElementById(cell.id);
        //console.log('came to cells tiers')
        //console.log(cellEl)

        if (!cellEl) return;
        //console.log('cell el exits')
        const labelEl = cellEl.querySelector(".cell-label");
        if (!labelEl) return;
        //console.log(labelEl);
        //console.log(cell.text);
        labelEl.textContent = cell.text || "";
      });
    });
  });

  console.log('applied labels');
}








