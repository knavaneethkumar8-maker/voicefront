import { getCurrentUsername } from "./loginPage.js";
import dayjs from "https://unpkg.com/dayjs@1.11.10/esm/index.js";
import { getUrls } from "../config/urls.js";


const MAX_TIME = 60000;
const urls = getUrls();
const {backendOrigin} = urls;

function startTimer(el) {
  const start = Date.now();
  return setInterval(() => {
    const elapsed = Date.now() - start;
    const s = Math.floor(elapsed / 1000);
    el.textContent =
      `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
  }, 500);
}

function blobToFile(blob, name) {
  return new File([blob], name, { type: blob.type });
}


let audioRecorder;
let audioChunks = [];
let recordedAudioBlob = null;
let audioInterval;
let videoInterval;
let currentAudioFileName;
let currentVideoFileName;


const audioRecordBtn = document.getElementById("audioRecordBtn-1");
const audioStopBtn   = document.getElementById("audioStopBtn-1");
const audioPreview   = document.getElementById("audioPreview-1");
const audioTimer     = document.getElementById("audioTimer-1");
const audioSubmitBtn = document.getElementById("audioSubmitBtn-1");
const videoTimerEl = document.getElementById("videoTimer-1");


audioRecordBtn.onclick = async () => {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

  let mimeType = "";
  if (MediaRecorder.isTypeSupported("audio/mp4")) mimeType = "audio/mp4";
  else if (MediaRecorder.isTypeSupported("audio/webm")) mimeType = "audio/webm";

  audioRecorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
  audioChunks = [];

  audioRecorder.ondataavailable = e => {
    if (e.data.size) audioChunks.push(e.data);
  };

  audioRecorder.onstop = () => {
    recordedAudioBlob = new Blob(audioChunks, {
      type: audioRecorder.mimeType || mimeType
    });

    if (!recordedAudioBlob.size) {
      audioPreview.innerHTML = "<p>Recording failed</p>";
      return;
    }

    audioSubmitBtn.disabled = false; // ✅ FIX
    audioSubmitBtn.classList.add("active-button");

    const url = URL.createObjectURL(recordedAudioBlob);
    audioPreview.innerHTML = `<audio controls src="${url}"></audio>`;
  };

  audioRecorder.start();
  audioStopBtn.disabled = false;
  audioSubmitBtn.disabled = true;

  audioTimer.textContent = "00:00";
  audioInterval = startTimer(audioTimer);

  setTimeout(stopAudioRecording, MAX_TIME);
};

audioStopBtn.onclick = stopAudioRecording;

function stopAudioRecording() {
  if (!audioRecorder || audioRecorder.state === "inactive") return;

  audioRecorder.stop();
  audioRecorder.stream.getTracks().forEach(t => t.stop());
  clearInterval(audioInterval);

  audioStopBtn.disabled = true;
}



let videoRecorder;
let videoChunks = [];
let recordedVideoBlob = null;
let videoStopTimeout;


const videoRecordBtn = document.querySelector(".panel-1:nth-child(2) .record-btn-1");
const videoStopBtn   = document.querySelector(".panel-1:nth-child(2) .stop-btn-1");
const videoPreview   = document.querySelector(".panel-1:nth-child(2) div:nth-of-type(2)");
const videoSubmitBtn = document.querySelector(".js-submit-video-button-1");

videoRecordBtn.onclick = async () => {
  const stream = await navigator.mediaDevices.getUserMedia({
    audio: true,
    video: true
  });

  // 🔴 SHOW LIVE CAMERA
  showLiveVideo(stream, videoPreview);

  let mimeType = "";
  if (MediaRecorder.isTypeSupported("video/mp4")) mimeType = "video/mp4";
  else if (MediaRecorder.isTypeSupported("video/webm")) mimeType = "video/webm";

  videoRecorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
  videoChunks = [];

  videoRecorder.ondataavailable = e => {
    if (e.data.size) videoChunks.push(e.data);
  };

  videoRecorder.onstop = () => {
    recordedVideoBlob = new Blob(videoChunks, {
      type: videoRecorder.mimeType || mimeType
    });

    if (!recordedVideoBlob.size) return;

    const url = URL.createObjectURL(recordedVideoBlob);

    // 🔁 SWITCH TO PLAYBACK
    videoPreview.innerHTML = `
      <video controls playsinline src="${url}"></video>
    `;

    videoSubmitBtn.disabled = false;
    videoSubmitBtn.classList.add("active-button");
  };

  videoRecorder.start();
  videoStopBtn.disabled = false;

  // TIMER
  videoTimerEl.textContent = "00:00";
  videoInterval = startTimer(videoTimerEl);
  videoStopTimeout = setTimeout(stopVideoRecording, MAX_TIME);
};



function stopVideoRecording() {
  if (!videoRecorder || videoRecorder.state === "inactive") return;

  videoRecorder.stop();
  videoRecorder.stream.getTracks().forEach(t => t.stop());

  // ✅ STOP TIMER
  clearInterval(videoInterval);

  // ✅ STOP AUTO TIMEOUT
  clearTimeout(videoStopTimeout);

  videoStopBtn.disabled = true;
}



videoStopBtn.onclick = stopVideoRecording;

audioSubmitBtn.onclick = () => {
  if (!recordedAudioBlob) return;

  const fileName = `audio_${dayjs().format('YYYY_MM_DD_HH_mm_ss_ms')}.wav`;

  const file = blobToFile(
    recordedAudioBlob,
    fileName
  );
  
  addFileRow(recordedAudioBlob, fileName);
  recordedAudioBlob = null;

  audioSubmitBtn.disabled = true;
  audioSubmitBtn.classList.remove("active-button");
  audioPreview.innerHTML = "";
};



videoSubmitBtn.onclick = () => {
  if (!recordedVideoBlob) return;
  const fileName = `video_${dayjs().format('YYYY_MM_DD_HH_mm_ss_ms')}.mp4`;
  const file = blobToFile(
    recordedVideoBlob,
    fileName
  );

  addFileRow(recordedVideoBlob, fileName.split('.')[0] + '.wav');
  recordedVideoBlob = null;

  videoSubmitBtn.disabled = true;
  videoSubmitBtn.classList.remove("active-button");
};




const filesBody = document.getElementById("filesBody");

function addFileRow(blob,fileName ,type = "audio") {
  const url = URL.createObjectURL(blob);
  const now = new Date();

  const row = document.createElement("div");
  row.className = "file-row";
  row.dataset.saved = "false";


  row.innerHTML = `
    <input type="checkbox" />
    ${type === "audio"
      ? `<audio controls src="${url}"></audio>`
      : `<video controls src="${url}"></video>`
    }
    <span class="filename">${fileName}</span>
    <span class="duration">--:--</span>
    <span class="recorded-at">${now.toLocaleString()}</span>
    <span class="status-badge">NEW</span>
    <span class="recorder-name">${getCurrentUsername()}</span>
    <span class="saved-badge not-saved">Not Saved</span>
  `;


  const mediaEl = row.querySelector("audio, video");
  const durationEl = row.querySelector(".duration");

  mediaEl.addEventListener("loadedmetadata", () => {
    const d = Math.floor(mediaEl.duration);
    durationEl.textContent =
      `${Math.floor(d / 60)}:${String(d % 60).padStart(2, "0")}`;
  });

  filesBody.prepend(row);
  attachRowSelection(row);
  updateActionButtons(); // 🔴 enable Clear All

}


function showLiveVideo(stream, container) {
  container.innerHTML = "";

  const video = document.createElement("video");
  video.autoplay = true;
  video.muted = true;          // REQUIRED
  video.playsInline = true;    // REQUIRED for mobile
  video.srcObject = stream;
  video.className = "live-video";

  container.appendChild(video);
}



const clearAllBtn    = document.getElementById("clearAllBtn");
const deselectAllBtn = document.getElementById("deselectAllBtn");
const deleteBtn      = document.getElementById("deleteBtn");
const exportBtn      = document.getElementById("exportBtn");



function updateActionButtons() {
  const rows = filesBody.querySelectorAll(".file-row");
  const selected = filesBody.querySelectorAll(
    '.file-row:not([style*="display: none"]) input[type="checkbox"]:checked'
  );


  // Clear all → at least one file exists
  clearAllBtn.disabled = rows.length === 0;

  // These need at least one selection
  const hasSelection = selected.length > 0;
  deselectAllBtn.disabled = !hasSelection;
  deleteBtn.disabled = !hasSelection;
  exportBtn.disabled = !hasSelection;
}



function attachRowSelection(row) {
  const checkbox = row.querySelector('input[type="checkbox"]');

  function syncSelection(isSelected) {
    checkbox.checked = isSelected;
    row.classList.toggle("selected", isSelected);
    updateActionButtons();
  }

  // Checkbox click (manual)
  checkbox.addEventListener("change", () => {
    syncSelection(checkbox.checked);
  });

  // Row click (toggle)
  row.addEventListener("click", (e) => {
    // Ignore clicks on interactive elements
    if (
      e.target.tagName === "INPUT" ||
      e.target.tagName === "AUDIO" ||
      e.target.tagName === "VIDEO" ||
      e.target.closest("audio, video")
    ) return;

    syncSelection(!checkbox.checked); // 🔁 TOGGLE
  });
}



clearAllBtn.onclick = () => {
  filesBody.innerHTML = "";
  updateActionButtons();
};


deselectAllBtn.onclick = () => {
  filesBody.querySelectorAll(".file-row").forEach(row => {
    row.classList.remove("selected");
    row.querySelector('input[type="checkbox"]').checked = false;
  });
  updateActionButtons();
};

deleteBtn.onclick = () => {
  filesBody.querySelectorAll(
    '.file-row input[type="checkbox"]:checked'
  ).forEach(cb => cb.closest(".file-row").remove());

  updateActionButtons();
};


exportBtn.onclick = async () => {
  const selectedRows = filesBody.querySelectorAll(
    '.file-row input[type="checkbox"]:checked'
  );

  for (const cb of selectedRows) {
    const row = cb.closest(".file-row");
    const badge = row.querySelector(".saved-badge");

    // ⛔ Skip already saved
    if (row.dataset.saved === "true") {
      cb.checked = false;
      row.classList.remove("selected");
      continue;
    }

    const mediaEl = row.querySelector("audio, video");
    const blobUrl = mediaEl.src;
    const blob = await fetch(blobUrl).then(r => r.blob());

    const meta = getRowMetadata(row);
    const user = getCurrentUsername();

    const formData = new FormData();
    formData.append("file", blob, meta.filename);
    formData.append("metadata", JSON.stringify(meta));

    try {
      const res = await fetch(
        `${backendOrigin}/${user}/recordings/${meta.filename}`,
        {
          method: "POST",
          body: formData
        }
      );

      if (!res.ok) throw new Error("Upload failed");

      // ✅ Update UI
      badge.textContent = "Saved";
      badge.classList.remove("not-saved");
      badge.classList.add("saved");
      row.dataset.saved = "true";

    } catch (err) {
      console.error("Upload failed:", meta.filename);
    }

    cb.checked = false;
    row.classList.remove("selected");
  }

  updateActionButtons();
};



function applyFilter(type) {
  const rows = filesBody.querySelectorAll(".file-row");

  rows.forEach(row => {
    const isSaved = row.dataset.saved === "true";

    let visible = true;

    if (type === "saved") visible = isSaved;
    if (type === "not-saved") visible = !isSaved;

    row.style.display = visible ? "" : "none";
  });

  updateActionButtons();
}


const filterButtons = document.querySelectorAll(".filters button");

filterButtons.forEach(btn => {
  btn.onclick = () => {
    // 🔄 remove from all
    filterButtons.forEach(b => b.classList.remove("filter-selected"));

    // ✅ add to selected
    btn.classList.add("filter-selected");

    const label = btn.textContent.toLowerCase();

    if (label.includes("all")) {
      applyFilter("all");
    } 
    else if (label.includes("saved") && !label.includes("not")) {
      applyFilter("saved");
    } 
    else if (label.includes("not")) {
      applyFilter("not-saved");
    }
  };
});


function getRowMetadata(row) {
  return {
    filename: row.querySelector(".filename").textContent,
    duration: row.querySelector(".duration").textContent,
    recordedAt: row.querySelector(".recorded-at").textContent,
    recorder: row.querySelector(".recorder-name").textContent,
    status: "NEW"
  };
}














