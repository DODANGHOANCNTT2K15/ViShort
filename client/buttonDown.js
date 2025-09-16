const container = document.getElementById("container");
const btn = document.getElementById("scrollDownBtn");

function isIOS() {
    return /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
}

btn.addEventListener("click", () => {
    if (isIOS()) {
        // iOS FIX: tìm div tiếp theo và scrollIntoView
        const pages = Array.from(container.querySelectorAll(".video-page"));
        const currentScroll = container.scrollTop;
        const nextScroll = currentScroll + window.innerHeight;

        let nextPage = pages.find(p => p.offsetTop >= nextScroll);

        // nếu chưa có => tạo mới
        if (!nextPage) {
            const newDiv = document.createElement("div");
            newDiv.className = "video-page";
            const newVideo = document.createElement("video");
            newVideo.muted = true;
            newVideo.loop = true;
            newVideo.autoplay = true;
            newVideo.playsInline = true;
            newVideo.preload = "auto";
            newDiv.appendChild(newVideo);
            container.appendChild(newDiv);

            // gọi hàm load video của bạn
            loadVideoNoRepeat(newVideo);

            nextPage = newDiv;
        }

        requestAnimationFrame(() => {
            nextPage.scrollIntoView({ behavior: "smooth", block: "start" });
        });
    } else {
        // Desktop + Android dùng code cũ
        const currentScroll = container.scrollTop;
        const nextScroll = currentScroll + window.innerHeight;
        container.scrollTo({
            top: nextScroll,
            behavior: "smooth"
        });
    }
});
