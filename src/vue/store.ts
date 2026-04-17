import { defineStore } from 'pinia'
import {Song} from "../types/musicTypes";

export const useStore = defineStore('store', {
    state: () => ({
        selectedSong: undefined as Song | undefined,
    }),
    actions: {
        setSelectedSong(selectedSong: Song | undefined) {
            this.selectedSong = selectedSong;
        },
    },
})