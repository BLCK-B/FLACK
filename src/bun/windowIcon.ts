// Electrobun's BrowserWindow has no icon API, and on Windows the titlebar /
// taskbar icon must be set natively via WM_SETICON. We do that from the bun
// process with bun:ffi against user32.dll. Works in both `electrobun dev` and
// the packaged app. Entirely best-effort: any failure is swallowed so it can
// never take down the app.
import { existsSync } from "node:fs";
import { join } from "node:path";

const IMAGE_ICON = 1;
const LR_LOADFROMFILE = 0x00000010;
const WM_SETICON = 0x0080;
const ICON_SMALL = 0;
const ICON_BIG = 1;

// UTF-16LE, null-terminated — the encoding the *W (wide) Win32 APIs expect.
function wstr(s: string): Buffer {
	return Buffer.from(s + "\0", "utf16le");
}

// LoadImageW can only read a real .ico, so force the extension — if the config
// points at a .png (which Electrobun converts for the exe but not for us), we use
// its .ico sibling instead.
function toIco(p: string): string {
	return p.replace(/\.[^./\\]+$/, ".ico");
}

function resolveIconPath(configuredIcon?: string): string | null {
	const candidates: string[] = [];
	if (configuredIcon) {
		candidates.push(
			toIco(join(import.meta.dir, "..", "..", configuredIcon)), // dev: src/bun -> project root
			toIco(join(process.cwd(), configuredIcon)),
		);
	}
	candidates.push(
		join(import.meta.dir, "..", "app.ico"), // packaged: Resources/app -> Resources/app.ico
		join(import.meta.dir, "app.ico"),
		join(import.meta.dir, "..", "..", "app.ico"),
	);
	return candidates.find((p) => existsSync(p)) ?? null;
}

export async function setWindowIcon(
	windowTitle: string,
	configuredIcon?: string,
): Promise<void> {
	if (process.platform !== "win32") return;

	try {
		const iconPath = resolveIconPath(configuredIcon);
		if (!iconPath) {
			console.warn("Window icon: could not locate an .ico file, skipping");
			return;
		}

		const { dlopen, FFIType, ptr } = await import("bun:ffi");
		const user32 = dlopen("user32.dll", {
			FindWindowW: {
				args: [FFIType.ptr, FFIType.ptr],
				returns: FFIType.ptr,
			},
			LoadImageW: {
				args: [
					FFIType.ptr,
					FFIType.ptr,
					FFIType.u32,
					FFIType.i32,
					FFIType.i32,
					FFIType.u32,
				],
				returns: FFIType.ptr,
			},
			SendMessageW: {
				args: [FFIType.ptr, FFIType.u32, FFIType.u64, FFIType.u64],
				returns: FFIType.i64,
			},
		});

		const titleBuf = wstr(windowTitle);
		const pathBuf = wstr(iconPath);

		// The window is created asynchronously; poll for it by title (~5s).
		let hwnd = 0;
		for (let i = 0; i < 50; i++) {
			hwnd = Number(user32.symbols.FindWindowW(null, ptr(titleBuf)));
			if (hwnd) break;
			await Bun.sleep(100);
		}
		if (!hwnd) {
			console.warn(`Window icon: window "${windowTitle}" not found, skipping`);
			user32.close();
			return;
		}

		const loadIcon = (size: number) =>
			Number(
				user32.symbols.LoadImageW(
					null,
					ptr(pathBuf),
					IMAGE_ICON,
					size,
					size,
					LR_LOADFROMFILE,
				),
			);
		const hIconSmall = loadIcon(16); // titlebar
		const hIconBig = loadIcon(32); // alt-tab / taskbar

		if (hIconSmall)
			user32.symbols.SendMessageW(hwnd, WM_SETICON, ICON_SMALL, hIconSmall);
		if (hIconBig)
			user32.symbols.SendMessageW(hwnd, WM_SETICON, ICON_BIG, hIconBig);

		console.log(`Window icon set from ${iconPath}`);
		user32.close();
	} catch (err) {
		console.warn(`Window icon: failed to set (${err})`);
	}
}
