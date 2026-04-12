const fs = require("fs");
const path = require("path");

const songsDir = path.join(__dirname, "songs");

let albums = [];

fs.readdirSync(songsDir).forEach(folder => {
    const folderPath = path.join(songsDir, folder);

    if (fs.lstatSync(folderPath).isDirectory()) {

        let songs = fs.readdirSync(folderPath)
            .filter(file => file.endsWith(".mp3"));

        // Optional: read info.json if exists
        let info = {
            title: folder,
            description: "No description",
            cover: "cover.jpg"
        };

        let infoPath = path.join(folderPath, "info.json");

        if (fs.existsSync(infoPath)) {
            let data = JSON.parse(fs.readFileSync(infoPath));
            info = { ...info, ...data };
        }

        albums.push({
            folder: folder,
            title: info.title,
            description: info.description,
            cover: info.cover,
            songs: songs
        });
    }
});

fs.writeFileSync(
    path.join(__dirname, "songs.json"),
    JSON.stringify({ albums }, null, 2)
);

console.log("✅ songs.json generated successfully!");