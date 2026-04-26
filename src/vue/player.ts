import {ref} from "vue";
import {Song} from "../types/musicTypes";

const audio = new Audio();

export const currentSong = ref<Song | null>(null);
export const duration = ref(0);

export const isPlaying = ref(false);
export const isSeeking = ref(false);

export const volume = ref(0.7);
export const lastVolume = ref(0.7);

export const currentTime = ref(0);

export function play(song: typeof currentSong.value) {
    if (!song) return;

    currentSong.value = song;
    audio.src = song.audioUrl;
    audio.load();
    audio.play().catch(e => console.warn("Playback blocked:", e));
}

export function pause() {
    audio.pause();
}

export function unpause() {
    audio.play().catch(e => console.warn("Playback blocked:", e));
}

export function stop() {
    audio.pause();
    audio.currentTime = 0;
}

export function setVolume(value: number) {
    const v = Math.max(0, Math.min(1, value));
    audio.volume = v;
    volume.value = v;
}

export function seek(seconds: number) {
    audio.currentTime = Math.max(0, Math.min(audio.duration || 0, seconds));
}

export function toggleMute() {
    if (volume.value !== 0) {
        lastVolume.value = volume.value;
        setVolume(0);
    } else {
        setVolume(lastVolume.value || 0.7);
    }
}

let onEndedCallback: (() => void) | null = null;

export function onEnded(cb: () => void) {
    onEndedCallback = cb;
}

audio.onplay = () => (isPlaying.value = true);
audio.onpause = () => (isPlaying.value = false);
audio.onended = () => {
    isPlaying.value = false;
    onEndedCallback?.();
};

audio.ontimeupdate = () => {
    currentTime.value = audio.currentTime || 0;
};

audio.onloadedmetadata = () => {
    duration.value = audio.duration || 0;
};

audio.onvolumechange = () => {
    volume.value = audio.volume
};

