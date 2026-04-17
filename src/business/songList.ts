import fs from "fs";
import path from "path";
import {Song} from "../types/musicTypes";
import {parseFile, selectCover} from "music-metadata";

const MUSIC_DIR = "C:\\DownloadedMusic";

export async function getSongs(): Promise<Song[]> {
    const files = fs.readdirSync(MUSIC_DIR);

    return await Promise.all(files.map(async (f) => {
            const filepath = path.join(MUSIC_DIR, f);

            try {
                const metadata = await parseFile(filepath);
                const common = metadata.common;

                const stats = fs.statSync(filepath);
                const date = common.date ? new Date(common.date) : stats.birthtime;

                const artists = common.artists || (common.artist ? [common.artist] : []);

                return {
                    filepath,
                    name: common.title || f,
                    date,
                    artists,
                    thumbnailUrl: `http://localhost:50001/thumbnail?filepath=${encodeURIComponent(filepath.replace(/\\/g, "/"))}`
                };
            } catch (err) {
                console.error(`Error reading metadata for ${f}`, err);
                return {
                    filepath: '',
                    name: f,
                    date: new Date(),
                    artists: [],
                    thumbnailUrl: ''
                };
            }
        })
    );
}

export const getThumbnailStream = async (filepath: string): Promise<Response> => {
    if (!filepath) {
        return new Response("Missing filepath", { status: 400 });
    }

    const metadata = await parseFile(filepath);
    const cover = selectCover(metadata.common.picture);

    if (!cover) {
        return new Response("No cover found", { status: 404 });
    }

    const data = new Uint8Array(cover.data.buffer) as Uint8Array<ArrayBuffer>;

    return new Response(data, {
        headers: {
            "Content-Type": cover.format || "image/jpeg",
            "Cache-Control": "public, max-age=31536000",
        },
    });
};