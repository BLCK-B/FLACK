import { defineStore } from 'pinia'
import {Song} from "../types/musicTypes";

export const useStore = defineStore('store', {
    state: () => ({
        selectedSong: undefined as Song | undefined,
        isPlaying: false as boolean,
    }),
    actions: {
        setSelectedSong(selectedSong: Song | undefined) {
            this.selectedSong = selectedSong;
        },
        setIsPlaying(isPlaying: boolean) {
            this.isPlaying = isPlaying;
        }
    },
})