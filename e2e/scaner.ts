// import fs from "node:fs";
// import * as mm from "music-metadata";
// import path from "node:path";
// import {createHash} from 'node:crypto';

import os from "node:os";
import path from "node:path";

// const buffer = fs.readFileSync("/home/toni/Documents/Toky/Mozika/e2e/Cehryl.mp3")
//
// const metadata = await mm.parseBuffer(buffer);

// console.log(metadata.common!.picture![0].data)


// const OsDataDir = process.env.APPDATA || (process.platform == 'darwin' ? process.env.HOME + '/Library/Preferences' : process.env.HOME + "/.local/share");
// const appDataDir = path.join(OsDataDir , ".mozika/cache")
//
// if(!fs.existsSync(appDataDir)) {
//    fs.mkdirSync(appDataDir , {recursive : true})
// }
//
// fs.writeFileSync(path.join(appDataDir , "hello.jpg") , metadata.common!.picture![0].data )

// function cacheImage(imageBuffer : Buffer , name : string ) {
//     const OsDataDir = process.env.APPDATA || (process.platform == 'darwin' ? process.env.HOME + '/Library/Preferences' : process.env.HOME + "/.local/share");
//     const appDataDir = path.join(OsDataDir , ".mozika/cache")
//
//     if(!fs.existsSync(appDataDir)) {
//         fs.mkdirSync(appDataDir , {recursive : true})
//     }
//
//     fs.writeFileSync(path.join(appDataDir , name + ".jpg") , imageBuffer )
// }
//
// function createImageHash(str : string) {
//     const hash = createHash('sha256');
//     hash.update(str);
//     return hash.digest('hex')
// }

//
// console.log(createImageHash("/home/image"))
// console.log(createImageHash("/home/image"))

console.log(path.basename("foo/bar.mp3"))