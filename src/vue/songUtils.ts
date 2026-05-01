import {Song} from "../types/musicTypes";

export const getSongKey = (song: Song) => {
    if (!song) return "";
    const artists = [...song.artists].sort().join(",");
    const date = new Date(song.date).toISOString();
    return `${song.name}_${artists}_${date}`;
};

export const areQueuesEqual = (a: Song[], b: Song[]) => {
    if (a.length !== b.length) return false;

    const count = new Map<string, number>();

    for (const song of a) {
        const key = getSongKey(song);
        count.set(key, (count.get(key) || 0) + 1);
    }

    for (const song of b) {
        const key = getSongKey(song);
        if (!count.has(key)) return false;
        const next = count.get(key)! - 1;
        if (next === 0) count.delete(key);
        else count.set(key, next);
    }

    return count.size === 0;
};