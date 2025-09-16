const container = document.getElementById("container");
let videos = Array.from(container.querySelectorAll("video"));
const API_BASE = "http://192.168.102.18:3000";
import { getIsPlaying, setIsPlaying } from "./playPauseButton.js";


async function fetchAllVideo() {
    try {
        const res = await fetch(`${API_BASE}/api/videos/all`);
        if (!res.ok) throw new Error("Không lấy được danh sách video");
        const data = await res.json();
        return data; // giả sử API trả mảng URL video
    } catch (err) {
        console.error(err);
        return [];
    }
}
let allVideos = await fetchAllVideo();

function shuffleArray(array) {
    let arr = array.slice();
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

let shuffledVideos = shuffleArray(allVideos);

let currentIndex = 0;
async function loadFirstVideos() {
    const videoEls = container.querySelectorAll("video");
    for (let i = 0; i < 3 && i < videoEls.length && i < shuffledVideos.length; i++) {
        const url = shuffledVideos[i];
        videoEls[i].src = API_BASE + url;
        videoEls[i].load();
        setVideoDataAttributes(videoEls[i], url);
        currentIndex = i + 1;
    };
};

loadFirstVideos();

// Scroll logic: play video visible nhất, pause các video khác
function handlePlay() {
    videos = Array.from(container.querySelectorAll("video"));

    const rects = videos.map(v => {
        const rect = v.getBoundingClientRect();
        const visible = Math.max(
            0,
            Math.min(container.clientHeight, rect.bottom) - Math.max(0, rect.top)
        );
        return { video: v, visible };
    });


    const mostVisible = rects.reduce((max, cur) => cur.visible > max.visible ? cur : max, { visible: -1 });

    if (mostVisible.video) {
        let title = mostVisible.video.getAttribute("data-title") || "Title Video";
        // loại bỏ .mp4 nếu có
        title = title.replace(/\.mp4$/i, "");

        const author = mostVisible.video.getAttribute("data-author") || "Author Video";
        const character = mostVisible.video.getAttribute("data-character") || "Description Video";
        const genre = mostVisible.video.getAttribute("data-genre") || "Genre Video";

        document.getElementById("titleVideo").textContent = title;
        document.getElementById("authorVideo").textContent = author;
        document.getElementById("characterVideo").textContent = character;
        document.getElementById("genreVideo").textContent = genre;
    }


    videos.forEach(v => {
        if (v === mostVisible.video) {
            v.play().catch(() => { }); // giữ logic play video visible nhất
        } else {
            v.pause();
        }
    });

    // Đồng bộ icon chỉ dựa trên video visible nhất
    const icon = playPauseBtn.querySelector("i");
    if (mostVisible.video && !mostVisible.video.paused) {
        icon.classList.remove("fa-play");
        icon.classList.add("fa-pause");
        setIsPlaying(true);
    }
}

async function loadVideoNoRepeat(videoEl) {
    if (shuffledVideos.length === 0) return;

    // reset nếu đã hết video
    if (currentIndex >= shuffledVideos.length) {
        currentIndex = 0;
    }

    const url = shuffledVideos[currentIndex];
    currentIndex++;

    videoEl.src = API_BASE + url;
    videoEl.load();
    setVideoDataAttributes(videoEl, url);
}

// Scroll event với debounce
container.addEventListener("scroll", () => {
    clearTimeout(container._scrollTimeout);
    container._scrollTimeout = setTimeout(async () => {
        handlePlay();

        const videoEls = container.querySelectorAll("video");
        const lastVideo = videoEls[videoEls.length - 1];

        // Khi video cuối cùng sắp hiện ra => thêm video mới
        const rect = lastVideo.getBoundingClientRect();
        if (rect.top < container.clientHeight * 1.5) {
            // thêm video mới vào cuối
            const newDiv = document.createElement("div");
            newDiv.className = "video-page";
            const newVideo = document.createElement("video");
            newVideo.muted = true;
            newVideo.loop = true;
            newVideo.autoplay = true;
            newVideo.controls = true;
            newVideo.playsInline = true;
            newVideo.preload = "auto"; // tải sẵn


            newDiv.appendChild(newVideo);
            container.appendChild(newDiv);
            videos.push(newVideo);

            await loadVideoNoRepeat(newVideo);

            // nếu đã có > 3 video thì xóa video đầu tiên
            if (videos.length > 4) {
                const firstDiv = videos[0].parentElement;
                firstDiv.remove();
                videos.shift(); // bỏ khỏi mảng
            }
        }
    }, 200);
});

function setVideoDataAttributes(videoEl, url) {
    // url ví dụ: /api/videos/angelyeah/angelyeah_myheroacde_unknow_Part2ofminaashidofromMyHeroAcade.mp4
    const parts = url.split("/");
    const filename = parts[parts.length - 1];
    const [author, genre, character, ...rest] = filename.split("_");

    videoEl.setAttribute("data-author", author || "Author Video");
    videoEl.setAttribute("data-genre", genre || "Genre Video");
    videoEl.setAttribute("data-character", character || "Description Video");
    videoEl.setAttribute("data-title", rest.join("_") || "Title Video");
}

// Trigger lần đầu
handlePlay();
