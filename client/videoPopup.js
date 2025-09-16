const videoPopup = document.getElementById("videoPopup");
const closePopup = document.getElementById("closePopup");
const popupVideosContainer = document.getElementById("popupVideosContainer");

let allVideos = [];
let currentPage = 1;
const videosPerPage = 8; // số video mỗi trang

// Tạo 1 video item
function createVideoItem(v) {
    const item = document.createElement("div");
    item.className = "popupVideoItem";

    const info = document.createElement("div");
    info.className = "videoInfo";
    info.innerHTML = `
        <strong>${v.title}</strong><br>
        <span>Author: </span>${v.author}<br>
        <span>Character: </span>${v.character}<br>
        <span>Genre: </span>${v.genre}
    `;

    const videoEl = document.createElement("video");
    videoEl.src = `http://192.168.102.18:3000/api/videos/${encodeURIComponent(v.author)}/${encodeURIComponent(v.filename)}`;
    videoEl.controls = true;
    videoEl.autoplay = false;
    videoEl.muted = true;
    videoEl.preload = "metadata";
    videoEl.style.width = "100%";
    videoEl.style.marginTop = "8px";

    videoEl.addEventListener('loadedmetadata', () => {
        videoEl.currentTime = videoEl.duration * 0.5;
        videoEl.pause();
    });

    item.appendChild(info);
    item.appendChild(videoEl);
    return item;
}

// Render 1 trang
function renderPage(page) {
    popupVideosContainer.innerHTML = "";
    const start = (page - 1) * videosPerPage;
    const end = start + videosPerPage;
    const videosToShow = allVideos.slice(start, end);

    videosToShow.forEach(v => popupVideosContainer.appendChild(createVideoItem(v)));

    renderPagination();
}

// Tạo nút phân trang
function renderPagination() {
    let pagination = document.getElementById("paginationContainer");
    if (!pagination) {
        pagination = document.createElement("div");
        pagination.id = "paginationContainer";
        pagination.style.marginTop = "10px";
        pagination.style.textAlign = "center";
        videoPopup.querySelector("#popupContent").appendChild(pagination);
    }
    pagination.innerHTML = "";

    const totalPages = Math.ceil(allVideos.length / videosPerPage);

    // Prev
    const prevBtn = document.createElement("button");
    prevBtn.textContent = "<";
    prevBtn.disabled = currentPage === 1;
    prevBtn.addEventListener("click", () => {
        if (currentPage > 1) {
            currentPage--;
            renderPage(currentPage);
        }
    });
    pagination.appendChild(prevBtn);

    // Nút đầu tiên
    pagination.appendChild(createPageButton(1));

    // Dấu ... nếu currentPage > 2
    if (currentPage > 2) {
        const dots1 = document.createElement("span");
        dots1.textContent = "...";
        dots1.style.margin = "0 4px";
        pagination.appendChild(dots1);
    }

    // Nút trang hiện tại (giữa)
    if (currentPage !== 1 && currentPage !== totalPages) {
        pagination.appendChild(createPageButton(currentPage));
    }

    // Dấu ... nếu currentPage < totalPages - 1
    if (currentPage < totalPages - 1) {
        const dots2 = document.createElement("span");
        dots2.textContent = "...";
        dots2.style.margin = "0 4px";
        pagination.appendChild(dots2);
    }

    // Nút cuối cùng nếu > 1
    if (totalPages > 1) {
        pagination.appendChild(createPageButton(totalPages));
    }

    // Next
    const nextBtn = document.createElement("button");
    nextBtn.textContent = ">";
    nextBtn.disabled = currentPage === totalPages;
    nextBtn.addEventListener("click", () => {
        if (currentPage < totalPages) {
            currentPage++;
            renderPage(currentPage);
        }
    });
    pagination.appendChild(nextBtn);
}

// Hàm tạo nút số trang
function createPageButton(pageNum) {
    const btn = document.createElement("button");
    btn.textContent = pageNum;
    btn.disabled = pageNum === currentPage;
    btn.style.margin = "0 2px";
    btn.addEventListener("click", () => {
        currentPage = pageNum;
        renderPage(currentPage);
    });
    return btn;
}

// Mở popup
export function showVideoPopup(videos) {
    allVideos = videos;
    currentPage = 1;
    renderPage(currentPage);
    videoPopup.classList.remove("hidden");
}

// Đóng popup
closePopup.addEventListener("click", () => {
    videoPopup.classList.add("hidden");
    // Dừng tất cả video khi đóng
    popupVideosContainer.querySelectorAll("video").forEach(v => {
        v.pause();
        v.currentTime = 0;
        v.src = ""; // Giải phóng bộ nhớ
    });
});

