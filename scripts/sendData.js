import { collectAllGridsData } from "./collectData.js";
import { getCurrentFileName, getCurrentAudioDuration } from "./recorder.js";
import { getUrls } from "../config/urls.js";
import { getCurrentUsername } from "./loginPage.js";

const urls = getUrls();
const {backendOrigin} = urls;


function areAllGridsLocked() {
  const grids = document.querySelectorAll('.booth-grid');
  if (grids.length === 0) return false;

  return Array.from(grids).every(grid =>
    grid.classList.contains('locked')
  );
}

function areAllRowGridsLocked(row) {
  const grids = row.querySelectorAll('.booth-grid');
  if (grids.length === 0) return false;

  return Array.from(grids).every(grid =>
    grid.classList.contains('locked')
  );
}

const sendDataButton = document.querySelector('.js-submit-data');

sendDataButton?.addEventListener("click", async () => {
  console.log('clicked');
  if (!areAllGridsLocked()) {
    showLockGridsMessage();
    return;
  }

  // ✅ safe to submit
  const username = getCurrentUsername();
  const allData = collectAllGridsData();
  const fileName = getCurrentFileName();
  if (!fileName) return;

  const duration_ms = Math.round(getCurrentAudioDuration() * 1000);

  const payload = createPayloadJSON(
    fileName,
    allData.grids,
    duration_ms,
    username
  );

  try {
    const response = await fetch(
      `${backendOrigin}/upload/${username}/textgrids/${fileName}`,
      {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      }
    );

    if (!response.ok) {
      showSubmitDataFailedMessage();
      return;
    }

    showSubmitDataSuccessMessage();
  } catch (err) {
    console.error(err);
    showSubmitDataFailedMessage();
  }
});


export function activateSubmitForRow(row) {
  const sendDataButton = row.querySelector('.js-submit-annotation');
  if (!sendDataButton) return;

  // 🚫 prevent multiple listeners
  //if (sendDataButton.dataset.bound === "true") return;
  //sendDataButton.dataset.bound = "true";

  sendDataButton.addEventListener("click", async () => {
    console.log("clicked");

    if (!areAllRowGridsLocked(row)) {
      showLockGridsMessage();
      console.log('lock grids');
      return;
    }

    // 🔹 get data purely from DOM
    const username = getCurrentUsername();

    const fileName =
      row.querySelector(".js-file-name")?.innerText?.trim();
    if (!fileName) return;

    const audioEl = row.querySelector("audio");
    if (!audioEl || isNaN(audioEl.duration)) {
      showSubmitDataFailedMessage();
      return;
    }

    const duration_ms = Math.round(audioEl.duration * 1000);

    const allData = collectAllGridsData(row);

    const payload = createPayloadJSON(
      fileName,
      allData.grids,
      duration_ms,
      username
    );
    console.log(payload);

    try {
      const response = await fetch(
        `${backendOrigin}/upload/textgrids/${fileName}`,
        {
          method: "PUT",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        }
      );

      if (!response.ok) {
        showSubmitDataFailedMessage();
        return;
      }

      showSubmitDataSuccessMessage();
    } catch (err) {
      console.error(err);
      showSubmitDataFailedMessage();
    }
  });
}



function getFileRoot(fileName) {
  if(!fileName) return;
  return fileName.substring(0, fileName.lastIndexOf('.')) || fileName;
}

const submitDataMessage = document.querySelector('.js-submit-data-response')

export function showSubmitDataSuccessMessage() {
  submitDataMessage.innerText = 'Successfully submitted';
  submitDataMessage.classList.add('success-color');
  submitDataMessage.classList.remove('failed-color');
  submitDataMessage.style.display = "flex";

  setTimeout(() => {
    submitDataMessage.innerText = '';
    submitDataMessage.classList.remove('success-color');
  }, 5000); // 1 second
}

export function showLockGridsMessage() {
  submitDataMessage.innerText = 'Lock all grids to submit data';
  submitDataMessage.classList.add('failed-color');
  submitDataMessage.classList.remove('success-color');
  submitDataMessage.style.display = "flex";

  setTimeout(() => {
    submitDataMessage.innerText = '';
    submitDataMessage.classList.remove('success-color');
  }, 5000); // 1 second
}

export function showSubmitDataFailedMessage() {
  submitDataMessage.innerText = `Unexpected error occured, check internet connection and try again. `;
  submitDataMessage.classList.remove('success-color');
  submitDataMessage.classList.add('failed-color');
}



function createPayloadJSON(fileName, gridsArray, duration, username) {
  const root = getFileRoot(fileName);

  return {
    metadata: {
      file_name: `${root}.json`,
      file_id: `DATASETS-${username}-${root}`,
      owner: "username",
      status: "FINISHED",
      duration_ms: duration,
      language: "hi",
      sample_rate: 48000,
      audio_source: fileName,
      version: "0.1",
      created_at: new Date().toISOString()
    },

    origin: {
      type: "platform",
      mode: "digital",
      name: "shunya",
      origin_ref: "internal"
    },

    storage: {
      scope: "user",
      path: `/textgrids/${root}.json`
    },

    play_intervals: {
      full: [
        {
          start_ms: 0,
          end_ms: duration
        }
      ]
    },

    global_tiers: {
      sentence: {
        sentence_raw: "",
        sentence_devanagari: "",
        akshar_normalized: ""
      },
      word: "आठ",
      extra_placeholder: ""
    },

    grids: gridsArray
  };
}

