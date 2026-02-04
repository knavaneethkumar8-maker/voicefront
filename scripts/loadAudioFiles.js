import { fetchUsers } from "./getUsersInfo.js";
import { getUrls } from "../config/urls.js";
import { generateAudioTimeLine , makeVerifyButtonsActive, generateSlowedCellsForTimeline} from "./recorder.js";
import { setAllDeleteRegionsActive} from "./dragLetters.js";
import { collectLockedGridData , collectLockedCellData} from "./collectData.js";
import { activateSubmitForRow , activateSlowedSubmit} from "./sendData.js";
import { getCurrentUsername } from "./loginPage.js";
import { createAksharEditor } from "./createAksharTimeline.js";
import { akshars } from "./renderBoothGrids.js";

let predictListenerAttached = false;
const urls = getUrls();
const {backendOrigin} = urls;

const newAkshars = [
  { char:"a", start:0,   end:200 },
  { char:"b", start:210,  end:350 },
  { char:"c", start:360,  end:550 },
  { char:"d", start:600,  end:900 },
  { char:"e", start:910,  end:1100 },
  { char:"n", start:1110, end:1400 },
  { char:"df", start:1410, end:1700 },
  { char:"d", start:1710, end:2000 },
  { char:"", start:2100, end:2400 },
  { char:"dd", start:2410, end:2700 },
  { char:"d", start:2710, end:3000 },
  { char:"d", start:3010, end:3300 }
];

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
    const baseName = r.filename.replace(/\.wav$/, "");

    const audioUrl = `${backendOrigin}/uploads/recordings/${r.filename}`;
    const audioUrl_8x = `${backendOrigin}/uploads/recordings/${baseName}_8x.wav`;
    const audioUrl_16x = `${backendOrigin}/uploads/recordings/${baseName}_16x.wav`;

    console.log(audioUrl_8x);


    const mime =
      r.filename.endsWith(".wav")  ? "audio/wav"  :
      r.filename.endsWith(".mp4")  ? "audio/mp4"  :
      r.filename.endsWith(".webm") ? "audio/webm" :
      "audio/*";

    const row = document.createElement("div");
    row.className = "load-row";

    row.innerHTML = `
      <div class="file-details-container">
        <audio controls preload="metadata" playsinline id="audioEl_${r.filename}" src="${audioUrl}" type="${mime}">
        </audio>

        <div class="file-name js-file-name">${r.filename}</div>

        <!-- Predict toggle -->
        <label class="predict-checkbox">
          <input type="checkbox"
                checked="true"
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
          <div class="js-grid-timeline grid-timeline "></div>
        </div>
        <div class="js-slow-timeline_8x slow-timeline" data-speed-factor="8">
          <div class="slow-audio-container">
            <audio controls preload="metadata" playsinline id="audioEl_${r.filename}_8x" src="${audioUrl_8x}" type="${mime}"></audio>
            <button class="js-submit_8x-data generate-btn submit-slow-button">Submit</button>
          </div>
          
          <div class="prithvi-cells-container">
          </div>
        </div>
        <div class="js-slow-timeline_16x slow-timeline" data-speed-factor="16">
          <div class="slow-audio-container">
            <audio controls preload="metadata" playsinline id="audioEl_${r.filename}_16x" src="${audioUrl_16x}" type="${mime}"></audio>
            <button class="js-submit_16x-data generate-btn submit-slow-button">Submit</button>
          </div>
          <div class="prithvi-cells-container">
          </div>
        </div>
      </div>
    `;


    container.appendChild(row);

    const gridTimeLine = row.querySelector(".js-grid-timeline");
    const slow8x = row.querySelector('.js-slow-timeline_8x')
    const slow16x = row.querySelector('.js-slow-timeline_16x');

    const audioEl = row.querySelector("audio");

    // ✅ THIS NOW REALLY WAITS
    await generateAudioTimeLine(row, gridTimeLine);
    await generateSlowedCellsForTimeline(slow8x, 8, audioEl);
    await generateSlowedCellsForTimeline(slow16x, 16, audioEl);

    // ✅ SAFE: cells now exist
    if (r.textgrid) {
      row._textgrids = {
        normal: r.textgrid.normal,
        x8: r.textgrid.x8,
        x16: r.textgrid.x16
      };

      // apply normal grid by default
      if (r.textgrid.normal) {
        applyTextgridToRenderedGrids(row, r.textgrid.normal);
        console.log('applied normal')
      }

      // apply slowed grids
      if (r.textgrid.x8) {
        applyTextgridToSlowedTimeline(row, r.textgrid.x8, 8);
        console.log('applied 8x')
        console.log(r.textgrid.x8)
      }

      if (r.textgrid.x16) {
        applyTextgridToSlowedTimeline(row, r.textgrid.x16, 16);
        console.log('applied 16x')
        console.log(r.textgrid.x16)
      }
    }


    activateSubmitForRow(row);
    activateSlowedSubmit(row);
    //createAksharEditor(row, newAkshars, 8)
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


export function applyTextgridToRenderedGrids(row, textgrid) {
  if (!row || !textgrid || !textgrid.grids) return;

  const COLOR_CLASSES = ["ui-green", "ui-blue", "ui-yellow", "ui-red"];

  textgrid.grids.forEach(grid => {
    if (!grid.tiers) return;

    Object.values(grid.tiers).forEach(tier => {
      tier.cells?.forEach(cell => {

        const cellEl = row.querySelector(
          `#${CSS.escape(cell.id)}`
        );
        if (!cellEl) return;

        // 🔒 Respect locks
        if (isCellProtected(cellEl)) return;

        // ---------- CONFIDENCE DOT ----------
        const dotEl = cellEl.querySelector(".cell-dot");
        if (dotEl) {
          dotEl.classList.remove(...COLOR_CLASSES);
          dotEl.classList.add(getConfidenceClass(cell.conf));
        }

        // ---------- TEXT APPLY RULE ----------
        const textEl = cellEl.querySelector(".cell-text");

        if (textEl) {
          // Normal cells
          textEl.innerText = cell.text || "";
        } else {
          // Cells without .cell-text (e.g. prithvi)
          if (cell.text !== undefined && cell.text !== null) {
            cellEl.innerText = cell.text;
          }
        }
      });
    });
  });

  console.log("TextGrid applied → conditional cell-text handling");
}



function makePredictCheckboxesActive() {
  if (predictListenerAttached) return; // 🔒 prevent duplicates
  predictListenerAttached = true;

  document.addEventListener("click", (e) => {

    if (
      !e.target.classList.contains("checkbox-box") &&
      !e.target.classList.contains("checkbox-label")
    ) return;

    const label = e.target.closest("label.predict-checkbox");
    if (!label) return;

    const checkbox = label.querySelector(".js-predict-checkbox");
    if (!checkbox) return;

    // manual toggle
    checkbox.checked = !checkbox.checked;

    const row = checkbox.closest(".load-row");
    if (!row) return;

    if (checkbox.checked) {
      if (row._textgrid) {
        applyTextgridToRenderedGrids(row, row._textgrid);
      }
    } else {
      clearPredictedTextFromRow(row);
    }

    console.log(
      "Predict toggled:",
      checkbox.dataset.file,
      checkbox.checked
    );
  });
}


function getConfidenceClass(confidence) {
  if (confidence > 0.9) return "ui-green";
  if (confidence > 0.75) return "ui-blue";
  if (confidence > 0.55) return "ui-yellow";
  return "ui-red";
}

function clearPredictedTextFromRow(row) {
  const cells = row.querySelectorAll(".cell");

  cells.forEach(cell => {

    // 🔒 Skip locked / verified cells
    if (isCellProtected(cell)) return;

    // remove predicted text nodes
    [...cell.childNodes].forEach(node => {
      if (node.nodeType === Node.TEXT_NODE) {
        node.remove();
      }
    });

    // clear confidence dot
    const dotEl = cell.querySelector(".cell-dot");
    if (dotEl) {
      dotEl.classList.remove("ui-green", "ui-blue", "ui-yellow", "ui-red");
    }
  });
}


function isCellProtected(cellEl) {
  if (!cellEl) return true;

  // cell-level protection
  if (
    cellEl.classList.contains("locked") ||
    cellEl.classList.contains("verified")
  ) {
    return true;
  }

  // grid-level protection
  const gridEl = cellEl.closest(".booth-grid");
  if (gridEl && gridEl.classList.contains("locked")) {
    return true;
  }

  return false;
}
makePredictCheckboxesActive();

function applyTextgridToSlowedTimeline(row, textgrid, factor) {
  if (!row || !textgrid || !textgrid.grids) return;

  const slowTimeline = row.querySelector(
    `.js-slow-timeline_${factor}x`
  );
  if (!slowTimeline) return;

  textgrid.grids.forEach(grid => {
    if (!grid.tiers) return;

    Object.values(grid.tiers).forEach(tier => {
      tier.cells?.forEach(cell => {
        const cellEl = slowTimeline.querySelector(
          `#${CSS.escape(cell.id)}`
        );
        if (!cellEl) return;

        // respect locks if you add them later
        cellEl.innerText = cell.text || "";
      });
    });
  });

  console.log(`Slowed ${factor}x TextGrid applied`);
}















