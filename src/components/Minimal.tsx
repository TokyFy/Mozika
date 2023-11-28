import React from 'react';
import {CassetteTape, Radio} from "lucide-react";
import {IMetadata} from "../../electron/main/music";

function Minimal({music , isPaused} : {music : IMetadata , isPaused ?: boolean}) {
    return (
        <div
            id={"dragable"}
            className="h-full w-full absolute flex flex-col bg-neutral-100 z-50 cursor-pointer p-1 dark:bg-neutral-900">
            <div className="w-full aspect-square overflow-hidden">
                {Boolean(music.picture !== "")
                    ? <img className="w-full h-auto" src={`app:///${music.picture}`} alt={""}/>
                    : <div className="flex justify-center bg-neutral-50 items-center text-inherit w-full h-full dark:text-neutral-100 dark:bg-neutral-800">
                        <CassetteTape absoluteStrokeWidth size={28}/>
                    </div>
                }
            </div>
            <div className="flex justify-between items-center grow">
                <div className="flex flex-col max-w-[70%]">
                    <p className="overflow-ellipsis whitespace-nowrap overflow-hidden text-sm dark:text-neutral-100">{music.title}</p>
                    <p className="overflow-ellipsis whitespace-nowrap overflow-hidden text-xs text-neutral-400">{music.artist}</p>
                </div>
                <div className={`flex justify-center items-center dark:text-neutral-100 px-1 ${isPaused && "opacity-30"}`}>
                    <Radio size={18}/>
                </div>
            </div>
        </div>
    );
}

export default Minimal;