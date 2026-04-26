import { defineStore } from 'pinia'
import {Song} from "../types/musicTypes";
import {createQueue} from "../business/playbackLogic";

export const useStore = defineStore('store', {
    state: () => ({
        queue: [] as Song[],
        selectedSong: undefined as Song | undefined,
        isPlaying: false as boolean,
    }),
    actions: {
        setSelectedSong(selectedSong: Song | undefined) {
            this.selectedSong = selectedSong;
        },
        setIsPlaying(isPlaying: boolean) {
            this.isPlaying = isPlaying;
        },
        setQueue(queue: Song[]) {
            this.queue = queue;
        },
        shuffleQueue() {
            this.queue = createQueue(this.queue);
        },
    },
})