import React, {useEffect, useRef, useState} from 'react';
import mousetrap from "mousetrap";
import {useDebounce} from "use-debounce";
import Fuse from "fuse.js";
import {IMetadata} from "../../electron/main/music";
import {IAppData} from "@/type/globalState";

type ISearch = {
    setSearchMode : (value : {state : boolean}) => void,
    searchMode : boolean,
    setAppData : (data : IAppData) => void,
    appData : IAppData,
    loadMusics : () => Promise<IMetadata[]>
    minimalMode ?: boolean
}

function Search({setSearchMode , searchMode , setAppData , appData , loadMusics , minimalMode} : ISearch) {

    const [query, setQuery] = useState('');
    const [dQuery] = useDebounce(query, 500);
    const searchInputRef = useRef<HTMLInputElement>();

    let fuse: Fuse<IMetadata>;

    useEffect(() => {
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
                        musics: [...fuse.search(dQuery).map(el => el.item), appData.musics[appData.currentMusic]],
                        currentMusic: 0,
                        isPaused: false
                    })
                : setAppData(
                    {
                        ...appData,
                        musics: await loadMusics(),
                        currentMusic: 0,
                        isPaused: false
                    })
        })()
    }, [dQuery]);

    mousetrap.bind('/', (event) => {
        event.preventDefault();

        if(!minimalMode) {
            setSearchMode({state: true})

            if (searchInputRef.current) {
                searchInputRef.current?.focus();
            }
        }
    });

    mousetrap.bind('esc', (_event) => {
        setSearchMode({state: false})
    });

    return (
        <div
            className={`absolute w-full -z-1 overflow-hidden duration-200 rounded-sm bg-white dark:bg-neutral-800 h-8`}>
            <div className="h-full border border-neutral-200 border-solid dark:border-neutral-600">
                <input
                    onKeyDown={(event) => {

                        if (event.key === "Escape") {
                            event.preventDefault()
                            setSearchMode({state: false});
                            return;
                        }

                        if (event.key === "/") {
                            event.preventDefault()
                            setSearchMode({state: true});
                            return
                        }

                        if (event.code === "Space" && !searchMode) {
                            event.preventDefault();
                            mousetrap.trigger("space");
                            return
                        }

                        if (!searchMode) {
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
                    className={`w-full px-2 h-full focus:outline-0 focus-visible:outline-0 border-transparent outline-0 dark:text-neutral-100 dark:placeholder:text-neutral-300 placeholder:text-neutral-400 bg-transparent`}
                    type="text"
                />
            </div>
        </div>
    );
}

export default Search;