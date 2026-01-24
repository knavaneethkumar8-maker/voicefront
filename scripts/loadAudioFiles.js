import { fetchUsers } from "./getUsersInfo.js";
import { getUrls } from "../config/urls.js";


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
    `${backendOrigin}/api/recordings?user=${user}&time=${time}`
  );

  const data = await res.json();
  console.log(res);
  renderRecordings(data, user);
}

function renderRecordings(records, user) {
  const container = document.querySelector(".loaded-files-container");
  container.innerHTML = "";

  if (!records.length) {
    container.innerHTML = "<p class='empty'>No recordings found</p>";
    return;
  }

  records.forEach(r => {
    const audioUrl =
      `${backendOrigin}/uploads/${user}/recordings/${r.filename}`;

    const mime =
      r.filename.endsWith(".wav")  ? "audio/wav"  :
      r.filename.endsWith(".mp4")  ? "audio/mp4"  :
      r.filename.endsWith(".webm") ? "audio/webm" :
      "audio/*";

    const row = document.createElement("div");
    row.className = "load-row";

    row.innerHTML = `
      <audio controls preload="metadata" playsinline>
        <source src="${audioUrl}" type="${mime}">
      </audio>

      <div class="file-name">${r.filename}</div>
      <div class="status ${r.status.toLowerCase()}">${r.status}</div>

      <button class="generate-btn">Generate</button>
      <button class="delete-btn">Delete</button>
    `;

    container.appendChild(row);

    // Safari fix
    row.querySelector("audio").load();
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







