// Lưu video vào danh sách đã dùng
export function addUsedVideo(url) {
    let used = JSON.parse(localStorage.getItem("usedVideos") || "[]");
    used.push(url);
    localStorage.setItem("usedVideos", JSON.stringify(used));
}

// Lấy danh sách đã dùng
export function getUsedVideos() {
    return JSON.parse(localStorage.getItem("usedVideos") || "[]");
}
