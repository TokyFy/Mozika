import {IMetadata} from "../../electron/main/music";

type IAppData = {
    musics: IMetadata[],
    onScanningMusics: boolean,
    currentMusic: number,
    volume: number,
    isPaused: boolean
}

export {IAppData}