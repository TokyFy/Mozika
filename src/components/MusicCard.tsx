import {IMetadata} from "../../electron/main/music";
import {Asterisk, Music, Music2, PlayCircle} from "lucide-react";

type IMusicCard = IMetadata & {isPlaying : boolean}

function MusicCard({title, artist, album, picture, file , isPlaying}: IMusicCard) {
    return <>
        <div className={`flex gap-2 text-sm items-center p-2 hover:bg-white max-w-lg cursor-pointer duration-500 ease-in rounded-sm ${isPlaying ? "bg-neutral-200" : ""}`}>
            <div>
                <div
                    className="aspect-square bg-neutral-200 w-10 rounded-sm flex justify-center items-center overflow-hidden text-neutral-400">
                    <img className="w-full h-auto z-50" src={`app:///${picture}`} alt={""}/>
                    <div className="absolute flex justify-center items-center z-10">
                        <Music2 size={18}/>
                    </div>
                </div>
            </div>
            <div className="overflow-hidden">
                <p className="overflow-ellipsis text-neutral-800 whitespace-nowrap text-sm overflow-hidden first-letter:uppercase">{title}</p>
                <p className="overflow-ellipsis text-neutral-400 whitespace-nowrap text-xs overflow-hidden first-letter:uppercase">{artist}</p>
            </div>
            <div className={`ml-auto items-center justify-center p-2 text-neutral-400 flex ${isPlaying ? "opacity-100" : "opacity-0"}`}>
                <Asterisk size={18}/>
            </div>
        </div>
    </>
}

export default MusicCard;