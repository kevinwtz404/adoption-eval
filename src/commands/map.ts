import type { CliOpts, ReadinessProfile } from '../types.js';
import { loadInput } from '../lib/loadInput.js';
import { validateInput } from '../lib/validateInput.js';
import { mapWorkflow } from '../lib/mapWorkflow.js';
import { writeJson } from '../core/output.js';
import { ExitCode } from '../core/errors.js';

export async function mapCommand(opts: CliOpts): Promise<number> {
  const input = await loadInput(opts.input);
  const v = await validateInput(input);
  if (!v.valid) return ExitCode.VALIDATION;

  const readiness: ReadinessProfile | null = opts.readiness
    ? (await loadInput(opts.readiness) as unknown as ReadinessProfile)
    : null;

  const map = mapWorkflow(input, readiness);
  await writeJson(opts.out, 'opportunity-map.json', map);
  console.log(`Wrote ${opts.out}/opportunity-map.json`);
  return ExitCode.OK;
}
