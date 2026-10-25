import { existsSync } from "node:fs";
import { extname } from "node:path";
import { audioExtensions } from "../business/dataLoading";

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

export function findLaunchFile(): string | null {
	let file = pickAudioFile([...process.argv, ...Bun.argv]);

	if (!file && process.platform === "win32") {
		file = pickAudioFile(tokenize(getParentCommandLine() ?? ""));
	}

	console.log(`FLACK launch file: ${file ?? "(none)"}`);
	return file;
}
