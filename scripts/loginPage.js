import { getUrls } from "../config/urls.js";

const authOverlay = document.getElementById("authOverlay");

const signinForm = document.getElementById("signinForm");
const signupForm = document.getElementById("signupForm");

const goToSignup = document.getElementById("goToSignup");
const goToSignin = document.getElementById("goToSignin");

const signinBtn = document.getElementById("signinBtn");
const signupBtn = document.getElementById("signupBtn");

const signinMessage = document.getElementById("signinMessage");
const signupMessage = document.getElementById("signupMessage");

const profileUsername = document.querySelector(".profile-details .username");

const urls = getUrls();
const {backendOrigin} = urls;
// 🔐 Current logged-in user (frontend state)
let currentUser = null;



/* SWITCH FORMS */
goToSignup.onclick = () => {
  signinForm.classList.remove("active");
  signupForm.classList.add("active");
  signinMessage.textContent = "";
};

goToSignin.onclick = () => {
  signupForm.classList.remove("active");
  signinForm.classList.add("active");
  signupMessage.textContent = "";
};

/* SIGN UP */
signupBtn.onclick = async () => {
  const username = document.getElementById("signupUsername").value.trim();
  const password = document.getElementById("signupPassword").value.trim();

  if (!username || !password) {
    signupMessage.textContent = "Please fill all fields";
    signupMessage.classList.remove("success");
    return;
  }

  try {
    const res = await fetch(`${backendOrigin}/auth/signup`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ username, password })
    });

    const result = await res.json();

    if (!res.ok) {
      signupMessage.textContent = result.message;
      signupMessage.classList.remove("success");
      return;
    }

    signupMessage.textContent = "Signup successful. Sign in now.";
    signupMessage.classList.add("success");

    setTimeout(() => goToSignin.click(), 1200);

  } catch (err) {
    signupMessage.textContent = "Server error";
  }
};


/* SIGN IN */
/* SIGN IN */
signinBtn.onclick = async () => {
  const username = document.getElementById("signinUsername").value.trim();
  const password = document.getElementById("signinPassword").value.trim();

  if (!username || !password) {
    signinMessage.textContent = "Please fill all fields";
    signinMessage.classList.remove("success");
    return;
  }

  try {
    const res = await fetch(`${backendOrigin}/auth/login`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ username, password })
    });

    const result = await res.json();

    if (!res.ok) {
      signinMessage.textContent = result.message;
      signinMessage.classList.remove("success");
      return;
    }

    // ✅ SET CURRENT USER (single source of truth)
    currentUser = {
      username: result.username
    };

    // ✅ Update UI
    profileUsername.textContent = currentUser.username;
    signinMessage.textContent = "Login successful";
    signinMessage.classList.add("success");

    setTimeout(() => {
      authOverlay.style.display = "none";
    }, 600);

  } catch (err) {
    signinMessage.textContent = "Server error";
  }
};



export function getCurrentUsername() {
  return currentUser?.username || "Unknown";
}




const recordSection   = document.querySelector(".record-section");
const annotateSection = document.querySelector(".annotate-section");

const recordBtn   = document.querySelector(".record-page-button");
const annotateBtn = document.querySelector(".annotate-page-button");

export function showPage(page) {
  const isAnnotate = (page === "annotate");

  // 🔁 toggle sections
  recordSection.style.display   = isAnnotate ? "none"  : "block";
  annotateSection.style.display = isAnnotate ? "block" : "none";

  // 🔁 toggle nav buttons (EXPLICIT)
  if(isAnnotate) {
    annotateBtn.classList.add('active-page-button');
    recordBtn.classList.remove('active-page-button');
  } else {
    annotateBtn.classList.remove('active-page-button');
    recordBtn.classList.add('active-page-button');
  }

  // 🔐 persist choice
  localStorage.setItem("activePage", isAnnotate ? "annotate" : "record");
}




document.addEventListener("DOMContentLoaded", () => {
  const savedPage = localStorage.getItem("activePage") || "record";
  showPage(savedPage);
});


showPage('annotate');






