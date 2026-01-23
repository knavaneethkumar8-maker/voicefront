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
signupBtn.onclick = () => {
  const username = document.getElementById("signupUsername").value.trim();
  const password = document.getElementById("signupPassword").value.trim();

  if (!username || !password) {
    signupMessage.textContent = "Please fill all fields";
    signupMessage.classList.remove("success");
    return;
  }

  const users = JSON.parse(localStorage.getItem("users") || "{}");

  if (users[username]) {
    signupMessage.textContent = "User already exists";
    signupMessage.classList.remove("success");
    return;
  }

  users[username] = password;
  localStorage.setItem("users", JSON.stringify(users));

  signupMessage.textContent = "Signup successful. Sign in now.";
  signupMessage.classList.add("success");

  setTimeout(() => {
    goToSignin.click();
  }, 1200);
};

/* SIGN IN */
/* SIGN IN */
signinBtn.onclick = () => {
  const username = document.getElementById("signinUsername").value.trim();
  const password = document.getElementById("signinPassword").value.trim();

  const users = JSON.parse(localStorage.getItem("users") || "{}");

  if (!users[username]) {
    signinMessage.textContent = "No user found";
    signinMessage.classList.remove("success");
    return;
  }

  if (users[username] !== password) {
    signinMessage.textContent = "Incorrect password";
    signinMessage.classList.remove("success");
    return;
  }

  /* SUCCESS */
  signinMessage.textContent = "Login successful";
  signinMessage.classList.add("success");

  // 🔹 Update profile section
  profileUsername.textContent = username;

  // 🔹 Store logged-in user
  localStorage.setItem("loggedInUser", username);

  setTimeout(() => {
    authOverlay.style.display = "none";
  }, 600);
};



const loggedInUser = localStorage.getItem("loggedInUser");

if (loggedInUser) {
  profileUsername.textContent = loggedInUser;
  authOverlay.style.display = "none";
}


