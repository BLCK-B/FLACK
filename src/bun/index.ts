import {BrowserView, BrowserWindow, RPCSchema, Updater, Utils, Screen} from "electrobun/bun";
import {getAudioStream, getSongs, getThumbnailStream} from "../business/dataLoading";
import {Song} from "../types/musicTypes";
import { serve } from "bun";

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
        };
        messages: {};
    }>;
    webview: RPCSchema<{
        requests: {};
        messages: {};
    }>;
};

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
            }
        },
    }
})

serve({
    port: 50001,
    fetch(req) {
        const url = new URL(req.url);
        if (url.pathname === "/thumbnail") {
            const filepath = url.searchParams.get("filepath");
            return getThumbnailStream(filepath || "");
        }
        if (url.pathname === "/audio") {
            const filepath = url.searchParams.get("filepath");
            return getAudioStream(filepath || "", req);
        }
        return new Response("Not found", { status: 404 });
    },
});

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

// Create the main application window
const url = await getBusinessUrl();

const { width, height } = Screen.getPrimaryDisplay().workArea;

const mainWindow = new BrowserWindow({
    title: "FLACK",
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
    mainWindow.maximize();
}, 0);