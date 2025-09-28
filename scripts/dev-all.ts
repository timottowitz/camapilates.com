// Runs Vite dev server + local dev API concurrently (Deno)
// deno run --allow-all scripts/dev-all.ts

const processes: Deno.ChildProcess[] = [];

async function run(cmd: string[], name: string) {
  const p = new Deno.Command(cmd[0], { args: cmd.slice(1), stdout: 'inherit', stderr: 'inherit' }).spawn();
  processes.push(p);
  const status = await p.status;
  console.log(`[${name}] exited with code ${status.code}`);
  // If one exits, kill the rest
  for (const proc of processes) {
    try { proc.kill('SIGTERM'); } catch {}
  }
}

await Promise.race([
  run(['deno', 'run', '--allow-net', '--allow-read', '--allow-write', '--allow-env', 'scripts/dev-api.ts'], 'api'),
  run(['deno', 'run', '--allow-all', 'npm:vite'], 'vite')
]);

