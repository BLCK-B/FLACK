import fs from "fs";
import path from "path";
import {Song} from "../types/musicTypes";
import {parseFile, selectCover} from "music-metadata";

export async function getSongs(dirPaths: string[]): Promise<Song[]> {
    if (!dirPaths.length) return [];
    const allFiles: string[] = [];

    const allowedExt = new Set(Object.keys(mimeTypes));

    for (const dir of dirPaths) {
        try {
            const entries = fs.readdirSync(dir);
            for (const file of entries) {
                const ext = path.extname(file).toLowerCase();
                if (!allowedExt.has(ext)) continue;
                allFiles.push(path.join(dir, file));
            }
        } catch (err) {
            console.error(`Failed to read directory: ${dir}`, err);
        }
    }

    return await Promise.all(
        allFiles.map(async (filepath) => {
            try {
                const metadata = await parseFile(filepath);
                const common = metadata.common;

                const stats = fs.statSync(filepath);
                const date = common.date ? new Date(common.date) : stats.birthtime;

                const artists =
                    common.artists || (common.artist ? [common.artist] : []);

                return {
                    filepath,
                    name: common.title || path.basename(filepath),
                    date,
                    artists,
                    thumbnailUrl: `http://localhost:50001/thumbnail?filepath=${encodeURIComponent(
                        filepath.replace(/\\/g, "/")
                    )}`,
                    audioUrl: `http://localhost:50001/audio?filepath=${encodeURIComponent(
                        filepath.replace(/\\/g, "/")
                    )}`,
                };
            } catch (err) {
                console.error(`Error reading metadata for ${filepath}`, err);

                return {
                    filepath,
                    name: path.basename(filepath),
                    date: new Date(),
                    artists: [],
                    thumbnailUrl: "",
                    audioUrl: "",
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

const mimeTypes: Record<string, string> = {
    ".mp3": "audio/mpeg",
    ".aac": "audio/aac",
    ".wav": "audio/wav",
    ".flac": "audio/flac",
    ".ogg": "audio/ogg",
    ".opus": "audio/opus",
    ".webm": "audio/webm",
};

const getMimeType = (filepath: string): string => {
    const extension = path.extname(filepath).toLowerCase();
    return mimeTypes[extension] || "application/octet-stream";
};


export const getAudioStream = async (filepath: string, req: Request): Promise<Response> => {
    if (!filepath) {
        return new Response("Missing filepath", { status: 400 });
    }

    const file = Bun.file(filepath);
    const fileSize = file.size;

    const contentType = getMimeType(filepath);
    const range = req.headers.get("range");

    if (range) {
        const parts = range.replace(/bytes=/, "").split("-");
        const start = parseInt(parts[0], 10);
        const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;

        const chunk = file.slice(start, end + 1);

        return new Response(chunk, {
            status: 206,
            headers: {
                "Content-Range": `bytes ${start}-${end}/${fileSize}`,
                "Accept-Ranges": "bytes",
                "Content-Length": `${end - start + 1}`,
                "Content-Type": contentType,
            },
        });
    }

    return new Response(file, {
        headers: {
            "Content-Type": contentType,
            "Content-Length": fileSize.toString(),
        },
    });
};