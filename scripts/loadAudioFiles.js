import { fetchUsers } from "./getUsersInfo.js";

fetchUsers().then(users => {
  const select = document.querySelector(".js-account-select");
  select.innerHTML = "";

  users.forEach(user => {
    const option = document.createElement("option");
    option.value = user;
    option.textContent = user;
    select.appendChild(option);
  });
});
