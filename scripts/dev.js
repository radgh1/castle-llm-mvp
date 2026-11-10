import { spawn } from "node:child_process";

const npmCli = process.env.npm_execpath;
if (!npmCli) {
  throw new Error("Run this script through npm so npm_execpath is available.");
}

let stopping = false;
const children = [];

function stop(exitCode) {
  if (stopping) return;
  stopping = true;
  process.exitCode = exitCode;
  for (const child of children) {
    if (child.exitCode === null) child.kill();
  }
}

for (const script of ["dev:server", "dev:client"]) {
  const child = spawn(process.execPath, [npmCli, "run", script], {
    stdio: "inherit",
  });
  children.push(child);

  child.on("error", error => {
    console.error(`Failed to start ${script}:`, error);
    stop(1);
  });

  child.on("exit", code => {
    if (!stopping) stop(code ?? 1);
  });
}

process.on("SIGINT", () => stop(0));
process.on("SIGTERM", () => stop(0));
