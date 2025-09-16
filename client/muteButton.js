const muteBtn = document.getElementById("muteBtn");
let isMuted = false; // trạng thái mute

muteBtn.addEventListener("click", () => {
    isMuted = !isMuted; // đảo trạng thái
    const icon = muteBtn.querySelector("i");

    // cập nhật icon
    if (isMuted) {
        icon.classList.remove("fa-volume-high");
        icon.classList.add("fa-volume-xmark"); // icon tắt tiếng
    } else {
        icon.classList.remove("fa-volume-xmark");
        icon.classList.add("fa-volume-high"); // icon bật tiếng
    }

    // áp dụng cho tất cả video
    const videos = document.querySelectorAll("video");
    videos.forEach(v => v.muted = isMuted);
});
