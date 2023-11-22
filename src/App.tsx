import {useEffect, useRef, useState} from 'react'
import './App.css'
import {ipcRenderer} from "electron";
import {IMetadata} from "../electron/main/music";
import Topbar from "@/components/Topbar";
import MusicsList from "@/components/MusicsList";


function App() {

    const [musics, setMusics] = useState<IMetadata[]>([])
    const [onScanningMusics, setOnScanningMusics] = useState(false)

    // Index of the current song in the Musics[]
    const [currentMusic, setCurrentMusic] = useState(0);

    // Hold the key code of the Key event
    const [keyPressed, setKeyPressed] = useState<{code : string}>()

    // For loading purpose
    const [songsCount, setSongsCount] = useState(0)

    const [volume, setVolume] = useState(1)

    // The Audio element reference (For play/pause/volume controls)
    const player = useRef<HTMLAudioElement>(null);


    const [isPaused, setIsPaused] = useState(true)

    ipcRenderer.on("song-added", () => {
        setSongsCount(songsCount + 1)
    })

    async function loadMusics() {
        return await ipcRenderer.invoke("load-musics") as IMetadata[];
    }

    async function scanMusic() {
        setMusics([])
        const folder = await ipcRenderer.invoke("select-folder");

        if (folder) {
            setOnScanningMusics(true)

            const musics = await ipcRenderer.invoke("scan-musics", {
                folder: folder[0]
            }) as IMetadata[]

            setMusics(musics)

            setOnScanningMusics(false);
        }

    }



    const next = () => {
        setCurrentMusic((currentMusic + 1) % musics.length)
    }

    const prev = () => {
        const current = (currentMusic - 1) % musics.length;
        current < 0 ? setCurrentMusic(musics.length - 1) : setCurrentMusic((currentMusic - 1) % (musics.length + 1));
    }

    const volumeAdd = () => {
        volume + 0.1 <= 1 ? setVolume(Number((volume + 0.1).toFixed(2))) : setVolume(1)
    }

    const volumeMinus = () => {
        volume - 0.1 >= 0 ? setVolume(Number((volume - 0.1).toFixed(2))) : setVolume(0)
    }

    useEffect(() => {
        (async ()=>{
            const musics = await loadMusics();
            setMusics(musics)
        })()

    }, []);

    useEffect(() => {
        if (musics.length) {
            document.addEventListener("keydown", event => {
                setKeyPressed({code : event.code})
            })
        }
    }, [musics]);

    useEffect(() => {
        switch (keyPressed?.code) {
            case "KeyN" :
                next();
                break;

            case "KeyP" :
                prev();
                break;

            case "KeyL" :
                scanMusic().then()
                break;

            case "NumpadAdd" :
                volumeAdd()
                break;

            case "NumpadSubtract" :
                volumeMinus()
                break;

            case "Tab" :
                setIsPaused(!isPaused)
                break;
        }
    }, [keyPressed]);

    useEffect(() => {
        if (player.current) {
            const audio = player.current;
            audio.volume = volume;
            isPaused ?  audio.pause() : audio.play()
        }
    }, [volume , isPaused]);

    return (
        <div
            className='w-full h-full text-neutral-900 flex flex-col overflow-hidden rounded-sm bg-neutral-50 border-4 border-solid border-neutral-200'>

            <Topbar/>

            <div className={`flex flex-col grow m-1`}>
                <div
                    className={`grow flex justify-center items-center rounded-[4px] h-0 overflow-hidden duration-300`}>
                    {
                        Boolean(musics.length) ?
                            <>
                                <MusicsList
                                    musics={musics}
                                    currentMusicIndex={currentMusic}
                                    onItemsClick={index => {
                                        setCurrentMusic(index)
                                        setIsPaused(false)
                                    }}
                                    isPaused={isPaused}
                                />
                                <audio
                                    ref={player}
                                    className="hidden"
                                    controls
                                    autoPlay={!isPaused}
                                    onEnded={() => next()}
                                    src={`app:///${musics[currentMusic].file}`
                                    }>
                                </audio>
                            </>
                            :
                            <>
                                <p
                                    className="text-xs font-mono font-bold text-neutral-400 cursor-pointer"
                                >
                                    {onScanningMusics ? `Loading... [${songsCount} songs]` : "Add songs ..."}
                                </p>
                            </>
                    }
                </div>
            </div>
        </div>
    )
}

export default App