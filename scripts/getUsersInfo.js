import { getUrls } from "../config/urls.js";
const urls = getUrls();
const {bakendOrigin} = urls;

export async function fetchUsers() {
  const res = await fetch(`${bakendOrigin}/api/users`, {
    method : "GET",
    credentials : "include"
  });
  if (!res.ok) throw new Error("Failed to fetch users");
  return await res.json(); // ["navaneethkumar", ...]
}
