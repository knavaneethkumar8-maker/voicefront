const authOverlay = document.getElementById("authOverlay");

const signinForm = document.getElementById("signinForm");
const signupForm = document.getElementById("signupForm");

const goToSignup = document.getElementById("goToSignup");
const goToSignin = document.getElementById("goToSignin");

const signinBtn = document.getElementById("signinBtn");
const signupBtn = document.getElementById("signupBtn");

const signinMessage = document.getElementById("signinMessage");
const signupMessage = document.getElementById("signupMessage");

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
signinBtn.onclick = () => {
  const username = document.getElementById("signinUsername").value.trim();
  const password = document.getElementById("signinPassword").value.trim();

  const users = JSON.parse(localStorage.getItem("users") || "{}");

  if (!users[username]) {
    signinMessage.textContent = "No user found";
    return;
  }

  if (users[username] !== password) {
    signinMessage.textContent = "Incorrect password";
    return;
  }

  /* SUCCESS */
  signinMessage.textContent = "Login successful";
  signinMessage.classList.add("success");

  setTimeout(() => {
    authOverlay.style.display = "none";
  }, 600);
};
