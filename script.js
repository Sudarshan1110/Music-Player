console.log('Lets write javascript');

let currentSong = new Audio();
let songs = [];
let currFolder = "";

function secondsToMinutesSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) return "00:00";

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
}

async function getSongs(folder) {
    let res = await fetch("songs.json");
    let data = await res.json();

    let album = data.albums.find(a => a.folder === folder);

    if (!album) {
        console.error("Album not found:", folder);
        return [];
    }

    currFolder = folder;
    songs = album.songs;

    let songsUL = document.querySelector(".songList ul");
    songsUL.innerHTML = "";

    for (const song of songs) {
        let name = decodeURIComponent(song.split("/").pop());

        songsUL.innerHTML += `
        <li data-file="${song}">
    <img class="invert" src="images/music.svg">
        <div class="info">
            <div>${name.replaceAll("_", " ").replace(".mp3", "")}</div>
            <div>Song Artist</div>
        </div>
        <div class="playnow">
            <span>Play Now</span>
            <img class="invert" src="images/play.svg">
        </div>
    </li>`;
    }

    document.querySelectorAll(".songList li").forEach(e => {
        e.addEventListener("click", () => {
            playMusic(e.dataset.file);
        });
    });

    return songs;
    // track = track.split("/").pop(); // safety
}

const playMusic = (track, pause = false) => {
    currentSong.src = track;

    if (!pause) {
        currentSong.play();
        play.src = "pause.svg";
    }

    let name = decodeURIComponent(track.split("/").pop());

    document.querySelector(".songinfo").innerHTML =
        name.replaceAll("_", " ").replace(".mp3", "");

    document.querySelector(".songtime").innerHTML = "00:00 / 00:00";
};

async function displayAlbums() {
    let res = await fetch("songs.json");
    let data = await res.json();

    let container = document.querySelector(".cardContainer");
    container.innerHTML = "";

    data.albums.forEach(album => {
        container.innerHTML += `
        <div data-folder="${album.folder}" class="card">
            <img src="${album.cover}">
            <h2>${album.title}</h2>
            <p>${album.description}</p>
        </div>`;
    });
}

async function main() {
    await displayAlbums();

    // Default load
    songs = await getSongs("Hindi_Fresh_Vibes");
    playMusic(songs[0], true);

    // Album click (EVENT DELEGATION FIX)
    document.querySelector(".cardContainer").addEventListener("click", async (e) => {
        let card = e.target.closest(".card");
        if (!card) return;

        let folder = card.dataset.folder;

        songs = await getSongs(folder);
        // playMusic(songs[0]);
        if (window.innerWidth <= 768) {
            document.querySelector(".left").style.left = "0";
        }
    });

    // console.log("Requested folder:", folder);
    // console.log("Available folders:", data.albums.map(a => a.folder));

    // Play/Pause
    play.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play();
            play.src = "images/pause.svg";
        } else {
            currentSong.pause();
            play.src = "images/play.svg";
        }
    });

    document.addEventListener("keydown", (e) => {
        // Prevent page from scrolling when space is pressed
        if (e.code === "Space") {
            e.preventDefault();

            if (currentSong.paused) {
                currentSong.play();
                play.src = "images/pause.svg";
            } else {
                currentSong.pause();
                play.src = "images/play.svg";
            }
        }
    });

    // Add an event listener to the hamburger
    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0"
    })

    // Add an event listener to the close button
    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-120%"
    })

    // Time update
    currentSong.addEventListener("timeupdate", () => {
        document.querySelector(".songtime").innerHTML =
            `${secondsToMinutesSeconds(currentSong.currentTime)} / ${secondsToMinutesSeconds(currentSong.duration)}`;

        document.querySelector(".circle").style.left =
            (currentSong.currentTime / currentSong.duration) * 100 + "%";
    });

    // Seek
    document.querySelector(".seekbar").addEventListener("click", e => {
        let percent = e.offsetX / e.target.getBoundingClientRect().width;
        currentSong.currentTime = currentSong.duration * percent;
        document.querySelector(".circle").style.left = percent * 100 + "%";
    });

    // Prev
    previous.addEventListener("click", () => {
        let currentFile = decodeURIComponent(currentSong.src.split("/").pop());
        let index = songs.indexOf(currentFile);


        index = (index - 1 + songs.length) % songs.length;
        playMusic(songs[index]);
    });

    // Next
    next.addEventListener("click", () => {
        let currentFile = decodeURIComponent(currentSong.src.split("/").pop());
        let index = songs.indexOf(currentFile);

        index = (index + 1) % songs.length;
        playMusic(songs[index]);
    });

    // Volume
    document.querySelector(".range input").addEventListener("input", e => {
        currentSong.volume = e.target.value / 100;
    });

    volumebtn.addEventListener("click", e => {
        if (currentSong.volume > 0) {
            currentSong.volume = 0;
            volumebtn.src = "images/mute.svg";
            document.querySelector(".range").getElementsByTagName("input")[0].value = 0
        }
        else {
            currentSong.volume = 0.1;
            volumebtn.src = "images/volume.svg";
            document.querySelector(".range").getElementsByTagName("input")[0].value = 10
        }
    });
}

main();
