import {Song} from "../types/musicTypes";

export function createQueue(songs: Song[]): Song[] {
    const queue = [...songs];

    for (let i = queue.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [queue[i], queue[j]] = [queue[j], queue[i]];
    }

    return queue;
}