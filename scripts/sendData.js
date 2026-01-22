import { collectAllGridsData } from "./collectData.js";
import { getCurrentFileName, getCurrentAudioDuration } from "./recorder.js";
import { getUrls } from "../config/urls.js";

const urls = getUrls();
const {backendOrigin} = urls;

const sendDataButton = document.querySelector('.js-submit-data');

sendDataButton?.addEventListener("click", async ()=> {
  const allData = collectAllGridsData();
  //console.log(allData.grids);
  const fileName = getCurrentFileName();
  console.log(fileName);
  if(!fileName) return;
  const duration_ms = Number((getCurrentAudioDuration()*1000).toFixed(0));
  const payload = createPayloadJSON(fileName, allData.grids, duration_ms);
  //console.log(payload);
  try {
    const response = await fetch(`${backendOrigin}/upload/textgrids/${fileName}`, {
      method : "PUT",
      body : JSON.stringify(payload),
      credentials : "include",
      headers : {
        "Content-Type" : "application/json"
      }
    });

    if(!response.ok) {
      showSubmitDataFailedMessage();
      return;
    }

    console.log('data sent');
    showSubmitDataSuccessMessage();

    const result = await response.json();
    console.log(result);
  } catch(err) {
    console.error(err);
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



function createPayloadJSON(fileName, gridsArray, duration) {
  const root = getFileRoot(fileName);
  return {
    "metadata": {
      "file_name": `${root}.json`,
      "file_id": `DATASETS-UNIQUE_recordings_${root}`,
      "status": "NEW",
      "duration_ms": duration,
      "language": "hi",
      "sample_rate": 48000,
      "audio_source": `${fileName}`,
      "version": "0.1"
    },
    "origin": {
      "type": "platform",
      "mode": "digital",
      "name": "huggingface",
      "origin_ref": "https://huggingface.co/MLCommons/datasets"
    },
    "play_intervals": {
      "432": [
        {
          "start_ms": 0,
          "end_ms": duration
        }
      ]
    },
    "global_tiers": {
        "sentence": {
          "sentence_raw": "",
          "sentence_devanagari": "",
          "akshar_normalized": ""
        },
        "word": "आठ",
        "extra_placeholder": ""
    },
    "grids" : gridsArray
  }
}
