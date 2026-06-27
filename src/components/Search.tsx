import React, {useEffect, useRef, useState} from 'react';
import mousetrap from "mousetrap";
import {useDebounce} from "use-debounce";
import Fuse from "fuse.js";
import {IMetadata} from "@electron/main/music";
import {IAppData} from "@/type/globalState";

type ISearch = {
    setSearchMode : (value : boolean) => void,
    searchMode : boolean,
    setAppData : (data : IAppData) => void,
    appData : IAppData,
    loadMusics : () => Promise<IMetadata[]>
    minimalMode ?: boolean
    setResult : (index : number) => void
}

function Search({setSearchMode , searchMode , setAppData , appData , loadMusics , minimalMode , setResult} : ISearch) {

    const [query, setQuery] = useState('');
    const [dQuery] = useDebounce(query, 500);
    const searchInputRef = useRef<HTMLInputElement>();

    let fuse: Fuse<IMetadata>;

    useEffect(() => {
        (async () => {
            if (!fuse) {
                fuse = new Fuse(appData.musics, {
                    keys: ['file' , "title" , "artist"],
                    threshold: .6,
                });
            }

            if (dQuery.trim() !== "") {
                const result = fuse.search(dQuery, {limit: 1});

                result.length === 1 && setResult(result[0].refIndex || -1);
            } else {
                setResult(appData.currentMusic)
            }
        })()
    }, [dQuery]);

    mousetrap.bind('/', (event) => {
        event.preventDefault();

        if(!minimalMode) {
            setSearchMode(true)

            if (searchInputRef.current) {
                searchInputRef.current?.focus();
            }
        }
    });

    return (
        <div
            className={`absolute w-full -z-1 overflow-hidden duration-200 rounded-sm bg-white dark:bg-neutral-800 h-8`}>
            <div className="h-full border border-neutral-200 border-solid dark:border-neutral-600">
                <input
                    onKeyDown={(event) => {

                        if (event.key === "Escape") {
                            event.preventDefault()
                            setSearchMode(false);
                            return;
                        }

                        if (event.key === "/") {
                            event.preventDefault()
                            setSearchMode(true);
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