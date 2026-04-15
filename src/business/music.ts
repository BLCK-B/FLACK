import fs from "fs";
import path from "path";

const MUSIC_DIR = "C:\\DownloadedMusic";

export function getSongs() {
    const files = fs.readdirSync(MUSIC_DIR);

    return files
        .map(f => ({
            name: f,
            path: path.join(MUSIC_DIR, f)
        }));
}