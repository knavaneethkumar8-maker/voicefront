import { fetchUsers } from "./getUsersInfo.js";
import { getUrls } from "../config/urls.js";
import { createLettersContainer } from "./dragLetters.js";
import { generateAudioTimeLine } from "./recorder.js";
import { setAllDeleteRegionsActive } from "./dragLetters.js";


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
}

function renderRecordings(records, user) {
  const container = document.querySelector(".loaded-files-container");
  container.innerHTML = "";

  if (!records.length) {
    container.innerHTML = "<p class='empty'>No recordings found</p>";
    return;
  }

  records.forEach((r) => {
    console.log(r.textgrid);
    const audioUrl =
      `${backendOrigin}/uploads/recordings/${r.filename}`;

    const mime =
      r.filename.endsWith(".wav")  ? "audio/wav"  :
      r.filename.endsWith(".mp4")  ? "audio/mp4"  :
      r.filename.endsWith(".webm") ? "audio/webm" :
      "audio/*";

    const row = document.createElement("div");
    row.className = "load-row";

    row.innerHTML = `
      <div class="file-details-container">
        <audio controls preload="metadata" playsinline>
          <source src="${audioUrl}" type="${mime}">
        </audio>

        <div class="file-name">${r.filename}</div>
        <div class="status ${r.status.toLowerCase()}">${r.status}</div>

        <button class="generate-btn">Generate</button>
        <button class="delete-btn">Remove</button>
      </div>

      <div class="js-askhar-editor akshar-editor" id="${r.filename}">
        <p class="rendered-filename js-rendered-filename">${r.filename}</p>

        <div class="letters-container js-letters-container"
             id="letter-container-${r.filename}">
        </div>

        <div class="delete-region js-delete-region">
          Drop here to delete
        </div>

        <div class="js-timeline timeline">
          <div class="js-grid-timeline grid-timeline"></div>
          <div class="adjust-akshar-timeline js-akshar-timeline"></div>
        </div>
      </div>
    `;

    container.appendChild(row);

    // ✅ SELECT THE CLOSEST LETTERS CONTAINER
    const lettersContainer =
      row.querySelector(".js-letters-container");

    // ✅ PASS IT INTO createLettersContainer
    createLettersContainer(lettersContainer);
    row.querySelector("audio").load();
    const gridTimeLine = row.querySelector('.js-grid-timeline');
    console.log(gridTimeLine);
    generateAudioTimeLine(row, gridTimeLine);
  });
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





