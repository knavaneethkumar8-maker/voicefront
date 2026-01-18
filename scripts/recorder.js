let recordedAudioBlob = null;
let recordedVideoBlob = null;

let audioRecorder, videoRecorder;
let audioChunks = [];
let videoChunks = [];
let audioInterval, videoInterval;

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

audioRecordBtn.onclick = async () => {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

  audioRecorder = new MediaRecorder(stream);
  audioChunks = [];

  audioRecorder.ondataavailable = e => audioChunks.push(e.data);
  audioRecorder.onstop = () => {
    recordedAudioBlob = new Blob(audioChunks, { type: "audio/webm" });
    const url = URL.createObjectURL(recordedAudioBlob);
    audioPreview.innerHTML = `<audio controls src="${url}"></audio>`;
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

  videoRecorder = new MediaRecorder(stream);
  videoChunks = [];

  videoRecorder.ondataavailable = e => videoChunks.push(e.data);
  videoRecorder.onstop = () => {
    recordedVideoBlob = new Blob(videoChunks, { type: "video/webm" });
    const url = URL.createObjectURL(recordedVideoBlob);
    videoPreview.innerHTML = `<video controls src="${url}"></video>`;
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


submitVideoBtn?.addEventListener("click", () => {
  videoPreview.innerHTML = '';
  submitVideoBtn.classList.remove("active-button");
})

submitAudioBtn?.addEventListener("click", () => {
  audioPreview.innerHTML = '';
  submitAudioBtn.classList.remove("active-button");
})