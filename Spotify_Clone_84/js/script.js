console.log("javaScript is running");
let currentsong = new Audio()
// This songs variable is use to store all the songs
let songs;
// it store the value of the current folder of songs
let currFolder;
// use to store the volume level and use it after unmute 
let vol=0.4;


// convert seconds into min/sec format 
function secondsToMinutesSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');

    return `${formattedMinutes}:${formattedSeconds}`;
}

// This function is use to fetch the music form the song folder
async function getSongs(folder) {
    // Store the value of the given folder 
    currFolder = folder;
    // Get the value from the selected folder
    let a = await fetch(`/songs/${folder}/`)
    let response = await a.text();
    // we need to create an element first 
    let div = document.createElement("div")
    div.innerHTML = response;
    let as = div.getElementsByTagName("a")
    songs = []
    for (let i = 0; i < as.length; i++) {
        let ele = as[i];
        // This if is use to take only the mp3 
        if (ele.href.endsWith(".mp3")) {
            // This is use to push href only to the array
            // it is use to split the song into 2 parts on the bases of /folder/ and we select the second porsition with [1]
            songs.push(ele.href.split(`/${folder}/`)[1]);
        }
    }

    // It is use to add songs in the ul
    let songul = document.querySelector(".songlist").getElementsByTagName("ul")[0]
    // It make the songList empty before add other songs
    songul.innerHTML = ""
    for (const song of songs) {
        songul.innerHTML = songul.innerHTML +
            `<li>
                            <img  class="invert"src="img/music.svg" alt="">
                            <div class="info">
                                <div>${song.replaceAll("%20", " ")}</div>
                                <div>Vishal</div>
                            </div>
                            <div class="playnow">
                                <span>Play Now</span>
                                <img  class="invert" src="img/play.svg" alt="">
                            </div>
                        </li>`;
    }

    // Attach eventlistner to each song 
    // It is use to store the songs in the array Array.from and this array is use to take iterable values
    // foreach only work on array that why we use the Array.from to convert it into the array
    Array.from(document.querySelector(".songlist").getElementsByTagName("li")).forEach(e => {
        // It is use to run the song when we click on it
        e.addEventListener("click", element => {
            playmusic(e.querySelector(".info").firstElementChild.innerHTML)
        })
    })
}

// This function is use to play music 
const playmusic = (track, pause = false) => {
    // store the src of the song in the currentsong variable
    currentsong.src = `/songs/${currFolder}/` + track
    if (!pause) {
        currentsong.play()
        play.src = "img/paused.svg"
    }
    // It change the svg 
    //It is use to insert the info of the song 
    document.querySelector(".songinfo").innerHTML = decodeURI(track)
}

// This function is use to create the cards inside the cardcontainer
async function displayalbums() {
    let a = await fetch(`/songs/`)
    let tex = await a.text();
    let div = document.createElement("div")
    div.innerHTML = tex
    let anchor = div.getElementsByTagName("a")
    let covercontainer = document.querySelector(".CardContainer")
    let arr = Array.from(anchor)
    for (let i = 0; i < arr.length; i++) {
        let e = arr[i]
        if (e.href.includes("/songs") && !e.href.includes(".htaccess")) {
            // get the name of the folder
            let folder = (e.href.split("/songs/")[1].split("/")[0])
            // Get the metadata(json) of the folder
            let a = await fetch(`/songs/${folder}/info.json`)
            let response = await a.json()

            covercontainer.innerHTML = covercontainer.innerHTML + 
            `<div data-folder="${folder}" class="card ">
                <div class="play">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
                        fill="none" class="injected-svg" data-src="/icons/play-stroke-sharp.svg"
                        xmlns:xlink="http://www.w3.org/1999/xlink" role="img" color="#000000">
                        <path d="M5 20V4L19 12L5 20Z" stroke="#000000" fill="#000" stroke-width="1.5"
                        stroke-linejoin="round"></path>
                    </svg>
                </div>
                <img src="/songs/${folder}/cover.jpg" alt="">
                <h3>${response.title}</h3>
                <p>${response.description}</p>
            </div>`

        }
    }

    // Load the playList when click the card 
    Array.from(document.getElementsByClassName("card")).forEach(e => {
        e.addEventListener("click", async item => {
            await getSongs(`${item.currentTarget.dataset.folder}`)
            playmusic(songs[0])
        })
    })


}
async function main() {
    // We have to insert the name of folder we want to import
    await getSongs("faltu");
    // It is use to give the firs default song in the list 
    playmusic(songs[0], true)
    // this function is use to create cards inside the
    displayalbums()



    // It is use to play the song in the playbar and also able to change the svg of the and use directly because it is a id not the class 
    play.addEventListener("click", () => {
        if (currentsong.paused) {
            currentsong.play()
            play.src = "img/paused.svg";
        }
        else {
            currentsong.pause();
            play.src = "img/play.svg";
        }
    })

    currentsong.addEventListener("timeupdate", () => {
        // console.log(currentsong.currentTime, currentsong.duration)
        document.querySelector(".songtime").innerHTML = `${secondsToMinutesSeconds(currentsong.currentTime)} / ${secondsToMinutesSeconds(currentsong.duration)}`
        // it is use to move the circle in the seekbar
        document.querySelector(".circle").style.left = (currentsong.currentTime / currentsong.duration) * 100 + "%"
    })

    // Create an eventListner in the seekbar
    document.querySelector(".seekbar").addEventListener("click", (e) => {
        // getBoundingClientRect it represent the info of the and element like height,width offsetX is use to provide info the position of the mouse in the x coordinate
        // console.log(e.offsetX/e.target.getBoundingClientRect().width*100)
        let per = (e.offsetX / e.target.getBoundingClientRect().width) * 100
        document.querySelector(".circle").style.left = per + "%"
        // It use to move the circle in the seekbar randomaly
        currentsong.currentTime = (currentsong.duration * per) / 100
    })

    // Create an eventListner in the hamburger
    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0"
    })

    // Add an EventListner in the cross button 
    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-120%"
    })

    // Add EventListner in the previous 
    previous.addEventListener("click", () => {
        // Give the index of the song in the list start form 0
        let index = songs.indexOf(currentsong.src.split(`/${currFolder}/`)[1])
        if (index - 1 >= 0) {
            playmusic(songs[index - 1])
        }

    })

    // Add EventListner in the  next
    next.addEventListener("click", () => {
        let index = songs.indexOf(currentsong.src.split(`/${currFolder}/`)[1])
        console.log("next")
        if ((index + 1) < songs.length) {
            playmusic(songs[index + 1])
        }
    })

    // Add Listner in the range for volume
    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", (e) => {
        vol=(e.target.value)/100
        // volume fuction of the audio class is use to set the audio and it take the values between 0 to 1 
        currentsong.volume = vol
        if(vol>0){
            document.querySelector(".volume>img").src=document.querySelector(".volume>img").src.replace("img/mute.svg","img/volume.svg")
        }
    })

    // use to mute or unmute 
    document.querySelector(".volume>img").addEventListener("click",e=>{
        // console.log(e.target.scr)
        if(e.target.src.includes("img/volume.svg")){
            e.target.src=e.target.src.replace("img/volume.svg","img/mute.svg")
            currentsong.volume=0
            document.querySelector(".range").getElementsByTagName("input")[0].value=0
        }
        else{
            e.target.src=e.target.src.replace("img/mute.svg","img/volume.svg")
            currentsong.volume=vol
            document.querySelector(".range").getElementsByTagName("input")[0].value=vol*100
        }
    })

}

main()