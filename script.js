
let currSong = new Audio();
let songs;
let currfolder

function secondsToMinutesSeconds(seconds) {
    if (isNaN(seconds || seconds < 0)) {
        return "00:00"
    }

    const minutes = Math.floor(seconds / 60);
    const remainSec = Math.floor(seconds % 60);

    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattefSeconds = String(remainSec).padStart(2, '0');

    return `${formattedMinutes}:${formattefSeconds}`
}

async function getSongs(folder) {
    currfolder = folder
    let a = await fetch(`http://127.0.0.1:3000/${folder}/`);
    let response = await a.text();
    console.log(response)
    let div = document.createElement("div")
    div.innerHTML = response;
    let as = div.getElementsByTagName("a");
    songs = []
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith("mp3")) {
            songs.push(element.href.split(`/${folder}/`)[1]);
        }
    }
    

    //show all the songs in the playlist
    let songUl = document.querySelector(".songList").getElementsByTagName("ul")[0]
    songUl.innerHTML = ""
    for (const song of songs) {
        songUl.innerHTML = songUl.innerHTML + `<li><img class="invert" src="Assets/Images/music.svg" alt="" srcset="">
                            <div class="info">
                                <div>${song.replaceAll("%20", " ")} </div>
                                <div>Ayush</div>
                            </div>

                            <div class="playNow">
                                <span>Play now</span>
                                <img class="invert" src="Assets/Images/playButton2.svg" alt="" srcset="">
                            </div>      
                            </li>`;
    }

    //attach an event listener to each song

    Array.from(document.querySelector(".songList").getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", element => {
            console.log(e.querySelector(".info").firstElementChild.innerHTML)
            play.src = "Assets/Images/pause.svg"
            playMusic(e.querySelector(".info").firstElementChild.innerHTML)

        })
    })

    return songs

}

const playMusic = (track, pause = false) => {
    // let audio = new Audio("/songs/" + track)
    currSong.src = `/${currfolder}/` + track
    if (!pause) {

        currSong.play()
    }
    document.querySelector(".songInfo").innerHTML = decodeURI(track)
    document.querySelector(".songTime").innerHTML = "00:00 / 00:00"
}

async function displayAlbums() {
    let a = await fetch(`http://127.0.0.1:3000/songs/`);
    let response = await a.text();
    let div = document.createElement("div")
    div.innerHTML = response;
    let anchors = div.getElementsByTagName("a")
    let cardContainer = document.querySelector(".cardContainer")
    let array = Array.from(anchors)
        for (let index = 0; index < array.length; index++) {
            const e = array[index];
            
        

        if (e.href.includes("\songs")) {
            let folder = e.href.split("/").slice(-2)[0]
            //get tha metadata of the folder
            let a = await fetch(`http://127.0.0.1:3000/songs/${folder}/info.json`);
            let response = await a.json();
            console.log(response)

            cardContainer.innerHTML = cardContainer.innerHTML + `<div data-folder="${folder}" class="card">
                        <div class="play">
                            <img src="Assets/Images/play-button.svg" alt="" srcset="">
                        </div>
                        <img src="/songs/${folder}/cover.jpeg" alt="">
                        <h2>${response.title}</h2>
                        <p>${response.description}</p>
                    </div>`

        }
    }
    //Load playlist whenever a card is clicked 
    Array.from(document.getElementsByClassName("card")).forEach(e => {
        console.log(e);
        e.addEventListener("click", async item => {
            console.log(item, item.currentTarget.dataset)
            songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`)
            playMusic(songs[0])
            
        })
    })
}

async function main() {


    //get the list of all the songs
    await getSongs("songs/ncs");
    playMusic(songs[0], true)


    //display all the albums
    displayAlbums();

    //attack an even listener to play next and previos
    play.addEventListener("click", () => {
        if (currSong.paused) {
            currSong.play();
            play.src = "Assets/Images/pause.svg"
        }
        else {
            currSong.pause();
            play.src = "Assets/Images/playButton2.svg"
        }
    })

    //Listen for time update event

    currSong.addEventListener("timeupdate", () => {
        console.log(currSong.currentTime, currSong.duration)
        document.querySelector(".songTime").innerHTML = `${secondsToMinutesSeconds(currSong.currentTime)}/${secondsToMinutesSeconds(currSong.duration)}`
        document.querySelector(".circle").style.left = (currSong.currentTime / currSong.duration) * 100 + "%"
    })

    //add an event listener to seekbar

    document.querySelector(".seekBar").addEventListener("click", e => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100
        document.querySelector(".circle").style.left = percent + "%"
        currSong.currentTime = ((currSong.duration) * percent) / 100
    })

    //Add an event listemer for hamburger

    document.querySelector(".hamBurger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0"
    })

    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-120%"
    })

    //Add an event listener to previous and next
    previous.addEventListener("click", () => {
        console.log("previous Clicked")
        let index = songs.indexOf(currSong.src.split("/").slice(-1)[0])

        console.log(songs, index)
        if (index - 1 >= 0) {

            playMusic(songs[index + 1]);
        }
    })
    next.addEventListener("click", () => {

        let index = songs.indexOf(currSong.src.split("/").slice(-1)[0])

        console.log(songs, index)
        if (index + 1 < songs.length) {

            playMusic(songs[index + 1]);
        }
    })

    //Add an event to volume    

    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", (e) => {
        console.log(e, e.target, e.target.value);
        currSong.volume = parseInt(e.target.value) / 100
    })

    //add an event to mute  
    document.querySelector(".volume>img").addEventListener("click", e=>{
        console.log(e.target)
        console.log(e.target.src)
        if (e.target.src == "http://127.0.0.1:3000/Assets/Images/volume.svg") {
            e.target.src = "http://127.0.0.1:3000/Assets/Images/mute.svg"
            currSong.volume = 0;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 0;
        }
        else{
            e.target.src = "http://127.0.0.1:3000/Assets/Images/volume.svg"
            currSong.volume = 1
            document.querySelector(".range").getElementsByTagName("input")[0].value = 100;
        }
    })

    

}

main()