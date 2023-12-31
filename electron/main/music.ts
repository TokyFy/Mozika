import fs from "node:fs";
import path from "node:path";
import * as mm from 'music-metadata';
import {createHash} from "node:crypto";
import sharp from "sharp";
import {APP_DATA_DIR} from "./Contant";

async function audioList(dir: string, callback: (musics: IMetadata | undefined) => void) {
    try {
        const files = await fs.promises.readdir(dir);

        for (const file of files) {
            const filePath = path.join(dir, file);
            const fileStat = await fs.promises.stat(filePath);

            if (fileStat.isDirectory()) {
                await audioList(filePath, callback);
            }

            if (file.endsWith(".flac") || file.endsWith(".mp3") || file.endsWith(".mp4")) {
                if (fileStat.size <= 2000 * 1000 * 1000) {
                    callback(await metadata(filePath));
                }
            }
        }
    } catch (err) {
        // Handle errors
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

        // It's better to do this way (with stream) to improve perf with large files
        const stream = fs.createReadStream(songPath)
        const metadata = await mm.parseStream(stream);


        let picture = "";

        if (metadata.common!.picture) {
            picture = await cacheImage(metadata.common!.picture[0].data, `${createImageHash(songPath)}.jpg` , path.join(APP_DATA_DIR , "/cache"))
        }

        if(Number(metadata.format!.duration) >= 10 * 60) return

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

async function cacheImage(imageBuffer: Buffer, name: string , location : string):Promise<string> {

    try {
        if (!fs.existsSync(location)) {
            fs.mkdirSync(location, {recursive: true})
        }

        if (imageBuffer.length > 0) {
            let sharpI = sharp(imageBuffer).resize(400);
            await sharpI.toFile(path.join(location, name));
        }

        return path.join(location, name);
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

