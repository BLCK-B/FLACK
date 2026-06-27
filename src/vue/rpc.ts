import Electrobun, { Electroview } from "electrobun/view";
import { RPC } from "../bun";

export type MediaAction = "playpause" | "next" | "prev";

let mediaControlHandler: ((action: MediaAction) => void) | null = null;

const rpc = Electroview.defineRPC<RPC>({
	maxRequestTime: 10000,
	handlers: {
		requests: {},
		messages: {
			mediaControl: ({ action }) => mediaControlHandler?.(action),
		},
	},
});

export const electrobun = new Electrobun.Electroview({ rpc });

export function onMediaControl(handler: (action: MediaAction) => void) {
	mediaControlHandler = handler;
}

export function sendPlaybackState(state: {
	songName: string | null;
	artists: string | null;
	isPlaying: boolean;
}) {
	electrobun.rpc?.send.playbackState(state);
}
