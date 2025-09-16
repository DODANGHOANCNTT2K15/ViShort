import { showVideoPopup } from "./videoPopup.js";

const searchContainer = document.getElementById("searchContainer");
const searchBtn = document.getElementById("searchBtn");
const searchInput = document.getElementById("searchInput");

// Hàm thực hiện tìm kiếm và hiển thị popup
async function performSearch() {
    const keyword = searchInput.value.trim();
    if (!keyword) return;

    try {
        const res = await fetch(`http://192.168.102.18:3000/api/search?q=${encodeURIComponent(keyword)}`);
        if (!res.ok) throw new Error("Không lấy được dữ liệu tìm kiếm");
        const videos = await res.json();

        if (videos.length === 0) {
            alert("Không tìm thấy video nào!");
            return;
        }

        showVideoPopup(videos);
    } catch (err) {
        console.error(err);
    }
}

// Bấm vào nút search
searchBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    if (searchContainer.classList.contains("collapsed")) {
        searchContainer.classList.remove("collapsed");
        searchInput.focus();
        return;
    }
    performSearch();
});

// Bấm Enter trên input
searchInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
        performSearch();
    }
});

// Click ra ngoài thì ẩn input
document.addEventListener("click", (e) => {
    if (!searchContainer.contains(e.target)) {
        searchContainer.classList.add("collapsed");
    }
});
