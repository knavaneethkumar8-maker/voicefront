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