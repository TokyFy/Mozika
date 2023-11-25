import React, {useEffect, useRef, useState} from 'react'
import './App.css'
import {ipcRenderer} from "electron";
import {IMetadata} from "../electron/main/music";
import TopBar from "@/components/Topbar";
import MusicsList from "@/components/MusicsList";
import {FolderPlus, FolderSync, FolderX, Sun} from "lucide-react";
import mousetrap from "mousetrap";
import {useDebounce} from "use-debounce";
import Fuse from "fuse.js";
import ThemeToggler from "@/components/ThemeToggler";


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
    const shuffleArray = (arrayInput: any[] , constant : number  = -1) => {

        const array = [...arrayInput]

        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            if (i !== constant && j !== constant) {
                [array[i], array[j]] = [array[j], array[i]];
            }
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

    const centerList = () => {
        if (listRef.current) {
            // @ts-ignore
            listRef.current.scrollToItem(appData.currentMusic, "auto");
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
                        musics: [...fuse.search(dQuery).map(el => el.item) , appData.musics[appData.currentMusic]],
                        currentMusic: 0
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
    mousetrap.bind('c', centerList);
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
            musics: [...shuffleArray(appData.musics , appData.currentMusic)],
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
        });


    return (
        <div
            id="main-frame"
            className='h-full text-neutral-900 flex flex-col overflow-hidden rounded-sm border-4 border-solid border-neutral-200 bg-neutral-50 dark:border-neutral-950 dark:bg-neutral-900 '>

            <TopBar onMenuClick={() => setMenuOpen({state: !menuOpen.state})}/>

            <div className={`flex flex-col grow mx-1 mb-1 relative`}>

                <div
                    className={`rounded-sm bg-neutral-50 dark:bg-neutral-900 text-neutral-800 dark:text-neutral-100 text-sm overflow-scroll duration-200 ease-in-out absolute z-50 w-full left-0  ${menuOpen.state ? "h-full" : "h-0"}`}>
                    <div className="p-1">
                        <div className="flex justify-between items-center my-2">
                            <h1 className="font-bold text-lg  text-center">Settings</h1>
                            <ThemeToggler/>
                        </div>

                        <div className="p-2 border border-solid border-neutral-200 rounded my-2 dark:border-neutral-700">
                            <p className="font-bold">Shortcuts</p>
                            <div className="flex flex-col my-2 gap-2">
                                <Shortcut keystroke={"space"} action={"Pause / Play"}/>
                                <Shortcut keystroke={"n"} action={"Next"}/>
                                <Shortcut keystroke={"p"} action={"Previous"}/>
                                <Shortcut keystroke={"s"} action={"Shuffle"}/>
                                <Shortcut keystroke={"o"} action={"Order"}/>
                                <Shortcut keystroke={"/"} action={"Search Mode"}/>
                                <Shortcut keystroke={"Esc"} action={"Close Search mode"}/>
                                <Shortcut keystroke={"+"} action={"Volume up"}/>
                                <Shortcut keystroke={"-"} action={"Volume down"}/>
                            </div>
                        </div>

                        <div className="p-2 border border-solid border-neutral-200 rounded dark:border-neutral-700">
                            <div className="flex justify-between items-center ">
                                <p className="font-bold">Musics Directories</p>
                                <div className="text-xs underline cursor-pointer flex gap-2 text-neutral-400">
                                    <p onClick={() => {
                                        addFolders().then();
                                    }}>
                                        <FolderPlus size={16}/>
                                    </p>

                                    <p onClick={() => {
                                        scanMusic().then();
                                        setMenuOpen({state: false})
                                    }}>
                                        <FolderSync size={16}/>
                                    </p>

                                    <p onClick={() => {
                                        setMusicsFolders([])
                                    }}>
                                        <FolderX size={16}/>
                                    </p>
                                </div>
                            </div>

                            <div>
                                <ul className="text-xs list-disc list-inside py-2">
                                    {
                                        musicsFolders.map((el, index) => <li className="marker:mr-0" key={index}>{el}</li>)
                                    }
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>

                <div className={`overflow-hidden duration-200 ${searchMode.state ? "h-[38px]" : "h-0"}`}>
                    <div className="h-max border rounded-sm border-neutral-200 border-solid mb-2">
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


const Shortcut = ({ action , keystroke} : {keystroke : string , action : string}) => {
    return (
        <div className="flex justify-between">
            <div className="text-xs">
                {action}
            </div>
            <div className="w-max h-min p-1 py-[1px] text-xs font-mono font-bold border border-solid border-neutral-300 dark:border-neutral-700 rounded-md text-neutral-900 dark:text-neutral-100">{keystroke}</div>
        </div>
    );
};


export default App