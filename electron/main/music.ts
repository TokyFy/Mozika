import fs from "node:fs";
import path from "node:path";
import * as mm from 'music-metadata';
import {createHash} from "node:crypto";
import sharp from "sharp";

async function audioList(dir: string, callback: (musics: IMetadata | undefined) => void) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        try {
            const filePath = path.join(dir, file);

            const fileStat = fs.statSync(filePath);

            if (fileStat.isDirectory()) {
                await audioList(filePath, callback)
            }

            if (file.endsWith(".flac") || file.endsWith(".mp3")  || file.endsWith(".mp4")) {
                fileStat.size <= 200 * 1000 * 1000 &&
                callback(await metadata(filePath));
            }

        } catch (err) {
            // Do things Here
        }
    }
}

type IMetadata = {
    title: string,
    artist: string,
    album: string,
    picture: string,
    file: string
}

async function metadata(songPath: string): Promise<IMetadata | undefined> {
    try {
        const buffer = fs.readFileSync(songPath)
        const metadata = await mm.parseBuffer(buffer);


        let picture = "";

        if (metadata.common!.picture) {
            picture = await cacheImage(metadata.common!.picture[0].data, `${createImageHash(songPath)}.jpg`)
        }

        if(Number(metadata.format!.duration) >= 7 * 60) return

        let fallbackSongsName = path.basename(songPath).replace(".mp4" , "").split("-").reverse()

        return {
            title: metadata.common.title || fallbackSongsName[0] || "",
            artist: metadata.common.artist || fallbackSongsName[1] || "unknown",
            album: metadata.common.album || "",
            picture: picture,
            file: songPath
        }
    } catch (err) {
        // Do thing Heres
    }
}

async function cacheImage(imageBuffer: Buffer, name: string):Promise<string> {

    try {
        const OsDataDir = process.env.APPDATA || (process.platform == 'darwin' ? process.env.HOME + '/Library/Preferences' : process.env.HOME + "/.local/share");
        const appDataDir = path.join(OsDataDir, ".mozika/cache")
        try {

            if (!fs.existsSync(appDataDir)) {
                fs.mkdirSync(appDataDir, {recursive: true})
            }


            if (imageBuffer.length > 0) {
                let sharpI = sharp(imageBuffer).resize(400);
                await sharpI.toFile(path.join(appDataDir, name));
            }

        } catch (err) {
            console.log(err)
        }

        // fs.writeFileSync(path.join(appDataDir , name) , imageBuffer )

        return path.join(appDataDir, name);
    } catch (err) {
        // Do thing here
    }

    return ""
}

function createImageHash(str: string) {
    const hash = createHash('sha256');
    hash.update(str);
    return hash.digest('hex')
}


export {audioList, metadata};
export type {IMetadata};

