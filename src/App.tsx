import {useEffect, useRef, useState} from 'react'
import './App.css'
import {ipcRenderer} from "electron";
import {IMetadata} from "../electron/main/music";
import TopBar from "@/components/Topbar";
import MusicsList from "@/components/MusicsList";
import {FolderClosed, FolderDown, FolderPlus, FolderSync, FolderX} from "lucide-react";


type IAppData = {
    musics: IMetadata[],
    onScanningMusics: boolean,
    currentMusic: number,
    volume: number,
    isPaused: boolean
}

function App() {

    const states = {
        musics: [],
        onScanningMusics: false,
        currentMusic: 0,
        volume: 1,
        isPaused: true
    }

    const [appData, setAppData] = useState<IAppData>(states)

    // Hold the key code of the Key event
    const [keyPressed, setKeyPressed] = useState<{ code: string }>()
    // For loading purpose
    const [songsCount, setSongsCount] = useState(0)

    const [musicsFolders, setMusicsFolders] = useState<string[]>([])

    // // The Audio element reference (For play/pause/volume controls)
    const player = useRef<HTMLAudioElement>(null);
    const listRef = useRef<HTMLElement>();

    const [menuOpen, setMenuOpen] = useState(false)


    ipcRenderer.on("song-added", () => {
        setSongsCount(songsCount + 1)
    })

    async function loadMusics() {
        return await ipcRenderer.invoke("load-musics") as IMetadata[];
    }

    async function scanMusic() {
        setAppData({...appData, musics: [], onScanningMusics: true, currentMusic: 0})

        const musics = await ipcRenderer.invoke("scan-musics", {
            folders: musicsFolders
        }) as IMetadata[]

        setAppData({...appData, musics: [...musics], onScanningMusics: false})
    }

    const next = () => {
        setAppData({...appData, currentMusic: (appData.currentMusic + 1) % appData.musics.length})
    }

    const prev = () => {
        const current = (appData.currentMusic - 1) % appData.musics.length;
        current < 0
            ? setAppData({...appData, currentMusic: appData.musics.length - 1}) :
            setAppData({...appData, currentMusic: (appData.currentMusic - 1) % (appData.musics.length + 1)})
    }

    const shuffleArray = (array: any[]) => {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }

        return array
    }

    useEffect(() => {
        if (listRef.current) { // @ts-ignore
            listRef.current.scrollToItem(appData.currentMusic, "auto");
        }
    }, [appData.currentMusic]);

    const volumeAdd = () => {
        appData.volume + 0.1 <= 1
            ? setAppData({...appData, volume: Number((appData.volume + 0.1).toFixed(2))})
            : setAppData({...appData, volume: 1})
    }

    const volumeMinus = () => {
        appData.volume - 0.1 >= 0
            ? setAppData({...appData, volume: Number((appData.volume - 0.1).toFixed(2))})
            : setAppData({...appData, volume: 0})
    }

    const addFolders = async () => {
        const folder = await ipcRenderer.invoke("select-folder");

        if (folder) {
            setMusicsFolders([...musicsFolders, folder[0]])
        }
    }

    useEffect(() => {
        // console.log(appData)
    }, [menuOpen]);

    useEffect(() => {
        (async () => {
            const musics = await loadMusics();
            setAppData({...appData, musics})
        })()

        const folders = JSON.parse(`${localStorage.getItem("folders")}`) as string[] || []
        setMusicsFolders(folders)

    }, []);

    useEffect(() => {
        localStorage.setItem("folders", JSON.stringify(musicsFolders))
    }, [musicsFolders]);

    useEffect(() => {
        if (appData.musics.length) {
            document.addEventListener("keydown", event => {
                setKeyPressed({code: event.code})
            })
        }

        setSongsCount(0)
    }, [appData.musics]);

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

            case "KeyS" :
                setAppData({
                    ...appData,
                    musics: [...shuffleArray(appData.musics)],
                    currentMusic : 0
                })
                break;

            case "KeyO" :
                setAppData({
                        ...appData,
                        musics: [...appData.musics.sort(
                            (a, b) => {
                                return a.title < b.title ? -1 : 1
                            }
                        )
                        ]
                    }
                )
                break;

            case "Tab" :
                setAppData({...appData, isPaused: !appData.isPaused})
                break;
        }
    }, [keyPressed]);

    useEffect(() => {
        if (player.current) {
            const audio = player.current;
            audio.volume = appData.volume;
            appData.isPaused ? audio.pause() : audio.play()
        }
    }, [appData.volume, appData.isPaused]);

    return (
        <div
            className='w-full h-full text-neutral-900 flex flex-col overflow-hidden rounded-sm bg-neutral-50 border-4 border-solid border-neutral-200'>

            <TopBar onMenuClick={() => setMenuOpen(!menuOpen)}/>

            <div className={`flex flex-col grow m-1 h-0`}>
                <div
                    className={`rounded-sm bg-neutral-100 text-neutral-800 mx-1 text-sm overflow-hidden duration-500 ${menuOpen ? "h-full" : "h-0"}`}>
                    <div className="p-1">
                        <p className="text-md underline">Preferences</p>

                        <div className="py-4">
                            <div className="flex justify-between items-center">
                                <p>Musics Directories :</p>
                                <div className="text-xs underline cursor-pointer flex gap-4">
                                    <p onClick={() => {
                                        addFolders().then();
                                    }}>
                                        <FolderPlus size={18}/>
                                    </p>

                                    <p onClick={() => {
                                        scanMusic().then();
                                        setMenuOpen(false)
                                    }}>
                                        <FolderSync size={18}/>
                                    </p>

                                    <p onClick={() => {
                                        setMusicsFolders([])
                                    }}>
                                        <FolderX size={18}/>
                                    </p>
                                </div>
                            </div>
                            <div>
                                <ul className="text-xs list-disc list-inside py-2">
                                    {
                                        musicsFolders.map((el, index) => <li key={index}>{el}</li>)
                                    }
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
                <div
                    className={`grow flex justify-center items-center rounded-[4px] h-0 overflow-hidden duration-300`}>
                    {
                        Boolean(appData.musics.length) ?
                            <>
                                <MusicsList
                                    musics={appData.musics}
                                    currentMusicIndex={appData.currentMusic}
                                    onItemsClick={index => {
                                        setAppData({...appData, currentMusic: index, isPaused: false})
                                    }}
                                    isPaused={appData.isPaused}
                                    listRef={listRef}
                                />
                                <audio
                                    ref={player}
                                    className="hidden"
                                    controls
                                    autoPlay={!appData.isPaused}
                                    onEnded={() => next()}
                                    src={`app:///${appData.musics[appData.currentMusic].file}`
                                    }>
                                </audio>
                            </>
                            :
                            <>
                                <p
                                    className="text-xs font-mono font-bold text-neutral-400 cursor-pointer"
                                >
                                    {appData.onScanningMusics ? `Loading... [${songsCount} songs]` : "Add songs ..."}
                                </p>
                            </>
                    }
                </div>
            </div>
        </div>
    )
}

export default App