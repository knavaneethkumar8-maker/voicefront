import dayjs from "https://unpkg.com/dayjs@1.11.10/esm/index.js";
import { setAudioForAllCells, setAudioForSlowedCells } from "./main.js";
import { renderAllGrids } from "./renderBoothGrids.js";
import { lockGrids } from "./main.js";
import { getUrls } from "../config/urls.js";
import { makeCellsEditableOnMobile } from "./controlMobileUI.js";
import { applyTextgridToRenderedGrids } from "./loadAudioFiles.js";

let recordedAudioBlob = null;
let recordedVideoBlob = null;

let audioRecorder, videoRecorder;
let audioChunks = [];
let videoChunks = [];
let audioInterval, videoInterval;

let currentFileName;
let currentAudioDuration;

const urls = getUrls();
const {backendOrigin} = urls;

function updateCurrentAudioDuration(audio) {
  currentAudioDuration = audio.duration;
}

export function getCurrentAudioDuration() {
  return currentAudioDuration;
}

export function updateCurrentFileName(fileName) {
  currentFileName = fileName;
}

export function getCurrentFileName() {
  return currentFileName;
}

const audiosPreviewContainer = document.querySelector('.js-audio-files-container');

const MAX_TIME = 60000; // 1 minute

function startTimer(el) {
  const start = Date.now();
  return setInterval(() => {
    const elapsed = Date.now() - start;
    const seconds = Math.floor(elapsed / 1000);
    const m = String(Math.floor(seconds / 60)).padStart(2, "0");
    const s = String(seconds % 60).padStart(2, "0");
    el.textContent = `${m}:${s}`;
  }, 500);
}

// ---------- AUDIO ----------
const audioRecordBtn = document.getElementById("audioRecordBtn");
const audioStopBtn = document.getElementById("audioStopBtn");
const audioPreview = document.getElementById("audioPreview");
const audioTimerEl = document.getElementById("audioTimer");
const submitAudioBtn = document.querySelector(".js-submit-audio-button");
const submitVideoBtn = document.querySelector(".js-submit-video-button");


//audio recording
audioRecordBtn.onclick = async () => {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

  // ✅ Pick a browser-supported mime type
  let mimeType = "";
  if (window.MediaRecorder) {
    if (MediaRecorder.isTypeSupported("audio/mp4")) {
      mimeType = "audio/mp4";        // Safari
    } else if (MediaRecorder.isTypeSupported("audio/webm")) {
      mimeType = "audio/webm";       // Chrome / Firefox
    } else if (MediaRecorder.isTypeSupported("audio/wav")) {
      mimeType = "audio/wav";
    }
  }

  audioRecorder = mimeType
    ? new MediaRecorder(stream, { mimeType })
    : new MediaRecorder(stream);

  audioChunks = [];

  audioRecorder.ondataavailable = e => {
    if (e.data && e.data.size > 0) {
      audioChunks.push(e.data);
    }
  };

  audioRecorder.onstop = () => {
    // ✅ Use the SAME mimeType the recorder used
    recordedAudioBlob = new Blob(audioChunks, {
      type: audioRecorder.mimeType || mimeType
    });

    // Safety check (prevents Safari silent failure)
    if (recordedAudioBlob.size === 0) {
      console.error("Recorded audio is empty");
      audioPreview.innerHTML = "<p>Recording failed. Please try again.</p>";
      return;
    }

    const url = URL.createObjectURL(recordedAudioBlob);

    audioPreview.innerHTML = `
      <audio controls>
        <source src="${url}" type="${recordedAudioBlob.type}">
      </audio>
    `;
  };

  audioRecorder.start();
  audioRecordBtn.classList.add("recording");
  audioStopBtn.disabled = false;

  audioTimerEl.textContent = "00:00";
  audioInterval = startTimer(audioTimerEl);

  setTimeout(stopAudioRecording, MAX_TIME);
};

audioStopBtn.onclick = stopAudioRecording;

function stopAudioRecording() {
  if (!audioRecorder || audioRecorder.state === "inactive") return;
  submitAudioBtn.classList.add('active-button');

  audioRecorder.stop();
  audioRecorder.stream.getTracks().forEach(t => t.stop());

  clearInterval(audioInterval);
  audioRecordBtn.classList.remove("recording");
  audioStopBtn.disabled = true;
}

submitAudioBtn?.addEventListener("click", async () => {
  audioPreview.innerHTML = '';
  submitAudioBtn.classList.remove("active-button");
  try {
    const audioFile = await blobToFile(recordedAudioBlob, "audio.wav");
    const formData = new FormData();
    formData.append("audio", audioFile);
    console.log(formData);
    const fileName = `audio_${dayjs().format('YYYY_MM_DD_HH_mm_ss_ms')}.wav`
    const response = await fetch(`${backendOrigin}/upload/audio/${fileName}`, {
      method : "POST",
      body : formData
    });

    if(!response.ok) {
      showUploadFailedMessage('err');
      return;
    }
    showUploadSuccessMessage();

    const audioUrl = URL.createObjectURL(recordedAudioBlob);
    const previewHTML = `
      <div class="js-audio-container audio-container ${fileName}">
        <p class="audio-filename">${fileName}</p>
        <div class="audio-preview">
          <audio src=${audioUrl} controls class="audio-file" id=${fileName}></audio>
          <button class="generate-button">Generate</button>
          <button class="remove-button">Delete</button>
        </div>
      </div>
    `;
    audiosPreviewContainer.innerHTML += previewHTML;
    const audio = document.getElementById(fileName);

    audio.addEventListener("loadedmetadata", ()=> {
      console.log(audio.duration);
      console.log(audio);
      const gridsCount = calcGridCount(audio.duration);
      updateCurrentFileName(fileName);
      updateCurrentAudioDuration(audio);
      renderAllGrids(gridsCount, fileName);
      setAudioForAllCells(audio);
      clearSelectedSpeedButtons();
      setupAudioSpeedControls(audio);
      makeCellsEditableOnMobile();
      lockGrids();
    });

    const result = await response.json();
    console.log(result);
  } catch (err) {
    console.error(err);
  }
});


// ---------- VIDEO ----------
const videoRecordBtn = document.getElementById("videoRecordBtn");
const videoStopBtn = document.getElementById("videoStopBtn");
const videoPreview = document.getElementById("videoPreview");
const videoTimerEl = document.getElementById("videoTimer");

videoRecordBtn.onclick = async () => {
  const stream = await navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true
  });

  // ✅ Choose supported mime type
  let mimeType = "";
  if (window.MediaRecorder) {
    if (MediaRecorder.isTypeSupported("video/mp4")) {
      mimeType = "video/mp4";               // Safari
    } else if (MediaRecorder.isTypeSupported("video/webm")) {
      mimeType = "video/webm";              // Chrome / Firefox
    }
  }

  videoRecorder = mimeType
    ? new MediaRecorder(stream, { mimeType })
    : new MediaRecorder(stream);

  videoChunks = [];

  videoRecorder.ondataavailable = e => {
    if (e.data && e.data.size > 0) {
      videoChunks.push(e.data);
    }
  };

  videoRecorder.onstop = () => {
    recordedVideoBlob = new Blob(videoChunks, {
      type: videoRecorder.mimeType || mimeType
    });

    // 🛑 Prevent Safari silent error
    if (recordedVideoBlob.size === 0) {
      console.error("Recorded video is empty");
      videoPreview.innerHTML = "<p>Video recording failed. Please try again.</p>";
      return;
    }

    const url = URL.createObjectURL(recordedVideoBlob);

    videoPreview.innerHTML = `
      <video controls playsinline>
        <source src="${url}" type="${recordedVideoBlob.type}">
      </video>
    `;
  };

  videoRecorder.start();
  videoRecordBtn.classList.add("recording");
  videoStopBtn.disabled = false;

  videoTimerEl.textContent = "00:00";
  videoInterval = startTimer(videoTimerEl);

  setTimeout(stopVideoRecording, MAX_TIME);
};

videoStopBtn.onclick = stopVideoRecording;

function stopVideoRecording() {
  if (!videoRecorder || videoRecorder.state === "inactive") return;
  submitVideoBtn.classList.add('active-button');
  videoRecorder.stop();
  videoRecorder.stream.getTracks().forEach(t => t.stop());

  clearInterval(videoInterval);
  videoRecordBtn.classList.remove("recording");
  videoStopBtn.disabled = true;
}

function blobToFile(blob, fileName) {
  return new File([blob], fileName, {type : blob.type});
}

const submitFileMessage = document.querySelector('.js-submit-file-message');

function showUploadSuccessMessage() {
  submitFileMessage.innerText = 'Successfully submitted';
  submitFileMessage.classList.add('success-color');
  submitFileMessage.classList.remove('failed-color');

  setTimeout(() => {
    submitFileMessage.innerText = '(Note: After submitting please wait for the response. Do not refresh)';
    submitFileMessage.classList.remove('success-color');
  }, 5000); // 1 second
}

function showUploadFailedMessage(errMessage) {
  submitFileMessage.innerText = `Unexpected error occured, check internet connection and try again. `;
  submitFileMessage.innerText += errMessage;
  submitFileMessage.classList.remove('success-color');
  submitFileMessage.classList.add('failed-color');
}

submitVideoBtn?.addEventListener("click", async () => {
  videoPreview.innerHTML = '';
  submitVideoBtn.classList.remove("active-button");
  try {
    const videoFile = await blobToFile(recordedVideoBlob, "video2.mp4");
    const formData = new FormData();
    formData.append("video", videoFile);
    const fileName = `video_${dayjs().format('YYYY_MM_DD_HH_mm_ss_ms')}.mp4`
    const response = await fetch(`${backendOrigin}/upload/video/${fileName}`, {
      method : "POST",
      body : formData
    });
    console.log(response);

    if(!response.ok) {
      showUploadFailedMessage('err');
      return;
    }
    showUploadSuccessMessage();

    const resultBlob = await response.blob();
    const audioUrl = URL.createObjectURL(resultBlob);
    const extractedFileName = fileName.split('.')[0] + '.wav';
    console.log(extractedFileName);

    const previewHTML = `
      <div class="js-audio-container audio-container ${extractedFileName}">
        <p class="audio-filename">${extractedFileName}</p>
        <div class="audio-preview">
          <audio src=${audioUrl} controls class="audio-file" id=${extractedFileName}></audio>
          <button class="generate-button">Generate</button>
          <button class="remove-button">Delete</button>
        </div>
        
      </div>
    `;
    audiosPreviewContainer.innerHTML += previewHTML;
    const audio = document.getElementById(extractedFileName);

    audio.addEventListener("loadedmetadata", ()=> {
      console.log(audio.duration);
      const gridsCount = calcGridCount(audio.duration);
      renderAllGrids(gridsCount, extractedFileName);
      updateCurrentFileName(fileName);
      updateCurrentAudioDuration(audio);
      setAudioForAllCells(audio);
      clearSelectedSpeedButtons();
      setupAudioSpeedControls(audio);
      makeCellsEditableOnMobile();
      lockGrids();
    });
  } catch(err) {
    console.error(err);
  }
})


function calcGridCount(duration) {
  const bioesTime = 9;
  let audioLength = duration*1000 ;
  const gridsCount = Math.ceil(audioLength/(24*bioesTime));
  return gridsCount;
}

//set delete audio from list
document.addEventListener('click', (e) => {
  if (e.target.classList.contains('remove-button')) {
    const parentContainer = e.target.closest('.audio-container');
    if (parentContainer) {
      parentContainer.remove();
    }
  }
});


function generateGrids() {
  document.addEventListener("click", (e)=> {
    e.preventDefault();
    if(!e.target.classList.contains('generate-button')) return;

    const audioContainer = e.target.closest(".audio-container");
    const audioEl = audioContainer.querySelector("audio");
    console.log(audioEl.duration);
    const fileName = audioEl.id;

    const gridsCount = calcGridCount(audioEl.duration);
    updateCurrentFileName(fileName);
    updateCurrentAudioDuration(audioEl);
    renderAllGrids(gridsCount, fileName);
    setAudioForAllCells(audioEl);
    clearSelectedSpeedButtons();
    setupAudioSpeedControls(audioEl);
    makeCellsEditableOnMobile();
    lockGrids();
  })
}

generateGrids();

function setupAudioSpeedControls(audioElement) {
  const buttons = document.querySelectorAll('.js-audio-speed-button');

  buttons.forEach(button => {
    button.addEventListener('click', () => {
      // Remove "selected-button" from all buttons
      buttons.forEach(btn => btn.classList.remove('selected-button'));

      // Add "selected-button" to the clicked button
      button.classList.add('selected-button');

      // Get the speed from data-speed and set it on audio
      const speed = parseFloat(button.dataset.speed);
      audioElement.playbackRate = speed;
    });
  });
}

function clearSelectedSpeedButtons() {
  const buttons = document.querySelectorAll('.js-audio-speed-button');
  buttons.forEach(button => button.classList.remove('selected-button'));
}

//generate grids
function makeGenerateGridsActive() {
  document.addEventListener("click", (e) => {
    if (!e.target.classList.contains("generate-btn")) return;

    const row = e.target.closest(".load-row");
    const audioEl = row.querySelector("audio");
    if (!audioEl) return;

    audioEl.addEventListener(
      "loadedmetadata",
      () => {
        const duration = audioEl.duration;
        const fileName = row.querySelector(".file-name").textContent;

        const gridsCount = calcGridCount(duration);

        updateCurrentFileName(fileName);
        updateCurrentAudioDuration(audioEl);

        renderAllGrids(gridsCount, fileName);
        setAudioForAllCells(audioEl, row);

        clearSelectedSpeedButtons();
        setupAudioSpeedControls(audioEl);
        makeCellsEditableOnMobile();
        lockGrids();
      },
      { once: true }
    );
    audioEl.load(); // ensure metadata is available
  });
}





export function generateAudioTimeLine(row, gridTimeLine) {
  return new Promise((resolve) => {
    const audioEl = row.querySelector("audio");
    if (!audioEl) return;
    console.log(audioEl.id);

    audioEl.addEventListener(
      "loadedmetadata",
      () => {
        const duration = audioEl.duration;
        const fileName = row.querySelector(".file-name").textContent;

        const gridsCount = calcGridCount(duration);

        //updateCurrentFileName(fileName);
        //updateCurrentAudioDuration(audioEl);

        // ✅ GRIDS + CELLS CREATED HERE
        renderAllGrids(gridsCount, fileName, gridTimeLine, row);
        setAudioForAllCells(audioEl, row);

        clearSelectedSpeedButtons();
        setupAudioSpeedControls(audioEl);
        makeCellsEditableOnMobile();
        lockGrids(row);

        // ✅ WAIT FOR DOM PAINT
        requestAnimationFrame(() => {
          resolve();
        });
      },
      { once: true }
    );

    audioEl.load();
  });
}


export function generateSlowedCellsForTimeline(slowTimelineEl, factor, originalAudioEl) {
  return new Promise((resolve) => {
    if (!slowTimelineEl) return;

    const audioEl = slowTimelineEl.querySelector("audio");
    const cellsContainer = slowTimelineEl.querySelector(
      ".prithvi-cells-container"
    );

    if (!audioEl || !cellsContainer) return;

    audioEl.addEventListener(
      "loadedmetadata",
      () => {
        const duration = originalAudioEl.duration;
        const gridsCount = calcGridCount(duration);
        console.log(gridsCount);
        const slowedCellsCount = gridsCount * 24
        console.log(slowedCellsCount);

        // clear old cells
        cellsContainer.innerHTML = "";

        for (let i = 0; i < slowedCellsCount; i++) {
          const cell = document.createElement("div");
          cell.className = "slowed-cell";
          cell.id = `${audioEl.id}_${i}`;

          // ✅ MAKE CELL EDITABLE
          cell.contentEditable = "true";
          cell.spellcheck = false;

          cellsContainer.appendChild(cell);
        }

        // bind audio AFTER cells exist
        setAudioForSlowedCells(slowTimelineEl, factor);

        requestAnimationFrame(resolve);
      },
      { once: true }
    );

    audioEl.load();
  });
}








//make verify buttons active
let verifyListenerAttached = false;

export function makeVerifyButtonsActive() {
  if (verifyListenerAttached) return;
  verifyListenerAttached = true;

  document.addEventListener("click", (e) => {
    const lockBtn = e.target.closest(".js-cell-lock");
    if (!lockBtn) return;

    e.preventDefault();
    e.stopPropagation();

    const cell = lockBtn.closest(".cell");
    if (!cell) return;

    const isLocked = cell.classList.toggle("locked");
    
    const elementsToLock = [cell, ...cell.querySelectorAll("*")];
    elementsToLock.forEach(el => {
      if (el === lockBtn) return;

      if (isLocked) {
        if (!el.dataset.originalContenteditable) {
          el.dataset.originalContenteditable =
            el.getAttribute("contenteditable");
        }

        el.setAttribute("contenteditable", "false");
        el.style.pointerEvents = "none";
      } else {
        const original = el.dataset.originalContenteditable;

        if (original === null || original === undefined) {
          el.removeAttribute("contenteditable");
        } else {
          el.setAttribute("contenteditable", original);
        }

        delete el.dataset.originalContenteditable;
        el.style.pointerEvents = "";
      }
    });
  });
}

