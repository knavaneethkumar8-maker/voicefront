import { collectAllGridsData } from "./collectData.js";
import { getCurrentFileName, getCurrentAudioDuration } from "./recorder.js";
import { getUrls } from "../config/urls.js";
import { getCurrentUsername } from "./loginPage.js";

const urls = getUrls();
const {backendOrigin} = urls;


const sendDataButton = document.querySelector('.js-submit-data');

sendDataButton?.addEventListener("click", async () => {
  const username = getCurrentUsername();
  const allData = collectAllGridsData();
  const fileName = getCurrentFileName();
  console.log('button clicked');
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
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      }
    );

    console.log(response);
    if (!response.ok) {
      showSubmitDataFailedMessage();
      return;
    }

    showSubmitDataSuccessMessage();
    const result = await response.json();
    console.log(result);

  } catch (err) {
    console.error(err);
    showSubmitDataFailedMessage();
  }
});


function getFileRoot(fileName) {
  if(!fileName) return;
  return fileName.substring(0, fileName.lastIndexOf('.')) || fileName;
}

const submitDataMessage = document.querySelector('.js-submit-data-response')

export function showSubmitDataSuccessMessage() {
  submitDataMessage.innerText = 'Successfully submitted';
  submitDataMessage.classList.add('success-color');
  submitDataMessage.classList.remove('failed-color');

  setTimeout(() => {
    submitDataMessage.innerText = '';
    submitDataMessage.classList.remove('success-color');
  }, 5000); // 1 second
}

export function showSubmitDataFailedMessage() {
  submitDataMessage.innerText = `Unexpected error occured, check internet connection and try again. `;
  submitDataMessage.classList.remove('success-color');
  submitDataMessage.classList.add('failed-color');

  // //setTimeout(() => {
  //   submitDataMessage.innerText = '(Note: After submitting please wait for the response. Do not refresh)';
  //   submitDataMessage.classList.remove('failed-color');
  // }, 5000); // 1 second
}



function createPayloadJSON(fileName, gridsArray, duration, username) {
  const root = getFileRoot(fileName);

  return {
    metadata: {
      file_name: `${root}.json`,
      file_id: `DATASETS-${username}-${root}`,
      owner: username,
      status: "NEW",
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
      path: `${username}/textgrids/${root}.json`
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

