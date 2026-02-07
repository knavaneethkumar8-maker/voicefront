//import { showPage } from "./loginPage.js";

const navButtons = document.querySelectorAll(
    ".record-page-button, .annotate-page-button"
);

const recordSection   = document.querySelector(".record-section");
const annotateSection = document.querySelector(".annotate-section");
const filesSection    = document.querySelector(".files-page-section");

const recordBtn   = document.querySelector(".record-page-button");
const annotateBtn = document.querySelector(".annotate-page-button");
const filesBtn    = document.querySelector(".files-page-button");

export function showPage(page) {
  const pages = ["record", "annotate", "files"];

  // Hide all sections
  recordSection.style.display   = "none";
  annotateSection.style.display = "none";
  filesSection.style.display    = "none";

  // Remove active class from all nav buttons
  recordBtn.classList.remove("active-page-button");
  annotateBtn.classList.remove("active-page-button");
  filesBtn.classList.remove("active-page-button");

  // Show selected page
  if (page === "record") {
    recordSection.style.display = "block";
    recordBtn.classList.add("active-page-button");
  }

  if (page === "annotate") {
    annotateSection.style.display = "block";
    annotateBtn.classList.add("active-page-button");
  }

  if (page === "files") {
    filesSection.style.display = "block";
    filesBtn.classList.add("active-page-button");
  }

  localStorage.setItem("activePage", page);
}



recordBtn.onclick   = () => showPage("record");
annotateBtn.onclick = () => showPage("annotate");
filesBtn.onclick    = () => showPage("files");

document.addEventListener("DOMContentLoaded", () => {
  const savedPage = localStorage.getItem("activePage") || "record";
  showPage(savedPage);
});
