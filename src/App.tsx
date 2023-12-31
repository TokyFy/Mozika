import React, {useEffect, useRef, useState} from 'react'
import './App.css'
import {ipcRenderer} from "electron";
import {IMetadata} from "@electron/main/music";
import TopBar from "@/components/Topbar";
import MusicsList from "@/components/MusicsList";
import mousetrap from "mousetrap";
import Settings from "@/components/Settings";
import {IAppData} from "@/type/globalState";
import Search from "@/components/Search";
import Minimal from "@/components/Minimal";
import Lyrics from "@/components/Lyrics";

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
    const [menuOpen, setMenuOpen] = useState(false);

    // TODO : merge these two state
    const [searchMode, setSearchMode] = useState(false);
    const [searchResultIndex, setSearchResultIndex] = useState(-1)

    const [minimalMode, setMinimalMode] = useState(false);
    const [lyricsMode, setLyricsMode] = useState(false)


    // // The Audio element reference (For play/pause/volume controls)
    const player = useRef<HTMLAudioElement>(null);
    const listRef = useRef<HTMLElement>();

    // For search purpose

    ipcRenderer.on("song-added", () => {
        setSongsCount(songsCount + 1)
    })

    async function loadMusics() {
        return await ipcRenderer.invoke("load-musics") as IMetadata[];
    }

    async function scanMusic(folders: string[]) {
        setAppData({...appData, musics: [], onScanningMusics: true, currentMusic: 0})

        const musics = await ipcRenderer.invoke("scan-musics", {
            folders: folders
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
    const shuffleArray = (arrayInput: any[], constant: number = -1) => {

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
    const centerList = () => {
        if (listRef.current) {
            // @ts-ignore
            listRef.current.scrollToItem(appData.currentMusic, "auto");
        }
    }
    const enQueue = (index: number, padding: number) => {
        let musics = [...appData.musics];
        [musics[index], musics[appData.currentMusic + padding]] = [musics[appData.currentMusic + padding], musics[index]];

        setAppData({...appData, musics: musics})
    }


    useEffect(() => {

        (async () => {
            const musics = await loadMusics();
            setAppData({...appData, musics})
        })()

    }, []);

    useEffect(() => {

    }, []);

    useEffect(() => {
        if (listRef.current) {
            // @ts-ignore
            listRef.current.scrollToItem(searchResultIndex, "center");
        }
    }, [searchResultIndex]);

    useEffect(() => {
        setAppData({...appData, isPaused: false})
        centerList();
    }, [appData.currentMusic]);

    useEffect(() => {
        if (appData.musics.length === 0) setAppData({...appData, currentMusic: 0})
        setSongsCount(0)
    }, [appData.musics]);

    useEffect(() => {
        const audio = player.current;
        if (audio) {
            audio.volume = appData.volume;
            appData.isPaused ? audio.pause() : audio.play()
        }
    }, [appData.volume, appData.isPaused]);

    useEffect(() => {
        setLyricsMode(false);
        setSearchMode(false)
    }, [minimalMode]);

    mousetrap.bind('n', next);
    mousetrap.bind('p', prev);
    mousetrap.bind('+', volumeAdd);
    mousetrap.bind('-', volumeMinus);
    mousetrap.bind('c', centerList);
    mousetrap.bind('s', () => {
        setAppData({
            ...appData,
            musics: [...shuffleArray(appData.musics, appData.currentMusic)],
        })
    });
    mousetrap.bind('o', () => {
        setAppData({
                ...appData,
                musics: [...appData.musics.sort(
                    (a, b) => {
                        return a.artist < b.artist ? -1 : 1
                    }
                )
                ]
            }
        )
    });
    mousetrap.bind('space', (event) => {
        if (event.preventDefault) {
            event.preventDefault()
        }
        setAppData({...appData, isPaused: !appData.isPaused})
    });
    mousetrap.bind('m', () => {

        if (minimalMode) {
            setMinimalMode(false);
            ipcRenderer.invoke("normal-mode").then()
        } else {
            setMinimalMode(true);
            ipcRenderer.invoke("minimal-mode").then()
        }
    })
    mousetrap.bind('l', () => {
        setLyricsMode(!lyricsMode)
    });
    mousetrap.bind('esc', () => {
        setLyricsMode(false);
        setSearchMode(false)
    });
    mousetrap.bind('f',  () => {
        ipcRenderer.invoke("open-music-on-folder" , appData.musics[appData.currentMusic].file)
    });
    mousetrap.bind('ctrl+c' , ()=>{
        const currentMusic = appData.musics[appData.currentMusic];

        ipcRenderer.invoke("copy-to-clipboard" ,
            `${currentMusic.artist} - ${currentMusic.title}`)
    })


    return (
        <div
            id="main-frame"
            className={`h-full relative text-neutral-900 flex flex-col overflow-hidden rounded-sm border-solid border-neutral-100 bg-neutral-50 gap-1 dark:border-neutral-950 dark:bg-neutral-950 ${minimalMode ? "border-2" : "border-4"}`}>

            {
                Boolean(appData.musics.length && minimalMode)
                && <Minimal music={appData.musics[appData.currentMusic]} isPaused={appData.isPaused}/>
            }

            <TopBar
                onMenuClick={() => {
                    setMenuOpen(!menuOpen);
                    setSearchMode(false)
                }}/>

            <div className={`flex flex-col grow mx-1 mb-1 relative ${searchMode ? "gap-1" : ""}`}>

                <Settings
                    scanMusic={scanMusic}
                    menuOpen={menuOpen}
                    toggleMenu={(state) => setMenuOpen(state)}
                />

                <Search
                    setResult={(index) => setSearchResultIndex(index)}
                    setSearchMode={(value) => setSearchMode(value)}
                    searchMode={searchMode && !minimalMode && !lyricsMode}
                    setAppData={(data) => setAppData(data)}
                    appData={appData}
                    loadMusics={() => loadMusics()}
                    minimalMode={minimalMode}
                />


                <div
                    className={`grow flex justify-center items-center overflow-hidden duration-300 bg-neutral-50 dark:bg-neutral-950 z-10 relative ${searchMode ? "translate-y-9" : ""}`}>
                    {
                        Boolean(appData.musics.length) ?
                            <>
                                {
                                    !minimalMode &&
                                    <MusicsList
                                        musics={appData.musics}
                                        currentMusicIndex={appData.currentMusic}
                                        onItemsClick={index => {
                                            setAppData({...appData, currentMusic: index, isPaused: false})
                                        }}
                                        isPaused={appData.isPaused}
                                        listRef={listRef}
                                        playerRef={player}
                                        marker={searchMode ? searchResultIndex : -1}
                                        onContextMenu={index => {
                                            enQueue(index, 1)
                                        }}
                                    />}
                                <audio
                                    ref={player}
                                    className="hidden"
                                    controls
                                    autoPlay={!appData.isPaused}
                                    onEnded={() => next()}
                                    onPause={() => setAppData({...appData, isPaused: true})}
                                    onPlay={() => setAppData({...appData, isPaused: false})}
                                    src={`app:///${appData.musics[appData.currentMusic].file}`}>
                                </audio>

                            </>
                            :
                            <p
                                className="text-xs font-mono font-bold text-neutral-400 cursor-pointer">
                                {appData.onScanningMusics ? `Loading... [${songsCount} songs]` : "Add songs ..."}
                            </p>
                    }
                </div>


                {
                    Boolean(appData.musics.length) &&
                    <Lyrics open={lyricsMode && !minimalMode} currentMusics={appData.musics[appData.currentMusic]}/>
                }

            </div>
        </div>
    )
}

export default App
