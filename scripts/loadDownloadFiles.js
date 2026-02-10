import { getUrls } from "../config/urls.js";

const urls = getUrls();
const {backendOrigin} = urls;

let currentPage = 1;
const pageSize = 20;




async function loadDownloadFiles(page = 1) {
  try {
    currentPage = page;

    const res = await fetch(
      `${backendOrigin}/api/downloads?page=${page}&limit=${pageSize}`,
      { credentials: "include" }
    );

    const data = await res.json();

    renderFilesList(data.records);
    renderPagination(data.totalPages, data.page);

  } catch (err) {
    console.error("Failed to load downloads:", err);
  }
}


function publicUrl(p) {
  if (!p) return "#";

  // normalize slashes for windows paths
  p = p.replace(/\\/g, "/");

  // remove leading slashes
  p = p.replace(/^\/+/, "");

  // already absolute URL
  if (p.startsWith("http")) return p;

  // ensure correct public mapping
  if (!p.startsWith("uploads/")) {
    p = "uploads/" + p;
  }

  return `${backendOrigin}/${p}`;
}


function toPublicPath(p) {
  if (!p) return "#";

  p = p.replace(/\\/g, "/");

  const idx = p.indexOf("/uploads/");
  if (idx !== -1) {
    p = p.slice(idx);   // keep only /uploads/...
  }

  return `${backendOrigin}${p}`;
}



function renderFilesList(records) {
  const container = document.querySelector(".files-list-container");
  const tpl = document.getElementById("fileRowTemplate");

  if (!container || !tpl) return;

  if (!records.length) {
    container.innerHTML = `<p style="text-align:center;color:#94a3b8;">No NEW files available</p>`;
    return;
  }

  const template = tpl.innerHTML;
  let html = "";

  for (const r of records) {
    html += template
            .replace("{{filename}}", r.filename)
            .replace("{{recorder}}", r.recorder || "Unknown")
            .replace("{{wav}}", `${backendOrigin}/download/wav/${r.filename}`)
            .replace("{{tg}}", r.tgPaths?.tg)
            .replace("{{wav8}}", `${backendOrigin}/download/wav/${r.filename.replace(".wav", "_8x.wav")}`)
            .replace("{{tg8}}", r.tgPaths?.tg_8x)
            .replace("{{wav16}}", `${backendOrigin}/download/wav/${r.filename.replace(".wav", "_16x.wav")}`)
            .replace("{{tg16}}", r.tgPaths?.tg_16x);

  }

  container.innerHTML = html;

  // 🔥 CRITICAL FIX
  container.querySelectorAll("a").forEach(a => {
    a.addEventListener("click", e => {
      e.stopPropagation();
    });
  });
}


function renderPagination(totalPages, activePage) {
  const bar = document.querySelector(".pagination-bar");
  if (!bar || totalPages <= 1) {
    bar.innerHTML = "";
    return;
  }

  let html = "";

  const maxVisible = 5;
  let start = Math.max(activePage - 2, 1);
  let end = Math.min(start + maxVisible - 1, totalPages);

  if (end - start < maxVisible - 1) {
    start = Math.max(end - maxVisible + 1, 1);
  }

  for (let i = start; i <= end; i++) {
    html += `
      <button 
        class="page-btn ${i === activePage ? "active" : ""}" 
        data-page="${i}">
        ${i}
      </button>
    `;
  }

  if (activePage < totalPages) {
    html += `<button class="page-btn next-btn" data-page="${activePage + 1}">Next ›</button>`;
  }

  bar.innerHTML = html;

  bar.querySelectorAll("button").forEach(btn => {
    btn.addEventListener("click", () => {
      loadDownloadFiles(parseInt(btn.dataset.page));
    });
  });
}






// document
//   .querySelector(".download-btn")
//   .addEventListener("click", loadDownloadFiles);

const loadDownloadFilesBtn = document.querySelector(".download-btn");

loadDownloadFilesBtn?.addEventListener("click", () => {
  loadDownloadFiles(1);
});

