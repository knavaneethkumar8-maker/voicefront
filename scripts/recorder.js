import dayjs from "https://unpkg.com/dayjs@1.11.10/esm/index.js";
import { setAudioForAllCells } from "./main.js";
import { renderAllGrids } from "./renderBoothGrids.js";
import { lockGrids } from "./main.js";

let recordedAudioBlob = null;
let recordedVideoBlob = null;

let audioRecorder, videoRecorder;
let audioChunks = [];
let videoChunks = [];
let audioInterval, videoInterval;

let currentFileName;
let currentAudioDuration;

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



function blobToFile(blob, fileName) {
  return new File([blob], fileName, {type : blob.type});
}


submitVideoBtn?.addEventListener("click", async () => {
  videoPreview.innerHTML = '';
  submitVideoBtn.classList.remove("active-button");

  const videoFile = await blobToFile(recordedVideoBlob, "video2.mp4");
  const formData = new FormData();
  formData.append("video", videoFile);
  const fileName = `video_${dayjs().format('YYYY_MM_DD_HH_mm_ss_ms')}.mp4`
  const response = await fetch(`http://localhost:3500/upload/video/${fileName}`, {
    method : "POST",
    body : formData
  });
  const resultBlob = await response.blob();
  const audioUrl = URL.createObjectURL(resultBlob);
  const extractedFileName = fileName.split('.')[0] + '.wav';
  console.log(extractedFileName);

  const previewHTML = `
    <div class="js-audio-container audio-container ${extractedFileName}">
      <audio src=${audioUrl} controls class="audio-file" id=${extractedFileName}></audio>
      <button class="predict-button">Predict</button>
      <div class="predicted-text-box" contenteditable="true">Predicted Text</div>
      <button class="lock-text-button">Lock</button>
      <button class="generate-button">Generate</button>
    </div>
  `;
  audiosPreviewContainer.innerHTML += previewHTML;
  const audio = document.getElementById(extractedFileName);

  audio.addEventListener("loadedmetadata", ()=> {
    console.log(audio.duration);
    const gridsCount = calcGridCount(audio.duration);
    renderAllGrids(gridsCount, extractedFileName);
    setAudioForAllCells(audio);
    lockGrids();
  });
})

submitAudioBtn?.addEventListener("click", async () => {
  audioPreview.innerHTML = '';
  submitAudioBtn.classList.remove("active-button");

  const audioFile = await blobToFile(recordedAudioBlob, "audio.wav");
  const formData = new FormData();
  formData.append("audio", audioFile);
  console.log(formData);
  const fileName = `audio_${dayjs().format('YYYY_MM_DD_HH_mm_ss_ms')}.wav`
  const response = await fetch(`http://localhost:3500/upload/audio/${fileName}`, {
    method : "POST",
    body : formData
  });
  const audioUrl = URL.createObjectURL(recordedAudioBlob);
  const previewHTML = `
    <div class="js-audio-container audio-container ${fileName}">
      <audio src=${audioUrl} controls class="audio-file" id=${fileName}></audio>
      <button class="predict-button">Predict</button>
      <div class="predicted-text-box" contenteditable="true">Predicted Text</div>
      <button class="lock-text-button">Lock</button>
      <button class="generate-button">Generate</button>
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
    lockGrids();
  });

  const result = await response.json();
  console.log(result);
});

function calcGridCount(duration) {
  const bioesTime = 9;
  let audioLength = duration*1000 ;
  const gridsCount = Math.ceil(audioLength/(24*bioesTime));
  return gridsCount;
}


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
    lockGrids();
  })
}

generateGrids();