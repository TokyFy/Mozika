import React, {useEffect, useState} from 'react';
import {ipcRenderer} from "electron";
import {IMetadata} from "../../electron/main/music";

const lyric =
    `[ar:boy pablo]
            [al:Wachito Rico]
            [ti:wachito rico]
            [00:16.33]Last couple of days been kind of grey
            [00:20.21]We've been slackin' around
            [00:22.11]Amor, we should get out of town
            [00:26.36]'Cause lately this has been drivin' me loco, I'm restless now
            [00:32.18]Ya no sé qué hacer, solo me quiero mover
            [00:36.06]A la disco tal vez, I just want us to have a good time
            [00:41.46]Amor, baila conmigo all night (get down with me)
            [00:47.35]I'll show how to dance, it's really easy
            [00:50.39]Mueve las caderas, let the rythm come and get you
            [00:58.31]No puedes negarlo
            [01:02.28]Tú quieres bailar conmigo
            [01:06.68]Dame tu mano
            [01:10.56]Yo soy tu guachito rico
            [01:14.47]I'm holding you tight,
            [01:16.94]Won't let you out of my sight
            [01:18.80]Look into my eyes y créeme cuando te digo
            [01:24.28]I could do this wherever, whenever, forever
            [01:30.06]No puedes negarlo
            [01:33.85]Tú quieres bailar conmigo
            [01:37.92]Dame tu mano
            [01:41.36]Yo soy tu guachito rico
            [01:45.71]Muévelo, show me that you're mine
            [01:50.54]Para siempre, baby
            [01:53.53]Dame tu mano
            [01:56.98]Yo soy tu guachito rico
            [02:04.35]Get down with me
            [02:08.29]Get down with me
            [02:09.71]Eh, eh, eh
            [02:12.21]Get down with me
            [02:13.63]Eh, eh, eh
            [02:16.15]Get down
            [02:23.88]Let me see you move
            [02:31.68]Check it out, baby
            [02:33.20]I'll show how to dance, it's really easy
            [02:35.77]Mueve las caderas, let the rythm come and get you
            [02:43.61]No puedes negarlo
            [02:47.54]Tú quieres bailar conmigo
            [02:51.53]Dame tu mano
            [02:55.34]Yo soy tu guachito rico
            [02:59.67]Muévelo, show me that you're mine
            [03:04.57]Para siempre, baby
            [03:07.49]Dame tu mano
            [03:10.96]Yo soy tu guachito rico`
        .split("\n")
        .filter((el) => !(el.includes("[00:00.00") || el.includes("[00:01.00")))
        .map((el) => {
            return [el.match(/\[\d{2,3}:\d{2,3}\.\d{2,3}]/), el.replace(/\[\d{2,3}:\d{2,3}\.\d{2,3}]/, "")]
        });

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
            className={`w-full bg-neutral-50 dark:bg-neutral-950 dark:text-neutral-50 absolute bottom-0 left-0 z-[99] text-sm items-center justify-center text-center duration-100 ease-in-out overflow-hidden ${open ? "h-full" : "h-0"}`}>
            <div className="h-full py-4 overflow-scroll px-8 italic">
                {
                    lyrics
                        ? lyrics.split("\n")
                        .filter((el) => !(el.includes("[00:00.00") || el.includes("[00:01.00")))
                        .map((el) => {
                            return [el.match(/\[\d{2,3}:\d{2,3}\.\d{2,3}]/), el.replace(/\[\d{2,3}:\d{2,3}\.\d{2,3}]/, "")]
                        })
                        .map((el, index) => <p key={"lyric" + index} className="my-3">{el[1]}</p>)
                        : <div className="h-full flex justify-center items-center text-xs"><p>Lyrics not found</p></div>
                }
            </div>
        </div>
    );
}

export default Lyrics;