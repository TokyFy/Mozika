import path from "node:path";

const OsDataDir = process.env.APPDATA || (process.platform == 'darwin' ? process.env.HOME + '/Library/Preferences' : process.env.HOME + "/.local/share");
export const APP_DATA_DIR = path.join(OsDataDir, ".mozika")