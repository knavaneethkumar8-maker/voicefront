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

    // ✅ SUCCESS
    profileUsername.textContent = result.username;
    signinMessage.textContent = "Login successful";
    signinMessage.classList.add("success");

    setTimeout(() => {
      authOverlay.style.display = "none";
    }, 600);

  } catch (err) {
    signinMessage.textContent = "Server error";
  }
};







