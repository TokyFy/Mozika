import React from 'react';
import {Asterisk, MoreHorizontal} from "lucide-react";

type ITopBar = {
    onMenuClick : ()=>void
}

function TopBar({onMenuClick} : ITopBar) {
    return (
        <div id="topbar"
             className="group/top h-8 min-h-[2rem] flex items-center justify-between px-2 w-full bg-neutral-200 dark:bg-neutral-700 dark:text-neutral-100">

            <div className="flex items-center ">
                <Asterisk absoluteStrokeWidth size={18}/>
            </div>

            <div
                onClick={()=>onMenuClick()}
                id="close"
                className="flex items-center justify-center cursor-pointer">
                <MoreHorizontal absoluteStrokeWidth size={18}/>
            </div>
        </div>
    );
}

export default TopBar;