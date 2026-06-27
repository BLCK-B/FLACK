import {Tray, Utils} from "electrobun/bun";
import {resolveIconPath} from "./windowIcon";

export type MediaAction = "playpause" | "next" | "prev";

type TrayAction = MediaAction | "quit";

type TrayMenuItem =
    | { type: "divider" }
    | {
    type: "normal";
    label: string;
    enabled?: boolean;
    action?: TrayAction;
};

export type PlaybackState = {
    songName: string | null;
    artists: string | null;
    isPlaying: boolean;
};

export type InitMediaTrayOptions = {
    icon: string | undefined;
    onControl: (action: MediaAction) => void;
};

let tray: Tray | null = null;
let onControl: ((action: MediaAction) => void) | null = null;
let state: PlaybackState = {songName: null, artists: null, isPlaying: false};

function buildMenu(): Array<TrayMenuItem> {
    const parts = [state.songName, state.artists].filter(item => item != null)
    const nowPlaying = parts.length ? parts.join(" - ") : "Nothing playing";
    return [
        {
            type: "normal",
            label: nowPlaying,
            enabled: false
        },
        {
            type: "divider"
        },
        {
            type: "normal",
            label: state.isPlaying ? "Pause" : "Play",
            action: "playpause",
        },
        {
            type: "normal",
            label: "Next",
            action: "next"
        },
        {
            type: "normal",
            label: "Previous",
            action: "prev"
        },
        {
            type: "divider"
        },
        {
            type: "normal",
            label: "Quit FLACK",
            action: "quit"
        },
    ];
}

function trayTooltip(): string {
    if (state.songName) {
        return `FLACK - ${[state.songName, state.artists].filter(Boolean).join(" - ")}`;
    } else {
        return "FLACK";
    }
}

export function initMediaTray({ icon, onControl: control }: InitMediaTrayOptions) {
    if (process.platform !== "win32") return;

    try {
        onControl = control;

        const iconPath = resolveIconPath(icon);
        tray = new Tray({
            title: "FLACK",
            image: iconPath ?? "",
            template: false,
        });

        tray.setMenu(buildMenu());
        tray.setTitle(trayTooltip());

        tray.on("tray-clicked", (event) => {
            const action = (event as { data?: { action?: string } }).data?.action;
            if (!action) return;
            if (action === "quit") {
                Utils.quit();
                return;
            }
            onControl?.(action as MediaAction);
        });
    } catch (err) {
        console.warn(`Media tray: failed to initialize (${err})`);
        tray = null;
    }
}

export function setPlaybackState(next: PlaybackState): void {
    const prev = state;
    state = next;
    if (!tray) return;

    const songOrArtistsChanged = prev.songName !== next.songName || prev.artists !== next.artists;

    if (songOrArtistsChanged || prev.isPlaying !== next.isPlaying) {
        tray.setMenu(buildMenu());
    }
    if (songOrArtistsChanged) {
        tray.setTitle(trayTooltip());
    }
}
