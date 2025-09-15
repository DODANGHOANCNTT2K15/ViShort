import express from 'express';
import fs from 'fs';
import path from 'path';
import cors from "cors";

const app = express();
app.use(cors());
const PORT = 3000;

const ROOT_DIR = "C:\\Users\\DO DANG HOAN\\Videos\\Captures\\all";
// const ROOT_DIR = "D:\\game_design\\hidden_movie\\_best_artist";

// list authors api
app.get("/api/authors", (req, res) => {
    const authors = fs.readdirSync(ROOT_DIR).filter(file =>
        fs.statSync(path.join(ROOT_DIR, file)).isDirectory()
    );
    res.json(authors);
});

// list movies api for an author
app.get("/api/videos", (req, res) => {
    const author = req.query.author;
    if (!author) {
        return res.status(400).json({
            error: "Author is required"
        });
    }

    const authorDir = path.join(ROOT_DIR, author);
    if (!fs.existsSync(authorDir)) {
        return res.status(404).json({
            error: "Author not found"
        });
    }

    const videos = fs.readdirSync(authorDir)
        .filter(file => file.endsWith('.mp4'))
        .map(file => {
            const parts = file.replace(".mp4", "").split("_");
            const [author, genre, character, ...titleParts] = parts;

            return {
                filename: file,
                author,
                genre,
                character,
                title: titleParts.join("_"), // gộp lại thành chuỗi
                url: `/api/videos/${author}/${file}`
            };
        });

    res.json(videos);
});

// stream video api
app.get("/api/videos/:author/:filename", (req, res) => {
    const { author, filename } = req.params;
    const filePath = path.join(ROOT_DIR, author, filename);

    if (!fs.existsSync(filePath)) return res.status(404).json({ error: "File not found" });

    const stat = fs.statSync(filePath);
    const fileSize = stat.size;
    const range = req.headers.range;

    if (range) {
        const parts = range.replace(/bytes=/, "").split("-");
        const start = parseInt(parts[0], 10);
        const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
        const chunkSize = (end - start) + 1;

        const file = fs.createReadStream(filePath, { start, end });
        const head = {
            'Content-Range': `bytes ${start}-${end}/${fileSize}`,
            'Accept-Ranges': 'bytes',
            'Content-Length': chunkSize,
            'Content-Type': 'video/mp4',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'Content-Type, Range',
            'Access-Control-Expose-Headers': 'Content-Range, Accept-Ranges',
        };

        res.writeHead(206, head);
        file.pipe(res);
    } else {
        const head = {
            'Content-Length': fileSize,
            'Content-Type': 'video/mp4',
            'Access-Control-Allow-Origin': '*',
        };
        res.writeHead(200, head);
        fs.createReadStream(filePath).pipe(res);
    }
});

// metadata api for a video
app.get("/api/videos/:author/:filename/meta", (req, res) => {
    const { author, filename } = req.params;
    if (!filename.endsWith(".mp4")) return res.status(400).json({ error: "wrong format" });

    const [authorName, genre, character, title] = filename.replace(".mp4", "").split("-");
    res.json({ filename, author: authorName, genre, character, title });
});

// filter with name character
app.get("/api/characters/:character", (req, res) => {
    const { character } = req.params;

    const authors = fs.readdirSync(ROOT_DIR)
        .filter(f => fs.statSync(path.join(ROOT_DIR, f)).isDirectory());

    let results = [];

    authors.forEach(author => {
        const files = fs.readdirSync(path.join(ROOT_DIR, author))
            .filter(f => f.endsWith(".mp4"));

        files.forEach(file => {
            const parts = file.replace(".mp4", "").split("_");
            const [authorName, genre, characterName, ...titleParts] = parts;
            const title = titleParts.join("_");

            // fix ở đây: dùng characterName thay vì file.character
            if (characterName && characterName.toLowerCase() === character.toLowerCase()) {
                results.push({
                    filename: file,
                    author: authorName,
                    genre,
                    character: characterName,
                    title,
                    url: `/api/videos/${author}/${file}`
                });
            }
        });
    });

    res.json(results);
});

// filter with genre
app.get("/api/genres/:genre", (req, res) => {
    const { genre } = req.params;

    const authors = fs.readdirSync(ROOT_DIR)
        .filter(f => fs.statSync(path.join(ROOT_DIR, f)).isDirectory());

    let results = [];

    authors.forEach(author => {
        const files = fs.readdirSync(path.join(ROOT_DIR, author))
            .filter(f => f.endsWith(".mp4"));

        files.forEach(file => {
            const parts = file.replace(".mp4", "").split("_");
            const [authorName, genreName, characterName, ...titleParts] = parts;
            const title = titleParts.join("_");
            if (genreName && genreName.toLowerCase() === genre.toLowerCase()) {
                results.push({
                    filename: file,
                    author: authorName,
                    genre: genreName,
                    character: characterName,
                    title,
                    url: `/api/videos/${author}/${file}`
                });
            }
        });
    });
    res.json(results);
});

// search theo genre, character, title
app.get("/api/search", (req, res) => {
    const { q } = req.query;
    if (!q) return res.json([]);

    const keyword = q.toLowerCase();
    const authors = fs.readdirSync(ROOT_DIR)
        .filter(f => fs.statSync(path.join(ROOT_DIR, f)).isDirectory());

    let results = [];

    authors.forEach(author => {
        const files = fs.readdirSync(path.join(ROOT_DIR, author))
            .filter(f => f.endsWith(".mp4"));

        files.forEach(file => {
            const parts = file.replace(".mp4", "").split("_");
            const [authorName, genre, characterName, ...titleParts] = parts;
            const title = titleParts.join("_");

            // chỉ check genre, character, title
            if (
                (genre && genre.toLowerCase().includes(keyword)) ||
                (characterName && characterName.toLowerCase().includes(keyword)) ||
                (title && title.toLowerCase().includes(keyword))
            ) {
                results.push({
                    filename: file,
                    author: authorName,
                    genre,
                    character: characterName,
                    title,
                    url: `/api/videos/${author}/${file}`
                });
            }
        });
    });
    res.json(results);
});

// get random videos
app.get("/api/random-video", (req, res) => {
    const authors = fs.readdirSync(ROOT_DIR)
        .filter(f => fs.statSync(path.join(ROOT_DIR, f)).isDirectory());

    let allVideos = [];

    authors.forEach(author => {
        const files = fs.readdirSync(path.join(ROOT_DIR, author))
            .filter(f => f.endsWith(".mp4"))
            .map(file => {
                const parts = file.replace(".mp4", "").split("_");
                const [authorName, genre, characterName, ...titleParts] = parts;
                const title = titleParts.join("_");
                return {
                    filename: file,
                    author: authorName,
                    genre,
                    character: characterName,
                    title,
                    url: `/api/videos/${author}/${file}`
                };
            });
        allVideos = allVideos.concat(files);
    });

    if (allVideos.length === 0) {
        return res.status(404).json({ error: "Không có video nào" });
    }

    // Chọn ngẫu nhiên 1 video
    const randomVideo = allVideos[Math.floor(Math.random() * allVideos.length)];
    res.json(randomVideo);
});

// count videos
app.get("/api/videos/count", (req, res) => {
    let allVideos = [];
    const authors = fs.readdirSync(ROOT_DIR).filter(f => fs.statSync(path.join(ROOT_DIR, f)).isDirectory());

    authors.forEach(author => {
        const files = fs.readdirSync(path.join(ROOT_DIR, author)).filter(f => f.endsWith(".mp4"));
        files.forEach(file => allVideos.push(`/api/videos/${author}/${file}`));
    });

    res.json({ total: allVideos.length, videos: allVideos });
});

// lấy tất cả URL video
app.get("/api/videos/all", (req, res) => {
    const authors = fs.readdirSync(ROOT_DIR)
        .filter(f => fs.statSync(path.join(ROOT_DIR, f)).isDirectory());

    let allVideos = [];

    authors.forEach(author => {
        const files = fs.readdirSync(path.join(ROOT_DIR, author))
            .filter(f => f.endsWith(".mp4"))
            .map(file => `/api/videos/${author}/${file}`);

        allVideos = allVideos.concat(files);
    });

    res.json(allVideos);
});

// listen api
app.listen(PORT, () => {
    console.log(`Server is running on http://192.168.102.18:3000`);
});