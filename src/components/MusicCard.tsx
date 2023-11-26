import {IMetadata} from "../../electron/main/music";
import {Circle, Disc, Disc3, Dot, Radio} from "lucide-react";
import React, {LegacyRef, useCallback, useEffect, useRef, useState} from "react";

type IMusicCard = IMetadata & {
    isPlaying: boolean,
    isPaused?: boolean,
    albumArts?: boolean,
    playerRef: React.RefObject<HTMLAudioElement>
}

function MusicCard({
                       title,
                       artist,
                       album,
                       picture,
                       file,
                       isPlaying,
                       isPaused,
                       albumArts = true,
                       playerRef
                   }: IMusicCard) {

    const getAudioCurrentTime = () => {
        if (playerRef.current) return Number((playerRef.current.currentTime / playerRef.current.duration) * 100).toFixed(2)
        return 0
    }

    const setAudioCurrentTime = (time: number) => {
        if (playerRef.current) {
            playerRef.current.currentTime = (playerRef.current.duration * (time / 100))
        }
    }


    const [currentTimePercent, setCurrentTimePercent] = useState(Number(getAudioCurrentTime()))
    const currentSongsRef: React.MutableRefObject<HTMLElement | undefined> = useRef<HTMLElement>();

    const clickHandler = useCallback((event: MouseEvent) => {
        const rect = currentSongsRef.current?.getBoundingClientRect();
        if (rect) setAudioCurrentTime(((event.clientX - rect.left) / rect.width) * 100)
    }, []);

    let timer: NodeJS.Timeout;

    useEffect(() => {
        if (isPlaying && playerRef && !isPaused) {
            timer = setInterval(() => {
                setCurrentTimePercent(Number(getAudioCurrentTime()))
            }, 700);
        } else {
            clearInterval(timer)
        }

        if (isPlaying && currentSongsRef.current) {
            currentSongsRef.current?.addEventListener("click", (event) => clickHandler(event))
        }

        return () => {
            if (currentSongsRef.current) currentSongsRef.current?.removeEventListener("click", clickHandler)
            clearInterval(timer)
        }
    }, []);


    return <>
        <div
            // @ts-ignore
            ref={currentSongsRef}
            className={`group/mc overflow-hidden relative grow flex max-w-full gap-2 text-sm items-center px-2 p-1 cursor-pointer duration-500 ease-in rounded-sm border border-solid ${isPlaying ? "border-neutral-300 dark:border-neutral-700" : "border-transparent hover:bg-neutral-200 dark:hover:bg-neutral-950"}`}>

            {
                albumArts &&  <div
                    className={`aspect-square w-9 z-50 rounded-sm flex justify-center items-center overflow-hidden text-neutral-400  group-hover/mc:bg-neutral-100 dark:group-hover/mc:bg-neutral-300 duration-500 ${isPlaying ? "bg-neutral-50" : "bg-neutral-200 dark:bg-neutral-700"}`}>
                    {picture
                        ? <img className="w-full h-auto z-50" src={`app:///${picture}`} alt={""}/>
                        : <div className="absolute flex justify-center items-center z-50 text-inherit">
                            <Radio size={16}/>
                        </div>
                    }
                </div>
            }
            <div className="overflow-ellipsis max-w-[75%] z-10">
                <p className={`overflow-ellipsis  whitespace-nowrap text-sm overflow-hidden first-letter:uppercase ${isPlaying ? "text-neutral-800 dark:text-neutral-100" : "text-neutral-800 dark:text-neutral-100"}`}>{title}</p>
                <p className={`overflow-ellipsis whitespace-nowrap text-xs overflow-hidden first-letter:uppercase  ${isPlaying ? "text-neutral-400" : "text-neutral-500 dark:text-neutral-500"}`}>{artist}</p>
            </div>
            <div
                className={`ml-auto items-center justify-center p-2 text-neutral-800 dark:text-neutral-200 flex z-10 ${isPlaying ? "opacity-100" : "hidden"}`}>
                <Radio className={`${isPaused ? "opacity-25" : "opacity-100"}`} size={20}/>
            </div>

            {
                isPlaying &&

                <div
                    style={{width: `${currentTimePercent}%`}}
                    className="absolute w-0 z-0 h-full bg-neutral-300 dark:bg-black bg-opacity-75 left-0 top-0 duration-100 ease-in transition-all"
                >

                </div>
            }

        </div>
    </>
}

export default MusicCard;
