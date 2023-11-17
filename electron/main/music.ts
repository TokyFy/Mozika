import fs from "node:fs";
import path from "node:path";
import * as mm from 'music-metadata';
import {createHash} from "node:crypto";
import sharp from "sharp";

const musicDir = "/home/toni/Music";

async function audioList(dir: string, callback: (musics: IMetadata | undefined) => void) {
    const files = fs.readdirSync(dir);
    for (const file of files) {

        try {
            const filePath = path.join(dir, file);

            if (fs.statSync(filePath).isDirectory()) {
                await audioList(filePath, callback)
            }

            if (file.endsWith(".mp3")) {
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

        return {
            title: metadata.common.title || path.basename(songPath),
            artist: metadata.common.artist || "Unknown",
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

