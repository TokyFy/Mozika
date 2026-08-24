import {IMetadata} from "../../electron/main/music";
import {Disc, Disc3, Music} from "lucide-react";

type IMusicCard = IMetadata & { isPlaying: boolean, isPaused?: boolean, albumArts?: boolean }

function MusicCard({title, artist, album, picture, file, isPlaying, isPaused, albumArts = true}: IMusicCard) {
    return <>
        <div
            className={`group/mc overflow-hidden relative grow flex max-w-full gap-2 text-sm items-center px-2 p-1 cursor-pointer duration-500 ease-in rounded-sm hover:bg-neutral-200 ${isPlaying ? "bg-neutral-200" : ""}`}>

            {
                albumArts && <div>
                    <div
                        className={`aspect-square w-9 rounded-sm flex justify-center items-center overflow-hidden text-neutral-400 group-hover/mc:bg-neutral-50 duration-500 ${isPlaying ? "bg-neutral-50" : "bg-neutral-200"}`}>
                        {picture ? <img className="w-full h-auto z-50" src={`app:///${picture}`} alt={""}/> : ""}
                        <div className="absolute flex justify-center items-center z-10 text-neutral-600">
                            <Music absoluteStrokeWidth size={14}/>
                        </div>
                    </div>
                </div>
            }
            <div className="overflow-ellipsis max-w-[75%] z-10">
                <p className={`overflow-ellipsis  whitespace-nowrap text-sm overflow-hidden first-letter:uppercase ${isPlaying ? "text-neutral-800" : "text-neutral-800"}`}>{title}</p>
                <p className="overflow-ellipsis text-neutral-400 whitespace-nowrap text-xs overflow-hidden first-letter:uppercase">{artist}</p>
            </div>
            <div
                className={`ml-auto items-center justify-center p-2 text-neutral-400 flex animate-spin z-10 ${isPlaying ? "opacity-100" : "hidden"}`}>
                {isPaused ? <Disc size={18}/> : <Disc3 size={18}/>}
            </div>

        </div>
    </>
}

export default MusicCard;
