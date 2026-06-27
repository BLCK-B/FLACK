import {BrowserView, BrowserWindow, RPCSchema, Updater, Utils, Screen} from "electrobun/bun";
import {getAudioStream, getSong, getSongs, getThumbnailStream} from "../business/dataLoading";
import {Song} from "../types/musicTypes";
import {serve} from "bun";
import config from "../../electrobun.config";
import {setWindowIcon} from "./windowIcon";
import {findLaunchFile} from "./launchFile";
import {initMediaTray, setPlaybackState, type MediaAction, type PlaybackState} from "./mediaTray";

export type RPC = {
    bun: RPCSchema<{
        requests: {
            GETsongs: {
                params: {
                    dirPaths: string[];
                };
                response: Song[];
            };
            openDirectoryDialog: {
                params: {};
                response: string[];
            };
            getLaunchSong: {
                params: {};
                response: Song | null;
            };
        };
        messages: {
            playbackState: PlaybackState;
        };
    }>;
    webview: RPCSchema<{
        requests: {};
        messages: {
            mediaControl: {
                action: MediaAction
            };
            openFile: {
                song: Song;
            };
        };
    }>;
};

const launchFilePath = findLaunchFile();
let launchSongConsumed = false;
let mainWindow: BrowserWindow | undefined;

const musicRPC = BrowserView.defineRPC<RPC>({
    maxRequestTime: 10000,
    handlers: {
        requests: {
            GETsongs: ({ dirPaths }) => getSongs(dirPaths),
            openDirectoryDialog: async () => {
                const paths = await Utils.openFileDialog({
                    startingFolder: Utils.paths.home,
                    allowedFileTypes: "*",
                    canChooseFiles: false,
                    canChooseDirectory: true,
                    allowsMultipleSelection: true,
                });
                return paths ?? [];
            },
            getLaunchSong: async () => {
                if (!launchFilePath || launchSongConsumed) return null;
                launchSongConsumed = true;
                return await getSong(launchFilePath);
            },
        },
        messages: {
            playbackState: (state) => setPlaybackState(state),
        },
    }
})

async function openFileInRunningApp(filepath: string): Promise<void> {
    try {
        const song = await getSong(filepath);
        musicRPC.send.openFile({song});
        mainWindow?.unminimize();
        mainWindow?.focus();
    } catch (err) {
        console.warn(`Failed to open file, ${err}`);
    }
}

function handleRequest(req: Request): Response | Promise<Response> {
    const url = new URL(req.url);
    if (url.pathname === "/thumbnail") {
        const filepath = url.searchParams.get("filepath");
        return getThumbnailStream(filepath || "");
    }
    if (url.pathname === "/audio") {
        const filepath = url.searchParams.get("filepath");
        return getAudioStream(filepath || "", req);
    }
    if (url.pathname === "/open") {
        const filepath = url.searchParams.get("filepath");
        if (filepath) void openFileInRunningApp(filepath);
        return new Response("ok");
    }
    return new Response("Not found", {status: 404});
}

let isPrimaryInstance = true;
try {
    serve({
        port: 50001,
        fetch: handleRequest
    });
} catch {
    isPrimaryInstance = false;
    if (launchFilePath) {
        try {
            await fetch(`http://localhost:50001/open?filepath=${encodeURIComponent(launchFilePath)}`);
        } catch (err) {
            console.warn(`Could not hand file to running FLACK (${err})`);
        }
    }
    Utils.quit();
}

// -----------------------------------------------------------

const DEV_SERVER_PORT = 5173;
const DEV_SERVER_URL = `http://localhost:${DEV_SERVER_PORT}`;

// Check if Vite dev server is running for HMR
async function getBusinessUrl(): Promise<string> {
    const channel = await Updater.localInfo.channel();
    if (channel === "dev") {
        try {
            await fetch(DEV_SERVER_URL, {method: "HEAD"});
            console.log(`HMR enabled: Using Vite dev server at ${DEV_SERVER_URL}`);
            return DEV_SERVER_URL;
        } catch {
            console.log(
                "Vite dev server not running. Run 'bun run dev:hmr' for HMR support.",
            );
        }
    }
    return "views://vue/index.html";
}

const simplifyVersion = (version: string) => {
    const parts = version.split(".").map(Number);
    while (parts.length > 1 && parts[parts.length - 1] === 0) {
        parts.pop();
    }
    return parts.join(".");
}

if (isPrimaryInstance) {
    const url = await getBusinessUrl();

    const {width, height} = Screen.getPrimaryDisplay().workArea;

    const windowTitle = `FLACK v${simplifyVersion(config.app.version)}`;

    mainWindow = new BrowserWindow({
        title: windowTitle,
        url,
        rpc: musicRPC,
        frame: {
            width,
            height,
            x: 0,
            y: 0,
        },
        titleBarStyle: "default",
    });

    setTimeout(() => {
        mainWindow?.maximize();
    }, 0);

    // Set the native window/taskbar icon on Windows (Electrobun has no icon API).
    void setWindowIcon(windowTitle, config.build?.win?.icon);

    initMediaTray({
        icon: config.build?.win?.icon,
        onControl: (action: MediaAction) => {
            musicRPC.send.mediaControl({action});
        },
    });
}