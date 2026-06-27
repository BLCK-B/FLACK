// Finding the file the app was launched with ("Open with FLACK") is awkward on
// Electrobun + Windows:
//   1. Electrobun runs our bun code inside a Worker, and Bun resets the Worker's
//      process.argv to [bun, <worker-file>].
//   2. The native launcher.exe (which Windows actually invokes with the file)
//      spawns `bun.exe main.js` WITHOUT forwarding the file argument.
// So the path lives only in launcher.exe's command line — and launcher.exe is
// our parent process. We read the parent's command line via WMI/CIM.
// Entirely best-effort: any failure falls back to argv / returns null.
import { existsSync } from "node:fs";
import { extname } from "node:path";
import { audioExtensions } from "../business/dataLoading";

// Minimal Windows command-line tokenizer: splits on unquoted whitespace and
// strips the double quotes Explorer wraps around paths containing spaces.
// Sufficient for file-association launches (no embedded/escaped quotes).
function tokenize(cmd: string): string[] {
	const tokens: string[] = [];
	let current = "";
	let inQuotes = false;
	for (const ch of cmd) {
		if (ch === '"') {
			inQuotes = !inQuotes;
		} else if (!inQuotes && (ch === " " || ch === "\t")) {
			if (current) tokens.push(current);
			current = "";
		} else {
			current += ch;
		}
	}
	if (current) tokens.push(current);
	return tokens;
}

// The full command line of our parent process (the native launcher.exe), which
// is where Windows put the "Open with" file path. Synchronous on purpose:
// findLaunchFile() runs during module init, before the window exists.
function getParentCommandLine(): string | null {
	try {
		const ps =
			`$me=${process.pid};` +
			`$pp=(Get-CimInstance Win32_Process -Filter "ProcessId=$me").ParentProcessId;` +
			`(Get-CimInstance Win32_Process -Filter "ProcessId=$pp").CommandLine`;
		const res = Bun.spawnSync([
			"powershell.exe",
			"-NoProfile",
			"-NonInteractive",
			"-Command",
			ps,
		]);
		const out = res.stdout?.toString().trim();
		return out || null;
	} catch (err) {
		console.warn(`Could not read parent command line: ${err}`);
		return null;
	}
}

function pickAudioFile(args: string[]): string | null {
	return (
		args.find(
			(arg) =>
				audioExtensions.has(extname(arg).toLowerCase()) && existsSync(arg),
		) ?? null
	);
}

// The audio file the app was launched with ("Open with FLACK"), or null.
export function findLaunchFile(): string | null {
	// Our own argv (covers a plain `bun run ... song.flac` in dev).
	let file = pickAudioFile([...process.argv, ...Bun.argv]);

	// The real source on a packaged/dev launch: the launcher's command line.
	if (!file && process.platform === "win32") {
		file = pickAudioFile(tokenize(getParentCommandLine() ?? ""));
	}

	console.log(`FLACK launch file: ${file ?? "(none)"}`);
	return file;
}
