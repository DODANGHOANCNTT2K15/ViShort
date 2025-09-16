const container = document.getElementById("container");
const btn = document.getElementById("scrollDownBtn");

btn.addEventListener("click", () => {
    const currentScroll = container.scrollTop;
    const nextScroll = currentScroll + window.innerHeight;
    container.scrollTo({
        top: nextScroll,
        behavior: "smooth"
    });
});
