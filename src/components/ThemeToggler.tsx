import React, {useEffect, useState} from 'react';
import {Moon, Sun} from "lucide-react";

function ThemeToggler() {

    const [dark, setDark] = useState(false)

    useEffect(() => {
        const theme = localStorage.getItem("Theme");
        if(theme) {
            theme === "DARK" ? setDark(true) : setDark(false)
        } else {
            localStorage.setItem("Theme" , "LIGHT")
        }
    }, []);

    useEffect(() => {
        dark ? document.body.classList.add("dark") : document.body.classList.remove("dark");
        localStorage.setItem("Theme" , dark ? "DARK" : "LIGHT")
    }, [dark]);

    return (
        <div
            className="flex items-center justify-center cursor-pointer"
            onClick={()=>setDark(!dark)}
        >
            {dark ? <Moon size={16}/> : <Sun size={16}/>}
        </div>
    );
}

export default ThemeToggler;