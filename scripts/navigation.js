 const navButtons = document.querySelectorAll(
    ".record-page-button, .annotate-page-button"
  );

navButtons.forEach(button => {
  button.addEventListener("click", () => {
    // remove active from all
    navButtons.forEach(btn =>
      btn.classList.remove("active-page-button")
    );

    // add active to clicked one
    button.classList.add("active-page-button");
  });
});





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
  activatePage("record");
}
