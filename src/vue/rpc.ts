import Electrobun, { Electroview } from "electrobun/view";
import { RPC } from "../bun";
import { Song } from "../types/musicTypes";

export type MediaAction = "playpause" | "next" | "prev";

let mediaControlHandler: ((action: MediaAction) => void) | null = null;
let openFileHandler: ((song: Song) => void) | null = null;

const rpc = Electroview.defineRPC<RPC>({
	maxRequestTime: 10000,
	handlers: {
		requests: {},
		messages: {
			mediaControl: ({ action }) => mediaControlHandler?.(action),
			openFile: ({ song }) => openFileHandler?.(song),
		},
	},
});

export const electrobun = new Electrobun.Electroview({ rpc });

export function onMediaControl(handler: (action: MediaAction) => void) {
	mediaControlHandler = handler;
}

export function onOpenFile(handler: (song: Song) => void) {
	openFileHandler = handler;
}

export function getLaunchSong(): Promise<Song | null> {
	return electrobun.rpc?.request.getLaunchSong({}) ?? Promise.resolve(null);
}

export function sendPlaybackState(state: {
	songName: string | null;
	artists: string | null;
	isPlaying: boolean;
}) {
	electrobun.rpc?.send.playbackState(state);
}
