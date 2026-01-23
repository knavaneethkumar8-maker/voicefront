import { showPage } from "./loginPage.js";

const navButtons = document.querySelectorAll(
    ".record-page-button, .annotate-page-button"
);

const recordPageButton = document.querySelector('.record-page-button');
const annotatePageButton = document.querySelector('.annotate-page-button')

recordPageButton.onclick = () => showPage("record");
annotatePageButton.onclick = () => showPage("annotate");


export function initPageNavigation() {
  const recordBtn = document.querySelector(".record-page-button");
  const annotateBtn = document.querySelector(".annotate-page-button");

  const recordSection = document.querySelector(".record-section");
  const annotateSection = document.querySelector(".annotate-section");

  function activatePage(page) {
    // buttons
    recordBtn.classList.toggle("active-page-button", page === "record");
    annotateBtn.classList.toggle("active-page-button", page === "annotate");

    // sections
    recordSection.classList.toggle("active", page === "record");
    annotateSection.classList.toggle("active", page === "annotate");
  }

  recordBtn.addEventListener("click", () => activatePage("record"));
  annotateBtn.addEventListener("click", () => activatePage("annotate"));

  // default page
  //activatePage("record");
  showPage('annotate');
}
