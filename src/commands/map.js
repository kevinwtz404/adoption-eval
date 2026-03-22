import { loadInput } from '../lib/loadInput.js';
import { validateInput } from '../lib/validateInput.js';
import { mapWorkflow } from '../lib/mapWorkflow.js';
import { writeJson } from '../core/output.js';
import { ExitCode } from '../core/errors.js';

export async function mapCommand(opts) {
  const input = await loadInput(opts.input);
  const v = validateInput(input);
  if (!v.valid) return ExitCode.VALIDATION;

  const map = mapWorkflow(input);
  await writeJson(opts.out, 'opportunity-map.json', map);
  console.log(`Wrote ${opts.out}/opportunity-map.json`);
  return ExitCode.OK;
}
