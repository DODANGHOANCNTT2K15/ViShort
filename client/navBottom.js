import { showVideoPopup } from "./videoPopup.js";
import { setCurrentApi } from "./streamButtom.js"; 
import { setShuffledVideos } from "./random_video.js";

const characterDiv = document.getElementById("character");
const genreDiv = document.getElementById("genre");
const authorDiv = document.getElementById("author");
const randomDiv = document.getElementById("random");
const dropdownContainer = document.getElementById("dropdownContainer");

async function fetchList(url) {
    try {
        const res = await fetch(url);
        if (!res.ok) throw new Error("Không lấy được dữ liệu");
        return await res.json();
    } catch (err) {
        console.error(err);
        return [];
    }
}

function showDropdown(items, type) {
    dropdownContainer.innerHTML = ""; // reset
    items.forEach(item => {
        const div = document.createElement("div");
        div.textContent = item;
        div.addEventListener("click", async (e) => {
            e.stopPropagation(); // tránh click ra ngoài đóng dropdown
            console.log(`Chọn ${type}:`, item);

            let apiUrl = "";
            if (type === "Character") apiUrl = `http://192.168.102.18:3000/api/characters/${encodeURIComponent(item)}`;
            if (type === "Genre") apiUrl = `http://192.168.102.18:3000/api/genres/${encodeURIComponent(item)}`;
            if (type === "Author") apiUrl = `http://192.168.102.18:3000/api/authors/${encodeURIComponent(item)}`;

            try {
                const res = await fetch(apiUrl);
                if (!res.ok) throw new Error("Không lấy được video");
                const videos = await res.json();
                showVideoPopup(videos); // mở popup
                setCurrentApi(apiUrl);
            } catch (err) {
                console.error(err);
            }

            dropdownContainer.classList.add("hidden");
        });
        dropdownContainer.appendChild(div);
    });
    dropdownContainer.classList.remove("hidden");
}

// Bấm vào từng navItem
characterDiv.addEventListener("click", async () => {
    const list = await fetchList("http://192.168.102.18:3000/api/characters");
    showDropdown(list, "Character");
});

genreDiv.addEventListener("click", async () => {
    const list = await fetchList("http://192.168.102.18:3000/api/genres");
    showDropdown(list, "Genre");
});

authorDiv.addEventListener("click", async () => {
    const list = await fetchList("http://192.168.102.18:3000/api/authors");
    showDropdown(list, "Author");
});

randomDiv.addEventListener("click", async () => {
    const apiUrl = "http://192.168.102.18:3000/api/videos/all";
    try {
        const res = await fetch(apiUrl);
        if (!res.ok) throw new Error("Không lấy được video random");
        const videos = await res.json();
        setShuffledVideos(videos);      
    } catch (err) {
        console.error(err);
    }
});

// Click ra ngoài dropdown => ẩn
document.addEventListener("click", (e) => {
    if (!dropdownContainer.contains(e.target) &&
        !characterDiv.contains(e.target) &&
        !genreDiv.contains(e.target) &&
        !authorDiv.contains(e.target)) {
        dropdownContainer.classList.add("hidden");
    }
});
