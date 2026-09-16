import { existsSync } from "node:fs";
import { spawn } from "node:child_process";
import process from "node:process";

const pythonCandidates = process.platform === "win32"
  ? [".venv\\Scripts\\python.exe", "python"]
  : [".venv/bin/python", "python3"];

const python = pythonCandidates.find((candidate) => candidate === "python" || candidate === "python3" || existsSync(candidate));
if (!python) {
  console.error("Python was not found. Create .venv and install backend/requirements.txt first.");
  process.exit(1);
}

const child = spawn(python, ["backend/manage.py", "runserver", "0.0.0.0:8000"], {
  stdio: "inherit",
});

child.on("error", (error) => {
  console.error(`Unable to start Django: ${error.message}`);
  process.exit(1);
});

child.on("exit", (code, signal) => {
  if (signal) process.kill(process.pid, signal);
  process.exit(code ?? 1);
});

for (const signal of ["SIGINT", "SIGTERM"]) {
  process.on(signal, () => child.kill(signal));
}
