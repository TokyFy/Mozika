function lyricsFile(path : string) {
    // Todo : replace with Regex
    let strArray = path.split(".");

    strArray[strArray.length - 1] = "lrc"

    return strArray.join(".")
}

export {lyricsFile}