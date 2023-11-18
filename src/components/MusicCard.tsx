import {IMetadata} from "../../electron/main/music";
import {Asterisk, Disc, Disc2, Disc3, Music, Music2, PlayCircle} from "lucide-react";

type IMusicCard = IMetadata & {isPlaying : boolean , isPaused? : boolean}

function MusicCard({title, artist, album, picture, file , isPlaying , isPaused}: IMusicCard) {
    return <>
        <div className={`group/mc flex gap-2 text-sm items-center p-2 max-w-lg cursor-pointer duration-500 ease-in rounded-sm ${isPlaying ? "bg-neutral-800" : "hover:bg-neutral-200"}`}>
            <div>
                <div
                    className={`aspect-square w-10 rounded-sm flex justify-center items-center overflow-hidden text-neutral-400 group-hover/mc:bg-neutral-50 duration-500 ${isPlaying ? "bg-neutral-50" :"bg-neutral-200"}`}>
                    <img className="w-full h-auto z-50" src={`app:///${picture}`} alt={""}/>
                    <div className="absolute flex justify-center items-center z-10 text-neutral-600">
                        <Music absoluteStrokeWidth size={14}/>
                    </div>
                </div>
            </div>
            <div className="overflow-hidden">
                <p className={`overflow-ellipsis  whitespace-nowrap text-sm overflow-hidden first-letter:uppercase ${isPlaying ? "text-neutral-100":"text-neutral-800"}`}>{title}</p>
                <p className="overflow-ellipsis text-neutral-400 whitespace-nowrap text-xs overflow-hidden first-letter:uppercase">{artist}</p>
            </div>
            <div className={`ml-auto items-center justify-center p-2 text-white flex ${isPlaying ? "opacity-100" : "opacity-0"}`}>
                <Disc3  className={`${!isPaused ? "animate-spin" : ""}`} size={20}/>
            </div>
        </div>
    </>
}

export default MusicCard;