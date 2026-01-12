import React, {useEffect, useState} from 'react';
import {ipcRenderer} from "electron";
import {IMetadata} from "../../electron/main/music";

type ILyrics = {
    open: boolean,
    currentMusics: IMetadata
}

function Lyrics({open, currentMusics}: ILyrics) {

    const [lyrics, setLyrics] = useState<string>()

    useEffect(() => {
        ipcRenderer.invoke("get-lyrics", currentMusics.file).then(lrc => setLyrics(String(lrc || "")))
    }, [currentMusics]);

    return (
        <div
            className={`w-full bg-neutral-50 dark:bg-neutral-950 dark:text-neutral-50 absolute bottom-0 left-0 z-[99] text-sm justify-center duration-100 ease-in-out overflow-hidden ${open ? "h-full" : "h-0"}`}>
            <div className="h-full overflow-scroll italic">
                {
                    lyrics
                        ? lyrics.split("\n")
                        .filter((el) => !(el.includes("[00:00.00") || el.includes("[00:01.00")))
                        .map((el) => {
                            return [el.match(/\[\d{2,3}:\d{2,3}\.\d{2,3}]/), el.replace(/\[\d{2,3}:\d{2,3}\.\d{2,3}]/, "")]
                        })
                        .map((el, index) => <p key={"lyric" + index} className="my-3 text-center">{el[1]}</p>)
                        : <div className="h-full flex justify-center items-center text-sm"><p>Lyrics not found</p></div>
                }
            </div>
        </div>
    );
}

export default Lyrics;