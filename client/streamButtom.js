const streamBtn = document.getElementById("streamBtn");
import { setShuffledVideos } from "./random_video.js";

let currentApiUrl = null;

// Hàm này được navBottom gọi để set api
export function setCurrentApi(url) {
    currentApiUrl = url;
}

streamBtn.addEventListener("click", async () => {
    if (!currentApiUrl) {
        alert("Chưa chọn nguồn video!");
        return;
    }

    try {
        const res = await fetch(currentApiUrl);
        if (!res.ok) throw new Error("Không lấy được danh sách video");

        const data = await res.json();

        const urls = data.map(v => `/api/videos/${v.author}/${v.filename}`);

        setShuffledVideos(urls);

        videoPopup.classList.add("hidden");
        
        // Dừng tất cả video khi đóng
        popupVideosContainer.querySelectorAll("video").forEach(v => {
            v.pause();
            v.currentTime = 0;
            v.src = ""; // Giải phóng bộ nhớ
        });

    } catch (err) {
        console.error("STREAM error:", err);
    }
});
