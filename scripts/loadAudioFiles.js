import { fetchUsers } from "./getUsersInfo.js";
import { getUrls } from "../config/urls.js";
import { generateAudioTimeLine , makeVerifyButtonsActive} from "./recorder.js";
import { setAllDeleteRegionsActive} from "./dragLetters.js";
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
  makePredictCheckboxesActive();
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

        <!-- Predict toggle -->
        <label class="predict-checkbox">
          <input type="checkbox"
                checked = "true"
                class="js-predict-checkbox"
                data-file="${r.filename}">
          <span class="checkbox-box" data-file="${r.filename}"></span>
          <span class="checkbox-label">Predict</span>
        </label>


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

  const COLOR_CLASSES = ["ui-green", "ui-blue", "ui-yellow", "ui-red"];

  textgrid.grids.forEach(grid => {
    const tiers = grid.tiers;
    if (!tiers) return;

    Object.entries(tiers).forEach(([tierKey, tier]) => {
      tier.cells?.forEach(cell => {
        const cellEl = document.getElementById(cell.id);
        if (!cellEl) return;

        /* ---------- REMOVE any existing text nodes ---------- */
        [...cellEl.childNodes].forEach(node => {
          if (node.nodeType === Node.TEXT_NODE) {
            node.remove();
          }
        });

        /* ---------- APPLY TEXT (skip PRITHVI) ---------- */
        if (tierKey !== "prithvi" && cell.text) {
          cellEl.insertBefore(
            document.createTextNode(cell.text),
            cellEl.firstChild
          );
        }

        /* ---------- confidence dot ---------- */
        const dotEl = cellEl.querySelector(".cell-dot");
        if (dotEl) {
          dotEl.classList.remove(...COLOR_CLASSES);
          dotEl.classList.add(getConfidenceClass(cell.conf));
        }
      });
    });
  });

  console.log("TextGrid text + confidence applied (prithvi hidden)");
}





function makePredictCheckboxesActive() {
  document.addEventListener("click", (e) => {

    // Only react to clicks on the box or label
    if (!e.target.classList.contains("checkbox-box") &&
        !e.target.classList.contains("checkbox-label")) return;

    // Find the label container
    const label = e.target.closest("label.predict-checkbox");
    if (!label) return;

    // Find the input inside the label
    const checkbox = label.querySelector(".js-predict-checkbox");
    if (!checkbox) return;

    // 🔄 MANUAL TOGGLE
    checkbox.checked = !checkbox.checked;

    const filename = checkbox.dataset.file;
    const enabled = checkbox.checked;

    console.log("Predict:", filename, enabled);

    // 🔽 Put your predict logic here
  });
}


function getConfidenceClass(confidence) {
  if (confidence > 0.9) return "ui-green";
  if (confidence > 0.75) return "ui-blue";
  if (confidence > 0.55) return "ui-yellow";
  return "ui-red";
}











