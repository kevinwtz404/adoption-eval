import type { CliOpts, ParsedArgs } from './types.js';
import { runCommand } from './commands/run.js';
import { mapCommand } from './commands/map.js';
import { evalCommand } from './commands/eval.js';
import { validateCommand } from './commands/validate.js';

function parseArgs(args: string[]): ParsedArgs {
  const out: ParsedArgs = { _: [] };
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a.startsWith('--')) {
      const key = a.slice(2);
      const next = args[i + 1];
      if (!next || next.startsWith('--')) out[key] = true;
      else {
        out[key] = next;
        i++;
      }
    } else (out._ as string[]).push(a);
  }
  return out;
}

export async function runCli(argv: string[]): Promise<number> {
  const parsed = parseArgs(argv);
  const command = parsed._[0];

  if (!command || parsed.help) {
    console.log(`adoption-eval <run|map|eval|validate> --input <path> [--out <dir>] [--readiness <path>] [--strict]`);
    return 0;
  }

  const opts: CliOpts = {
    input: parsed.input as string,
    out: (parsed.out as string) || './out',
    readiness: parsed.readiness as string | undefined,
    strict: Boolean(parsed.strict),
  };

  if (['run', 'map', 'eval', 'validate'].includes(command) && !opts.input) {
    console.error('Missing required flag: --input <path>');
    return 2;
  }

  if (command === 'run') return runCommand(opts);
  if (command === 'map') return mapCommand(opts);
  if (command === 'eval') return evalCommand(opts);
  if (command === 'validate') return validateCommand(opts);

  console.error(`Unknown command: ${command}`);
  return 2;
}
