import {RPCSchema} from "electrobun/bun";
import {Song} from "./musicTypes";

export type RPC = {
    bun: RPCSchema<{
        requests: {
            GETsongs: {
                params: {};
                response: Song[];
            };
        };
        messages: {};
    }>;
    webview: RPCSchema<{
        requests: {};
        messages: {};
    }>;
};