import {IMetadata} from "../../electron/main/music";
import {Circle, Disc, Disc3, Dot, Radio} from "lucide-react";

type IMusicCard = IMetadata & { isPlaying: boolean, isPaused?: boolean, albumArts?: boolean }

function MusicCard({title, artist, album, picture, file, isPlaying, isPaused, albumArts = true}: IMusicCard) {
    return <>
        <div
            className={`group/mc overflow-hidden relative grow flex max-w-full gap-2 text-sm items-center px-2 p-1 cursor-pointer duration-500 ease-in rounded-sm  dark:hover:bg-neutral-800 ${isPlaying ? "bg-neutral-200 dark:bg-neutral-300 dark:hover:bg-neutral-50" : " hover:bg-slate-200"}`}>

            {
                albumArts && <div>
                    <div
                        className={`aspect-square w-9 rounded-sm flex justify-center items-center overflow-hidden text-neutral-400  group-hover/mc:bg-neutral-100 duration-500 ${isPlaying ? "bg-neutral-50" : "bg-neutral-200 dark:bg-neutral-700"}`}>
                        {picture
                            ? <img className="w-full h-auto z-50" src={`app:///${picture}`} alt={""}/>
                            : <div className="absolute flex justify-center items-center z-10 text-inherit">
                                <Radio size={16}/>
                        </div>
                        }
                    </div>
                </div>
            }
            <div className="overflow-ellipsis max-w-[75%] z-10">
                <p className={`overflow-ellipsis  whitespace-nowrap text-sm overflow-hidden first-letter:uppercase ${isPlaying ? "text-neutral-800 dark:text-neutral-800" : "text-neutral-800 dark:text-neutral-100"}`}>{title}</p>
                <p className={`overflow-ellipsis whitespace-nowrap text-xs overflow-hidden first-letter:uppercase  ${isPlaying ? "" : "text-neutral-500 dark:text-neutral-500"}`}>{artist}</p>
            </div>
            <div
                className={`ml-auto items-center justify-center p-2 text-neutral-800 dark:text-neutral-950 flex z-10 ${isPlaying ? "opacity-100" : "hidden"}`}>
                <Radio className={`${isPaused ? "opacity-25" : "opacity-100"}`} size={20}/>
            </div>

        </div>
    </>
}

export default MusicCard;
