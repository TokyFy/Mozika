import React, {useEffect, useState} from 'react';
import ThemeToggler from "@/components/ThemeToggler";
import {FolderPlus, FolderSync, FolderX} from "lucide-react";
import {ipcRenderer} from "electron";


type ISettings = {
    scanMusic : (fodler : string[]) => Promise<void>,
    menuOpen : boolean,
    toggleMenu : (state : boolean) => void
}

function Settings({scanMusic , menuOpen , toggleMenu} : ISettings) {

    const [musicsFolders, setMusicsFolders] = useState<string[]>([])

    const addFolders = async () => {
        const folder = await ipcRenderer.invoke("select-folder");

        if (folder) {
            setMusicsFolders([...musicsFolders, folder[0]])
        }
    }

    useEffect(() => {
        const folders = JSON.parse(`${localStorage.getItem("folders")}`) as string[] || []
        setMusicsFolders(folders)
    }, []);

    useEffect(() => {
        localStorage.setItem("folders", JSON.stringify(musicsFolders))
    }, [musicsFolders]);

    return (
        <div
            className={`rounded-sm bg-neutral-50 dark:bg-neutral-900 text-neutral-800 dark:text-neutral-100 text-sm overflow-scroll duration-200 ease-in-out absolute z-50 w-full left-0  ${menuOpen ? "h-full" : "h-0"}`}>
            <div className="p-1">
                <div className="flex justify-between items-center my-2">
                    <h1 className="font-bold text-lg  text-center">Settings</h1>
                    <ThemeToggler/>
                </div>

                <div className="p-2 border border-solid border-neutral-200 rounded my-2 dark:border-neutral-700">
                    <p className="font-bold">Shortcuts</p>
                    <div className="flex flex-col my-2 gap-2">
                        <Shortcut keystroke={"space"} action={"Pause / Play"}/>
                        <Shortcut keystroke={"n"} action={"Next"}/>
                        <Shortcut keystroke={"p"} action={"Previous"}/>
                        <Shortcut keystroke={"s"} action={"Shuffle"}/>
                        <Shortcut keystroke={"o"} action={"Order"}/>
                        <Shortcut keystroke={"/"} action={"Search Mode"}/>
                        <Shortcut keystroke={"Esc"} action={"Close Search mode"}/>
                        <Shortcut keystroke={"+"} action={"Volume up"}/>
                        <Shortcut keystroke={"-"} action={"Volume down"}/>
                    </div>
                </div>

                <div className="p-2 border border-solid border-neutral-200 rounded dark:border-neutral-700">
                    <div className="flex justify-between items-center ">
                        <p className="font-bold">Musics Directories</p>
                        <div className="text-xs underline cursor-pointer flex gap-2 text-neutral-400">
                            <p onClick={() => {
                                addFolders().then();
                            }}>
                                <FolderPlus size={16}/>
                            </p>

                            <p onClick={() => {
                                scanMusic(musicsFolders).then();
                                toggleMenu(false)
                            }}>
                                <FolderSync size={16}/>
                            </p>

                            <p onClick={() => {
                                setMusicsFolders([])
                            }}>
                                <FolderX size={16}/>
                            </p>
                        </div>
                    </div>

                    <div>
                        <ul className="text-xs list-disc list-inside py-2">
                            {
                                musicsFolders.map((el, index) => <li className="marker:mr-0" key={index}>{el}</li>)
                            }
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}

const Shortcut = ({ action , keystroke} : {keystroke : string , action : string}) => {
    return (
        <div className="flex justify-between">
            <div className="text-xs">
                {action}
            </div>
            <div className="w-max h-min p-1 py-[1px] text-xs font-mono font-bold border border-solid border-neutral-300 dark:border-neutral-700 rounded-md text-neutral-900 dark:text-neutral-100">{keystroke}</div>
        </div>
    );
};

export default Settings;