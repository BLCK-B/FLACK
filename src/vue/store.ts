import {defineStore} from 'pinia'
import {Song} from "../types/musicTypes";
import {createShuffledQueue} from "../business/playbackLogic";

export const useStore = defineStore('store', {
    state: () => ({
        queue: [] as Song[],
        selectedSong: undefined as Song | undefined,
        isPlaying: false as boolean,
        isSettingsOpen: false as boolean,
        dirPaths: [] as string[],
    }),
    actions: {
        setSelectedSong(selectedSong: Song | undefined) {
            this.selectedSong = selectedSong;
            if (selectedSong) {
                localStorage.setItem("selected-song", JSON.stringify(selectedSong));
            }
        },
        setIsPlaying(isPlaying: boolean) {
            this.isPlaying = isPlaying;
        },
        setQueue(queue: Song[]) {
            this.queue = queue;
            localStorage.setItem("queue", JSON.stringify(queue));
        },
        shuffleQueue() {
            this.queue = createShuffledQueue(this.queue);
            localStorage.setItem("queue", JSON.stringify(this.queue));
        },
        setIsSettingsOpen(isSettingsOpen: boolean) {
            this.isSettingsOpen = isSettingsOpen;
        },
        setDirPaths(dirPaths: string[]) {
            this.dirPaths = dirPaths;
        },
    },
})