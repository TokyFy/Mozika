import {app, BrowserWindow, dialog, ipcMain, shell} from 'electron'
import {release} from 'node:os'
import path, {join} from 'node:path'
import {update} from './update'
import {audioList, IMetadata} from "./music";
import fs from "node:fs"
import {APP_DATA_DIR} from "./Contant";

const {protocol, net} = require('electron');

// The built directory structure
//
// ├─┬ dist-electron
// │ ├─┬ main
// │ │ └── index.js    > Electron-Main
// │ └─┬ preload
// │   └── index.js    > Preload-Scripts
// ├─┬ dist
// │ └── index.html    > Electron-Renderer
//
process.env.DIST_ELECTRON = join(__dirname, '../')
process.env.DIST = join(process.env.DIST_ELECTRON, '../dist')
process.env.VITE_PUBLIC = process.env.VITE_DEV_SERVER_URL
    ? join(process.env.DIST_ELECTRON, '../public')
    : process.env.DIST

// Disable GPU Acceleration for Windows 7
if (release().startsWith('6.1')) app.disableHardwareAcceleration()

// Set application name for Windows 10+ notifications
if (process.platform === 'win32') app.setAppUserModelId(app.getName())

if (!app.requestSingleInstanceLock()) {
    app.quit()
    process.exit(0)
}

// Remove electron security warnings
// This warning only shows in development mode
// Read more on https://www.electronjs.org/docs/latest/tutorial/security
// process.env['ELECTRON_DISABLE_SECURITY_WARNINGS'] = 'true'

let win: BrowserWindow | null = null
// Here, you can also use other preload
const preload = join(__dirname, '../preload/index.js')
const url = process.env.VITE_DEV_SERVER_URL
const indexHtml = join(process.env.DIST, 'index.html')

const WINDOWS_WIDTH = 375;
const WINDOWS_HEIGHT = 675;


async function createWindow() {
    win = new BrowserWindow({
        title: 'Mozika',
        width: WINDOWS_WIDTH,
        height: WINDOWS_HEIGHT,
        maximizable: false,
        minimizable: false,
        maxWidth: WINDOWS_WIDTH,
        maxHeight: WINDOWS_HEIGHT,
        minWidth: WINDOWS_WIDTH,
        minHeight: WINDOWS_HEIGHT,
        frame: false,
        transparent: true,
        icon: join(process.env.VITE_PUBLIC, 'favicon.ico'),
        webPreferences: {
            preload,
            // Warning: Enable nodeIntegration and disable contextIsolation is not secure in production
            // Consider using contextBridge.exposeInMainWorld
            // Read more on https://www.electronjs.org/docs/latest/tutorial/context-isolation
            nodeIntegration: true,
            contextIsolation: false,
        },
    })

    if (url) { // electron-vite-vue#298
        win.loadURL(url)
        // Open devTool if the app is not packaged
    } else {


        win.loadFile(indexHtml)
    }

    // Test actively push message to the Electron-Renderer
    win.webContents.on('did-finish-load', async () => {

        win!.webContents.openDevTools()
        console.log("Main Async ")

    })

    // Make all links open with the browser, not with the application
    win.webContents.setWindowOpenHandler(({url}) => {
        if (url.startsWith('https:')) shell.openExternal(url)
        return {action: 'deny'}
    })

    win.setBackgroundColor('rgba(0, 0, 0, 0)')

    win.removeMenu()

    // Apply electron-updater
    update(win)
}

app.whenReady().then(createWindow)


app.on('window-all-closed', () => {
    win = null
    if (process.platform !== 'darwin') app.quit()
})

app.on('second-instance', () => {
    if (win) {
        // Focus on the main window if the user tried to open another
        if (win.isMinimized()) win.restore()
        win.focus()
    }
})

app.on('activate', () => {
    const allWindows = BrowserWindow.getAllWindows()
    if (allWindows.length) {
        allWindows[0].focus()
    } else {
        createWindow()
    }
})

app.on("ready", () => {

    // Name the protocol whatever you want.
    const protocolName = 'app'

    // TODO : Remove this deprecated
    protocol.registerFileProtocol(protocolName, (request, callback) => {
        const url = request.url.replace(`${protocolName}://`, '')
        try {
            return callback(decodeURIComponent(url))
        } catch (error) {
            // Handle the error as needed
            console.error(error)
        }
        // Create some window you can even use webPreferences: true
    });

})


// New window example arg: new windows url
ipcMain.handle('open-win', (_, arg) => {
    const childWindow = new BrowserWindow({
        webPreferences: {
            preload,
            nodeIntegration: true,
            contextIsolation: false,
        },
    })

    if (process.env.VITE_DEV_SERVER_URL) {
        childWindow.loadURL(`${url}#${arg}`)
    } else {
        childWindow.loadFile(indexHtml, {hash: arg})
    }
})

ipcMain.handle('quit', () => {
    console.log("Quit")
    win = null
    app.quit()
})

ipcMain.handle('scan-musics', async (_event, args) => {

    const musics: IMetadata[] = [];

    const musicsFolders = args.folders as string[]

    console.log(musicsFolders)

    for (let folder of musicsFolders) {
        await audioList(folder, (music) => {
            if (music) {
                win?.webContents.send("song-added")
                musics.push(music);
            }
        })
    }

    fs.writeFileSync(path.join(APP_DATA_DIR, "/db.json"), JSON.stringify(musics))

    return musics;

})


ipcMain.handle('load-musics', async (_event, args) => {

    if (fs.existsSync(path.join(APP_DATA_DIR, "db.json"))) return JSON.parse(fs.readFileSync(path.join(APP_DATA_DIR, "db.json")).toString()) as IMetadata[];

    return []
})


ipcMain.handle('select-folder', () => {
    return dialog.showOpenDialogSync(
        {
            title: "choose folder",
            properties: ['openDirectory']
        }
    )
})

ipcMain.handle('minimal-mode', () => {
    const WINDOWS_WIDTH = 240;
    const WINDOWS_HEIGHT = 290;

    win?.setMaximumSize(WINDOWS_WIDTH, WINDOWS_HEIGHT);
    win?.setMinimumSize(WINDOWS_WIDTH, WINDOWS_HEIGHT)
    win?.setSize(WINDOWS_WIDTH, WINDOWS_HEIGHT, true)
})

ipcMain.handle('normal-mode', () => {
    win?.setMaximumSize(WINDOWS_WIDTH, WINDOWS_HEIGHT);
    win?.setMinimumSize(WINDOWS_WIDTH, WINDOWS_HEIGHT)
    win?.setSize(WINDOWS_WIDTH, WINDOWS_HEIGHT, true)
})

