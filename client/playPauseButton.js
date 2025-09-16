const playPauseBtn = document.getElementById("playPauseBtn");
let isPlaying = true;

export function getIsPlaying() {
    return isPlaying;
}

export function setIsPlaying(value) {
    isPlaying = value;
}
playPauseBtn.addEventListener("click", () => {
    const videos = document.querySelectorAll("video");
    const icon = playPauseBtn.querySelector("i");

    if (isPlaying) {
        // Pause tất cả video
        videos.forEach(v => v.pause());
        icon.classList.remove("fa-pause");
        icon.classList.add("fa-play");
    } else {
        // Play tất cả video
        videos.forEach(v => v.play().catch(()=>{})); // tránh lỗi video chưa tải xong
        icon.classList.remove("fa-play");
        icon.classList.add("fa-pause");
    }

    isPlaying = !isPlaying;
});
