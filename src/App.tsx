import React, {useEffect, useRef, useState} from 'react'
import './App.css'
import {ipcRenderer} from "electron";
import {IMetadata} from "../electron/main/music";
import TopBar from "@/components/Topbar";
import MusicsList from "@/components/MusicsList";
import {FolderPlus, FolderSync, FolderX} from "lucide-react";
import mousetrap from "mousetrap";
import {useDebounce} from "use-debounce";
import Fuse from "fuse.js";


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

    // For loading purpose
    const [songsCount, setSongsCount] = useState(0)

    const [musicsFolders, setMusicsFolders] = useState<string[]>([])

    // // The Audio element reference (For play/pause/volume controls)
    const player = useRef<HTMLAudioElement>(null);
    const listRef = useRef<HTMLElement>();
    const searchInputRef = useRef<HTMLInputElement>();

    const [menuOpen, setMenuOpen] = useState({state: false});
    const [searchMode, setSearchMode] = useState({state : false});

    // For search purpose
    const [query, setQuery] = useState('');
    const [dQuery] = useDebounce(query, 500);


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
    const shuffleArray = (arrayInput: any[]) => {

        const array = [...arrayInput]

        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }

        return array
    }
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

    const pause = () => {
        setAppData({...appData, isPaused: true});
    }
    const centerList = () => {
        if (listRef.current) {
            // @ts-ignore
            listRef.current.scrollToItem(appData.currentMusic, "smart");
        }
    }


    useEffect(() => {

        (async () => {
            const musics = await loadMusics();
            setAppData({...appData, musics})
        })()

        const folders = JSON.parse(`${localStorage.getItem("folders")}`) as string[] || []
        setMusicsFolders(folders)

    }, []);

    useEffect(() => {
        setAppData({...appData , isPaused : false})
        centerList();
    }, [appData.currentMusic]);

    useEffect(() => {
        localStorage.setItem("folders", JSON.stringify(musicsFolders))
    }, [musicsFolders]);

    useEffect(() => {
        setSongsCount(0)
    }, [appData.musics]);

    let fuse: Fuse<IMetadata>;

    useEffect(() => {
        setAppData({...appData, isPaused: true});

        (async () => {
            if (!fuse) {
                fuse = new Fuse(await loadMusics(), {
                    keys: ['title', 'artist', 'album'],
                    threshold: .5
                });
            }

            dQuery.trim() !== ""
                ? setAppData(
                    {
                        ...appData,
                        musics: fuse.search(dQuery).map(el => el.item),
                        currentMusic: 0,
                        isPaused : true
                    })
                : setAppData(
                    {
                        ...appData,
                        musics: await loadMusics(),
                        currentMusic: 0
                    })
        })()
    }, [dQuery]);

    useEffect(() => {
        if (player.current) {
            const audio = player.current;
            audio.volume = appData.volume;
            appData.isPaused ? audio.pause() : audio.play()
        }
    }, [appData.volume, appData.isPaused]);

    mousetrap.bind('n', next);
    mousetrap.bind('p', prev);
    mousetrap.bind('+', volumeAdd);
    mousetrap.bind('-', volumeMinus);
    mousetrap.bind('/', (event)=>{
        event.preventDefault();

        setSearchMode({state: true})

        if(searchInputRef.current) {
            searchInputRef.current?.focus();
        }
    });
    mousetrap.bind('esc', (event)=>{
        setSearchMode({state: false})
    });
    mousetrap.bind('s', () => {
        setAppData({
            ...appData,
            musics: [...shuffleArray(appData.musics)],
            currentMusic: 0
        })
    });
    mousetrap.bind('o', () => {
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
    });
    mousetrap.bind('space', (event) => {
            if(event.preventDefault) {
                event.preventDefault()
            }
            setAppData({...appData, isPaused: !appData.isPaused})
        }
    );


    return (
        <div
            className='h-full text-neutral-900 flex flex-col overflow-hidden rounded-sm bg-neutral-50 border-4 border-solid border-neutral-200'>

            <TopBar onMenuClick={() => setMenuOpen({state: !menuOpen.state})}/>

            <div className={`flex flex-col grow mx-1 mb-1 relative`}>

                <div
                    className={`rounded-sm bg-neutral-100 text-neutral-800 text-sm overflow-hidden duration-200 ease-in-out absolute z-50 w-full left-0 ${menuOpen.state ? "h-full" : "h-0"}`}>
                    <div className="p-1">
                        <p className="text-md underline">Preferences</p>

                        <div className="py-4">
                            <div className="flex justify-between items-center">
                                <p>Musics Directories :</p>
                                <div className="text-xs underline cursor-pointer flex gap-4 text-neutral-400">
                                    <p onClick={() => {
                                        addFolders().then();
                                    }}>
                                        <FolderPlus size={18}/>
                                    </p>

                                    <p onClick={() => {
                                        scanMusic().then();
                                        setMenuOpen({state: false})
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

                <div className={`overflow-hidden duration-200 ${searchMode.state ? "h-[38px]" : "h-0"}`}>
                    <div className="h-max border rounded-sm border-neutral-300 border-solid mb-2">
                        <input
                            onKeyDown={(event)=>{

                                if(event.key === "Escape") {
                                    event.preventDefault()
                                    setSearchMode({state: false});
                                    return;
                                }

                                if(event.key === "/") {
                                    event.preventDefault()
                                    setSearchMode({state: true});
                                    return
                                }

                                if(event.code === "Space" && !searchMode.state) {
                                    event.preventDefault();
                                    mousetrap.trigger("space");
                                    return
                                }

                                if(!searchMode.state) {
                                    event.preventDefault()
                                    mousetrap.trigger(event.key)
                                }
                            }}
                            // @ts-ignore
                            ref={searchInputRef}
                            placeholder={"search ..."}
                            spellCheck={false}
                            onChange={(e) => {
                                setQuery(e.target.value);
                            }}
                            className={`w-full px-2 h-7 focus:outline-0 focus-visible:outline-0 border-transparent outline-0 placeholder:text-neutral-400`}
                            type="text"
                        />
                    </div>
                </div>

                <div
                    className={`grow flex justify-center items-center rounded-[4px] overflow-hidden duration-300`}>
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