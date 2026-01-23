const MAX_TIME = 60000;

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

const audioRecordBtn = document.getElementById("audioRecordBtn-1");
const audioStopBtn   = document.getElementById("audioStopBtn-1");
const audioPreview   = document.getElementById("audioPreview-1");
const audioTimer     = document.getElementById("audioTimer-1");
const audioSubmitBtn = document.getElementById("audioSubmitBtn-1");

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

const videoRecordBtn = document.querySelector(".panel-1:nth-child(2) .record-btn-1");
const videoStopBtn   = document.querySelector(".panel-1:nth-child(2) .stop-btn-1");
const videoPreview   = document.querySelector(".panel-1:nth-child(2) div:nth-of-type(2)");
const videoSubmitBtn = document.querySelector(".js-submit-video-button-1");

videoRecordBtn.onclick = async () => {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });

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

    if (!recordedVideoBlob.size) {
      videoPreview.innerHTML = "<p>Recording failed</p>";
      return;
    }

    videoSubmitBtn.disabled = false;
    videoSubmitBtn.classList.add("active-button");

    const url = URL.createObjectURL(recordedVideoBlob);
    videoPreview.innerHTML = `<video controls playsinline src="${url}"></video>`;
  };

  videoRecorder.start();
  videoStopBtn.disabled = false;
};

videoStopBtn.onclick = () => {
  if (!videoRecorder || videoRecorder.state === "inactive") return;
  videoRecorder.stop();
  videoRecorder.stream.getTracks().forEach(t => t.stop());
  videoStopBtn.disabled = true;
};



audioSubmitBtn.onclick = () => {
  if (!recordedAudioBlob) return;

  const file = blobToFile(
    recordedAudioBlob,
    `audio_${Date.now()}.${recordedAudioBlob.type.split("/")[1]}`
  );

  addFileRow(recordedAudioBlob);
  recordedAudioBlob = null;

  audioSubmitBtn.disabled = true;
  audioSubmitBtn.classList.remove("active-button");
  audioPreview.innerHTML = "";
};



videoSubmitBtn.onclick = () => {
  if (!recordedVideoBlob) return;

  const file = blobToFile(
    recordedVideoBlob,
    `video_${Date.now()}.${recordedVideoBlob.type.split("/")[1]}`
  );

  addFileRow(recordedVideoBlob);
  recordedVideoBlob = null;

  videoSubmitBtn.disabled = true;
  videoSubmitBtn.classList.remove("active-button");
};




const filesBody = document.getElementById("filesBody");

function addFileRow(blob, type = "audio") {
  const url = URL.createObjectURL(blob);
  const now = new Date();

  const row = document.createElement("div");
  row.className = "file-row";

  row.innerHTML = `
    <input type="checkbox" />
    ${type === "audio"
      ? `<audio controls src="${url}"></audio>`
      : `<video controls src="${url}" width="120"></video>`
    }
    <span>${type}-${now.getTime()}</span>
    <span class="duration">--:--</span>
    <span>${now.toLocaleString()}</span>
    <span class="status-badge">NEW</span>
    <span>John Smith</span>
    <button>⋮</button>
  `;

  const mediaEl = row.querySelector("audio, video");
  const durationEl = row.querySelector(".duration");

  mediaEl.addEventListener("loadedmetadata", () => {
    const d = Math.floor(mediaEl.duration);
    durationEl.textContent =
      `${Math.floor(d / 60)}:${String(d % 60).padStart(2, "0")}`;
  });

  filesBody.prepend(row);
}









