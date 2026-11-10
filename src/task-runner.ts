import { spawn } from "child_process";

export function runRawCommand(scriptName: string, cwd = process.cwd()): Promise<void> {
  const cmd = "npm";
  const args = ["run", scriptName, "--silent"];

  console.info("\n" + `Running command: ${cmd} ${args.join(" ")} in directory: ${cwd}` + "\n");

  return new Promise((resolve, reject) => {
    const child = spawn(cmd, args, {
      cwd,
      stdio: "inherit",
      shell: false,
      env: { ...process.env },
    });

    child.on("error", (err) => reject(err));
    child.on("close", (code) => {
      if (code === 0) {
        console.info("\n" + `Command ${cmd} ${args.join(" ")} completed successfully` + "\n");
        resolve();
      } else reject(new Error(`${cmd} ${args.join(" ")} exited with code ${code}`));
    });
  });
}
