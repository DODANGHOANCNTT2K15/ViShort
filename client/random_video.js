const container = document.getElementById("container");
let videos = Array.from(container.querySelectorAll("video"));
const API_BASE = "http://192.168.102.18:3000";

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
        console.log(`Đã load video ${i}:`, url);
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

    videos.forEach(v => {
        if (v === mostVisible.video) {
            v.play().catch(() => { }); // giữ logic play video visible nhất
        } else {
            v.pause();
        }
    });
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

    console.log("Đã load video:", url);
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


// Trigger lần đầu
handlePlay();
